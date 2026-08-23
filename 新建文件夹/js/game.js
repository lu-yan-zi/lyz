// ==================== 游戏主循环 ====================
class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // 系统
    this.input = new InputManager(canvas);
    this.input.game = this;
    this.renderer = new Renderer(this);
    this.ui = new UIManager(this);
    this.soundManager = new SoundManager();
    this.stageManager = new StageManager(this);

    // 对象池
    this.bulletPool = new BulletPool(200);
    this.particlePool = new ParticlePool(500);
    this.powerUpPool = new PowerUpPool(50);
    this.enemyPool = new EnemyPool(50);

    // 玩家
    this.player = new Player(this);

    // 游戏状态
    this.state = 'menu'; // menu | playing | paused | boss_intro | boss_fight | upgrade | gameover | stage_clear
    this.isVictory = false;

    this.pauseKeyTimer = 0;
    this.bombKeyTimer = 0;
    this.confirmKeyTimer = 0;
    this.lastTime = 0;
    this.accumulator = 0;
    this.fixedDt = 1000 / 60; // 固定 60 FPS 更新

    // 启动循环
    this._loop = this._loop.bind(this);
    requestAnimationFrame(this._loop);
  }

  _loop(timestamp) {
    requestAnimationFrame(this._loop);

    if (this.lastTime === 0) {
      this.lastTime = timestamp;
    }

    this.accumulator += timestamp - this.lastTime;
    this.lastTime = timestamp;

    // 防止螺旋死亡（最小化/后台标签页恢复时）
    if (this.accumulator > 200) {
      this.accumulator = 200;
    }

    // 固定时间步长更新
    while (this.accumulator >= this.fixedDt) {
      if (this.state !== 'menu') {
        this.update();
      }
      this.accumulator -= this.fixedDt;
    }

    this.render();
  }

  // ==================== 更新 ====================
  update() {
    // 渲染器更新
    this.renderer.updateShake();
    this.renderer.updateStars();
    this.ui.update();

    // 暂停键处理
    if (this.input.isPausePressed()) {
      if (this.pauseKeyTimer <= 0) {
        if (this.state === 'playing' || this.state === 'boss_intro' || this.state === 'boss_fight') {
          this.state = 'paused';
        } else if (this.state === 'paused') {
          this.state = this._getActualGameState();
        }
        this.pauseKeyTimer = 20;
      }
    }
    if (this.pauseKeyTimer > 0) this.pauseKeyTimer--;

    // 暂停时不更新
    if (this.state === 'paused') return;

    switch (this.state) {
      case 'playing':
      case 'boss_intro':
      case 'boss_fight':
        this.updateGameplay();
        break;
      case 'stage_clear':
        this.updateStageClear();
        break;
      case 'upgrade':
        this.updateUpgrade();
        break;
      case 'gameover':
        this.updateGameOver();
        break;
    }
  }

  _getActualGameState() {
    const stage = this.stageManager;
    if (stage.state === 'boss_intro') return 'boss_intro';
    if (stage.state === 'boss_fight') return 'boss_fight';
    return 'playing';
  }

  updateGameplay() {
    const player = this.player;
    const input = this.input;

    // 玩家移动
    const { dx, dy } = input.getMovement();
    player.move(dx, dy);

    // 炸弹
    if (input.isBombPressed() && this.bombKeyTimer <= 0) {
      if (player.useBomb()) {
        this.triggerBomb();
        this.bombKeyTimer = 30;
      }
    }
    if (this.bombKeyTimer > 0) this.bombKeyTimer--;

    // 玩家更新
    player.update();

    // 僚机射击
    player.wingmanShoot(this.bulletPool);

    // 子弹更新
    this.bulletPool.updateAll();

    // 敌机更新
    this.enemyPool.updateAll();

    // 道具更新
    this.powerUpPool.updateAll();

    // 粒子更新
    this.particlePool.updateAll();

    // 关卡管理
    this.stageManager.update();

    // 碰撞检测
    const hitResult = Collision.checkBulletEnemyCollisions(
      this.bulletPool, this.enemyPool, this.particlePool, this.soundManager
    );
    if (hitResult) {
      const enemy = hitResult.enemy;
      if (!enemy.isBoss) {
        player.addCombo();
        player.addScore(enemy.score);
        player.kills++;
        player.gold += enemy.goldDrop;

        // 道具掉落
        const enemyType = enemy.type === 'elite' ? 'elite' : 'normal';
        this.powerUpPool.tryDrop(enemy.x, enemy.y, enemyType);

        // Combo 提示
        if (player.combo >= 5 && player.combo % 5 === 0) {
          this.ui.showCombo(player.combo);
          this.soundManager.play('combo');
        }
      } else {
        // Boss 击杀
        player.addScore(enemy.score);
        player.kills++;
        player.gold += enemy.goldDrop;
        this.powerUpPool.bossDrop(enemy.x, enemy.y);
        this.stageManager.bossDefeated = true;
        this.stageManager.state = 'clear';
        this.stageManager.clearTimer = 60;
      }
    }

    // 敌机子弹碰撞玩家
    Collision.checkBulletPlayerCollisions(this.bulletPool, player, this.particlePool);
    if (!player.alive) {
      this.soundManager.play('explosion');
      this.state = 'gameover';
      this.isVictory = false;
      return;
    }

    // 敌机碰撞玩家
    Collision.checkEnemyPlayerCollisions(this.enemyPool, player, this.particlePool);
    if (!player.alive) {
      this.soundManager.play('explosion');
      this.state = 'gameover';
      this.isVictory = false;
      return;
    }

    // 道具碰撞
    const powerUpType = Collision.checkPlayerPowerUpCollisions(
      player, this.powerUpPool, this.particlePool, this.soundManager
    );
    if (powerUpType) {
      this.applyPowerUp(powerUpType);
    }

    // Boss 入场检测
    if (this.stageManager.state === 'boss_intro') {
      this.state = 'boss_intro';
    } else if (this.stageManager.state === 'boss_fight') {
      this.state = 'boss_fight';
    } else if (this.stageManager.state === 'clear') {
      this.state = 'stage_clear';
    }
  }

  triggerBomb() {
    const player = this.player;
    this.soundManager.play('bomb');
    this.renderer.triggerShake(CONFIG.SHAKE.INTENSITY * 1.5, CONFIG.SHAKE.DURATION);

    // 清除敌机子弹
    for (const bullet of this.bulletPool.pool) {
      if (!bullet.active || bullet.fromPlayer) continue;
      bullet.active = false;
      this.particlePool.hitEffect(bullet.x, bullet.y, '#ff3366');
    }

    // 对敌机造成伤害
    for (const enemy of this.enemyPool.pool) {
      if (!enemy.active) continue;
      const damage = enemy.isBoss ? 100 : 50;
      enemy.hp -= damage;
      this.particlePool.explode(enemy.x, enemy.y, 10, ['#ff6600', '#ffff00', '#ffffff']);
      if (enemy.hp <= 0) {
        enemy.active = false;
        if (enemy.isBoss) {
          this.particlePool.bossExplode(enemy.x, enemy.y);
          player.addScore(enemy.score);
          player.kills++;
          player.gold += enemy.goldDrop;
          this.powerUpPool.bossDrop(enemy.x, enemy.y);
          this.stageManager.bossDefeated = true;
          this.stageManager.state = 'clear';
          this.stageManager.clearTimer = 120;
        } else {
          player.addScore(enemy.score);
          player.kills++;
          player.gold += enemy.goldDrop;
          this.powerUpPool.tryDrop(enemy.x, enemy.y, enemy.type === 'elite' ? 'elite' : 'normal');
        }
      }
    }
  }

  applyPowerUp(type) {
    const player = this.player;
    switch (type) {
      case 'weapon':
        if (player.weaponLevel < CONFIG.WEAPON.MAX_LEVEL) {
          player.weaponLevel++;
          this.ui.showMessage(`火力 Lv ${player.weaponLevel}!`, '#ffdd00', 60);
        }
        break;
      case 'shield':
        player.shieldCount++;
        this.ui.showMessage('获得护盾+1!', '#00ccff', 40);
        break;
      case 'bomb':
        player.bombCount++;
        this.ui.showMessage('获得炸弹+1!', '#ff6600', 40);
        break;
      case 'wingman':
        player.wingman.active = true;
        player.wingman.timer = CONFIG.PLAYER.WINGMAN_DURATION;
        this.ui.showMessage('僚机出击!', '#ff00ff', 60);
        break;
      case 'gold':
        player.gold += 5;
        break;
      case 'heal':
        player.hp = Math.min(player.maxHp, player.hp + CONFIG.POWERUP.HEAL_AMOUNT);
        this.ui.showMessage('生命恢复!', '#00ff88', 40);
        break;
    }
  }

  updateStageClear() {
    this.stageManager.update();
    if (this.stageManager.isClearReady()) {
      this.input.clearConfirmKey();
      this.confirmKeyTimer = 15;
      this.state = 'upgrade';
    }
  }

  updateUpgrade() {
    const input = this.input;
    const player = this.player;

    // 数字键升级
    const keys = ['1', '2', '3', '4'];
    const upgradeKeys = ['engine', 'armor', 'fire', 'ammo'];

    for (let i = 0; i < keys.length; i++) {
      if (input.keys[keys[i]]) {
        const key = upgradeKeys[i];
        const currentLv = player.upgrades[key];
        const cost = CONFIG.UPGRADE.COSTS[currentLv];
        if (currentLv < CONFIG.UPGRADE.MAX_LEVEL && player.gold >= cost) {
          player.gold -= cost;
          player.upgrades[key]++;
          this.applyUpgradeBonus(key);
          this.soundManager.play('pickup');
        }
        input.keys[keys[i]] = false;
      }
    }

    // 确认继续
    if (input.isConfirmPressed() && this.confirmKeyTimer <= 0) {
      this.confirmKeyTimer = 20;
      this.nextStage();
    }
    if (this.confirmKeyTimer > 0) this.confirmKeyTimer--;
  }

  applyUpgradeBonus(key) {
    const player = this.player;
    switch (key) {
      case 'engine':
        player.speed = CONFIG.PLAYER.SPEED * (1 + player.upgrades.engine * CONFIG.UPGRADE.ENGINE_SPEED_BONUS);
        break;
      case 'armor':
        player.maxHp = Math.floor(CONFIG.PLAYER.HP * (1 + player.upgrades.armor * CONFIG.UPGRADE.ARMOR_HP_BONUS));
        player.hp = player.maxHp;
        break;
      // fire and ammo bonuses are applied in shoot() method
    }
  }

  nextStage() {
    const nextStage = this.stageManager.currentStage + 1;
    if (nextStage >= STAGE_CONFIGS.length) {
      // 通关 - 清除按键防止瞬间重启
      this.input.clearConfirmKey();
      this.confirmKeyTimer = 30;
      this.state = 'gameover';
      this.isVictory = true;
      return;
    }

    // 切换关卡 - 清除按键防止跳过升级画面
    this.input.clearConfirmKey();
    this.confirmKeyTimer = 15;
    this.player.hp = this.player.maxHp;
    this.bulletPool.clearAll();
    this.enemyPool.clearAll();
    this.powerUpPool.clearAll();
    this.stageManager.startStage(nextStage);
    this.state = 'playing';
  }

  updateGameOver() {
    if (this.input.isConfirmPressed() && this.confirmKeyTimer <= 0) {
      this.confirmKeyTimer = 20;
      this.restartGame();
    }
    if (this.confirmKeyTimer > 0) this.confirmKeyTimer--;
  }

  startGame() {
    this.isVictory = false;
    this.player.reset();
    this.bulletPool.clearAll();
    this.enemyPool.clearAll();
    this.powerUpPool.clearAll();
    this.particlePool.clearAll();
    this.stageManager.reset();
    this.stageManager.startStage(0);
    this.state = 'playing';
    this.soundManager.init();
  }

  restartGame() {
    this.player.upgrades = { engine: 0, armor: 0, fire: 0, ammo: 0 };
    this.startGame();
  }

  exitToMenu() {
    this.state = 'menu';
    this.isVictory = false;
  }

  // ==================== 渲染 ====================
  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);

    // 应用屏幕震动
    ctx.save();
    if (this.state !== 'menu' && this.state !== 'paused') {
      ctx.translate(this.renderer.shakeX, this.renderer.shakeY);
    }

    // 背景
    this.renderer.drawBackground(ctx);

    if (this.state === 'menu') {
      this.renderer.drawBackground(ctx);
      ctx.restore();
      this.ui.drawMenu(ctx);
      return;
    }

    // 道具
    this.powerUpPool.drawAll(ctx);

    // 敌机
    this.enemyPool.drawAll(ctx);

    // 玩家
    this.player.draw(ctx);

    // 子弹
    this.bulletPool.drawAll(ctx);

    // 粒子
    this.particlePool.drawAll(ctx);

    ctx.restore();

    // UI 层（不受震动影响）
    this.ui.drawHUD(ctx);

    // 暂停按钮（游戏进行中）
    if (this.state === 'playing' || this.state === 'boss_intro' || this.state === 'boss_fight') {
      this.ui.drawPauseBtn(ctx);
    }

    // 右侧进度面板
    this.ui.drawProgressPanel(ctx);

    // 关卡标题
    this.ui.drawLevelIntro(ctx);

    // Boss 血条
    const boss = this.enemyPool.getBoss();
    if (boss && boss.active) {
      this.ui.drawBossHP(ctx, boss);
    }

    // Combo 弹出
    this.ui.drawComboPopup(ctx);

    // 浮动消息
    this.ui.drawMessages(ctx);

    // Boss 入场警告
    if (this.stageManager.state === 'boss_intro') {
      const alpha = this.stageManager.bossIntroTimer > 30 ? 1 : this.stageManager.bossIntroTimer / 30;
      this.renderer.drawBossWarning(ctx, alpha);
    }

    // 关卡清屏
    if (this.state === 'stage_clear') {
      const alpha = Math.min(1, (120 - this.stageManager.clearTimer) / 60);
      this.renderer.drawStageClear(ctx, alpha);
    }

    // 暂停
    if (this.state === 'paused') {
      this.ui.drawPause(ctx);
    }

    // 升级
    if (this.state === 'upgrade') {
      this.ui.drawUpgrade(ctx);
    }

    // 游戏结束
    if (this.state === 'gameover') {
      this.ui.drawGameOver(ctx);
    }
  }

  // 屏幕震动
  screenShake(intensity, duration) {
    this.renderer.triggerShake(intensity, duration);
  }
}
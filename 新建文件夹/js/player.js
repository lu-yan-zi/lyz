// ==================== 玩家类 ====================
class Player {
  constructor(game) {
    this.game = game;
    this.x = CONFIG.WIDTH / 2;
    this.y = CONFIG.HEIGHT - 100;
    this.width = CONFIG.PLAYER.SIZE * 2;
    this.height = CONFIG.PLAYER.SIZE * 2;
    this.speed = CONFIG.PLAYER.SPEED;
    this.hp = CONFIG.PLAYER.HP;
    this.maxHp = CONFIG.PLAYER.MAX_HP;
    this.weaponLevel = 1;
    this.shieldCount = 0;
    this.bombCount = CONFIG.PLAYER.BOMB_COUNT;
    this.invincible = false;
    this.invincibleTimer = 0;
    this.gold = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.maxCombo = 0;
    this.fireTimer = 0;
    this.score = 0;
    this.kills = 0;
    this.wingman = { active: false, timer: 0 };
    this.wingmanAngle = 0;

    // 升级
    this.upgrades = {
      engine: 0,
      armor: 0,
      fire: 0,
      ammo: 0,
    };

    this.alive = true;
    this.animTimer = 0;
  }

  reset() {
    this.x = CONFIG.WIDTH / 2;
    this.y = CONFIG.HEIGHT - 100;
    this.speed = CONFIG.PLAYER.SPEED * (1 + this.upgrades.engine * CONFIG.UPGRADE.ENGINE_SPEED_BONUS);
    this.hp = this.maxHp;
    this.weaponLevel = 1;
    this.shieldCount = 0;
    this.bombCount = CONFIG.PLAYER.BOMB_COUNT;
    this.invincible = false;
    this.invincibleTimer = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.maxCombo = 0;
    this.fireTimer = 0;
    this.score = 0;
    this.kills = 0;
    this.wingman = { active: false, timer: 0 };
    this.wingmanAngle = 0;
    this.alive = true;
  }

  getHitboxRadius() {
    return CONFIG.PLAYER.HITBOX_RADIUS;
  }

  move(dx, dy) {
    if (!this.alive) return;
    this.x = Utils.clamp(this.x + dx * this.speed, 15, CONFIG.WIDTH - 15);
    this.y = Utils.clamp(this.y + dy * this.speed, 50, CONFIG.HEIGHT - 30);
  }

  setPosition(x, y) {
    if (!this.alive) return;
    this.x = Utils.clamp(x, 15, CONFIG.WIDTH - 15);
    this.y = Utils.clamp(y, 50, CONFIG.HEIGHT - 30);
  }

  update() {
    if (!this.alive) return;
    this.animTimer++;

    // 无敌计时
    if (this.invincible) {
      this.invincibleTimer--;
      if (this.invincibleTimer <= 0) {
        this.invincible = false;
      }
    }

    // 僚机计时
    if (this.wingman.active) {
      this.wingman.timer--;
      this.wingmanAngle += 0.05;
      if (this.wingman.timer <= 0) {
        this.wingman.active = false;
      }
    }

    // Combo 计时
    if (this.comboTimer > 0) {
      this.comboTimer--;
      if (this.comboTimer <= 0) {
        this.combo = 0;
      }
    }

    // 自动射击
    this.fireTimer--;
    if (this.fireTimer <= 0) {
      this.fireTimer = CONFIG.PLAYER.FIRE_RATE;
      this.shoot();
    }
  }

  shoot() {
    const bulletPool = this.game.bulletPool;
    const dmg = CONFIG.WEAPON.DAMAGE_PER_LEVEL[this.weaponLevel - 1] * (1 + this.upgrades.fire * CONFIG.UPGRADE.FIRE_DAMAGE_BONUS);
    const bulletSpeed = CONFIG.WEAPON.BULLET_SPEED * (1 + this.upgrades.ammo * CONFIG.UPGRADE.AMMO_SPEED_BONUS);
    const cx = this.x;
    const cy = this.y - 15;

    switch (this.weaponLevel) {
      case 1:
        // 单发
        this.createBullet(cx, cy, 0, -1, bulletSpeed, dmg);
        break;
      case 2:
        // 双发
        this.createBullet(cx - 6, cy, 0, -1, bulletSpeed, dmg);
        this.createBullet(cx + 6, cy, 0, -1, bulletSpeed, dmg);
        break;
      case 3:
        // 三向散射
        this.createBullet(cx, cy, 0, -1, bulletSpeed, dmg);
        this.createBullet(cx, cy, -0.2, -1, bulletSpeed, dmg);
        this.createBullet(cx, cy, 0.2, -1, bulletSpeed, dmg);
        break;
      case 4:
        // 五向扇形
        this.createBullet(cx, cy, 0, -1, bulletSpeed, dmg);
        this.createBullet(cx, cy, -0.15, -1, bulletSpeed, dmg);
        this.createBullet(cx, cy, 0.15, -1, bulletSpeed, dmg);
        this.createBullet(cx, cy, -0.35, -1, bulletSpeed, dmg);
        this.createBullet(cx, cy, 0.35, -1, bulletSpeed, dmg);
        break;
      case 5:
        // 中央激光 + 两翼散射
        this.createBullet(cx, cy, -0.25, -1, bulletSpeed, dmg);
        this.createBullet(cx, cy, 0.25, -1, bulletSpeed, dmg);
        this.createBullet(cx, cy, -0.45, -1, bulletSpeed, dmg);
        this.createBullet(cx, cy, 0.45, -1, bulletSpeed, dmg);
        // 激光
        const laser = bulletPool.get();
        laser.initLaser(cx, cy, CONFIG.WEAPON.LASER_DAMAGE_TICK, '#00ffff', 3);
        break;
    }
  }

  createBullet(x, y, vx, vy, speed, damage) {
    const b = this.game.bulletPool.get();
    b.init(x, y, vx, vy, speed, damage, true, CONFIG.COLORS.PLAYER_BULLET, 3);
  }

  // 僚机射击
  wingmanShoot(bulletPool) {
    if (!this.wingman.active) return;
    const dmg = CONFIG.WEAPON.DAMAGE_PER_LEVEL[this.weaponLevel - 1] * 0.5;
    const offsets = [
      { x: -30, y: -5 },
      { x: 30, y: -5 },
    ];
    for (const off of offsets) {
      const wx = this.x + Math.cos(this.wingmanAngle + (off.x > 0 ? 0 : Math.PI)) * 30;
      const wy = this.y + off.y;
      const b = bulletPool.get();
      b.init(wx, wy, 0, -1, 8, dmg, true, '#88ff88', 2);
    }
  }

  useBomb() {
    if (this.bombCount <= 0 || !this.alive) return false;
    this.bombCount--;
    return true;
  }

  takeDamage(damage) {
    if (this.invincible || !this.alive) return false;

    if (this.shieldCount > 0) {
      this.shieldCount--;
      this.invincible = true;
      this.invincibleTimer = 60; // 护盾抵消后短暂无敌
      this.game.particlePool.explode(this.x, this.y, 15, ['#00ccff', '#ffffff']);
      return false;
    }

    this.hp -= damage;
    this.invincible = true;
    this.invincibleTimer = 60; // 受伤后短暂无敌

    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
      this.game.particlePool.explode(this.x, this.y, 40, ['#ff0000', '#ff8800', '#ffff00', '#ffffff']);
      return true; // 死亡
    }
    return false;
  }

  addCombo() {
    this.combo++;
    this.comboTimer = CONFIG.COMBO.TIMEOUT;
    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
    }
  }

  getComboMultiplier() {
    if (this.combo <= 1) return 1;
    return Math.min(1 + (this.combo - 1) * CONFIG.COMBO.MULT_PER_KILL, CONFIG.COMBO.MAX_MULT);
  }

  addScore(baseScore) {
    const mult = this.getComboMultiplier();
    this.score += Math.floor(baseScore * mult);
  }

  draw(ctx) {
    if (!this.alive) return;

    this.animTimer++;
    const thrust = Math.sin(this.animTimer * 0.3) * 2;

    ctx.save();
    ctx.translate(this.x, this.y);

    // 无敌闪烁
    if (this.invincible && Math.floor(this.invincibleTimer / 4) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    // 护盾光环
    if (this.shieldCount > 0) {
      ctx.strokeStyle = CONFIG.COLORS.SHIELD;
      ctx.lineWidth = 3;
      ctx.shadowColor = '#00ccff';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // ---- 引擎火焰 ----
    const flameLen = 10 + thrust;
    const gradMain = ctx.createLinearGradient(0, 12, 0, 12 + flameLen);
    gradMain.addColorStop(0, '#00ffff');
    gradMain.addColorStop(0.4, '#0088ff');
    gradMain.addColorStop(1, 'transparent');

    // 主引擎火焰
    ctx.fillStyle = gradMain;
    ctx.beginPath();
    ctx.moveTo(-5, 12);
    ctx.lineTo(0, 12 + flameLen);
    ctx.lineTo(5, 12);
    ctx.closePath();
    ctx.fill();

    // 左引擎火焰
    ctx.beginPath();
    ctx.moveTo(-14, 7);
    ctx.lineTo(-11, 7 + flameLen * 0.7);
    ctx.lineTo(-8, 7);
    ctx.closePath();
    ctx.fill();

    // 右引擎火焰
    ctx.beginPath();
    ctx.moveTo(8, 7);
    ctx.lineTo(11, 7 + flameLen * 0.7);
    ctx.lineTo(14, 7);
    ctx.closePath();
    ctx.fill();

    // ---- 飞机机身 ----
    const bodyColor = '#1a2a4a';
    const accentColor = '#00ccff';
    const darkColor = '#0d1525';

    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 8;
    ctx.lineWidth = 1.5;

    // 垂直尾翼（画在机身后面）
    ctx.fillStyle = darkColor;
    ctx.strokeStyle = accentColor;
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(0, 8);
    ctx.lineTo(-3, 8);
    ctx.lineTo(-2, -8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 主翼（后掠翼）
    ctx.fillStyle = bodyColor;
    ctx.strokeStyle = accentColor;
    ctx.beginPath();
    // 左翼
    ctx.moveTo(-3, -2);
    ctx.lineTo(-18, 6);
    ctx.lineTo(-16, 8);
    ctx.lineTo(-4, 2);
    // 右翼
    ctx.lineTo(4, 2);
    ctx.lineTo(16, 8);
    ctx.lineTo(18, 6);
    ctx.lineTo(3, -2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 机身前段（锥形机头）
    ctx.fillStyle = bodyColor;
    ctx.strokeStyle = accentColor;
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(4, -8);
    ctx.lineTo(4, 4);
    ctx.lineTo(3, 12);
    ctx.lineTo(-3, 12);
    ctx.lineTo(-4, 4);
    ctx.lineTo(-4, -8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 机头雷达罩
    ctx.fillStyle = '#334466';
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(3, -14);
    ctx.lineTo(-3, -14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 机头尖端
    ctx.fillStyle = '#ff0044';
    ctx.beginPath();
    ctx.arc(0, -19, 2, 0, Math.PI * 2);
    ctx.fill();

    // 驾驶舱（水滴形）
    ctx.fillStyle = '#00ccff';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.quadraticCurveTo(5, -6, 0, -2);
    ctx.quadraticCurveTo(-5, -6, 0, -12);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 驾驶舱高光
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.ellipse(0, -8, 2, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // 机身中段装饰线
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1;
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.moveTo(-3, 0);
    ctx.lineTo(3, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-3, 6);
    ctx.lineTo(3, 6);
    ctx.stroke();

    // 机翼武器挂载点
    ctx.fillStyle = '#ff0044';
    ctx.shadowColor = '#ff0044';
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(-15, 7, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(15, 7, 2, 0, Math.PI * 2);
    ctx.fill();

    // 水平尾翼
    ctx.fillStyle = darkColor;
    ctx.strokeStyle = accentColor;
    ctx.shadowBlur = 3;
    ctx.beginPath();
    ctx.moveTo(-3, 10);
    ctx.lineTo(-9, 12);
    ctx.lineTo(-7, 14);
    ctx.lineTo(-3, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(3, 10);
    ctx.lineTo(9, 12);
    ctx.lineTo(7, 14);
    ctx.lineTo(3, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 发动机喷口
    ctx.fillStyle = '#ff6600';
    ctx.shadowColor = '#ff6600';
    ctx.shadowBlur = 6;
    ctx.fillRect(-2, 11, 4, 2);

    ctx.shadowBlur = 0;
    ctx.restore();

    // 僚机
    if (this.wingman.active) {
      this.drawWingmen(ctx);
    }
  }

  drawWingmen(ctx) {
    const wingmanPositions = [
      { x: this.x + Math.cos(this.wingmanAngle) * 30, y: this.y + Math.sin(this.wingmanAngle * 1.5) * 5 - 5 },
      { x: this.x + Math.cos(this.wingmanAngle + Math.PI) * 30, y: this.y + Math.sin(this.wingmanAngle * 1.5 + Math.PI) * 5 - 5 },
    ];

    for (const pos of wingmanPositions) {
      ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.fillStyle = '#88ff88';
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#00ff00';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // 小炮管
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.lineTo(0, -9);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();
    }
  }
}
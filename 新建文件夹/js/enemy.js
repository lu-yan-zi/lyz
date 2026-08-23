// ==================== 敌机系统 ====================
class Enemy {
  constructor() {
    this.active = false;
    this.x = 0;
    this.y = 0;
    this.width = 28;
    this.height = 28;
    this.hp = 30;
    this.maxHp = 30;
    this.speedX = 0;
    this.speedY = 2;
    this.type = 'normal';
    this.score = 100;
    this.goldDrop = 5;
    this.fireRate = 60;
    this.fireTimer = 0;
    this.bulletPattern = 'straight';
    this.movePattern = 'straight';
    this.canDropItem = true;
    this.isBoss = false;
    this.bossPhase = 0;
    this.bossPhaseHp = [];
    this.bossName = '';
    this.animTimer = 0;
    this.moveTimer = 0;
    this.entryTimer = 0;

    // Boss 专用
    this.bossTargetX = 0;
    this.bossTargetY = 0;
    this.bossPhaseChanging = false;
    this.bossPhaseTimer = 0;
    this.bossLaserTimer = 0;
    this.bossSpiralAngle = 0;
    this.bossBaseY = 0;
  }

  init(x, y, type, config) {
    this.active = true;
    this.x = x;
    this.y = y;
    this.type = type;
    this.animTimer = 0;
    this.moveTimer = 0;
    this.fireTimer = Utils.randInt(0, 30);

    if (type === 'normal' || type === 'elite') {
      const c = CONFIG.ENEMY[type.toUpperCase()];
      this.hp = c.hp;
      this.maxHp = c.hp;
      this.width = c.size * 2;
      this.height = c.size * 2;
      this.speedX = 0;
      this.speedY = c.speed;
      this.score = c.score;
      this.goldDrop = c.goldDrop;
      this.fireRate = c.fireRate;
      this.canDropItem = true;
      this.isBoss = false;
      this.bulletPattern = config.bulletPattern || 'straight';
      this.movePattern = config.movePattern || 'straight';
    } else if (type === 'boss') {
      this.isBoss = true;
      this.hp = config.hp || 500;
      this.maxHp = this.hp;
      this.width = config.size || 60;
      this.height = config.size || 60;
      this.speedX = 0;
      this.speedY = 0;
      this.score = config.score || 5000;
      this.goldDrop = 50;
      this.fireRate = 30;
      this.canDropItem = false;
      this.bossName = config.name || 'BOSS';
      this.bossPhase = 0;
      this.bossPhaseHp = config.phases.map(p => this.maxHp * p.hpPercent);
      this.bossPhaseChanging = false;
      this.bossPhaseTimer = 0;
      this.bossLaserTimer = 0;
      this.bossSpiralAngle = 0;
      this.bossTargetX = CONFIG.WIDTH / 2;
      this.bossTargetY = 80;
      this.bossBaseY = 80;
      this.entryTimer = 60; // 入场动画
      this.y = -100;
      this.x = CONFIG.WIDTH / 2;
    }
  }

  update() {
    if (!this.active) return;
    this.animTimer++;

    if (this.isBoss) {
      this.updateBoss();
      return;
    }

    // 普通/精英敌机移动
    this.updateMovement();
    // 射击
    this.fireTimer--;
    if (this.fireTimer <= 0) {
      this.fireTimer = this.fireRate;
      this.shoot();
    }
    // 出界
    if (this.y > CONFIG.HEIGHT + 50 || this.x < -50 || this.x > CONFIG.WIDTH + 50) {
      this.active = false;
    }
  }

  updateMovement() {
    this.moveTimer++;
    const s = this.type === 'elite' ? CONFIG.ENEMY.ELITE.speed : CONFIG.ENEMY.NORMAL.speed;

    switch (this.movePattern) {
      case 'straight':
        this.y += this.speedY;
        break;
      case 'zigzag':
        this.y += this.speedY;
        this.x += Math.sin(this.moveTimer * 0.05) * 3;
        break;
      case 'sine':
        this.y += this.speedY * 0.8;
        this.x += Math.sin(this.moveTimer * 0.03) * 2;
        break;
      case 'circle':
        const cx = CONFIG.WIDTH / 2;
        const cy = 200;
        this.x = cx + Math.cos(this.moveTimer * 0.02) * 100;
        this.y = cy + Math.sin(this.moveTimer * 0.02) * 50;
        break;
      case 'easeIn':
        if (this.y < 150) {
          this.y += this.speedY * 0.3;
        } else {
          this.y += this.speedY;
        }
        break;
      default:
        this.y += this.speedY;
    }
  }

  shoot() {
    const bulletPool = this.game.bulletPool;
    const cx = this.x;
    const cy = this.y + this.height / 2;
    const bulletSpeed = 4;
    const damage = this.type === 'elite' ? 15 : 10;

    switch (this.bulletPattern) {
      case 'straight':
        this.createBullet(cx, cy, 0, 1, bulletSpeed, damage);
        break;
      case 'aimed':
        if (this.game.player.alive) {
          const angle = Utils.angle(cx, cy, this.game.player.x, this.game.player.y);
          this.createBullet(cx, cy, Math.cos(angle), Math.sin(angle), bulletSpeed, damage);
        }
        break;
      case 'spread':
        for (let i = -2; i <= 2; i++) {
          const angle = Math.PI / 2 + i * 0.2;
          this.createBullet(cx, cy, Math.cos(angle), Math.sin(angle), bulletSpeed, damage);
        }
        break;
      case 'circle':
        for (let i = 0; i < 8; i++) {
          const angle = (Math.PI * 2 / 8) * i + this.moveTimer * 0.02;
          this.createBullet(cx, cy, Math.cos(angle), Math.sin(angle), bulletSpeed * 0.7, damage);
        }
        break;
      case 'spiral':
        for (let i = 0; i < 3; i++) {
          const angle = this.moveTimer * 0.05 + i * Math.PI * 2 / 3;
          this.createBullet(cx, cy, Math.cos(angle), Math.sin(angle), bulletSpeed * 0.8, damage);
        }
        break;
    }
  }

  createBullet(x, y, vx, vy, speed, damage) {
    const b = this.game.bulletPool.get();
    b.init(x, y, vx, vy, speed, damage, false, CONFIG.COLORS.ENEMY_BULLET, 3);
  }

  // ==================== Boss 逻辑 ====================
  updateBoss() {
    // 入场动画
    if (this.entryTimer > 0) {
      this.entryTimer--;
      this.y += (this.bossTargetY - this.y) * 0.05;
      if (this.entryTimer <= 0) {
        this.y = this.bossTargetY;
      }
      return;
    }

    // 阶段切换无敌
    if (this.bossPhaseChanging) {
      this.bossPhaseTimer--;
      if (this.bossPhaseTimer <= 0) {
        this.bossPhaseChanging = false;
      }
      return;
    }

    // 左右移动
    this.x += Math.sin(this.animTimer * 0.015) * 1.5;
    this.y = this.bossBaseY + Math.sin(this.animTimer * 0.01) * 20;

    // 阶段检测
    for (let i = this.bossPhaseHp.length - 1; i > this.bossPhase; i--) {
      if (this.hp <= this.bossPhaseHp[i]) {
        this.bossPhase = i;
        this.bossPhaseChanging = true;
        this.bossPhaseTimer = 40;
        this.game.particlePool.explode(this.x, this.y, 30, ['#ff0044', '#ff6600', '#ffffff']);
        this.game.screenShake(10, 20);
        return;
      }
    }

    // 狂暴模式
    const isEnraged = this.hp <= this.maxHp * CONFIG.BOSS.ENRAGE_THRESHOLD;

    // 射击
    this.fireTimer--;
    const fireRate = this.fireRate * (isEnraged ? 0.5 : 1);
    if (this.fireTimer <= 0) {
      this.fireTimer = fireRate;
      this.bossShoot();
    }

    // 激光定时器
    this.bossLaserTimer--;
    this.bossSpiralAngle += 0.03;
  }

  bossShoot() {
    const bulletPool = this.game.bulletPool;
    const cx = this.x;
    const cy = this.y + this.height / 2;
    const bSpeed = 4;
    const damage = 20;

    const phase = this.bossPhase;
    const isEnraged = this.hp <= this.maxHp * CONFIG.BOSS.ENRAGE_THRESHOLD;

    switch (phase) {
      case 0: // 瞄准 + 直线
        if (this.game.player.alive) {
          const angle = Utils.angle(cx, cy, this.game.player.x, this.game.player.y);
          this.createBullet(cx, cy, Math.cos(angle), Math.sin(angle), bSpeed, damage);
        }
        if (isEnraged) {
          this.createBullet(cx - 20, cy, 0, 1, bSpeed, damage);
          this.createBullet(cx + 20, cy, 0, 1, bSpeed, damage);
        }
        break;
      case 1: // 扇形扩散
        const spreadCount = isEnraged ? 9 : 5;
        for (let i = 0; i < spreadCount; i++) {
          const angle = Math.PI * 0.2 + (Math.PI * 0.6 / (spreadCount - 1)) * i;
          this.createBullet(cx, cy, Math.cos(angle), Math.sin(angle), bSpeed, damage);
        }
        break;
      case 2: // 圆形散射 + 螺旋
        for (let i = 0; i < 12; i++) {
          const angle = (Math.PI * 2 / 12) * i + this.bossSpiralAngle;
          this.createBullet(cx, cy, Math.cos(angle), Math.sin(angle), bSpeed * 0.7, damage);
        }
        if (isEnraged) {
          // 额外螺旋弹
          for (let i = 0; i < 6; i++) {
            const angle = this.bossSpiralAngle * 2 + (Math.PI * 2 / 6) * i;
            this.createBullet(cx, cy, Math.cos(angle), Math.sin(angle), bSpeed * 0.5, damage);
          }
        }
        break;
    }
  }

  takeDamage(damage) {
    if (this.bossPhaseChanging) return false;
    this.hp -= damage;
    return this.hp <= 0;
  }

  draw(ctx) {
    if (!this.active) return;

    if (this.isBoss) {
      this.drawBoss(ctx);
      return;
    }

    ctx.save();
    ctx.translate(this.x, this.y);

    const color = this.type === 'elite' ? CONFIG.COLORS.ELITE_ENEMY : CONFIG.COLORS.NORMAL_ENEMY;
    const size = this.width / 2;

    // 外发光
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;

    // 敌机形状
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;

    if (this.type === 'elite') {
      // 精英机：六边形
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = Math.PI / 3 * i - Math.PI / 6;
        const px = Math.cos(angle) * size;
        const py = Math.sin(angle) * size;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // 内圈
      ctx.fillStyle = Utils.hexToRgba(color, 0.3);
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // 普通机：菱形
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size, 0);
      ctx.lineTo(0, size);
      ctx.lineTo(-size, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // 核心亮点
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.restore();
  }

  drawBoss(ctx) {
    const size = this.width / 2;
    const color = CONFIG.COLORS.BOSS_COLOR;

    ctx.save();
    ctx.translate(this.x, this.y);

    // 入场时渐变
    if (this.entryTimer > 0) {
      ctx.globalAlpha = 1 - (this.entryTimer / 60) * 0.5;
    }

    // 阶段切换闪烁
    if (this.bossPhaseChanging && this.bossPhaseTimer % 4 < 2) {
      ctx.globalAlpha = 0.5;
    }

    // Boss 外发光
    ctx.shadowColor = color;
    ctx.shadowBlur = 20;

    // 主体
    ctx.fillStyle = '#1a0a0a';
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;

    // 八角形
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = Math.PI / 4 * i - Math.PI / 8;
      const r = i % 2 === 0 ? size : size * 0.7;
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 内部装甲板
    ctx.fillStyle = Utils.hexToRgba(color, 0.2);
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.stroke();

    // 核心
    const pulse = Math.sin(this.animTimer * 0.1) * 0.3 + 0.7;
    ctx.fillStyle = color;
    ctx.shadowBlur = 15 * pulse;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // 炮管
    ctx.fillStyle = color;
    ctx.shadowBlur = 5;
    ctx.fillRect(-size * 0.9, -3, size * 0.3, 6);
    ctx.fillRect(size * 0.6, -3, size * 0.3, 6);
    ctx.fillRect(-3, -size * 0.9, 6, size * 0.3);

    ctx.shadowBlur = 0;
    ctx.restore();
  }
}

class EnemyPool {
  constructor(size) {
    this.pool = [];
    for (let i = 0; i < size; i++) {
      this.pool.push(new Enemy());
    }
  }

  get() {
    for (const e of this.pool) {
      if (!e.active) return e;
    }
    const e = new Enemy();
    this.pool.push(e);
    return e;
  }

  getActiveEnemies() {
    return this.pool.filter(e => e.active && !e.isBoss);
  }

  getBoss() {
    return this.pool.find(e => e.active && e.isBoss);
  }

  getActiveCount() {
    return this.pool.filter(e => e.active && !e.isBoss).length;
  }

  updateAll() {
    for (const e of this.pool) {
      if (e.active) e.update();
    }
  }

  drawAll(ctx) {
    for (const e of this.pool) {
      if (e.active) e.draw(ctx);
    }
  }

  clearAll() {
    for (const e of this.pool) {
      e.active = false;
    }
  }
}
// ==================== 全局配置 ====================
const CONFIG = {
  // 画布尺寸（设计分辨率）
  WIDTH: 480,
  HEIGHT: 800,

  // 游戏参数
  FPS: 60,

  // 玩家
  PLAYER: {
    SPEED: 5,
    HP: 100,
    MAX_HP: 100,
    SIZE: 16,
    FIRE_RATE: 8,        // 射击间隔（帧）
    BOMB_COUNT: 3,
    INVINCIBLE_FRAMES: 180,  // 3秒
    WINGMAN_DURATION: 900,   // 15秒
    HITBOX_RADIUS: 8,
  },

  // 武器等级配置
  WEAPON: {
    MAX_LEVEL: 5,
    DAMAGE_PER_LEVEL: [10, 12, 14, 16, 20],
    BULLET_SPEED: 10,
    LASER_DAMAGE_TICK: 30,  // 激光每帧伤害
  },

  // 敌机
  ENEMY: {
    NORMAL: { hp: 30, score: 100, speed: 2, size: 14, fireRate: 60, goldDrop: 5 },
    ELITE:  { hp: 100, score: 300, speed: 1.5, size: 20, fireRate: 40, goldDrop: 15 },
  },

  // Boss
  BOSS: {
    SIZES: [60, 70, 70, 80, 80],
    HP_BASE: [500, 700, 1000, 1300, 1600],
    PHASE_THRESHOLDS: [1.0, 0.7, 0.4, 0.15],
    ENRAGE_THRESHOLD: 0.1,
    FIRE_RATE_MULT: 2,
  },

  // 道具
  POWERUP: {
    SPEED: 2,
    SIZE: 14,
    DROP_CHANCE: {
      weapon: { normal: 0.05, elite: 0.15 },
      shield: { normal: 0.03, elite: 0.10 },
      bomb:   { normal: 0.02, elite: 0.08 },
      wingman:{ normal: 0.02, elite: 0.05 },
      gold:   { normal: 0.30, elite: 0.50 },
      heal:   { normal: 0.05, elite: 0.10 },
    },
    HEAL_AMOUNT: 30,
  },

  // Combo 系统
  COMBO: {
    TIMEOUT: 90,  // 帧
    MAX_MULT: 10,
    MULT_PER_KILL: 0.5,
  },

  // 粒子
  PARTICLE: {
    EXPLOSION_COUNT: 30,
    BOSS_EXPLOSION_COUNT: 60,
    TRAIL_LENGTH: 5,
  },

  // 屏幕震动
  SHAKE: {
    INTENSITY: 8,
    DURATION: 15,
    DECAY: 0.85,
  },

  // 背景
  BG: {
    STAR_COUNT: 200,
    GRID_SPEED: 1.5,
    STAR_SPEED_MIN: 0.5,
    STAR_SPEED_MAX: 3,
  },

  // 光标
  COLORS: {
    BG: '#0a0a2e',
    GRID: 'rgba(255, 255, 255, 0.08)',
    PLAYER_BULLET: '#ffdd00',
    ENEMY_BULLET: '#ff3366',
    NORMAL_ENEMY: '#ff6600',
    ELITE_ENEMY: '#ff00ff',
    BOSS_COLOR: '#ff0044',
    POWERUP_WEAPON: '#ffdd00',
    POWERUP_SHIELD: '#00ccff',
    POWERUP_BOMB: '#ff6600',
    POWERUP_WINGMAN: '#ff00ff',
    POWERUP_GOLD: '#ffd700',
    POWERUP_HEAL: '#00ff88',
    SHIELD: 'rgba(0, 200, 255, 0.5)',
    UI_TEXT: '#00ffff',
    UI_HIGHLIGHT: '#ffffff',
    UI_DANGER: '#ff3366',
    UI_GOLD: '#ffd700',
    COMBO_COLORS: ['#ffffff', '#ffff00', '#ff8800', '#ff3366', '#ff00ff'],
  },

  // 升级系统
  UPGRADE: {
    MAX_LEVEL: 5,
    COSTS: [100, 200, 400, 700, 1000],
    ENGINE_SPEED_BONUS: 0.10,
    ARMOR_HP_BONUS: 0.20,
    FIRE_DAMAGE_BONUS: 0.15,
    AMMO_SPEED_BONUS: 0.10,
  },
};// ==================== 工具函数 ====================
const Utils = {
  // 随机整数 [min, max]
  randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // 随机浮点数 [min, max)
  randFloat(min, max) {
    return Math.random() * (max - min) + min;
  },

  // 两点距离
  distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  },

  // 两点角度
  angle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
  },

  // 线性插值
  lerp(a, b, t) {
    return a + (b - a) * t;
  },

  // 限制范围
  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  },

  // 角度转弧度
  degToRad(deg) {
    return deg * Math.PI / 180;
  },

  // 圆周坐标
  circlePos(centerX, centerY, radius, angle) {
    return {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    };
  },

  // 随机选择
  randChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  // 概率判定
  chance(probability) {
    return Math.random() < probability;
  },

  // 颜色插值
  lerpColor(c1, c2, t) {
    const r1 = parseInt(c1.slice(1, 3), 16);
    const g1 = parseInt(c1.slice(3, 5), 16);
    const b1 = parseInt(c1.slice(5, 7), 16);
    const r2 = parseInt(c2.slice(1, 3), 16);
    const g2 = parseInt(c2.slice(3, 5), 16);
    const b2 = parseInt(c2.slice(5, 7), 16);
    const r = Math.round(Utils.lerp(r1, r2, t));
    const g = Math.round(Utils.lerp(g1, g2, t));
    const b = Math.round(Utils.lerp(b1, b2, t));
    return `rgb(${r},${g},${b})`;
  },

  // 十六进制颜色转 rgba
  hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  },
};// ==================== 子弹系统 ====================
class Bullet {
  constructor() {
    this.active = false;
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.speed = 0;
    this.radius = 3;
    this.damage = 10;
    this.fromPlayer = true;
    this.color = '#00ffff';
    this.trail = [];
    this.isLaser = false;
    this.laserWidth = 4;
    this.laserTimer = 0;
  }

  init(x, y, vx, vy, speed, damage, fromPlayer, color, radius) {
    this.active = true;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.speed = speed || 10;
    this.damage = damage || 10;
    this.fromPlayer = fromPlayer;
    this.color = color || '#00ffff';
    this.radius = radius || 3;
    this.trail = [];
    this.isLaser = false;
    this.laserWidth = 4;
    this.laserTimer = 0;
  }

  initLaser(x, y, damage, color, width) {
    this.active = true;
    this.x = x;
    this.y = 0; // 激光从顶部开始
    this.laserX = x;
    this.laserY = y;
    this.vx = 0;
    this.vy = 0;
    this.speed = 0;
    this.damage = damage || 30;
    this.fromPlayer = true;
    this.color = color || '#00ffff';
    this.radius = 0;
    this.isLaser = true;
    this.laserWidth = width || 4;
    this.laserTimer = 0;
    this.trail = [];
  }

  update() {
    if (!this.active) return;
    if (this.isLaser) {
      this.laserTimer++;
      // 激光持续 30 帧后失效
      if (this.laserTimer > 30) {
        this.active = false;
      }
      return;
    }

    // 添加拖尾
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > CONFIG.PARTICLE.TRAIL_LENGTH) {
      this.trail.shift();
    }

    this.x += this.vx * this.speed * 0.5;
    this.y += this.vy * this.speed * 0.5;

    // 出界检测
    if (this.y < -20 || this.y > CONFIG.HEIGHT + 20 ||
        this.x < -20 || this.x > CONFIG.WIDTH + 20) {
      this.active = false;
      this.trail = [];
    }
  }

  draw(ctx) {
    if (!this.active) return;

    if (this.isLaser) {
      // 激光绘制
      const alpha = 1 - (this.laserTimer / 30) * 0.5;
      ctx.save();
      ctx.globalAlpha = alpha;

      // 外层发光
      const grad = ctx.createLinearGradient(this.laserX, this.laserY, this.laserX, 0);
      grad.addColorStop(0, Utils.hexToRgba(this.color, 0.8));
      grad.addColorStop(1, Utils.hexToRgba(this.color, 0.1));
      ctx.strokeStyle = grad;
      ctx.lineWidth = this.laserWidth + 6;
      ctx.beginPath();
      ctx.moveTo(this.laserX, this.laserY);
      ctx.lineTo(this.laserX, 0);
      ctx.stroke();

      // 内层激光
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = this.laserWidth;
      ctx.beginPath();
      ctx.moveTo(this.laserX, this.laserY);
      ctx.lineTo(this.laserX, 0);
      ctx.stroke();

      ctx.restore();
      return;
    }

    // 绘制拖尾
    if (this.trail.length > 0) {
      ctx.save();
      for (let i = 0; i < this.trail.length; i++) {
        const alpha = (i / this.trail.length) * 0.5;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.trail[i].x, this.trail[i].y, this.radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 子弹主体
    ctx.save();
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // 高亮核心
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// 子弹对象池
class BulletPool {
  constructor(size) {
    this.pool = [];
    for (let i = 0; i < size; i++) {
      this.pool.push(new Bullet());
    }
  }

  get() {
    for (const bullet of this.pool) {
      if (!bullet.active) {
        bullet.active = true;
        return bullet;
      }
    }
    // 池满则扩展
    const bullet = new Bullet();
    this.pool.push(bullet);
    return bullet;
  }

  updateAll() {
    for (const bullet of this.pool) {
      if (bullet.active) bullet.update();
    }
  }

  drawAll(ctx) {
    for (const bullet of this.pool) {
      if (bullet.active) bullet.draw(ctx);
    }
  }

  getActiveCount() {
    return this.pool.filter(b => b.active).length;
  }

  clearAll() {
    for (const bullet of this.pool) {
      bullet.active = false;
      bullet.trail = [];
    }
  }
}// ==================== 粒子系统 ====================
class Particle {
  constructor() {
    this.active = false;
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.life = 0;
    this.maxLife = 0;
    this.size = 2;
    this.color = '#ffffff';
    this.alpha = 1;
  }

  init(x, y, vx, vy, life, size, color) {
    this.active = true;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.life = life;
    this.maxLife = life;
    this.size = size;
    this.color = color;
    this.alpha = 1;
  }

  update() {
    if (!this.active) return;
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.98;
    this.vy *= 0.98;
    this.life--;
    this.alpha = this.life / this.maxLife;
    this.size *= 0.99;
    if (this.life <= 0) {
      this.active = false;
    }
  }

  draw(ctx) {
    if (!this.active) return;
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class ParticlePool {
  constructor(size) {
    this.pool = [];
    for (let i = 0; i < size; i++) {
      this.pool.push(new Particle());
    }
  }

  get() {
    for (const p of this.pool) {
      if (!p.active) return p;
    }
    const p = new Particle();
    this.pool.push(p);
    return p;
  }

  // 创建爆炸效果
  explode(x, y, count, colors) {
    const colorList = colors || ['#ffff00', '#ff8800', '#ff0000', '#ffffff'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Utils.randFloat(1, 5);
      const p = this.get();
      p.init(
        x, y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        Utils.randInt(20, 40),
        Utils.randFloat(1, 4),
        Utils.randChoice(colorList)
      );
    }
  }

  // 创建 Boss 爆炸
  bossExplode(x, y) {
    const colors = ['#ff0044', '#ff6600', '#ffff00', '#ffffff', '#ff00ff'];
    this.explode(x, y, CONFIG.PARTICLE.BOSS_EXPLOSION_COUNT, colors);
    // 第二波延迟爆炸
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const p = this.get();
      p.init(
        x + Utils.randFloat(-30, 30),
        y + Utils.randFloat(-30, 30),
        Math.cos(angle) * 2,
        Math.sin(angle) * 2,
        Utils.randInt(30, 60),
        Utils.randFloat(2, 6),
        colors[i % colors.length]
      );
    }
  }

  // 道具拾取特效
  pickupEffect(x, y, color) {
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const p = this.get();
      p.init(
        x, y,
        Math.cos(angle) * Utils.randFloat(1, 3),
        Math.sin(angle) * Utils.randFloat(1, 3),
        Utils.randInt(10, 20),
        Utils.randFloat(1, 3),
        color
      );
    }
  }

  // 子弹命中特效
  hitEffect(x, y, color) {
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2;
      const p = this.get();
      p.init(
        x, y,
        Math.cos(angle) * Utils.randFloat(0.5, 2),
        Math.sin(angle) * Utils.randFloat(0.5, 2),
        Utils.randInt(8, 16),
        Utils.randFloat(1, 2),
        color
      );
    }
  }

  updateAll() {
    for (const p of this.pool) {
      if (p.active) p.update();
    }
  }

  drawAll(ctx) {
    for (const p of this.pool) {
      if (p.active) p.draw(ctx);
    }
  }

  clearAll() {
    for (const p of this.pool) {
      p.active = false;
    }
  }
}// ==================== 道具系统 ====================
class PowerUp {
  constructor() {
    this.active = false;
    this.x = 0;
    this.y = 0;
    this.width = CONFIG.POWERUP.SIZE;
    this.height = CONFIG.POWERUP.SIZE;
    this.speedY = CONFIG.POWERUP.SPEED;
    this.type = 'gold';
    this.value = 0;
    this.glowTimer = 0;
  }

  init(x, y, type, value) {
    this.active = true;
    this.x = x;
    this.y = y;
    this.type = type;
    this.value = value || 0;
    this.glowTimer = 0;
  }

  update() {
    if (!this.active) return;
    this.y += this.speedY;
    this.glowTimer += 0.1;
    if (this.y > CONFIG.HEIGHT + 20) {
      this.active = false;
    }
  }

  getColor() {
    const map = {
      weapon: CONFIG.COLORS.POWERUP_WEAPON,
      shield: CONFIG.COLORS.POWERUP_SHIELD,
      bomb: CONFIG.COLORS.POWERUP_BOMB,
      wingman: CONFIG.COLORS.POWERUP_WINGMAN,
      gold: CONFIG.COLORS.POWERUP_GOLD,
      heal: CONFIG.COLORS.POWERUP_HEAL,
    };
    return map[this.type] || '#ffffff';
  }

  getLabel() {
    const map = {
      weapon: 'W',
      shield: 'S',
      bomb: 'B',
      wingman: 'M',
      gold: 'G',
      heal: '+',
    };
    return map[this.type] || '?';
  }

  draw(ctx) {
    if (!this.active) return;
    const color = this.getColor();
    const glow = Math.sin(this.glowTimer) * 0.3 + 0.7;

    ctx.save();
    ctx.translate(this.x, this.y);

    // 外发光
    ctx.shadowColor = color;
    ctx.shadowBlur = 12 * glow;

    // 菱形背景
    ctx.fillStyle = Utils.hexToRgba(color, 0.3);
    ctx.beginPath();
    const s = this.width / 2;
    ctx.moveTo(0, -s);
    ctx.lineTo(s, 0);
    ctx.lineTo(0, s);
    ctx.lineTo(-s, 0);
    ctx.closePath();
    ctx.fill();

    // 边框
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // 内圈
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // 标签
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.getLabel(), 0, 1);

    ctx.restore();
  }
}

class PowerUpPool {
  constructor(size) {
    this.pool = [];
    for (let i = 0; i < size; i++) {
      this.pool.push(new PowerUp());
    }
  }

  get() {
    for (const p of this.pool) {
      if (!p.active) return p;
    }
    const p = new PowerUp();
    this.pool.push(p);
    return p;
  }

  spawn(x, y, type, value) {
    const p = this.get();
    p.init(x, y, type, value);
    return p;
  }

  // 根据概率表掉落
  tryDrop(x, y, enemyType) {
    const chances = CONFIG.POWERUP.DROP_CHANCE;
    for (const [type, probs] of Object.entries(chances)) {
      if (Utils.chance(probs[enemyType] || 0)) {
        const value = type === 'gold' ? Utils.randInt(3, 10) : 1;
        this.spawn(x, y, type, value);
        return;
      }
    }
  }

  // Boss 掉落
  bossDrop(x, y) {
    this.spawn(x - 20, y, 'weapon', 1);
    this.spawn(x + 20, y, 'shield', 1);
    this.spawn(x - 40, y, 'bomb', 2);
    this.spawn(x + 40, y, 'bomb', 2);
    this.spawn(x, y, 'wingman', 1);
    this.spawn(x, y - 20, 'gold', 50);
  }

  updateAll() {
    for (const p of this.pool) {
      if (p.active) p.update();
    }
  }

  drawAll(ctx) {
    for (const p of this.pool) {
      if (p.active) p.draw(ctx);
    }
  }

  clearAll() {
    for (const p of this.pool) {
      p.active = false;
    }
  }
}// ==================== 玩家类 ====================
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
}// ==================== 敌机系统 ====================
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
}// ==================== 碰撞检测 ====================
const Collision = {
  // 圆形碰撞
  circleCollision(x1, y1, r1, x2, y2, r2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = dx * dx + dy * dy;
    const radii = r1 + r2;
    return dist < radii * radii;
  },

  // AABB 碰撞
  aabbCollision(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  },

  // 玩家子弹碰撞敌机
  checkBulletEnemyCollisions(bulletPool, enemyPool, particlePool, soundManager) {
    for (const bullet of bulletPool.pool) {
      if (!bullet.active || !bullet.fromPlayer || bullet.isLaser) continue;

      for (const enemy of enemyPool.pool) {
        if (!enemy.active) continue;

        // 激光特殊处理
        const hitRadius = enemy.isBoss ? enemy.width / 2 : enemy.width / 2;
        if (this.circleCollision(bullet.x, bullet.y, bullet.radius, enemy.x, enemy.y, hitRadius)) {
          bullet.active = false;
          bullet.trail = [];
          enemy.hp -= bullet.damage;
          particlePool.hitEffect(bullet.x, bullet.y, '#ffff00');

          if (enemy.hp <= 0) {
            enemy.active = false;
            if (enemy.isBoss) {
              particlePool.bossExplode(enemy.x, enemy.y);
              soundManager.play('bossDeath');
            } else {
              particlePool.explode(enemy.x, enemy.y, CONFIG.PARTICLE.EXPLOSION_COUNT);
              soundManager.play('explosion');
            }
            return { enemy, bullet };
          }
        }
      }
    }

    // 激光碰撞检测
    for (const bullet of bulletPool.pool) {
      if (!bullet.active || !bullet.isLaser) continue;
      for (const enemy of enemyPool.pool) {
        if (!enemy.active) continue;
        // 激光是一条竖线，检查敌机是否在激光路径上
        if (Math.abs(enemy.x - bullet.laserX) < enemy.width / 2 + bullet.laserWidth + 3) {
          if (enemy.y < bullet.laserY) {
            enemy.hp -= bullet.damage;
            particlePool.hitEffect(enemy.x, enemy.y + Utils.randFloat(-10, 10), '#00ffff');
            if (enemy.hp <= 0) {
              enemy.active = false;
              if (enemy.isBoss) {
                particlePool.bossExplode(enemy.x, enemy.y);
              } else {
                particlePool.explode(enemy.x, enemy.y, CONFIG.PARTICLE.EXPLOSION_COUNT);
              }
              return { enemy, bullet };
            }
          }
        }
      }
    }

    return null;
  },

  // 敌机子弹碰撞玩家
  checkBulletPlayerCollisions(bulletPool, player, particlePool) {
    if (!player.alive || player.invincible) return false;

    for (const bullet of bulletPool.pool) {
      if (!bullet.active || bullet.fromPlayer) continue;

      if (this.circleCollision(bullet.x, bullet.y, bullet.radius, player.x, player.y, player.getHitboxRadius())) {
        bullet.active = false;
        bullet.trail = [];
        particlePool.hitEffect(bullet.x, bullet.y, '#ff3366');
        player.takeDamage(bullet.damage);
        return true;
      }
    }
    return false;
  },

  // 敌机碰撞玩家
  checkEnemyPlayerCollisions(enemyPool, player, particlePool) {
    if (!player.alive || player.invincible) return false;

    for (const enemy of enemyPool.pool) {
      if (!enemy.active) continue;
      const radius = enemy.isBoss ? enemy.width / 2 : enemy.width / 2;

      if (this.circleCollision(enemy.x, enemy.y, radius, player.x, player.y, player.getHitboxRadius())) {
        if (!enemy.isBoss) {
          enemy.active = false;
          particlePool.explode(enemy.x, enemy.y, CONFIG.PARTICLE.EXPLOSION_COUNT);
        }
        player.takeDamage(enemy.isBoss ? 30 : 20);
        return true;
      }
    }
    return false;
  },

  // 玩家碰撞道具
  checkPlayerPowerUpCollisions(player, powerUpPool, particlePool, soundManager) {
    for (const p of powerUpPool.pool) {
      if (!p.active) continue;
      if (this.circleCollision(player.x, player.y, player.getHitboxRadius() + 10, p.x, p.y, p.width / 2)) {
        const type = p.type;
        p.active = false;
        particlePool.pickupEffect(p.x, p.y, p.getColor());
        soundManager.play('pickup');
        return type;
      }
    }
    return null;
  },
};// ==================== 输入处理 ====================
class InputManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = {};
    this.mouse = { x: 0, y: 0, down: false };
    this.touch = { active: false, x: 0, y: 0, startX: 0, startY: 0 };

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
    this._onTouchStart = this._onTouchStart.bind(this);
    this._onTouchMove = this._onTouchMove.bind(this);
    this._onTouchEnd = this._onTouchEnd.bind(this);

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    canvas.addEventListener('mousemove', this._onMouseMove);
    canvas.addEventListener('mousedown', this._onMouseDown);
    canvas.addEventListener('mouseup', this._onMouseUp);
    canvas.addEventListener('touchstart', this._onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', this._onTouchMove, { passive: false });
    canvas.addEventListener('touchend', this._onTouchEnd);
  }

  _onKeyDown(e) {
    this.keys[e.key] = true;
    if (e.key === ' ') {
      e.preventDefault();
    }
  }

  _onKeyUp(e) {
    this.keys[e.key] = false;
  }

  _onMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = CONFIG.WIDTH / rect.width;
    const scaleY = CONFIG.HEIGHT / rect.height;
    this.mouse.x = (e.clientX - rect.left) * scaleX;
    this.mouse.y = (e.clientY - rect.top) * scaleY;
  }

  _onMouseDown(e) {
    this.mouse.down = true;
  }

  _onMouseUp(e) {
    this.mouse.down = false;
  }

  _onTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = CONFIG.WIDTH / rect.width;
    const scaleY = CONFIG.HEIGHT / rect.height;
    this.touch.active = true;
    this.touch.x = (touch.clientX - rect.left) * scaleX;
    this.touch.y = (touch.clientY - rect.top) * scaleY;
    this.touch.startX = this.touch.x;
    this.touch.startY = this.touch.y;
  }

  _onTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = CONFIG.WIDTH / rect.width;
    const scaleY = CONFIG.HEIGHT / rect.height;
    this.touch.x = (touch.clientX - rect.left) * scaleX;
    this.touch.y = (touch.clientY - rect.top) * scaleY;
  }

  _onTouchEnd(e) {
    this.touch.active = false;
  }

  // 获取移动方向
  getMovement() {
    let dx = 0;
    let dy = 0;

    // 键盘
    if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) dx -= 1;
    if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) dx += 1;
    if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) dy -= 1;
    if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']) dy += 1;

    // 鼠标跟随
    if (this.mouse.down) {
      const player = this.game ? this.game.player : null;
      if (player && player.alive) {
        const targetDx = this.mouse.x - player.x;
        const targetDy = this.mouse.y - player.y;
        const dist = Math.sqrt(targetDx * targetDx + targetDy * targetDy);
        if (dist > 3) {
          dx = targetDx / dist;
          dy = targetDy / dist;
        }
      }
    }

    // 触屏
    if (this.touch.active) {
      const player = this.game ? this.game.player : null;
      if (player && player.alive) {
        const targetDx = this.touch.x - player.x;
        const targetDy = this.touch.y - player.y;
        const dist = Math.sqrt(targetDx * targetDx + targetDy * targetDy);
        if (dist > 3) {
          dx = targetDx / dist;
          dy = targetDy / dist;
        }
      }
    }

    // 归一化
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 1) {
      dx /= len;
      dy /= len;
    }
    return { dx, dy };
  }

  // 炸弹键
  isBombPressed() {
    return this.keys[' '] || this.keys['Space'];
  }

  // 暂停键
  isPausePressed() {
    return this.keys['Escape'] || this.keys['p'] || this.keys['P'];
  }

  // 确认键
  isConfirmPressed() {
    return this.keys['Enter'] || this.keys[' '] || this.keys['Space'];
  }

  // 清除炸弹键状态（防止连续触发）
  clearBombKey() {
    this.keys[' '] = false;
    this.keys['Space'] = false;
  }

  clearConfirmKey() {
    this.keys['Enter'] = false;
    this.keys[' '] = false;
    this.keys['Space'] = false;
  }

  destroy() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    this.canvas.removeEventListener('mousemove', this._onMouseMove);
    this.canvas.removeEventListener('mousedown', this._onMouseDown);
    this.canvas.removeEventListener('mouseup', this._onMouseUp);
    this.canvas.removeEventListener('touchstart', this._onTouchStart);
    this.canvas.removeEventListener('touchmove', this._onTouchMove);
    this.canvas.removeEventListener('touchend', this._onTouchEnd);
  }
}// ==================== 关卡管理器 ====================
const STAGE_CONFIGS = [
  // ========== 第 1 关：初入战场 ==========
  {
    stage: 1,
    title: '初入战场',
    sub: 'Stage 1 - 突破前线',
    waves: [
      { enemyType: 'normal', count: 4, spawnInterval: 55, movePattern: 'straight', bulletPattern: 'straight' },
      { enemyType: 'normal', count: 5, spawnInterval: 50, movePattern: 'zigzag', bulletPattern: 'straight' },
      { enemyType: 'normal', count: 3, spawnInterval: 50, movePattern: 'sine', bulletPattern: 'straight' },
      { enemyType: 'normal', count: 6, spawnInterval: 45, movePattern: 'straight', bulletPattern: 'straight' },
    ],
    boss: {
      hp: 600, size: 60, name: '哨兵战舰', score: 5000,
      phases: [
        { hpPercent: 1.0, bulletPattern: 'straight', fireRate: 40 },
        { hpPercent: 0.5, bulletPattern: 'aimed', fireRate: 30 },
        { hpPercent: 0.2, bulletPattern: 'spread', fireRate: 25 },
      ],
    },
  },
  // ========== 第 2 关：危机四伏 ==========
  {
    stage: 2,
    title: '危机四伏',
    sub: 'Stage 2 - 深渊突袭',
    waves: [
      { enemyType: 'normal', count: 5, spawnInterval: 45, movePattern: 'zigzag', bulletPattern: 'straight' },
      { enemyType: 'elite', count: 1, spawnInterval: 60, movePattern: 'sine', bulletPattern: 'aimed' },
      { enemyType: 'normal', count: 6, spawnInterval: 40, movePattern: 'straight', bulletPattern: 'spread' },
      { enemyType: 'elite', count: 2, spawnInterval: 50, movePattern: 'easeIn', bulletPattern: 'aimed' },
      { enemyType: 'normal', count: 8, spawnInterval: 35, movePattern: 'sine', bulletPattern: 'straight' },
    ],
    boss: {
      hp: 1200, size: 75, name: '幽冥巡洋舰', score: 12000,
      phases: [
        { hpPercent: 1.0, bulletPattern: 'spread', fireRate: 28 },
        { hpPercent: 0.6, bulletPattern: 'spiral', fireRate: 22 },
        { hpPercent: 0.3, bulletPattern: 'circle', fireRate: 18 },
      ],
    },
  },
  // ========== 第 3 关：终极审判 ==========
  {
    stage: 3,
    title: '终极审判',
    sub: 'Stage 3 - 最终决战',
    waves: [
      { enemyType: 'elite', count: 2, spawnInterval: 50, movePattern: 'sine', bulletPattern: 'aimed' },
      { enemyType: 'normal', count: 8, spawnInterval: 35, movePattern: 'zigzag', bulletPattern: 'spread' },
      { enemyType: 'elite', count: 3, spawnInterval: 45, movePattern: 'circle', bulletPattern: 'circle' },
      { enemyType: 'normal', count: 10, spawnInterval: 30, movePattern: 'straight', bulletPattern: 'aimed' },
      { enemyType: 'elite', count: 4, spawnInterval: 40, movePattern: 'easeIn', bulletPattern: 'spread' },
      { enemyType: 'normal', count: 12, spawnInterval: 25, movePattern: 'sine', bulletPattern: 'straight' },
    ],
    boss: {
      hp: 3000, size: 100, name: '灭世者·泰坦', score: 30000,
      phases: [
        { hpPercent: 1.0, bulletPattern: 'aimed', fireRate: 20 },
        { hpPercent: 0.7, bulletPattern: 'circle', fireRate: 16 },
        { hpPercent: 0.4, bulletPattern: 'spiral', fireRate: 14 },
        { hpPercent: 0.15, bulletPattern: 'spread', fireRate: 10 },
      ],
    },
  },
];

class StageManager {
  constructor(game) {
    this.game = game;
    this.currentStage = 0;
    this.currentWave = 0;
    this.waveTimer = 0;
    this.spawnTimer = 0;
    this.enemiesInWave = 0;
    this.waveEnemiesSpawned = 0;
    this.state = 'waiting'; // waiting | level_intro | waves | boss_intro | boss_fight | clear
    this.levelIntroTimer = 0;
    this.bossIntroTimer = 0;
    this.clearTimer = 0;
    this.bossDefeated = false;
  }

  reset() {
    this.currentStage = 0;
    this.currentWave = 0;
    this.waveTimer = 0;
    this.spawnTimer = 0;
    this.enemiesInWave = 0;
    this.waveEnemiesSpawned = 0;
    this.state = 'waiting';
    this.bossIntroTimer = 0;
    this.clearTimer = 0;
    this.bossDefeated = false;
  }

  startStage(stageIndex) {
    this.currentStage = stageIndex;
    this.currentWave = 0;
    this.state = 'level_intro';
    this.levelIntroTimer = 90; // 1.5 秒关卡标题
  }

  startWave() {
    const stage = STAGE_CONFIGS[this.currentStage];
    if (!stage || this.currentWave >= stage.waves.length) {
      // 所有波次结束，进入 Boss
      this.state = 'boss_intro';
      this.bossIntroTimer = 90; // 1.5 秒
      return;
    }

    const wave = stage.waves[this.currentWave];
    this.waveEnemiesSpawned = 0;
    this.enemiesInWave = wave.count;
    this.spawnTimer = 0;
    this.waveTimer = 0;
  }

  update() {
    const stage = STAGE_CONFIGS[this.currentStage];
    if (!stage) return;

    switch (this.state) {
      case 'level_intro':
        this.updateLevelIntro();
        break;
      case 'waves':
        this.updateWaves(stage);
        break;
      case 'boss_intro':
        this.updateBossIntro(stage);
        break;
      case 'boss_fight':
        this.updateBossFight();
        break;
      case 'clear':
        this.updateClear();
        break;
    }
  }

  updateLevelIntro() {
    this.levelIntroTimer--;
    if (this.levelIntroTimer <= 0) {
      this.state = 'waves';
      this.startWave();
    }
  }

  updateWaves(stage) {
    // 生成敌机
    if (this.waveEnemiesSpawned < this.enemiesInWave) {
      this.spawnTimer--;
      if (this.spawnTimer <= 0) {
        const wave = stage.waves[this.currentWave];
        this.spawnEnemy(wave);
        this.spawnTimer = wave.spawnInterval;
        this.waveEnemiesSpawned++;
      }
    }

    this.waveTimer++;

    // 检查波次是否结束
    const activeEnemies = this.game.enemyPool.getActiveEnemies();
    if (this.waveEnemiesSpawned >= this.enemiesInWave && activeEnemies.length === 0 && this.waveTimer > 60) {
      this.currentWave++;
      this.waveTimer = 0;
      this.startWave();
    }
  }

  spawnEnemy(waveConfig) {
    const x = Utils.randInt(40, CONFIG.WIDTH - 40);
    const y = -30;
    const enemy = this.game.enemyPool.get();
    enemy.game = this.game;
    enemy.init(x, y, waveConfig.enemyType, {
      movePattern: waveConfig.movePattern,
      bulletPattern: waveConfig.bulletPattern,
    });
  }

  updateBossIntro(stage) {
    this.bossIntroTimer--;
    if (this.bossIntroTimer <= 0) {
      // 生成 Boss
      const bossConfig = stage.boss;
      const boss = this.game.enemyPool.get();
      boss.game = this.game;
      boss.init(0, 0, 'boss', bossConfig);
      this.state = 'boss_fight';
      this.game.screenShake(CONFIG.SHAKE.INTENSITY * 2, CONFIG.SHAKE.DURATION * 2);
      this.game.soundManager.play('bossAlert');
    }
  }

  updateBossFight() {
    const boss = this.game.enemyPool.getBoss();
    if (!boss || !boss.active) {
      this.bossDefeated = true;
      this.state = 'clear';
      this.clearTimer = 60; // 1 秒
      this.game.screenShake(CONFIG.SHAKE.INTENSITY * 2, CONFIG.SHAKE.DURATION * 2);
    }
  }

  updateClear() {
    this.clearTimer--;
  }

  isClearReady() {
    return this.state === 'clear' && this.clearTimer <= 0;
  }

  getStageConfig() {
    return STAGE_CONFIGS[this.currentStage];
  }
}// ==================== 渲染器 ====================
class Renderer {
  constructor(game) {
    this.game = game;
    this.stars = [];
    this.nebulas = [];
    this.gridOffset = 0;
    this.shakeX = 0;
    this.shakeY = 0;
    this.shakeIntensity = 0;
    this.shakeDuration = 0;

    // 初始化星空
    for (let i = 0; i < 150; i++) {
      this.stars.push({
        x: Math.random() * CONFIG.WIDTH,
        y: Math.random() * CONFIG.HEIGHT,
        size: Math.random() * 2.5 + 0.3,
        speed: Utils.randFloat(0.3, 1.5),
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: Utils.randFloat(0.02, 0.06),
        color: ['#ffffff', '#aaccff', '#ffccff', '#ccffff'][Math.floor(Math.random() * 4)],
      });
    }

    // 初始化星云
    this.nebulas = [];
    for (let i = 0; i < 5; i++) {
      this.nebulas.push({
        x: Math.random() * CONFIG.WIDTH,
        y: Math.random() * CONFIG.HEIGHT,
        r: Utils.randInt(60, 120),
        color: ['rgba(80, 0, 180,', 'rgba(0, 40, 120,', 'rgba(120, 0, 80,', 'rgba(0, 100, 80,', 'rgba(40, 0, 100,'][i],
        speedX: Utils.randFloat(-0.15, 0.15),
        speedY: Utils.randFloat(-0.1, 0.1),
      });
    }
  }

  // 屏幕震动
  triggerShake(intensity, duration) {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    this.shakeDuration = Math.max(this.shakeDuration, duration);
  }

  updateShake() {
    if (this.shakeDuration > 0) {
      this.shakeX = (Math.random() - 0.5) * this.shakeIntensity * 2;
      this.shakeY = (Math.random() - 0.5) * this.shakeIntensity * 2;
      this.shakeIntensity *= CONFIG.SHAKE.DECAY;
      this.shakeDuration--;
    } else {
      this.shakeX = 0;
      this.shakeY = 0;
      this.shakeIntensity = 0;
    }
  }

  // 更新星空
  updateStars() {
    for (const star of this.stars) {
      star.y += star.speed;
      star.twinkle += star.twinkleSpeed;
      if (star.y > CONFIG.HEIGHT) {
        star.y = 0;
        star.x = Math.random() * CONFIG.WIDTH;
      }
    }
    for (const neb of this.nebulas) {
      neb.x += neb.speedX;
      neb.y += neb.speedY;
      if (neb.x < -120) neb.x = CONFIG.WIDTH + 120;
      if (neb.x > CONFIG.WIDTH + 120) neb.x = -120;
      if (neb.y < -120) neb.y = CONFIG.HEIGHT + 120;
      if (neb.y > CONFIG.HEIGHT + 120) neb.y = -120;
    }
    this.gridOffset = (this.gridOffset + CONFIG.BG.GRID_SPEED) % 50;
  }

  // 绘制背景
  drawBackground(ctx) {
    // 根据关卡切换深空色调
    const stage = this.game.stageManager.currentStage;
    let topColor, midColor, botColor;
    if (stage === 0) {
      topColor = '#0a0a2e'; midColor = '#0d0d3a'; botColor = '#060620'; // 深蓝紫
    } else if (stage === 1) {
      topColor = '#0d0015'; midColor = '#1a0025'; botColor = '#0a0010'; // 暗紫
    } else {
      topColor = '#1a0000'; midColor = '#2a000a'; botColor = '#0d0005'; // 暗红
    }

    const grad = ctx.createLinearGradient(0, 0, 0, CONFIG.HEIGHT);
    grad.addColorStop(0, topColor);
    grad.addColorStop(0.4, midColor);
    grad.addColorStop(0.7, topColor);
    grad.addColorStop(1, botColor);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);

    // 星云
    this.drawNebula(ctx);

    // 星空
    this.drawStars(ctx);

    // 霓虹网格
    this.drawGrid(ctx);
  }

  drawNebula(ctx) {
    ctx.save();
    for (const neb of this.nebulas) {
      const grad = ctx.createRadialGradient(neb.x, neb.y, 0, neb.x, neb.y, neb.r);
      grad.addColorStop(0, neb.color + '0.08)');
      grad.addColorStop(0.5, neb.color + '0.03)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(neb.x - neb.r, neb.y - neb.r, neb.r * 2, neb.r * 2);
    }
    ctx.restore();
  }

  drawStars(ctx) {
    for (const star of this.stars) {
      const alpha = 0.3 + Math.sin(star.twinkle) * 0.4 + 0.3;
      ctx.fillStyle = star.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
      if (star.color === '#ffffff') {
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      } else if (star.color === '#aaccff') {
        ctx.fillStyle = `rgba(170, 204, 255, ${alpha})`;
      } else if (star.color === '#ffccff') {
        ctx.fillStyle = `rgba(255, 204, 255, ${alpha})`;
      } else {
        ctx.fillStyle = `rgba(204, 255, 255, ${alpha})`;
      }

      ctx.beginPath();
      if (star.size > 2) {
        // 大星星画十字闪光
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(star.x - star.size * 2.5, star.y, star.size * 5, 1);
        ctx.fillRect(star.x, star.y - star.size * 2.5, 1, star.size * 5);
      } else {
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  drawGrid(ctx) {
    const horizon = CONFIG.HEIGHT * 0.25;
    ctx.lineWidth = 1;

    // 水平线
    for (let y = horizon; y < CONFIG.HEIGHT; y += 50) {
      const offsetY = (y + this.gridOffset) % CONFIG.HEIGHT;
      const progress = (offsetY - horizon) / (CONFIG.HEIGHT - horizon);
      const alpha = progress * 0.4;
      ctx.strokeStyle = `rgba(0, 200, 255, ${alpha * 0.06})`;
      ctx.beginPath();
      ctx.moveTo(0, offsetY);
      ctx.lineTo(CONFIG.WIDTH, offsetY);
      ctx.stroke();
    }

    // 透视线
    const vanishX = CONFIG.WIDTH / 2;
    const vanishY = horizon;
    ctx.strokeStyle = 'rgba(0, 200, 255, 0.03)';
    for (let i = 0; i <= 20; i++) {
      const x = (CONFIG.WIDTH / 20) * i;
      ctx.beginPath();
      ctx.moveTo(vanishX, vanishY);
      ctx.lineTo(x, CONFIG.HEIGHT);
      ctx.stroke();
    }
  }

  // 绘制 Boss 入场提示
  drawBossWarning(ctx, alpha) {
    if (alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = CONFIG.COLORS.UI_DANGER;
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = CONFIG.COLORS.UI_DANGER;
    ctx.shadowBlur = 20;
    ctx.fillText('WARNING', CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 - 10);
    ctx.font = '16px monospace';
    ctx.fillText('BOSS APPROACHING', CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 + 20);
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // 绘制关卡清屏提示
  drawStageClear(ctx, alpha) {
    if (alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = CONFIG.COLORS.UI_TEXT;
    ctx.font = 'bold 30px monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = CONFIG.COLORS.UI_TEXT;
    ctx.shadowBlur = 15;
    ctx.fillText('STAGE CLEAR!', CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 - 20);
    ctx.font = '18px monospace';
    ctx.fillText('Press ENTER to continue', CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 + 20);
    ctx.shadowBlur = 0;
    ctx.restore();
  }
}// ==================== UI 系统 ====================
class UIManager {
  constructor(game) {
    this.game = game;
    this.comboPopupTimer = 0;
    this.comboPopupText = '';
    this.comboPopupColor = '#ffffff';
    this.messages = []; // [{text, timer, color, y}]
  }

  // 显示 Combo 弹出
  showCombo(combo, color) {
    this.comboPopupTimer = 60;
    this.comboPopupText = `${combo}x 连击!`;
    this.comboPopupColor = color || CONFIG.COLORS.COMBO_COLORS[Math.min(combo - 1, 4)];
  }

  // 显示浮动消息
  showMessage(text, color, duration) {
    this.messages.push({
      text,
      timer: duration || 60,
      color: color || CONFIG.COLORS.UI_TEXT,
      y: CONFIG.HEIGHT / 2,
    });
  }

  update() {
    // Combo 弹出
    if (this.comboPopupTimer > 0) {
      this.comboPopupTimer--;
    }

    // 浮动消息
    for (const msg of this.messages) {
      msg.timer--;
      msg.y -= 1;
    }
    this.messages = this.messages.filter(m => m.timer > 0);
  }

  // 绘制 HUD
  drawHUD(ctx) {
    const player = this.game.player;
    if (!player || !player.alive) return;

    ctx.save();
    const y = 15;
    const margin = 10;

    // 半透明背景条
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, CONFIG.WIDTH, 32);

    ctx.font = '12px monospace';
    ctx.textBaseline = 'middle';

    // 血量
    const hpColor = player.hp > player.maxHp * 0.3 ? '#00ff88' : CONFIG.COLORS.UI_DANGER;
    ctx.fillStyle = hpColor;
    ctx.textAlign = 'left';
    ctx.fillText(`生命 ${Math.ceil(player.hp)}/${player.maxHp}`, margin, y);

    // 武器等级
    ctx.fillStyle = '#ffdd00';
    ctx.fillText(`火力 Lv.${player.weaponLevel}`, margin + 120, y);

    // 护盾
    ctx.fillStyle = '#00ccff';
    ctx.fillText(`护盾 x${player.shieldCount}`, margin + 180, y);

    // 炸弹
    ctx.fillStyle = '#ff6600';
    ctx.fillText(`炸弹 x${player.bombCount}`, margin + 270, y);

    // 金币
    ctx.fillStyle = CONFIG.COLORS.UI_GOLD;
    ctx.textAlign = 'right';
    ctx.fillText(`金币 ${player.gold}`, CONFIG.WIDTH - margin - 80, y);

    // 分数
    ctx.fillStyle = CONFIG.COLORS.UI_HIGHLIGHT;
    ctx.fillText(`得分 ${player.score}`, CONFIG.WIDTH - margin, y);

    ctx.restore();
  }

  // 绘制右侧进度面板
  drawProgressPanel(ctx) {
    const stageMgr = this.game.stageManager;
    const stageCfg = STAGE_CONFIGS[stageMgr.currentStage];
    if (!stageCfg) return;

    const panelX = CONFIG.WIDTH - 60;
    const panelW = 55;
    const panelH = 200;
    const panelY = 50;

    ctx.save();

    // 面板背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.fillRect(panelX, panelY, panelW, panelH);
    ctx.strokeRect(panelX, panelY, panelW, panelH);

    // 标题
    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = CONFIG.COLORS.UI_TEXT;
    ctx.textAlign = 'center';
    ctx.fillText('进度', panelX + panelW / 2, panelY + 14);

    // 分隔线
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.moveTo(panelX + 5, panelY + 20);
    ctx.lineTo(panelX + panelW - 5, panelY + 20);
    ctx.stroke();

    // 关卡
    ctx.font = '10px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('关卡', panelX + panelW / 2, panelY + 36);
    ctx.font = 'bold 18px monospace';
    ctx.fillStyle = CONFIG.COLORS.UI_TEXT;
    ctx.shadowColor = CONFIG.COLORS.UI_TEXT;
    ctx.shadowBlur = 6;
    ctx.fillText(`${stageMgr.currentStage + 1}`, panelX + panelW / 2, panelY + 56);
    ctx.shadowBlur = 0;
    ctx.font = '8px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText(`/ ${STAGE_CONFIGS.length}`, panelX + panelW / 2, panelY + 68);

    // 分隔线
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.moveTo(panelX + 5, panelY + 76);
    ctx.lineTo(panelX + panelW - 5, panelY + 76);
    ctx.stroke();

    // 波次进度
    const totalWaves = stageCfg.waves.length;
    const currentWave = Math.min(stageMgr.currentWave + 1, totalWaves);

    ctx.font = '9px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText('波次', panelX + panelW / 2, panelY + 92);

    // 波次进度条
    const barX = panelX + 8;
    const barY = panelY + 98;
    const barW = panelW - 16;
    const barH = 8;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(barX, barY, barW, barH);

    if (stageMgr.state === 'boss_intro' || stageMgr.state === 'boss_fight' || stageMgr.state === 'clear') {
      // Boss 阶段，满条
      const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
      grad.addColorStop(0, '#ff0044');
      grad.addColorStop(1, '#ff6600');
      ctx.fillStyle = grad;
      ctx.fillRect(barX, barY, barW, barH);
    } else {
      const waveProgress = currentWave / totalWaves;
      const fillW = barW * waveProgress;
      const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
      grad.addColorStop(0, '#00ff88');
      grad.addColorStop(0.6, '#ffaa00');
      grad.addColorStop(1, '#ff0044');
      ctx.fillStyle = grad;
      ctx.fillRect(barX, barY, fillW, barH);
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barW, barH);

    ctx.font = '8px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${currentWave}/${totalWaves}`, panelX + panelW / 2, barY + barH + 12);

    // 状态文字
    const statusY = panelY + panelH - 18;
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';

    let statusText = '';
    let statusColor = '#ffffff';
    const pulse = Math.sin(Date.now() * 0.005) * 0.4 + 0.6;

    switch (stageMgr.state) {
      case 'waves':
        statusText = '敌袭';
        statusColor = '#00ff88';
        break;
      case 'boss_intro':
        statusText = 'BOSS!';
        statusColor = `rgba(255,0,68,${pulse})`;
        ctx.shadowColor = '#ff0044';
        ctx.shadowBlur = 8;
        break;
      case 'boss_fight':
        statusText = 'BOSS!';
        statusColor = `rgba(255,0,68,${pulse})`;
        ctx.shadowColor = '#ff0044';
        ctx.shadowBlur = 8;
        break;
      case 'clear':
        statusText = '通过!';
        statusColor = '#00ffff';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 6;
        break;
    }

    ctx.fillStyle = statusColor;
    ctx.fillText(statusText, panelX + panelW / 2, statusY);
    ctx.shadowBlur = 0;

    ctx.restore();
  }

  // 绘制关卡标题
  drawLevelIntro(ctx) {
    const stageMgr = this.game.stageManager;
    if (stageMgr.state !== 'level_intro') return;

    const stageCfg = STAGE_CONFIGS[stageMgr.currentStage];
    if (!stageCfg) return;

    const alpha = Math.min(1, stageMgr.levelIntroTimer / 30);
    const scale = 1 + (1 - stageMgr.levelIntroTimer / 90) * 0.2;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2);
    ctx.scale(scale, scale);

    // 关卡编号
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#00ccff';
    ctx.fillText(`STAGE ${stageCfg.stage}`, 0, -40);

    // 关卡标题
    ctx.font = 'bold 32px "Microsoft YaHei", "PingFang SC", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#00ccff';
    ctx.shadowBlur = 20;
    ctx.fillText(stageCfg.title, 0, 0);
    ctx.shadowBlur = 0;

    // 副标题
    ctx.font = '13px monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText(stageCfg.sub, 0, 30);

    ctx.restore();
  }

  // 绘制 Boss 血条
  drawBossHP(ctx, boss) {
    if (!boss || !boss.active) return;

    const barWidth = CONFIG.WIDTH - 60;
    const barHeight = 16;
    const x = 30;
    const y = 40;

    ctx.save();

    // Boss 名称
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = CONFIG.COLORS.UI_DANGER;
    ctx.textAlign = 'center';
    ctx.fillText(boss.bossName, CONFIG.WIDTH / 2, y - 5);

    // 血条背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.strokeStyle = CONFIG.COLORS.UI_TEXT;
    ctx.lineWidth = 1;
    ctx.fillRect(x, y, barWidth, barHeight);
    ctx.strokeRect(x, y, barWidth, barHeight);

    // 内框
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
    ctx.strokeRect(x + 2, y + 2, barWidth - 4, barHeight - 4);

    // 血量填充
    const hpPercent = boss.hp / boss.maxHp;
    const fillWidth = (barWidth - 4) * hpPercent;

    // 颜色渐变
    let hpColor;
    if (hpPercent > 0.6) hpColor = '#00ff44';
    else if (hpPercent > 0.3) hpColor = '#ffaa00';
    else hpColor = CONFIG.COLORS.UI_DANGER;

    const grad = ctx.createLinearGradient(x + 2, 0, x + 2 + fillWidth, 0);
    grad.addColorStop(0, hpColor);
    grad.addColorStop(1, Utils.hexToRgba(hpColor, 0.5));
    ctx.fillStyle = grad;
    ctx.fillRect(x + 2, y + 2, fillWidth, barHeight - 4);

    // 阶段分隔线
    const thresholds = CONFIG.BOSS.PHASE_THRESHOLDS;
    for (const t of thresholds) {
      if (t < 1.0) {
        const lineX = x + 2 + (barWidth - 4) * t;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(lineX, y + 2);
        ctx.lineTo(lineX, y + barHeight - 2);
        ctx.stroke();
      }
    }

    // 百分比文字
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.ceil(hpPercent * 100)}%`, CONFIG.WIDTH / 2, y + barHeight / 2 + 1);

    ctx.restore();
  }

  // 绘制 Combo 弹出
  drawComboPopup(ctx) {
    if (this.comboPopupTimer <= 0) return;

    const alpha = Math.min(1, this.comboPopupTimer / 30);
    const scale = 1 + (1 - this.comboPopupTimer / 60) * 0.3;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 - 50);
    ctx.scale(scale, scale);

    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = this.comboPopupColor;
    ctx.shadowColor = this.comboPopupColor;
    ctx.shadowBlur = 15;
    ctx.fillText(this.comboPopupText, 0, 0);
    ctx.shadowBlur = 0;

    ctx.restore();
  }

  // 绘制浮动消息
  drawMessages(ctx) {
    for (const msg of this.messages) {
      const alpha = Math.min(1, msg.timer / 20);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = '16px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = msg.color;
      ctx.shadowColor = msg.color;
      ctx.shadowBlur = 10;
      ctx.fillText(msg.text, CONFIG.WIDTH / 2, msg.y);
      ctx.shadowBlur = 0;
      ctx.restore();
    }
  }

  // 绘制主菜单
  drawMenu(ctx) {
    ctx.save();

    // 标题
    const titleY = CONFIG.HEIGHT * 0.2;
    ctx.font = 'bold 38px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#00ccff';
    ctx.shadowBlur = 20;
    ctx.fillText('星空战机', CONFIG.WIDTH / 2, titleY);

    // 副标题
    ctx.font = '14px monospace';
    ctx.fillStyle = '#ffcc00';
    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur = 8;
    ctx.fillText('NEON DEFENSE', CONFIG.WIDTH / 2, titleY + 32);
    ctx.shadowBlur = 0;

    // ---- 开始按钮 ----
    const btnX = CONFIG.WIDTH / 2;
    const btnY = CONFIG.HEIGHT * 0.48;
    const btnW = 180;
    const btnH = 50;
    const pulse = Math.sin(Date.now() * 0.003) * 0.3 + 0.7;

    ctx.save();
    ctx.translate(btnX, btnY);

    // 按钮外发光
    ctx.shadowColor = '#00ccff';
    ctx.shadowBlur = 20 * pulse;

    // 按钮主体
    const btnGrad = ctx.createLinearGradient(0, -btnH / 2, 0, btnH / 2);
    btnGrad.addColorStop(0, '#0066cc');
    btnGrad.addColorStop(0.5, '#0088ee');
    btnGrad.addColorStop(1, '#0055aa');
    ctx.fillStyle = btnGrad;
    ctx.strokeStyle = '#00ccff';
    ctx.lineWidth = 2;

    // 圆角矩形按钮
    const r = 8;
    const hw = btnW / 2;
    const hh = btnH / 2;
    ctx.beginPath();
    ctx.moveTo(-hw + r, -hh);
    ctx.lineTo(hw - r, -hh);
    ctx.arcTo(hw, -hh, hw, -hh + r, r);
    ctx.lineTo(hw, hh - r);
    ctx.arcTo(hw, hh, hw - r, hh, r);
    ctx.lineTo(-hw + r, hh);
    ctx.arcTo(-hw, hh, -hw, hh - r, r);
    ctx.lineTo(-hw, -hh + r);
    ctx.arcTo(-hw, -hh, -hw + r, -hh, r);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 按钮文字
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px "Microsoft YaHei", "PingFang SC", sans-serif';
    ctx.fillText('开始游戏', 0, 7);

    ctx.restore();

    // 按钮下方提示
    ctx.font = '12px monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.fillText('按 Enter 或点击按钮开始', CONFIG.WIDTH / 2, btnY + btnH / 2 + 28);

    // 操作说明
    const infoY = CONFIG.HEIGHT * 0.68;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.font = '11px monospace';
    const instructions = [
      '移动：WASD / 方向键 / 鼠标 / 触屏',
      '射击：自动开火',
      '炸弹：空格键',
      '暂停：ESC / P',
    ];
    for (let i = 0; i < instructions.length; i++) {
      ctx.fillText(instructions[i], CONFIG.WIDTH / 2, infoY + i * 18);
    }

    ctx.restore();
  }

  // 暂停按钮位置（用于点击检测），放在左上角避免与右侧进度面板重叠
  getPauseBtnBounds() {
    return {
      x: 8,
      y: 38,
      w: 28,
      h: 28,
    };
  }

  // 绘制暂停按钮（游戏进行中右上角）
  drawPauseBtn(ctx) {
    const b = this.getPauseBtnBounds();
    ctx.save();

    // 半透明背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    const r = 5;
    const hw = b.w / 2;
    const hh = b.h / 2;
    const cx = b.x + hw;
    const cy = b.y + hh;
    ctx.beginPath();
    ctx.moveTo(cx - hw + r, cy - hh);
    ctx.lineTo(cx + hw - r, cy - hh);
    ctx.arcTo(cx + hw, cy - hh, cx + hw, cy - hh + r, r);
    ctx.lineTo(cx + hw, cy + hh - r);
    ctx.arcTo(cx + hw, cy + hh, cx + hw - r, cy + hh, r);
    ctx.lineTo(cx - hw + r, cy + hh);
    ctx.arcTo(cx - hw, cy + hh, cx - hw, cy + hh - r, r);
    ctx.lineTo(cx - hw, cy - hh + r);
    ctx.arcTo(cx - hw, cy - hh, cx - hw + r, cy - hh, r);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 暂停图标（两条竖线）
    ctx.fillStyle = '#00ffff';
    const barW = 3;
    const barH = 10;
    const gap = 4;
    ctx.fillRect(cx - gap - barW, cy - barH / 2, barW, barH);
    ctx.fillRect(cx + gap, cy - barH / 2, barW, barH);

    ctx.restore();
    return b;
  }

  // 暂停界面按钮位置
  getPauseContinueBtnBounds() {
    return {
      x: CONFIG.WIDTH / 2 - 75,
      y: CONFIG.HEIGHT / 2 + 20,
      w: 150,
      h: 44,
    };
  }
  getPauseExitBtnBounds() {
    return {
      x: CONFIG.WIDTH / 2 - 75,
      y: CONFIG.HEIGHT / 2 + 75,
      w: 150,
      h: 44,
    };
  }

  // 绘制暂停界面
  drawPause(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);

    // 标题
    ctx.font = 'bold 30px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = CONFIG.COLORS.UI_TEXT;
    ctx.shadowColor = CONFIG.COLORS.UI_TEXT;
    ctx.shadowBlur = 15;
    ctx.fillText('游戏暂停', CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 - 40);
    ctx.shadowBlur = 0;

    const pulse = Math.sin(Date.now() * 0.003) * 0.3 + 0.7;

    // ---- 继续游戏按钮 ----
    this._drawPauseBtn(ctx, this.getPauseContinueBtnBounds(), '继续游戏', '#00ccff', pulse);

    // ---- 退出游戏按钮 ----
    this._drawPauseBtn(ctx, this.getPauseExitBtnBounds(), '退出游戏', '#ff4466', pulse);

    ctx.restore();
  }

  _drawPauseBtn(ctx, b, text, color, pulse) {
    const cx = b.x + b.w / 2;
    const cy = b.y + b.h / 2;
    const r = 6;
    const hw = b.w / 2;
    const hh = b.h / 2;

    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 12 * pulse;

    const grad = ctx.createLinearGradient(0, cy - hh, 0, cy + hh);
    grad.addColorStop(0, Utils.hexToRgba(color, 0.6));
    grad.addColorStop(0.5, Utils.hexToRgba(color, 0.8));
    grad.addColorStop(1, Utils.hexToRgba(color, 0.5));
    ctx.fillStyle = grad;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(cx - hw + r, cy - hh);
    ctx.lineTo(cx + hw - r, cy - hh);
    ctx.arcTo(cx + hw, cy - hh, cx + hw, cy - hh + r, r);
    ctx.lineTo(cx + hw, cy + hh - r);
    ctx.arcTo(cx + hw, cy + hh, cx + hw - r, cy + hh, r);
    ctx.lineTo(cx - hw + r, cy + hh);
    ctx.arcTo(cx - hw, cy + hh, cx - hw, cy + hh - r, r);
    ctx.lineTo(cx - hw, cy - hh + r);
    ctx.arcTo(cx - hw, cy - hh, cx - hw + r, cy - hh, r);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px "Microsoft YaHei", "PingFang SC", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, cx, cy + 6);

    ctx.restore();
  }

  // 绘制升级面板
  drawUpgrade(ctx) {
    const player = this.game.player;
    if (!player) return;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);

    // 标题
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = CONFIG.COLORS.UI_TEXT;
    ctx.shadowColor = CONFIG.COLORS.UI_TEXT;
    ctx.shadowBlur = 10;
    ctx.fillText('升级商店', CONFIG.WIDTH / 2, 50);
    ctx.shadowBlur = 0;

    // 金币
    ctx.font = '14px monospace';
    ctx.fillStyle = CONFIG.COLORS.UI_GOLD;
    ctx.fillText(`金币: ${player.gold}`, CONFIG.WIDTH / 2, 75);

    // 升级项
    const upgrades = [
      { key: 'engine', name: '引擎', desc: '移动速度 +10%', icon: '>' },
      { key: 'armor', name: '装甲', desc: '最大生命 +20%', icon: 'O' },
      { key: 'fire', name: '火力', desc: '伤害 +15%', icon: '#' },
      { key: 'ammo', name: '弹药', desc: '子弹速度 +10%', icon: '!' },
    ];

    const startY = 110;
    const itemH = 65;

    for (let i = 0; i < upgrades.length; i++) {
      const u = upgrades[i];
      const y = startY + i * itemH;
      const currentLv = player.upgrades[u.key];
      const maxLv = CONFIG.UPGRADE.MAX_LEVEL;
      const cost = CONFIG.UPGRADE.COSTS[currentLv];
      const canBuy = currentLv < maxLv && player.gold >= cost;

      // 边框
      ctx.strokeStyle = canBuy ? CONFIG.COLORS.UI_TEXT : 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(30, y, CONFIG.WIDTH - 60, itemH);

      // 名称
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = canBuy ? '#ffffff' : 'rgba(255,255,255,0.4)';
      ctx.fillText(`${u.name}`, 50, y + 20);

      // 描述
      ctx.font = '11px monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillText(`${u.desc}`, 50, y + 38);

      // 等级
      ctx.font = '12px monospace';
      ctx.textAlign = 'right';
      ctx.fillStyle = '#00ffff';
      ctx.fillText(`Lv ${currentLv}/${maxLv}`, CONFIG.WIDTH - 50, y + 20);

      // 价格或 MAX
      if (currentLv >= maxLv) {
        ctx.fillStyle = '#ffdd00';
        ctx.fillText('已满', CONFIG.WIDTH - 50, y + 38);
      } else {
        ctx.fillStyle = canBuy ? CONFIG.COLORS.UI_GOLD : 'rgba(255,255,255,0.3)';
        ctx.fillText(`${cost} 金币`, CONFIG.WIDTH - 50, y + 38);
      }

      // 按键提示
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = canBuy ? '#ffffff' : 'rgba(255,255,255,0.3)';
      ctx.fillText(`[${i + 1}]`, CONFIG.WIDTH / 2, y + 38);
    }

    // 继续提示
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText('按 Enter 继续游戏', CONFIG.WIDTH / 2, startY + upgrades.length * itemH + 30);

    ctx.restore();
  }

  // 绘制游戏结束
  drawGameOver(ctx) {
    const player = this.game.player;
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);

    // 标题
    const isVictory = this.game.isVictory;
    const titleText = isVictory ? '闯关成功' : '游戏失败';
    const titleColor = isVictory ? '#ffdd00' : CONFIG.COLORS.UI_DANGER;

    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = titleColor;
    ctx.shadowColor = titleColor;
    ctx.shadowBlur = 20;
    ctx.fillText(titleText, CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 - 90);

    // 胜利时显示副标题
    if (isVictory) {
      const pulse = Math.sin(Date.now() * 0.005) * 0.4 + 0.6;
      ctx.font = 'bold 18px "Microsoft YaHei", "PingFang SC", sans-serif';
      ctx.fillStyle = `rgba(255, 221, 0, ${pulse})`;
      ctx.shadowColor = '#ffdd00';
      ctx.shadowBlur = 12;
      ctx.fillText('恭喜你完成所有关卡！', CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 - 55);
    }
    ctx.shadowBlur = 0;

    // 统计信息
    ctx.font = '14px monospace';
    ctx.fillStyle = '#ffffff';
    const lines = [
      `得分: ${player.score}`,
      `最高连击: ${player.maxCombo}x`,
      `击杀数: ${player.kills}`,
      `到达关卡: ${this.game.stageManager.currentStage + 1}`,
    ];
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 - 25 + i * 22);
    }

    // ---- 重新开始按钮 ----
    const btnX = CONFIG.WIDTH / 2;
    const btnY = CONFIG.HEIGHT * 0.7;
    const btnW = 180;
    const btnH = 50;
    const pulse = Math.sin(Date.now() * 0.003) * 0.3 + 0.7;

    ctx.save();
    ctx.translate(btnX, btnY);

    // 按钮发光颜色
    const btnGlowColor = isVictory ? '#ffdd00' : '#ff0044';
    ctx.shadowColor = btnGlowColor;
    ctx.shadowBlur = 20 * pulse;

    // 按钮主体
    const btnGrad = ctx.createLinearGradient(0, -btnH / 2, 0, btnH / 2);
    if (isVictory) {
      btnGrad.addColorStop(0, '#cc8800');
      btnGrad.addColorStop(0.5, '#eeaa22');
      btnGrad.addColorStop(1, '#aa6600');
    } else {
      btnGrad.addColorStop(0, '#cc2244');
      btnGrad.addColorStop(0.5, '#ee3355');
      btnGrad.addColorStop(1, '#aa1133');
    }
    ctx.fillStyle = btnGrad;
    ctx.strokeStyle = isVictory ? '#ffcc44' : '#ff6688';
    ctx.lineWidth = 2;

    // 圆角矩形按钮
    const r = 8;
    const hw = btnW / 2;
    const hh = btnH / 2;
    ctx.beginPath();
    ctx.moveTo(-hw + r, -hh);
    ctx.lineTo(hw - r, -hh);
    ctx.arcTo(hw, -hh, hw, -hh + r, r);
    ctx.lineTo(hw, hh - r);
    ctx.arcTo(hw, hh, hw - r, hh, r);
    ctx.lineTo(-hw + r, hh);
    ctx.arcTo(-hw, hh, -hw, hh - r, r);
    ctx.lineTo(-hw, -hh + r);
    ctx.arcTo(-hw, -hh, -hw + r, -hh, r);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 按钮文字
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px "Microsoft YaHei", "PingFang SC", sans-serif';
    const btnText = isVictory ? '再玩一次' : '重新挑战';
    ctx.fillText(btnText, 0, 7);

    ctx.restore();

    // 按钮下方提示
    ctx.font = '12px monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    const hintText = isVictory
      ? '按 Enter 或点击按钮再玩一次'
      : '按 Enter 或点击按钮重新挑战';
    ctx.fillText(hintText, CONFIG.WIDTH / 2, btnY + btnH / 2 + 28);

    ctx.restore();
  }
}// ==================== 音效系统 ====================
class SoundManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.volume = 0.3;
    this.initialized = false;
  }

  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported');
      this.enabled = false;
    }
  }

  ensureContext() {
    if (!this.initialized) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  play(type) {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    switch (type) {
      case 'shoot':
        this._playShoot();
        break;
      case 'explosion':
        this._playExplosion();
        break;
      case 'pickup':
        this._playPickup();
        break;
      case 'bossAlert':
        this._playBossAlert();
        break;
      case 'bossDeath':
        this._playBossDeath();
        break;
      case 'bomb':
        this._playBomb();
        break;
      case 'hit':
        this._playHit();
        break;
      case 'combo':
        this._playCombo();
        break;
    }
  }

  _playShoot() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(this.volume * 0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  _playExplosion() {
    const bufferSize = this.ctx.sampleRate * 0.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const source = this.ctx.createBufferSource();
    const gain = this.ctx.createGain();
    source.buffer = buffer;
    gain.gain.setValueAtTime(this.volume * 0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
    source.connect(gain);
    gain.connect(this.ctx.destination);
    source.start();
  }

  _playPickup() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(this.volume * 0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  _playBossAlert() {
    for (let i = 0; i < 3; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      const t = this.ctx.currentTime + i * 0.3;
      osc.frequency.setValueAtTime(200, t);
      osc.frequency.setValueAtTime(300, t + 0.1);
      gain.gain.setValueAtTime(this.volume * 0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.25);
    }
  }

  _playBossDeath() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.8);
    gain.gain.setValueAtTime(this.volume * 0.6, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.8);

    // 爆炸音
    setTimeout(() => this._playExplosion(), 100);
  }

  _playBomb() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(this.volume * 0.8, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.5);
  }

  _playHit() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(this.volume * 0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  _playCombo() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.setValueAtTime(1000, this.ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(this.volume * 0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }
}// ==================== 游戏主循环 ====================
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
}// ==================== 入口 ====================
(function () {
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) {
    console.error('Canvas not found');
    return;
  }

  // 高清适配（内部分辨率保持 480×800，CSS 由样式表控制为响应式）
  const dpr = window.devicePixelRatio || 1;
  canvas.width = CONFIG.WIDTH * dpr;
  canvas.height = CONFIG.HEIGHT * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  // 创建游戏
  const game = new Game(canvas);

  // 获取点击在游戏坐标系中的位置
  function getClickPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = CONFIG.WIDTH / rect.width;
    const scaleY = CONFIG.HEIGHT / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  // 检查点击是否在按钮范围内
  function isInBounds(mx, my, b) {
    return mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h;
  }

  // 点击 Canvas 开始游戏（从菜单）
  canvas.addEventListener('click', (e) => {
    const pos = getClickPos(e);

    if (game.state === 'menu') {
      game.startGame();
      return;
    }

    // 暂停按钮点击
    if (game.state === 'playing' || game.state === 'boss_intro' || game.state === 'boss_fight') {
      const pauseBtn = game.ui.getPauseBtnBounds();
      if (isInBounds(pos.x, pos.y, pauseBtn)) {
        game.state = 'paused';
        return;
      }
    }

    // 暂停界面按钮点击
    if (game.state === 'paused') {
      const continueBtn = game.ui.getPauseContinueBtnBounds();
      if (isInBounds(pos.x, pos.y, continueBtn)) {
        game.state = game._getActualGameState();
        return;
      }
      const exitBtn = game.ui.getPauseExitBtnBounds();
      if (isInBounds(pos.x, pos.y, exitBtn)) {
        game.exitToMenu();
        return;
      }
    }

    if (game.state === 'gameover') {
      // 检查是否点击了重新开始按钮
      const btnX = CONFIG.WIDTH / 2;
      const btnY = CONFIG.HEIGHT * 0.7;
      const btnW = 180;
      const btnH = 50;

      if (isInBounds(pos.x, pos.y, { x: btnX - btnW / 2, y: btnY - btnH / 2, w: btnW, h: btnH })) {
        game.restartGame();
      }
    }
  });

  // 键盘回车开始 / 重新开始
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      if (game.state === 'menu') {
        game.startGame();
      } else if (game.state === 'gameover') {
        game.restartGame();
      }
    }
  });
})();
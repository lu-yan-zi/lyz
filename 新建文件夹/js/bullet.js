// ==================== 子弹系统 ====================
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
}
// ==================== 粒子系统 ====================
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
}
// ==================== 道具系统 ====================
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
}
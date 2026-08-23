// ==================== 渲染器 ====================
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
}
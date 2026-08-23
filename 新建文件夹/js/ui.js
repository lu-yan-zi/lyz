// ==================== UI 系统 ====================
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
}
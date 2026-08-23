// ==================== 入口 ====================
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
// ==================== 输入处理 ====================
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
}
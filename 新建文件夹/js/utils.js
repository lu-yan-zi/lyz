// ==================== 工具函数 ====================
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
};
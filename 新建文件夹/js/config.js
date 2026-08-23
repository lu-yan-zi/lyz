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
};
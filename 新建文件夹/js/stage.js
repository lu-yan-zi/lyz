// ==================== 关卡管理器 ====================
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
}
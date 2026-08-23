// ==================== 音效系统 ====================
class SoundManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.volume = 0.3;
    this.initialized = false;
  }

  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported');
      this.enabled = false;
    }
  }

  ensureContext() {
    if (!this.initialized) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  play(type) {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    switch (type) {
      case 'shoot':
        this._playShoot();
        break;
      case 'explosion':
        this._playExplosion();
        break;
      case 'pickup':
        this._playPickup();
        break;
      case 'bossAlert':
        this._playBossAlert();
        break;
      case 'bossDeath':
        this._playBossDeath();
        break;
      case 'bomb':
        this._playBomb();
        break;
      case 'hit':
        this._playHit();
        break;
      case 'combo':
        this._playCombo();
        break;
    }
  }

  _playShoot() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(this.volume * 0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  _playExplosion() {
    const bufferSize = this.ctx.sampleRate * 0.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const source = this.ctx.createBufferSource();
    const gain = this.ctx.createGain();
    source.buffer = buffer;
    gain.gain.setValueAtTime(this.volume * 0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
    source.connect(gain);
    gain.connect(this.ctx.destination);
    source.start();
  }

  _playPickup() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(this.volume * 0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  _playBossAlert() {
    for (let i = 0; i < 3; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      const t = this.ctx.currentTime + i * 0.3;
      osc.frequency.setValueAtTime(200, t);
      osc.frequency.setValueAtTime(300, t + 0.1);
      gain.gain.setValueAtTime(this.volume * 0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.25);
    }
  }

  _playBossDeath() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.8);
    gain.gain.setValueAtTime(this.volume * 0.6, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.8);

    // 爆炸音
    setTimeout(() => this._playExplosion(), 100);
  }

  _playBomb() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(this.volume * 0.8, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.5);
  }

  _playHit() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(this.volume * 0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  _playCombo() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.setValueAtTime(1000, this.ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(this.volume * 0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }
}
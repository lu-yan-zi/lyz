// ==================== 碰撞检测 ====================
const Collision = {
  // 圆形碰撞
  circleCollision(x1, y1, r1, x2, y2, r2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = dx * dx + dy * dy;
    const radii = r1 + r2;
    return dist < radii * radii;
  },

  // AABB 碰撞
  aabbCollision(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  },

  // 玩家子弹碰撞敌机
  checkBulletEnemyCollisions(bulletPool, enemyPool, particlePool, soundManager) {
    for (const bullet of bulletPool.pool) {
      if (!bullet.active || !bullet.fromPlayer || bullet.isLaser) continue;

      for (const enemy of enemyPool.pool) {
        if (!enemy.active) continue;

        // 激光特殊处理
        const hitRadius = enemy.isBoss ? enemy.width / 2 : enemy.width / 2;
        if (this.circleCollision(bullet.x, bullet.y, bullet.radius, enemy.x, enemy.y, hitRadius)) {
          bullet.active = false;
          bullet.trail = [];
          enemy.hp -= bullet.damage;
          particlePool.hitEffect(bullet.x, bullet.y, '#ffff00');

          if (enemy.hp <= 0) {
            enemy.active = false;
            if (enemy.isBoss) {
              particlePool.bossExplode(enemy.x, enemy.y);
              soundManager.play('bossDeath');
            } else {
              particlePool.explode(enemy.x, enemy.y, CONFIG.PARTICLE.EXPLOSION_COUNT);
              soundManager.play('explosion');
            }
            return { enemy, bullet };
          }
        }
      }
    }

    // 激光碰撞检测
    for (const bullet of bulletPool.pool) {
      if (!bullet.active || !bullet.isLaser) continue;
      for (const enemy of enemyPool.pool) {
        if (!enemy.active) continue;
        // 激光是一条竖线，检查敌机是否在激光路径上
        if (Math.abs(enemy.x - bullet.laserX) < enemy.width / 2 + bullet.laserWidth + 3) {
          if (enemy.y < bullet.laserY) {
            enemy.hp -= bullet.damage;
            particlePool.hitEffect(enemy.x, enemy.y + Utils.randFloat(-10, 10), '#00ffff');
            if (enemy.hp <= 0) {
              enemy.active = false;
              if (enemy.isBoss) {
                particlePool.bossExplode(enemy.x, enemy.y);
              } else {
                particlePool.explode(enemy.x, enemy.y, CONFIG.PARTICLE.EXPLOSION_COUNT);
              }
              return { enemy, bullet };
            }
          }
        }
      }
    }

    return null;
  },

  // 敌机子弹碰撞玩家
  checkBulletPlayerCollisions(bulletPool, player, particlePool) {
    if (!player.alive || player.invincible) return false;

    for (const bullet of bulletPool.pool) {
      if (!bullet.active || bullet.fromPlayer) continue;

      if (this.circleCollision(bullet.x, bullet.y, bullet.radius, player.x, player.y, player.getHitboxRadius())) {
        bullet.active = false;
        bullet.trail = [];
        particlePool.hitEffect(bullet.x, bullet.y, '#ff3366');
        player.takeDamage(bullet.damage);
        return true;
      }
    }
    return false;
  },

  // 敌机碰撞玩家
  checkEnemyPlayerCollisions(enemyPool, player, particlePool) {
    if (!player.alive || player.invincible) return false;

    for (const enemy of enemyPool.pool) {
      if (!enemy.active) continue;
      const radius = enemy.isBoss ? enemy.width / 2 : enemy.width / 2;

      if (this.circleCollision(enemy.x, enemy.y, radius, player.x, player.y, player.getHitboxRadius())) {
        if (!enemy.isBoss) {
          enemy.active = false;
          particlePool.explode(enemy.x, enemy.y, CONFIG.PARTICLE.EXPLOSION_COUNT);
        }
        player.takeDamage(enemy.isBoss ? 30 : 20);
        return true;
      }
    }
    return false;
  },

  // 玩家碰撞道具
  checkPlayerPowerUpCollisions(player, powerUpPool, particlePool, soundManager) {
    for (const p of powerUpPool.pool) {
      if (!p.active) continue;
      if (this.circleCollision(player.x, player.y, player.getHitboxRadius() + 10, p.x, p.y, p.width / 2)) {
        const type = p.type;
        p.active = false;
        particlePool.pickupEffect(p.x, p.y, p.getColor());
        soundManager.play('pickup');
        return type;
      }
    }
    return null;
  },
};
/**
 * CollisionDetector.js
 * Módulo responsável pela detecção de colisão entre objetos
 * 
 * CORREÇÃO CRÍTICA:
 * A renderização dos objetos do mundo é feita com: ctx.translate(0, depthOffset)
 * onde depthOffset = -depth + 300 + cameraOffset
 * 
 * Para que a colisão seja sincronizada com a renderização visual,
 * TODOS os objetos devem ser comparados no MESMO sistema de coordenadas.
 * 
 * Sistema de Coordenadas Escolhido: TELA (screen coordinates)
 * - Submarino: sempre em coordenadas de tela (posição fixa na tela)
 * - Objetos do Mundo: convertidos para coordenadas de tela usando depthOffset
 */

class CollisionDetector {
    constructor() {
        // Rastrear objetos em cooldown de colisão (para evitar múltiplas colisões)
        this.collisionCooldown = new Map();
        this.cooldownDuration = 100; // ms
    }

    /**
     * Verifica colisão AABB entre dois retângulos
     * @param {Object} rect1 - Primeiro retângulo {x, y, width, height}
     * @param {Object} rect2 - Segundo retângulo {x, y, width, height}
     * @returns {boolean} - true se há colisão
     */
    checkAABB(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }

    /**
     * Verifica se um objeto está em cooldown de colisão
     * @param {GameObject} obj - Objeto a verificar
     * @returns {boolean} - true se está em cooldown
     */
    isInCollisionCooldown(obj) {
        if (!this.collisionCooldown.has(obj.id)) {
            return false;
        }

        const cooldownTime = this.collisionCooldown.get(obj.id);
        const now = Date.now();

        if (now - cooldownTime >= this.cooldownDuration) {
            this.collisionCooldown.delete(obj.id);
            return false;
        }

        return true;
    }

    /**
     * Define um objeto em cooldown de colisão
     * @param {GameObject} obj - Objeto a colocar em cooldown
     */
    setCollisionCooldown(obj) {
        this.collisionCooldown.set(obj.id, Date.now());
    }

    /**
     * Limpa o cooldown de um objeto
     * @param {GameObject} obj - Objeto a limpar
     */
    clearCollisionCooldown(obj) {
        this.collisionCooldown.delete(obj.id);
    }

    /**
     * Calcula o depthOffset que é usado na renderização
     * CRÍTICO: Este deve ser o MESMO cálculo usado no Renderer.js
     * 
     * @param {number} depth - Profundidade atual do submarino
     * @param {number} cameraOffset - Offset da câmera
     * @returns {number} - O offset de profundidade
     */
    calculateDepthOffset(depth, cameraOffset) {
        return -depth + 300 + cameraOffset;
    }

    /**
     * Obtém a hitbox de um objeto do mundo em coordenadas de tela
     * CRÍTICO: Isso garante que a hitbox acompanhe visualmente a imagem
     * 
     * @param {GameObject} obj - Objeto do mundo
     * @param {number} depthOffset - O offset de profundidade (já calculado)
     * @returns {Object} - Hitbox em coordenadas de tela {x, y, width, height}
     */
    getWorldObjectScreenHitbox(obj, depthOffset) {
        // Obter a hitbox base do objeto (com offsets específicos do tipo)
        const baseHitbox = obj.getHitbox();
        
        // Aplicar a transformação de câmera à coordenada Y
        // Isso simula o que o Canvas faz com ctx.translate(0, depthOffset)
        const screenY = baseHitbox.y + depthOffset;
        
        return {
            x: baseHitbox.x,
            y: screenY,
            width: baseHitbox.width,
            height: baseHitbox.height
        };
    }

    /**
     * Verifica colisão entre o submarino e monstros
     * @param {Submarine} submarine - O submarino
     * @param {Array<GameObject>} monsters - Array de monstros
     * @param {number} depth - Profundidade atual
     * @param {number} cameraOffset - Offset da câmera
     * @returns {Array<GameObject>} - Array de monstros que colidiram
     */
    checkMonsterCollisions(submarine, monsters, depth, cameraOffset) {
        const subScreenHitbox = submarine.getScreenHitbox();
        const depthOffset = this.calculateDepthOffset(depth, cameraOffset);
        const collisions = [];

        monsters.forEach(monster => {
            if (!this.isInCollisionCooldown(monster)) {
                const monsterScreenHitbox = this.getWorldObjectScreenHitbox(monster, depthOffset);
                
                if (this.checkAABB(subScreenHitbox, monsterScreenHitbox)) {
                    collisions.push(monster);
                    this.setCollisionCooldown(monster);
                }
            }
        });

        return collisions;
    }

    /**
     * Verifica colisão entre o submarino e obstáculos
     * @param {Submarine} submarine - O submarino
     * @param {Array<GameObject>} obstacles - Array de obstáculos
     * @param {number} depth - Profundidade atual
     * @param {number} cameraOffset - Offset da câmera
     * @returns {Array<GameObject>} - Array de obstáculos que colidiram
     */
    checkObstacleCollisions(submarine, obstacles, depth, cameraOffset) {
        const subScreenHitbox = submarine.getScreenHitbox();
        const depthOffset = this.calculateDepthOffset(depth, cameraOffset);
        const collisions = [];

        obstacles.forEach(obstacle => {
            if (!this.isInCollisionCooldown(obstacle)) {
                const obstacleScreenHitbox = this.getWorldObjectScreenHitbox(obstacle, depthOffset);
                
                if (this.checkAABB(subScreenHitbox, obstacleScreenHitbox)) {
                    collisions.push(obstacle);
                    this.setCollisionCooldown(obstacle);
                }
            }
        });

        return collisions;
    }

    /**
     * Verifica colisão entre o submarino e bolhas
     * @param {Submarine} submarine - O submarino
     * @param {Array<GameObject>} bubbles - Array de bolhas
     * @param {number} depth - Profundidade atual
     * @param {number} cameraOffset - Offset da câmera
     * @returns {Array<GameObject>} - Array de bolhas que colidiram
     */
    checkBubbleCollisions(submarine, bubbles, depth, cameraOffset) {
        const subScreenHitbox = submarine.getScreenHitbox();
        const depthOffset = this.calculateDepthOffset(depth, cameraOffset);
        const collisions = [];

        bubbles.forEach(bubble => {
            const bubbleScreenHitbox = this.getWorldObjectScreenHitbox(bubble, depthOffset);
            
            if (this.checkAABB(subScreenHitbox, bubbleScreenHitbox)) {
                collisions.push(bubble);
            }
        });

        return collisions;
    }

    /**
     * Limpa cooldowns expirados
     */
    cleanupCooldowns() {
        const now = Date.now();
        const expiredIds = [];

        this.collisionCooldown.forEach((cooldownTime, id) => {
            if (now - cooldownTime >= this.cooldownDuration) {
                expiredIds.push(id);
            }
        });

        expiredIds.forEach(id => this.collisionCooldown.delete(id));
    }

    /**
     * Reseta todos os cooldowns
     */
    reset() {
        this.collisionCooldown.clear();
    }

    /**
     * Retorna informações de debug sobre colisões
     * @returns {Object}
     */
    getDebugInfo() {
        return {
            activeCooldowns: this.collisionCooldown.size,
            cooldownDuration: this.cooldownDuration
        };
    }
}

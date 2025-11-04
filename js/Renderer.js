/**
 * Renderer.js
 * Classe responsável por toda a renderização no Canvas
 */

class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;

        // Mapeamento de emojis para elementos do jogo
        this.emojiMap = {
            submarine: '🚢',
            shark: '🦈',
            squid: '🦑',
            angler: '🎣',
            viper: '🐍',
            bubble: '🫧',
            rock: '🪨'
        };
        
        // Imagens carregadas
        this.images = {};
        
        // Cores de profundidade
        this.depthColor = { r: 0, g: 100, b: 150 };
        
        // Referência de fundo
        this.backgroundY = 0;
        
        this.loadImages();
    }

    /**
     * Carrega todas as imagens necessárias (agora ignorado, mas mantido para compatibilidade)
     */
    loadImages() {
        // Não carrega imagens, pois usaremos emojis
        console.log('Emojis ativados! Ignorando carregamento de imagens.');
    }

    /**
     * Atualiza a cor de profundidade com base na profundidade atual
     * @param {number} depth - Profundidade atual
     */
    updateDepthColor(depth) {
        if (depth < 1000) {
            this.depthColor = { r: 0, g: 100, b: 150 };
        } else if (depth < 3000) {
            this.depthColor = { r: 0, g: 60, b: 120 };
        } else if (depth < 6000) {
            this.depthColor = { r: 0, g: 30, b: 80 };
        } else if (depth < 9000) {
            this.depthColor = { r: 0, g: 15, b: 50 };
        } else {
            this.depthColor = { r: 0, g: 5, b: 20 };
        }
    }

    /**
     * Limpa o canvas
     */
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Desenha o fundo do oceano com gradiente
     */
    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, `rgb(${this.depthColor.r}, ${this.depthColor.g + 50}, ${this.depthColor.b + 100})`);
        gradient.addColorStop(0.5, `rgb(${this.depthColor.r}, ${this.depthColor.g}, ${this.depthColor.b})`);
        gradient.addColorStop(1, `rgb(${this.depthColor.r}, ${Math.max(0, this.depthColor.g - 20)}, ${Math.max(0, this.depthColor.b - 40)})`);
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Desenha raios de luz (apenas em profundidades rasas)
     * @param {number} depth - Profundidade atual
     */
    drawLightRays(depth) {
        if (depth >= 2000) return;

        const lightOpacity = Math.max(0, (2000 - depth) / 2000) * 0.15;

        for (let i = 0; i < 3; i++) {
            const rayGradient = this.ctx.createLinearGradient(
                150 + i * 200, 0,
                200 + i * 200, this.canvas.height
            );
            rayGradient.addColorStop(0, `rgba(100, 200, 255, ${lightOpacity})`);
            rayGradient.addColorStop(1, 'rgba(100, 200, 255, 0)');

            this.ctx.fillStyle = rayGradient;
            this.ctx.fillRect(150 + i * 200, 0, 60, this.canvas.height);
        }
    }

    /**
     * Desenha partículas ambientes
     * @param {Array<Object>} particles - Array de partículas
     */
    drawParticles(particles) {
        particles.forEach(p => {
            this.ctx.fillStyle = `rgba(100, 200, 255, ${0.3 * (p.size / 4)})`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    /**
     * Desenha bolhas
     * @param {Array<GameObject>} bubbles - Array de bolhas
     */
    drawBubbles(bubbles) {
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        bubbles.forEach(bubble => {
            this.ctx.save();
            this.ctx.shadowColor = 'rgba(100, 200, 255, 0.6)';
            this.ctx.shadowBlur = 10;
            this.ctx.fillText(this.emojiMap['bubble'], bubble.x + bubble.width / 2, bubble.y + bubble.height / 2);
            this.ctx.restore();
        });
    }

    /**
     * Desenha obstáculos (rochas)
     * @param {Array<GameObject>} obstacles - Array de obstáculos
     */
    drawObstacles(obstacles) {
        this.ctx.font = '40px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        obstacles.forEach(obstacle => {
            this.ctx.save();
            this.ctx.shadowColor = 'rgba(150, 150, 150, 0.5)';
            this.ctx.shadowBlur = 15;
            this.ctx.fillText(this.emojiMap['rock'], obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2);
            this.ctx.restore();
        });
    }

    /**
     * Desenha monstros
     * @param {Array<GameObject>} monsters - Array de monstros
     */
    drawMonsters(monsters) {
        this.ctx.font = '50px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        monsters.forEach(monster => {
            if (monster.visible) {
                this.ctx.save();

                // Cores de bioluminescência
                const glowColors = {
                    squid: 'rgba(0, 255, 255, 0.5)',
                    angler: 'rgba(0, 255, 100, 0.6)',
                    viper: 'rgba(0, 150, 255, 0.4)',
                    shark: 'rgba(255, 100, 0, 0.3)'
                };

                this.ctx.shadowColor = glowColors[monster.type] || 'rgba(0, 255, 255, 0.4)';
                this.ctx.shadowBlur = 15;

                // Desenhar monstro (inverter squid)
                if (monster.type === 'squid') {
                    this.ctx.translate(monster.x + monster.width, monster.y);
                    this.ctx.scale(-1, 1);
                    this.ctx.fillText(this.emojiMap[monster.type], 0 - monster.width / 2, monster.y + monster.height / 2);
                } else {
                    this.ctx.fillText(this.emojiMap[monster.type], monster.x + monster.width / 2, monster.y + monster.height / 2);
                }

                this.ctx.restore();
            }
        });
    }

    /**
     * Desenha o efeito de sonar
     * @param {Submarine} submarine - O submarino
     * @param {boolean} sonarActive - Se o sonar está ativo
     */
    drawSonar(submarine, sonarActive) {
        if (!sonarActive) return;

        const center = submarine.getScreenCenter();
        const time = Date.now() / 1000;

        // Múltiplos anéis de sonar
        for (let i = 0; i < 3; i++) {
            const radius = ((time * 200 + i * 100) % 400);
            const opacity = Math.max(0, 0.3 - radius / 400);

            this.ctx.save();
            this.ctx.strokeStyle = `rgba(0, 217, 255, ${opacity})`;
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.restore();
        }

        // Brilho do sonar
        const gradient = this.ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, 300);
        gradient.addColorStop(0, 'rgba(0, 217, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 217, 255, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Desenha o submarino
     * @param {Submarine} submarine - O submarino
     */
    drawSubmarine(submarine) {
        const center = submarine.getScreenCenter();

        this.ctx.save();
        this.ctx.translate(center.x, center.y);
        this.ctx.rotate((submarine.rotation * Math.PI) / 180);

        // Desenhar feixe de luz (atrás do submarino)
        const beamGradient = this.ctx.createLinearGradient(0, 0, 150, 0);
        beamGradient.addColorStop(0, 'rgba(255, 255, 200, 0.4)');
        beamGradient.addColorStop(1, 'rgba(255, 255, 200, 0)');
        this.ctx.fillStyle = beamGradient;
        this.ctx.beginPath();
        this.ctx.moveTo(submarine.width / 2, 0);
        this.ctx.lineTo(submarine.width / 2 + 150, -50);
        this.ctx.lineTo(submarine.width / 2 + 150, 50);
        this.ctx.closePath();
        this.ctx.fill();

        // Desenhar submarino com brilho (agora emoji)
        this.ctx.shadowColor = 'rgba(255, 255, 100, 0.6)';
        this.ctx.shadowBlur = 12;
        this.ctx.font = '60px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(this.emojiMap['submarine'], 0, 0);

        this.ctx.restore();
    }

    /**
     * Desenha hitboxes para debug
     * @param {Submarine} submarine - O submarino
     * @param {Array<GameObject>} monsters - Array de monstros
     * @param {Array<GameObject>} obstacles - Array de obstáculos
     * @param {Array<GameObject>} bubbles - Array de bolhas
     * @param {number} depth - Profundidade atual
     */
    drawDebugHitboxes(submarine, monsters, obstacles, bubbles, depth, cameraOffset) {
        // CRÍTICO: Desenhar as hitboxes FORA da transformação de câmera
        // para que elas apareçam em coordenadas de tela (não transformadas)
        
        // Hitbox do submarino (em coordenadas de tela)
        const subHitbox = submarine.getScreenHitbox();
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(subHitbox.x, subHitbox.y, subHitbox.width, subHitbox.height);
        this.ctx.restore();

        // Hitboxes dos objetos do mundo (convertidas para coordenadas de tela)
        // CRÍTICO: Use o MESMO cálculo que o CollisionDetector
        const depthOffset = -depth + 300 + cameraOffset;
        const drawWorldObjectHitbox = (obj) => {
            const baseHitbox = obj.getHitbox();
            const screenY = baseHitbox.y + depthOffset;
            
            this.ctx.save();
            this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(baseHitbox.x, screenY, baseHitbox.width, baseHitbox.height);
            this.ctx.restore();
        };

        monsters.forEach(drawWorldObjectHitbox);
        obstacles.forEach(drawWorldObjectHitbox);
        bubbles.forEach(drawWorldObjectHitbox);
    }

    /**
     * Desenha vinheta de profundidade
     * @param {number} depth - Profundidade atual
     */
    drawVignette(depth) {
        const vignette = this.ctx.createRadialGradient(
            this.canvas.width / 2,
            this.canvas.height / 2,
            this.canvas.width / 4,
            this.canvas.width / 2,
            this.canvas.height / 2,
            this.canvas.width
        );
        vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vignette.addColorStop(1, `rgba(0, 0, 0, ${Math.min(0.5, depth / 11000)})`);
        this.ctx.fillStyle = vignette;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Renderiza um frame completo
     * @param {Object} gameState - Estado do jogo
     * @param {Submarine} submarine - O submarino
     * @param {Array<GameObject>} monsters - Array de monstros
     * @param {Array<GameObject>} obstacles - Array de obstáculos
     * @param {Array<GameObject>} bubbles - Array de bolhas
     * @param {Array<Object>} particles - Array de partículas
     * @param {number} cameraOffset - Offset da câmera
     * @param {boolean} debugMode - Se o modo debug está ativo
     */
    render(gameState, submarine, monsters, obstacles, bubbles, particles, cameraOffset, debugMode) {
        this.clear();
        this.updateDepthColor(gameState.depth);

        // Desenhar fundo
        this.drawBackground();
        this.drawLightRays(gameState.depth);

        // Aplicar transformação de câmera
        this.ctx.save();
        const depthOffset = -gameState.depth + 300 + cameraOffset;
        this.ctx.translate(0, depthOffset);

        // Desenhar partículas
        this.drawParticles(particles);

        // Desenhar objetos do mundo
        this.drawBubbles(bubbles);
        this.drawObstacles(obstacles);
        this.drawMonsters(monsters);

        // Debug hitboxes
        if (debugMode) {
            this.drawDebugHitboxes(submarine, monsters, obstacles, bubbles, gameState.depth, cameraOffset);
        }

        this.ctx.restore();

        // Desenhar sonar (fora da transformação de câmera)
        this.drawSonar(submarine, gameState.sonarActive);

        // Desenhar submarino (fora da transformação de câmera)
        this.drawSubmarine(submarine);

        // Desenhar vinheta
        this.drawVignette(gameState.depth);
    }

    /**
     * Retorna se as imagens foram carregadas
     * @returns {boolean}
     */
    imagesLoaded() {
        // Sempre retorna true, pois não dependemos mais de imagens
        return true;
    }

    /**
     * Reseta o renderer
     */
    reset() {
        this.backgroundY = 0;
        this.depthColor = { r: 0, g: 100, b: 150 };
    }
}

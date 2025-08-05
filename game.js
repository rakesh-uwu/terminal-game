class PingPong {
    constructor() {
        this.canvas = document.getElementById('game');
        this.ctx = this.canvas.getContext('2d');
        this.canvasWidth = this.canvas.width;
        this.canvasHeight = this.canvas.height;
        
        this.ballSize = 15;
        this.paddleWidth = 15;
        this.paddleHeight = 100;
        this.paddleSpeed = 8;
        this.computerPaddleSpeed = 5;
        
        this.ball = {
            x: this.canvasWidth / 2,
            y: this.canvasHeight / 2,
            dx: 5,
            dy: 5,
            speed: 5
        };
        
        this.playerPaddle = {
            x: this.paddleWidth,
            y: (this.canvasHeight - this.paddleHeight) / 2,
            score: 0
        };
        
        this.computerPaddle = {
            x: this.canvasWidth - this.paddleWidth * 2,
            y: (this.canvasHeight - this.paddleHeight) / 2,
            score: 0
        };
        
        this.gameRunning = false;
        this.gamePaused = false;
        this.mouseY = 0;
        
        this.startBtn = document.getElementById('start-btn');
        this.difficultySelect = document.getElementById('difficulty');
        this.playerScoreElement = document.getElementById('player-score');
        this.computerScoreElement = document.getElementById('computer-score');
        
        this.bindEvents();
    }
    
    bindEvents() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseY = e.clientY - rect.top;
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            this.mouseY = e.touches[0].clientY - rect.top;
        }, { passive: false });
        
        this.startBtn.addEventListener('click', () => {
            if (!this.gameRunning) {
                this.startGame();
            } else if (this.gamePaused) {
                this.resumeGame();
            } else {
                this.pauseGame();
            }
        });
        
        this.difficultySelect.addEventListener('change', () => {
            this.setDifficulty(this.difficultySelect.value);
        });
        
        window.addEventListener('keydown', (e) => {
            if (e.key === 'p' || e.key === 'P') {
                if (this.gameRunning && !this.gamePaused) {
                    this.pauseGame();
                } else if (this.gameRunning && this.gamePaused) {
                    this.resumeGame();
                }
            }
        });
        
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        this.setDifficulty(this.difficultySelect.value);
    }
    
    setDifficulty(level) {
        switch(level) {
            case 'easy':
                this.computerPaddleSpeed = 3;
                break;
            case 'medium':
                this.computerPaddleSpeed = 5;
                break;
            case 'hard':
                this.computerPaddleSpeed = 7;
                break;
            default:
                this.computerPaddleSpeed = 5;
        }
    }
    
    startGame() {
        this.resetGame();
        this.gameRunning = true;
        this.gamePaused = false;
        this.startBtn.textContent = 'Pause Game';
        this.gameLoop();
    }
    
    pauseGame() {
        this.gamePaused = true;
        this.startBtn.textContent = 'Resume Game';
    }
    
    resumeGame() {
        this.gamePaused = false;
        this.startBtn.textContent = 'Pause Game';
        this.gameLoop();
    }
    
    resetGame() {
        this.ball.x = this.canvasWidth / 2;
        this.ball.y = this.canvasHeight / 2;
        this.ball.dx = this.ball.speed * (Math.random() > 0.5 ? 1 : -1);
        this.ball.dy = this.ball.speed * (Math.random() > 0.5 ? 1 : -1);
        
        this.playerPaddle.y = (this.canvasHeight - this.paddleHeight) / 2;
        this.computerPaddle.y = (this.canvasHeight - this.paddleHeight) / 2;
    }
    
    handleResize() {
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        
        if (containerWidth < this.canvasWidth) {
            const scale = containerWidth / this.canvasWidth;
            this.canvas.style.width = `${containerWidth}px`;
            this.canvas.style.height = `${this.canvasHeight * scale}px`;
        } else {
            this.canvas.style.width = '';
            this.canvas.style.height = '';
        }
    }
    
    updatePlayerPaddle() {
        const targetY = Math.min(
            Math.max(this.mouseY - this.paddleHeight / 2, 0),
            this.canvasHeight - this.paddleHeight
        );
        
        if (this.playerPaddle.y < targetY) {
            this.playerPaddle.y = Math.min(this.playerPaddle.y + this.paddleSpeed, targetY);
        } else if (this.playerPaddle.y > targetY) {
            this.playerPaddle.y = Math.max(this.playerPaddle.y - this.paddleSpeed, targetY);
        }
    }
    
    updateComputerPaddle() {
        const paddleCenter = this.computerPaddle.y + this.paddleHeight / 2;
        const ballCenter = this.ball.y;
        
        let targetY = ballCenter;
        
        if (this.ball.dx > 0) {
            const distanceToTravel = this.computerPaddle.x - this.ball.x;
            const timeToImpact = distanceToTravel / this.ball.dx;
            const predictedY = this.ball.y + (this.ball.dy * timeToImpact);
            
            targetY = predictedY + (Math.random() * 30 - 15);
        }
        
        if (paddleCenter < targetY) {
            this.computerPaddle.y += this.computerPaddleSpeed;
        } else if (paddleCenter > targetY) {
            this.computerPaddle.y -= this.computerPaddleSpeed;
        }
        
        this.computerPaddle.y = Math.max(
            0,
            Math.min(this.computerPaddle.y, this.canvasHeight - this.paddleHeight)
        );
    }
    
    updateBall() {
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;
        
        if (this.ball.y - this.ballSize / 2 <= 0 || 
            this.ball.y + this.ballSize / 2 >= this.canvasHeight) {
            this.ball.dy = -this.ball.dy;
            this.playSound('wall');
        }
        
        if (this.ball.dx < 0 && 
            this.ball.x - this.ballSize / 2 <= this.playerPaddle.x + this.paddleWidth &&
            this.ball.y >= this.playerPaddle.y && 
            this.ball.y <= this.playerPaddle.y + this.paddleHeight) {
            
            const hitPosition = (this.ball.y - (this.playerPaddle.y + this.paddleHeight / 2)) / (this.paddleHeight / 2);
            const bounceAngle = hitPosition * (Math.PI / 4);
            
            const newSpeed = Math.min(this.ball.speed + 0.2, 15);
            
            this.ball.dx = Math.cos(bounceAngle) * newSpeed;
            this.ball.dy = Math.sin(bounceAngle) * newSpeed;
            
            if (this.ball.dx < 0) this.ball.dx = -this.ball.dx;
            
            this.ball.speed = newSpeed;
            this.playSound('paddle');
        }
        
        if (this.ball.dx > 0 && 
            this.ball.x + this.ballSize / 2 >= this.computerPaddle.x &&
            this.ball.y >= this.computerPaddle.y && 
            this.ball.y <= this.computerPaddle.y + this.paddleHeight) {
            
            const hitPosition = (this.ball.y - (this.computerPaddle.y + this.paddleHeight / 2)) / (this.paddleHeight / 2);
            const bounceAngle = hitPosition * (Math.PI / 4);
            
            const newSpeed = Math.min(this.ball.speed + 0.2, 15);
            
            this.ball.dx = -Math.cos(bounceAngle) * newSpeed;
            this.ball.dy = Math.sin(bounceAngle) * newSpeed;
            
            this.ball.speed = newSpeed;
            this.playSound('paddle');
        }
        
        if (this.ball.x + this.ballSize / 2 < 0) {
            this.computerPaddle.score++;
            this.updateScoreDisplay();
            this.playSound('score');
            this.resetBall('computer');
        } else if (this.ball.x - this.ballSize / 2 > this.canvasWidth) {
            this.playerPaddle.score++;
            this.updateScoreDisplay();
            this.playSound('score');
            this.resetBall('player');
        }
    }
    
    resetBall(scorer) {
        this.ball.x = this.canvasWidth / 2;
        this.ball.y = this.canvasHeight / 2;
        this.ball.speed = 5;
        
        if (scorer === 'player') {
            this.ball.dx = -this.ball.speed;
        } else {
            this.ball.dx = this.ball.speed;
        }
        
        this.ball.dy = this.ball.speed * (Math.random() > 0.5 ? 1 : -1);
    }
    
    updateScoreDisplay() {
        this.playerScoreElement.textContent = this.playerPaddle.score;
        this.computerScoreElement.textContent = this.computerPaddle.score;
        
        if (this.playerPaddle.score >= 10 || this.computerPaddle.score >= 10) {
            this.endGame();
        }
    }
    
    endGame() {
        this.gameRunning = false;
        this.startBtn.textContent = 'Start New Game';
        
        const winner = this.playerPaddle.score > this.computerPaddle.score ? 'You win!' : 'Computer wins!';
        this.drawEndGameMessage(winner);
    }
    
    playSound(type) {
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        this.ctx.beginPath();
        this.ctx.setLineDash([10, 15]);
        this.ctx.moveTo(this.canvasWidth / 2, 0);
        this.ctx.lineTo(this.canvasWidth / 2, this.canvasHeight);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ballSize / 2, 0, Math.PI * 2);
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fill();
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(
            this.playerPaddle.x, 
            this.playerPaddle.y, 
            this.paddleWidth, 
            this.paddleHeight
        );
        
        this.ctx.fillStyle = '#ff5722';
        this.ctx.fillRect(
            this.computerPaddle.x, 
            this.computerPaddle.y, 
            this.paddleWidth, 
            this.paddleHeight
        );
        
        if (this.gamePaused) {
            this.drawPauseMessage();
        }
    }
    
    drawPauseMessage() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        this.ctx.font = '30px Arial';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Game Paused', this.canvasWidth / 2, this.canvasHeight / 2);
        this.ctx.font = '20px Arial';
        this.ctx.fillText('Press P or click Resume to continue', this.canvasWidth / 2, this.canvasHeight / 2 + 40);
    }
    
    drawEndGameMessage(message) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        this.ctx.font = '40px Arial';
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(message, this.canvasWidth / 2, this.canvasHeight / 2 - 20);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText(
            `Final Score: ${this.playerPaddle.score} - ${this.computerPaddle.score}`,
            this.canvasWidth / 2,
            this.canvasHeight / 2 + 30
        );
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        if (this.gamePaused) {
            requestAnimationFrame(() => this.gameLoop());
            return;
        }
        
        this.updatePlayerPaddle();
        this.updateComputerPaddle();
        this.updateBall();
        this.draw();
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

window.addEventListener('load', () => {
    const game = new PingPong();
    game.handleResize();
    game.draw();
});
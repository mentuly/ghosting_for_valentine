class Tool {
    static randomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    static randomColorRGB() {
        return `rgb(${this.randomNumber(0, 255)}, ${this.randomNumber(0, 255)}, ${this.randomNumber(0, 255)})`;
    }
    static randomColorHSL(hue, saturation, lightness) {
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }
    static gradientColor(ctx, cr, cg, cb, ca, x, y, r) {
        const col = `${cr},${cg},${cb}`;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(${col}, ${ca * 1})`);
        g.addColorStop(0.5, `rgba(${col}, ${ca * 0.5})`);
        g.addColorStop(1, `rgba(${col}, ${ca * 0})`);
        return g;
    }
}
class Angle {
    constructor(a) {
        this.a = a;
        this.rad = (this.a * Math.PI) / 180;
    }
    incDec(num) {
        this.a += num;
        this.rad = (this.a * Math.PI) / 180;
    }
}
let canvas;
let offCanvas;

class Canvas {
    constructor(bool) {
        this.canvas = document.createElement("canvas");
        if (bool === true) {
            this.canvas.style.position = "relative";
            this.canvas.style.display = "block";
            this.canvas.style.top = 0;
            this.canvas.style.left = 0;
            document.body.appendChild(this.canvas);
        }
        this.ctx = this.canvas.getContext("2d");
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
        this.width < 768 ? (this.heartSize = 180) : (this.heartSize = 250);
        this.mouseX = null;
        this.mouseY = null;
        this.hearts = [];
        this.offHeartNum = 1;
        this.offHearts = [];
        this.data = null;
        this.texts = [
            "С Днём Святого Валентина 💗",
        ];
        this.currentTextIndex = 0;
        this.currentText = "";
        this.textIndex = 0;
        this.textDelay = 100;
        this.textAlpha = 1;
        this.isFadingOut = false;
        this.isTyping = false;
        this.isFinished = false;
        this.isDelayed = false;
        this.audio = new Audio();
        this.loadAudio();
    }
    loadAudio() {
        this.audio.src = "alabama.mp3";
        this.audio.loop = true;
        this.audio.volume = 0.5;
    
        this.audio.addEventListener("canplaythrough", () => {
            console.log("Аудіо готове до відтворення!");
        });

        document.addEventListener("click", () => {
            this.audio.play()
                .then(() => console.log("Аудіо грає!"))
                .catch(err => console.error("Помилка при запуску аудіо:", err));
        }, { once: true });
    }
    
    onInit() {
        let index = 0;
        for (let i = 0; i < this.height; i += 12) {
            for (let j = 0; j < this.width; j += 12) {
                let oI = (j + i * this.width) * 4 + 3;
                if (this.data[oI] > 0) {
                    index++;
                    const h = new Heart(canvas.ctx, j + Tool.randomNumber(-3, 3), i + Tool.randomNumber(-3, 3), Tool.randomNumber(6, 12), index);
                    canvas.hearts.push(h);
                }
            }
        }
    }
    offInit() {
        for (let i = 0; i < this.offHeartNum; i++) {
            const s = new Heart(this.ctx, this.width / 2, this.height / 2.3, this.heartSize);
            this.offHearts.push(s);
        }
        for (let i = 0; i < this.offHearts.length; i++) {
            this.offHearts[i].offRender(i);
        }
        this.data = this.ctx.getImageData(0, 0, this.width, this.height).data;
        this.onInit();
    }
    render() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        for (let i = 0; i < this.hearts.length; i++) {
            this.hearts[i].render(i);
        }
        if (!this.isDelayed) {
            this.startDelay();
        } else if (!this.isFinished) {
            this.drawText();
            this.typeWriterEffect();
            this.fadeText();
        }
    }
    startDelay() {
        setTimeout(() => {
            this.isDelayed = true;
            this.isTyping = true;
        }, 1);
    }
    drawText() {
        const ctx = this.ctx;
        ctx.save();
        ctx.font = "italic bold 24px Arial";
        ctx.fillStyle = `rgba(255, 0, 0, ${this.textAlpha})`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.currentText, this.width / 2, this.height - 50);
        ctx.restore();
    }
    typeWriterEffect() {
        if (!this.isFadingOut && this.isTyping && this.textIndex < this.texts[this.currentTextIndex].length) {
            this.currentText += this.texts[this.currentTextIndex][this.textIndex];
            this.textIndex++;
            setTimeout(() => {}, this.textDelay);
        } else if (!this.isFadingOut && this.textIndex >= this.texts[this.currentTextIndex].length) {
            this.isTyping = false;
            setTimeout(() => {
                this.isFadingOut = true;
            }, 1000);
        }
    }
    fadeText() {
        if (this.isFadingOut) {
            this.textAlpha -= 0.02;
            if (this.textAlpha <= 0) {
                this.textAlpha = 0;
                this.isFadingOut = false;
                if (this.currentTextIndex < this.texts.length - 1) {
                    this.currentTextIndex++;
                    this.currentText = "";
                    this.textIndex = 0;
                    this.isTyping = true;
                    this.textAlpha = 1;
                } else {
                    this.isFinished = true;
                }
            }
        }
    }
    resize() {
        this.offHearts = [];
        this.hearts = [];
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
        this.width < 768 ? (this.heartSize = 180) : (this.heartSize = 250);
    }
}

class Heart {
    constructor(ctx, x, y, r, i) {
        this.ctx = ctx;
        this.init(x, y, r, i);
    }
    init(x, y, r, i) {
        this.x = x;
        this.xi = x;
        this.y = y;
        this.yi = y;
        this.r = r;
        this.i = i * 0.5 + 200;
        this.l = this.i;
        this.c = Tool.randomColorHSL(Tool.randomNumber(-5, 5), 80, 60);
        this.a = new Angle(Tool.randomNumber(0, 360));
        this.v = {
            x: Math.random(),
            y: -Math.random(),
        };
        this.ga = Math.random();
    }
    draw() {
        const ctx = this.ctx;
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = this.ga;
        ctx.beginPath();
        ctx.fillStyle = this.c;
        ctx.moveTo(this.x, this.y + this.r);
        ctx.bezierCurveTo(
            this.x - this.r - this.r / 5,
            this.y + this.r / 1.5,
            this.x - this.r,
            this.y - this.r,
            this.x,
            this.y - this.r / 5
        );
        ctx.bezierCurveTo(
            this.x + this.r,
            this.y - this.r,
            this.x + this.r + this.r / 5,
            this.y + this.r / 1.5,
            this.x,
            this.y + this.r
        );
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
    updateParams() {
        this.a.incDec(1);
        Math.sin(this.a.rad) < 0 ? (this.r = -Math.sin(this.a.rad) * 20) : (this.r = Math.sin(this.a.rad) * 20);
    }
    updatePosition() {
        this.l -= 1;
        if (this.l < 0) {
            this.v.y -= 0.01;
            this.v.x += 0.02;
            this.y += this.v.y;
            this.x += this.v.x;
        }
    }
    wrapPosition() {
        if (this.x > canvas.width * 1.5) {
            this.init(this.xi, this.yi, Tool.randomNumber(6, 12), this.i);
        }
    }
    render() {
        this.wrapPosition();
        this.updateParams();
        this.updatePosition();
        this.draw();
    }
    offRender(i) {
        this.draw();
    }
}

(function () {
    "use strict";
    window.addEventListener("load", function () {
        offCanvas = new Canvas(false);
        canvas = new Canvas(true);
        offCanvas.offInit();

        function render() {
            window.requestAnimationFrame(function () {
                canvas.render();
                render();
            });
        }
        render();

        window.addEventListener(
            "resize",
            function () {
                canvas.resize();
                offCanvas.resize();
                offCanvas.offInit();
            },
            false
        );

        window.changeTextDelay = function (newDelay) {
            canvas.textDelay = newDelay;
        };

        window.addText = function (newText) {
            canvas.texts.push(newText);
        };

        window.changeVolume = function (volume) {
            canvas.audio.volume = volume;
        };

        window.toggleMusic = function () {
            if (canvas.audio.paused) {
                canvas.audio.play();
            } else {
                canvas.audio.pause();
            }
        };
    });
})();
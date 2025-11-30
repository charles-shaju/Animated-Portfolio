const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width = 0;
let height = 0;
let animationFrameId;
const dpr = window.devicePixelRatio || 1;
const PARTICLE_COUNT = 180;
const LINK_DISTANCE = 140;
const ACCENT_RGBA = 'rgba(125, 240, 198, 0.85)';
const ACCENT_GRADIENT_INNER = 'rgba(125, 240, 198, 0.22)';
const ACCENT_GRADIENT_OUTER = 'rgba(125, 240, 198, 0)';
const particles = [];
const pointer = { x: 0, y: 0, active: false };

class Particle {
    constructor() {
        this.reset(true);
    }

    reset(initial = false) {
        if (initial) {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
        } else {
            const spawnOnX = Math.random() > 0.5;
            if (spawnOnX) {
                this.x = Math.random() * width;
                this.y = Math.random() < 0.5 ? -20 : height + 20;
            } else {
                this.x = Math.random() < 0.5 ? -20 : width + 20;
                this.y = Math.random() * height;
            }
        }

        const speed = 0.35 + Math.random() * 0.5;
        const angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.size = 1 + Math.random() * 2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (pointer.active) {
            const dx = pointer.x - this.x;
            const dy = pointer.y - this.y;
            const distSq = dx * dx + dy * dy;
            const maxInfluence = 160;
            if (distSq < maxInfluence * maxInfluence && distSq > 0.01) {
                const force = -20 / distSq;
                this.vx += force * dx;
                this.vy += force * dy;
            }
        }

        this.vx += (Math.random() - 0.5) * 0.01;
        this.vy += (Math.random() - 0.5) * 0.01;

        const friction = 0.985;
        this.vx *= friction;
        this.vy *= friction;

        const speedSq = this.vx * this.vx + this.vy * this.vy;
        if (speedSq < 0.015) {
            const speed = 0.35 + Math.random() * 0.45;
            const angle = Math.random() * Math.PI * 2;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
        }

        if (this.x < -60 || this.x > width + 60 || this.y < -60 || this.y > height + 60) {
            this.reset();
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = ACCENT_RGBA;
        ctx.fill();
    }
}

function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
}

function initParticles() {
    particles.length = 0;
    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
        particles.push(new Particle());
    }
}

function drawConnections(particle, others, startIndex) {
    for (let i = startIndex + 1; i < others.length; i += 1) {
        const other = others[i];
        const dx = particle.x - other.x;
        const dy = particle.y - other.y;
        const dist = Math.hypot(dx, dy);

        if (dist <= LINK_DISTANCE) {
            const opacity = 0.3 - (dist / LINK_DISTANCE) * 0.3;
            ctx.strokeStyle = `rgba(125, 240, 198, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
        }
    }
}

function render() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((particle, index) => {
        particle.update();
        particle.draw();
        drawConnections(particle, particles, index);
    });

    if (pointer.active) {
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, 80, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 80);
        gradient.addColorStop(0, ACCENT_GRADIENT_INNER);
        gradient.addColorStop(1, ACCENT_GRADIENT_OUTER);
        ctx.fillStyle = gradient;
        ctx.fill();
    }

    animationFrameId = requestAnimationFrame(render);
}

function handlePointerMove(event) {
    pointer.active = true;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
}

function handlePointerLeave() {
    pointer.active = false;
}

function setup() {
    resizeCanvas();
    initParticles();
    render();

    window.addEventListener('resize', () => {
        resizeCanvas();
        initParticles();
    });

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('blur', () => { pointer.active = false; });

    window.addEventListener('beforeunload', () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerleave', handlePointerLeave);
    });
}

setup();

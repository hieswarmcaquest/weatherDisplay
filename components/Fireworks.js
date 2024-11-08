import React, { useEffect, useRef } from 'react';

function Fireworks() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas dimensions to fill the entire window
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particleCount = 100;
    const gravity = 0.1;
    const drag = 0.01; // Adjust drag for speed control

    class Particle {
      constructor(x, y, vx, vy, color, size) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.size = size;
        this.alpha = 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 1 - drag;
        this.vy += gravity;
        this.alpha -= 0.01;

        // Add a slight random acceleration to create more dynamic movement
        this.vx += (Math.random() - 0.5) * 0.1;
        this.vy += (Math.random() - 0.5) * 0.1;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    function createFirework() {
      const fireworks = [];
      const x = Math.random() * canvas.width;
      const y = canvas.height;
      const hue = Math.random() * 360;

      for (let i = 0; i < particleCount; i++) {
        const vx = (Math.random() - 0.5) * 10;
        const vy = (Math.random() - 1) * 10;
        const size = Math.random() * 5 + 1;
        fireworks.push(new Particle(x, y, vx, vy, `hsl(${hue}, 100%, 50%)`, size));
      }

      return fireworks;
    }

    const fireworks = [];

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = fireworks.length - 1; i >= 0; i--) {
        const firework = fireworks[i];
        firework.update();
        firework.draw();

        if (firework.alpha <= 0) {
          fireworks.splice(i, 1);
        }
      }

      if (Math.random() < 0.05) {
        fireworks.push(...createFirework());
      }

      requestAnimationFrame(animate);
    }

    animate();

    // Update canvas size if the window is resized
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });

    return () => {
      // Cleanup event listener on unmount
      window.removeEventListener('resize', () => {});
    };
  }, []);

  return (
    <div style={{ height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <canvas ref={canvasRef} width="100%" height="100%"></canvas>
    </div>
  );
}

export default Fireworks;
import React, { useEffect, useRef } from 'react';

// 첫 화면 배경: 반짝이는 별이 은하수처럼 천천히 쏟아지고, 가끔 별똥별이 지나갑니다.
const COLORS = ['#ffffff', '#c7d2fe', '#a5b4fc', '#f5d0fe', '#bae6fd'];

export default function Galaxy() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, stars = [], meteors = [], frame;

    const newStar = (y) => ({
      x: Math.random() * w,
      y: y ?? Math.random() * h,
      r: Math.random() * 1.6 + 0.3,
      speed: Math.random() * 0.6 + 0.2,
      drift: Math.random() * 0.3 - 0.15,
      phase: Math.random() * Math.PI * 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    });

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = Array.from({ length: Math.floor((w * h) / 2500) }, () => newStar());
    };

    const draw = (t) => {
      ctx.clearRect(0, 0, w, h);

      // 화면을 비스듬히 가로지르는 은하수 띠
      const band = ctx.createLinearGradient(0, h, w, 0);
      band.addColorStop(0.3, 'rgba(0,0,0,0)');
      band.addColorStop(0.5, 'rgba(167,139,250,0.12)');
      band.addColorStop(0.7, 'rgba(0,0,0,0)');
      ctx.fillStyle = band;
      ctx.fillRect(0, 0, w, h);

      for (const s of stars) {
        s.y += s.speed;
        s.x += s.drift;
        if (s.y > h + 2) Object.assign(s, newStar(-2));
        ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t / 500 + s.phase);
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (Math.random() < 0.01) {
        meteors.push({ x: Math.random() * w, y: Math.random() * h * 0.4, life: 1 });
      }
      meteors = meteors.filter(m => m.life > 0);
      for (const m of meteors) {
        const tail = ctx.createLinearGradient(m.x, m.y, m.x - 80, m.y - 40);
        tail.addColorStop(0, 'rgba(255,255,255,1)');
        tail.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.globalAlpha = m.life;
        ctx.strokeStyle = tail;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - 80, m.y - 40);
        ctx.stroke();
        m.x += 8;
        m.y += 4;
        m.life -= 0.02;
      }
      ctx.globalAlpha = 1;

      frame = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none" aria-hidden="true" />;
}

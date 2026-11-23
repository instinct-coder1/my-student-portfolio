(() => {
  "use strict";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  canvas.id = "rajin3dCanvas";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) { canvas.remove(); return; }

  let width = 0, height = 0, dpr = 1, frame = 0;
  let pointerX = 0, pointerY = 0, targetX = 0, targetY = 0;
  let particles = [];
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const count = () => Math.min(coarse ? 42 : 78, Math.max(28, Math.floor(width * height / 19000)));

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    particles = Array.from({ length: count() }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: .25 + Math.random() * .75,
      phase: Math.random() * Math.PI * 2,
      speed: .08 + Math.random() * .18,
      size: .45 + Math.random() * 1.25,
      i
    }));
  }

  function onPointer(event) {
    targetX = (event.clientX / width - .5) * 2;
    targetY = (event.clientY / height - .5) * 2;
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    pointerX += (targetX - pointerX) * .035;
    pointerY += (targetY - pointerY) * .035;
    const t = frame * .006;
    const points = [];

    for (const p of particles) {
      p.phase += p.speed * .008;
      const driftX = Math.sin(p.phase + t) * 9;
      const driftY = Math.cos(p.phase * .8 + t) * 7;
      const depth = p.z;
      const x = p.x + driftX + pointerX * 15 * depth;
      const y = p.y + driftY + pointerY * 11 * depth;
      points.push({ x, y, depth, size: p.size * depth });
    }

    // Fine constellation links, limited to nearby points for predictable performance.
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const a = points[i], b = points[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 118) {
          ctx.strokeStyle = "rgba(172, 255, 93, " + ((1 - distance / 118) * .105 * Math.min(a.depth, b.depth)) + ")";
          ctx.lineWidth = .65;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    for (const p of points) {
      ctx.beginPath();
      ctx.fillStyle = "rgba(196, 255, 133, " + (.12 + p.depth * .36) + ")";
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // A subtle perspective halo lives behind the content and never covers the portrait asset.
    const hero = document.querySelector(".portrait-stage");
    if (hero) {
      const rect = hero.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < height) {
        const cx = rect.left + rect.width * .5;
        const cy = rect.top + rect.height * .5;
        const radius = Math.min(rect.width, rect.height) * .43;
        ctx.save();
        ctx.translate(cx + pointerX * 8, cy + pointerY * 6);
        ctx.rotate(t * .08);
        for (let k = 0; k < 3; k++) {
          ctx.beginPath();
          ctx.ellipse(0, 0, radius * (1 + k * .18), radius * (.34 + k * .09), k * .72, 0, Math.PI * 2);
          ctx.strokeStyle = k % 2 ? "rgba(75, 225, 255, .11)" : "rgba(190, 255, 91, .13)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    frame++;
    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize, { passive: true });
  if (!coarse) window.addEventListener("pointermove", onPointer, { passive: true });
  resize();
  requestAnimationFrame(draw);
})();
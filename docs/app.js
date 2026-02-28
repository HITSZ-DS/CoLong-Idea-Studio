const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const initReveal = () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
        }
      });
    },
    { threshold: 0.2 }
  );
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
};

const initScrollProgress = () => {
  const bar = document.querySelector(".scroll-progress");
  if (!bar) return;
  const update = () => {
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop;
    const scrollHeight = doc.scrollHeight - doc.clientHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    bar.style.width = `${progress}%`;
  };
  window.addEventListener("scroll", update, { passive: true });
  update();
};

const initHeroCanvas = () => {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas || prefersReducedMotion) return;

  const ctx = canvas.getContext("2d");
  const particles = [];
  const maxParticles = 56;
  const maxDistance = 140;

  const resize = () => {
    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
  };

  const random = (min, max) => Math.random() * (max - min) + min;

  const createParticle = () => ({
    x: random(0, canvas.width),
    y: random(0, canvas.height),
    vx: random(-0.4, 0.4),
    vy: random(-0.3, 0.3),
    r: random(1.2, 2.4),
  });

  const init = () => {
    particles.length = 0;
    for (let i = 0; i < maxParticles; i += 1) {
      particles.push(createParticle());
    }
  };

  const step = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(29, 78, 216, 0.4)";

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    for (let i = 0; i < particles.length; i += 1) {
      for (let j = i + 1; j < particles.length; j += 1) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < maxDistance) {
          const alpha = 1 - dist / maxDistance;
          ctx.strokeStyle = `rgba(29, 78, 216, ${alpha * 0.2})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(step);
  };

  resize();
  init();
  step();
  window.addEventListener("resize", () => {
    resize();
    init();
  });
};

initReveal();
initScrollProgress();
initHeroCanvas();

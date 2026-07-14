// ------------------------------------------------------------------
// برقتو - نسخه ۴: Particle Field + Tilt Card + Marquee + Gradient Border + Scroll Progress
// ------------------------------------------------------------------

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ۱) لیست استان‌های ایران برای فرم بررسی رایگان
const PROVINCES = [
  "آذربایجان شرقی", "آذربایجان غربی", "اردبیل", "اصفهان", "البرز", "ایلام",
  "بوشهر", "تهران", "چهارمحال و بختیاری", "خراسان جنوبی", "خراسان رضوی",
  "خراسان شمالی", "خوزستان", "زنجان", "سمنان", "سیستان و بلوچستان", "فارس",
  "قزوین", "قم", "کردستان", "کرمان", "کرمانشاه", "کهگیلویه و بویراحمد",
  "گلستان", "گیلان", "لرستان", "مازندران", "مرکزی", "هرمزگان", "همدان", "یزد"
];

function fillProvinces() {
  const select = document.getElementById("province");
  if (!select) return;
  PROVINCES.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p;
    opt.textContent = p;
    select.appendChild(opt);
  });
}

// ۲) Reveal Up: انیمیشن ورود بخش‌ها هنگام اسکرول
function setupRevealUp() {
  const items = document.querySelectorAll(".reveal-up");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => entry.target.classList.add("in-view"), Number(delay));
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  items.forEach((item) => observer.observe(item));
}

// ۳) نوار پیشرفت اسکرول
function setupScrollProgress() {
  const bar = document.getElementById("scroll-progress");
  if (!bar) return;

  function update() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = percent + "%";
  }
  window.addEventListener("scroll", update, { passive: true });
  update();
}

// ۴) پس‌زمینه ذرات نور در هیرو (Canvas)
function setupParticleField() {
  const canvas = document.getElementById("particle-canvas");
  if (!canvas || prefersReducedMotion) return;
  const ctx = canvas.getContext("2d");
  const hero = canvas.closest(".hero");

  let width, height, particles;

  function resize() {
    width = canvas.width = hero.offsetWidth;
    height = canvas.height = hero.offsetHeight;
  }

  function createParticles() {
    const count = Math.round((width * height) / 9000);
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.6 + 0.6,
      vy: Math.random() * 0.25 + 0.05,
      vx: (Math.random() - 0.5) * 0.15,
      alpha: Math.random() * 0.6 + 0.3,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(251, 191, 36, ${p.alpha})`;
      ctx.fill();

      p.y -= p.vy;
      p.x += p.vx;
      if (p.y < -5) {
        p.y = height + 5;
        p.x = Math.random() * width;
      }
      if (p.x < -5) p.x = width + 5;
      if (p.x > width + 5) p.x = -5;
    });
    requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  draw();

  window.addEventListener("resize", () => {
    resize();
    createParticles();
  });
}

// ۵) Tilt Card: چرخش سه‌بعدی کارت‌های مقایسه با موس
function setupTiltCards() {
  if (prefersReducedMotion) return;
  document.querySelectorAll("[data-tilt]").forEach((card) => {
    const maxTilt = 10;
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rotateY = (px - 0.5) * maxTilt * 2;
      const rotateX = (0.5 - py) * maxTilt * 2;
      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(4px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "rotateX(0) rotateY(0) translateZ(0)";
    });
  });
}

// ۶) شمارنده اعداد در کارت‌های آمار هنگام ورود به دید
function setupCounters() {
  const cards = document.querySelectorAll(".stat-value");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  cards.forEach((c) => observer.observe(c));
}

function animateCount(el) {
  const target = Number(el.dataset.count || 0);
  if (prefersReducedMotion) {
    el.textContent = target.toLocaleString("fa-IR");
    return;
  }
  const duration = 1200;
  const start = performance.now();

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const value = Math.floor(progress * target);
    el.textContent = value.toLocaleString("fa-IR");
    if (progress < 1) requestAnimationFrame(frame);
    else el.textContent = target.toLocaleString("fa-IR");
  }
  requestAnimationFrame(frame);
}

// ۷) آکاردئون سوالات متداول
function setupFaq() {
  document.querySelectorAll(".faq-question").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      const wasOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach((i) => i.classList.remove("open"));
      if (!wasOpen) item.classList.add("open");
    });
  });
}

// ۸) ماشین‌حساب درآمد
// نرخ‌های زیر «نمونه» هستند و صرفاً برای نمایش تخمینی به‌کار می‌روند.
// پیش از استفاده واقعی، باید با نرخ‌های به‌روز بازار برق و خرید تضمینی جایگزین شوند.
const SAMPLE_RATES = {
  guaranteedPricePerKwh: 4500,
  barghtoPricePerKwh: 6200,
  specificYieldPerKw: 1500,
  hybridGridShare: 0.8,
};

function formatToman(value) {
  return Math.round(value).toLocaleString("fa-IR") + " تومان";
}

function setupCalculator() {
  const form = document.getElementById("calc-form");
  if (!form) return;

  form.addEventListener("submit", () => {
    const capacityInput = parseFloat(document.getElementById("capacity").value);
    if (!capacityInput || capacityInput <= 0) return;

    const unit = document.getElementById("capacity-unit").value;
    const capacityKw = unit === "mw" ? capacityInput * 1000 : capacityInput;
    const plantType = document.getElementById("plant-type").value;

    let annualProduction = capacityKw * SAMPLE_RATES.specificYieldPerKw;
    if (plantType === "hybrid") {
      annualProduction *= SAMPLE_RATES.hybridGridShare;
    }

    const guaranteedIncome = annualProduction * SAMPLE_RATES.guaranteedPricePerKwh;
    const barghtoIncome = annualProduction * SAMPLE_RATES.barghtoPricePerKwh;
    const diff = barghtoIncome - guaranteedIncome;

    document.getElementById("res-production").textContent =
      Math.round(annualProduction).toLocaleString("fa-IR") + " kWh";
    document.getElementById("res-guaranteed").textContent = formatToman(guaranteedIncome);
    document.getElementById("res-barghto").textContent = formatToman(barghtoIncome);
    document.getElementById("res-diff").textContent = "+" + formatToman(diff);
  });
}

// ۹) فرم بررسی رایگان (بدون بک‌اند - فقط نمایش پیام موفقیت روی کلاینت)
function setupReviewForm() {
  const form = document.getElementById("review-form");
  const success = document.getElementById("review-success");
  if (!form) return;

  form.addEventListener("submit", () => {
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    // TODO: اتصال به بک‌اند/CRM برقتو برای ثبت واقعی درخواست
    success.hidden = false;
    form.reset();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  fillProvinces();
  setupRevealUp();
  setupScrollProgress();
  setupParticleField();
  setupTiltCards();
  setupCounters();
  setupFaq();
  setupCalculator();
  setupReviewForm();
});

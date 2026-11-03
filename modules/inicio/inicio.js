let currentSlide = 0;
let autoTimer = null;
let listenerAttached = false;

function showSlide(index) {
  const box = document.getElementById("inmutecCarouselBox");
  if (!box) return;

  const slides = box.querySelectorAll(".inmutec-slide");
  const dots = box.querySelectorAll(".inmutec-dot");
  if (!slides.length) return;

  if (index >= slides.length) currentSlide = 0;
  else if (index < 0) currentSlide = slides.length - 1;
  else currentSlide = index;

  slides.forEach((slide, i) => {
    if (i === currentSlide) {
      slide.classList.remove("opacity-0", "pointer-events-none", "z-0");
      slide.classList.add("opacity-100", "z-10");
    } else {
      slide.classList.remove("opacity-100", "z-10");
      slide.classList.add("opacity-0", "pointer-events-none", "z-0");
    }
  });

  dots.forEach((dot, i) => {
    if (i === currentSlide) {
      dot.className = "inmutec-dot w-6 h-3 rounded-full bg-[#00a8e8] transition-all cursor-pointer";
    } else {
      dot.className = "inmutec-dot w-3 h-3 rounded-full bg-white/40 transition-all cursor-pointer";
    }
  });
}

function startTimer() {
  stopTimer();
  autoTimer = setInterval(() => {
    showSlide(currentSlide + 1);
  }, 4500);
}

function stopTimer() {
  if (autoTimer) {
    clearInterval(autoTimer);
    autoTimer = null;
  }
}

export function init() {
  const box = document.getElementById("inmutecCarouselBox");
  if (!box) return;

  currentSlide = 0;
  showSlide(0);
  startTimer();

  box.onmouseenter = stopTimer;
  box.onmouseleave = startTimer;

  // Delegación de clics en el documento para garantizar que siempre atrape las flechas
  if (!listenerAttached) {
    document.addEventListener("click", (e) => {
      const prevBtn = e.target.closest("#inmutecBtnPrev");
      const nextBtn = e.target.closest("#inmutecBtnNext");
      const dotBtn = e.target.closest(".inmutec-dot");

      if (nextBtn) {
        e.preventDefault();
        showSlide(currentSlide + 1);
        startTimer();
      } else if (prevBtn) {
        e.preventDefault();
        showSlide(currentSlide - 1);
        startTimer();
      } else if (dotBtn) {
        e.preventDefault();
        const idx = parseInt(dotBtn.getAttribute("data-idx"), 10);
        showSlide(idx);
        startTimer();
      }
    });
    listenerAttached = true;
  }
}
export function init() {
  const track = document.getElementById("teamCarouselTrack");
  const prevBtn = document.getElementById("teamPrevBtn");
  const nextBtn = document.getElementById("teamNextBtn");

  if (!track || !prevBtn || !nextBtn) return;

  // Desplazamiento interactivo horizontal para pantallas pequeñas y medianas
  nextBtn.onclick = (e) => {
    e.preventDefault();
    track.scrollBy({ left: 280, behavior: "smooth" });
  };

  prevBtn.onclick = (e) => {
    e.preventDefault();
    track.scrollBy({ left: -280, behavior: "smooth" });
  };
}
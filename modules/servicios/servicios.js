const SERVICES_DATA = {
  datos: {
    title: "Internet Dedicado y Enlaces Simétricos",
    category: "Conectividad Empresarial",
    icon: "fa-solid fa-wifi",
    iconColor: "bg-cyan-50 text-[#00a8e8]",
    desc: "Canales de datos dedicados con garantía simétrica 1:1, monitoreo 24/7 y acuerdos de nivel de servicio (SLA) para sedes corporativas, minería e industrias.",
    deliverables: [
      "Monitoreo MRTG continuo de caudal y latencia.",
      "Disponibilidad contractual certificada 99.8%.",
      "Enlace primario por fibra óptica o respaldo inalámbrico microondas.",
      "Atención de incidencias con cuadrillas de guardia local."
    ],
    targetQuote: "Internet Dedicado"
  },
  fibra: {
    title: "Redes de Fibra Óptica (Planta Interna & Externa)",
    category: "Transporte Óptico",
    icon: "fa-solid fa-network-wired",
    iconColor: "bg-emerald-50 text-[#10b981]",
    desc: "Ingeniería de detalle, replanteo de rutas, tendido aéreo/subterráneo y conectorización de alta densidad para operadores de telecomunicaciones.",
    deliverables: [
      "Pruebas de reflectometría óptica bidireccional (OTDR).",
      "Reporte de pérdidas por empalme en mufas con fusión de núcleo.",
      "Certificación documental conforme a obra (As-Built).",
      "Experiencia comprobada en troncales TR-35 / TR-14 para WOW Tel."
    ],
    targetQuote: "Fibra Óptica"
  },
  estructuras: {
    title: "Estructuras Metálicas & Sistemas STP",
    category: "Infraestructura & Seguridad",
    icon: "fa-solid fa-tower-broadcast",
    iconColor: "bg-amber-50 text-[#f59e0b]",
    desc: "Fabricación, montaje vertical e implementación integral de sistemas de puesta a tierra para protección electromecánica de equipamiento crítico.",
    deliverables: [
      "Cumplimiento de normativa NTP 2050 y Código Nacional de Electricidad.",
      "Protocolo de medición de resistencia con telurómetro calibrado.",
      "Cuadrillas con EPP completo para trabajos de alto riesgo en altura.",
      "Supervisión pericial de torres ventadas y monopolos en campo."
    ],
    targetQuote: "Estructuras / STP"
  },
  laboratorio: {
    title: "Laboratorio Técnico de Radiotransmisión",
    category: "Soporte de Equipamiento",
    icon: "fa-solid fa-microchip",
    iconColor: "bg-rose-50 text-[#ef4444]",
    desc: "Diagnóstico especializado en banco de pruebas de radiofrecuencia, reparación electrónica modular y calibración de repetidoras y transceptores.",
    deliverables: [
      "Banco de pruebas con analizadores de espectro y potencia RF.",
      "Stock de repuestos para cambio inmediato.",
      "Informe técnico de calibración y curvas de modulación.",
      "Mantenimiento preventivo por lotes para flotas vehiculares y portátiles."
    ],
    targetQuote: "Laboratorio de Radios"
  }
};

export function init() {
  const cards = document.querySelectorAll(".svc-card");
  const filterBtns = document.querySelectorAll(".svc-tab-btn");
  const counterText = document.getElementById("svcCounterText");

  // Filtrado de servicios
  filterBtns.forEach(btn => {
    btn.onclick = () => {
      const selectedCategory = btn.getAttribute("data-category");

      filterBtns.forEach(b => {
        b.classList.remove("active-tab", "bg-[#00a8e8]", "text-[#002b49]");
        b.classList.add("bg-white", "text-slate-600");
      });

      btn.classList.add("active-tab", "bg-[#00a8e8]", "text-[#002b49]");
      btn.classList.remove("bg-white", "text-slate-600");

      let visibleCount = 0;
      cards.forEach(card => {
        const cat = card.getAttribute("data-cat");
        if (selectedCategory === "all" || cat === selectedCategory) {
          card.style.display = "flex";
          visibleCount++;
        } else {
          card.style.display = "none";
        }
      });

      if (counterText) {
        counterText.textContent = `Mostrando ${visibleCount} de 4 especialidades`;
      }
    };
  });

  // Modal de Especificaciones Técnicas
  window.openServiceModal = function(serviceKey) {
    const data = SERVICES_DATA[serviceKey];
    const modal = document.getElementById("serviceDetailModal");
    if (!data || !modal) return;

    document.getElementById("modalTitle").textContent = data.title;
    document.getElementById("modalCategory").textContent = data.category;
    document.getElementById("modalDesc").textContent = data.desc;

    const iconBox = document.getElementById("modalIconBox");
    iconBox.className = `w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${data.iconColor}`;
    iconBox.innerHTML = `<i class="${data.icon}"></i>`;

    const list = document.getElementById("modalDeliverables");
    list.innerHTML = "";
    data.deliverables.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      list.appendChild(li);
    });

    const actionBtn = document.getElementById("modalActionBtn");
    actionBtn.onclick = () => {
      window.closeServiceModal();
      window.goToQuoteService(data.targetQuote);
    };

    modal.classList.remove("hidden");
  };

  window.closeServiceModal = function() {
    const modal = document.getElementById("serviceDetailModal");
    if (modal) modal.classList.add("hidden");
  };

  // Redirección y preselección en Cotización
  window.goToQuoteService = function(serviceName) {
    sessionStorage.setItem("inmutec_prefill_service", serviceName);
    window.location.hash = "cotizacion";
  };
}
// Base de datos de peritaje técnico para las obras
const PROJECTS_DATA = {
  wow: {
    title: "Despliegue de Red Troncal TR-35 y TR-14",
    client: "WOW Tel / LPS GROUP S.A.C.",
    tag: "Fibra Óptica Troncal de Alta Capacidad",
    desc: "Ingeniería, tendido aéreo y fusionado de precisión para el enlace troncal principal de fibra óptica en Junín. Se completó el tendido sobre postería urbana con mufas de empalme herméticas de alta densidad y verificación reflectométrica total.",
    tools: [
      "Fusionadoras de núcleo Fujikura 70S+",
      "Reflectómetros ópticos en el dominio del tiempo (OTDR) Anritsu",
      "Medidores de potencia óptica y fuentes láser",
      "Camionetas 4x4 y escaleras dieléctricas homologadas"
    ],
    standards: [
      "Normas técnicas MTC de planta externa",
      "Estándar ITU-T G.652.D para fibra monomodo",
      "Protocolo de atenuación máxima < 0.22 dB/km a 1550nm"
    ],
    servicePrefill: "Fibra Óptica"
  },
  dorsal: {
    title: "Mantenimiento Red Dorsal Nacional de Fibra Óptica",
    client: "TELRAD S.A.C.",
    tag: "Infraestructura Interregional de Altura",
    desc: "Atención de emergencias y mantenimiento correctivo/preventivo en tramos cordilleranos de la Red Dorsal. Trabajos en condiciones geográficas agrestes con bajas temperaturas, garantizando continuidad en la transmisión de datos interdepartamental.",
    tools: [
      "Kits de empalme de campo con carpas térmicas",
      "Equipos OTDR de largo alcance (>100 km dinámicos)",
      "Generadores eléctricos portátiles para altitud",
      "Indumentaria térmica de alta montaña y EPP dieléctrico"
    ],
    standards: [
      "SLA contractual de restablecimiento menor a 4 horas",
      "Normativa técnica de seguridad en trabajos de alta montaña",
      "Certificación As-Built de empalmes reemplazados"
    ],
    servicePrefill: "Fibra Óptica"
  },
  tgp: {
    title: "Interconexión Satelital en Estaciones de Gasoducto TGP",
    client: "TELSAT S.R.L. / Gilat Perú (Transportadora de Gas del Perú)",
    tag: "Infraestructura Crítica de Hidrocarburos",
    desc: "Instalación electromecánica, fijación de pedestales y apuntamiento de antenas satelitales en estaciones de bombeo de gasoducto para telemetría continua de válvulas y sistemas de control SCADA.",
    tools: [
      "Analizadores de espectro satelital Satlink",
      "Antenas parabólicas de alta ganancia en banda Ku",
      "Sistemas de respaldo de energía y baterías de gel",
      "Torquímetros certificados para fijación estructural"
    ],
    standards: [
      "Protocolos de seguridad industrial para plantas de gas",
      "Tolerancia cero de caídas en enlaces de telemetría",
      "Alineamiento óptimo de polarización cruzada (X-Pol)"
    ],
    servicePrefill: "Estructuras / STP"
  },
  ifit: {
    title: "Estaciones Base Celular RAN y Gabinetes",
    client: "IFIT PERÚ S.A.C. / OSC Telecoms",
    tag: "Telefonía Celular & Redes Móviles",
    desc: "Implementación integral de sitios celulares 3G/4G en comunidades rurales. Comprende estudios de campo TSS, montaje de antenas en torres autosoportadas y conexionado de energía solar y comercial.",
    tools: [
      "Analizadores de antenas y cables (Site Master Anritsu)",
      "Arneses certificados y líneas de vida para altura",
      "Kits de crimpado coaxial y conectores DIN 7/16",
      "Herramientas de alineación óptica y brújula geológica"
    ],
    standards: [
      "Normativa de telecomunicaciones móviles 3GPP",
      "Valores VSWR y pérdida de retorno dentro de tolerancia",
      "Inspección pericial de izaje y estabilidad estructural"
    ],
    servicePrefill: "Estructuras / STP"
  },
  huancavelica: {
    title: "Supervisión y Mantenimiento de 24 Estaciones Base y STP",
    client: "Dirección Regional de Transportes y Comunicaciones de Huancavelica",
    tag: "Supervisión Técnica Estatal",
    desc: "Auditoría pericial a las estaciones retransmisoras del gobierno regional. Se midió la resistencia eléctrica de los sistemas de puesta a tierra y se realizó el cambio de pararrayos y mantenimiento correctivo de pozos.",
    tools: [
      "Telurómetros digitales de 4 picas calibrados",
      "Compuestos químicos gel para reducción de resistividad",
      "Cámaras termográficas para detección de puntos calientes",
      "Instrumental de torque en barras colectoras de cobre"
    ],
    standards: [
      "Norma Técnica Peruana NTP 2050 (Puestas a tierra)",
      "Código Nacional de Electricidad (Suministro)",
      "Resistencia final homologada por debajo de 5 Ohmios"
    ],
    servicePrefill: "Estructuras / STP"
  },
  tambo: {
    title: "Mantenimiento Preventivo y Correctivo de Videovigilancia",
    client: "Municipalidad Distrital de El Tambo - Huancayo",
    tag: "Seguridad Ciudadana & Redes Ópticas",
    desc: "Servicio de diagnóstico y mantenimiento sobre los anillos de fibra óptica que transportan las señales de las cámaras de videovigilancia y conmutadores de distribución distribuidos en el distrito.",
    tools: [
      "Identificadores de tráfico en fibra activa",
      "Microscopios de inspección de conectores ópticos",
      "Canastilla alza-hombres para trabajos en vía pública",
      "Equipos de limpieza óptica de conectores SC/LC"
    ],
    standards: [
      "Continuidad de flujo de video en resolución Full HD",
      "Protección de cables contra vandalismo y tracción",
      "Revisión periódica de empalmes en cajas NAP"
    ],
    servicePrefill: "Fibra Óptica"
  }
};

let selectedProjectKey = "wow";

export function init() {
  const cards = document.querySelectorAll(".project-card");
  const filterBtns = document.querySelectorAll(".port-tab-btn");
  const counterText = document.getElementById("portCounterText");

  // 1. Filtrado dinámico por categoría
  filterBtns.forEach(btn => {
    btn.onclick = () => {
      const filter = btn.getAttribute("data-filter");

      filterBtns.forEach(b => {
        b.classList.remove("active-tab", "bg-[#00a8e8]", "text-[#002b49]");
        b.classList.add("bg-white", "text-slate-600");
      });

      btn.classList.add("active-tab", "bg-[#00a8e8]", "text-[#002b49]");
      btn.classList.remove("bg-white", "text-slate-600");

      let count = 0;
      cards.forEach(card => {
        const cat = card.getAttribute("data-cat");
        if (filter === "all" || cat === filter) {
          card.style.display = "block";
          count++;
        } else {
          card.style.display = "none";
        }
      });

      if (counterText) {
        counterText.textContent = `Mostrando ${count} de 6 obras registradas`;
      }
    };
  });

  // 2. Control del modal técnico
  window.openProjectModal = function(key) {
    const data = PROJECTS_DATA[key];
    const modal = document.getElementById("projectDetailModal");
    if (!data || !modal) return;

    selectedProjectKey = key;
    document.getElementById("projModalTag").textContent = data.tag;
    document.getElementById("projModalTitle").textContent = data.title;
    document.getElementById("projModalClient").textContent = `Cliente: ${data.client}`;
    document.getElementById("projModalDesc").textContent = data.desc;

    const toolsList = document.getElementById("projModalTools");
    toolsList.innerHTML = "";
    data.tools.forEach(t => {
      const li = document.createElement("li");
      li.textContent = t;
      toolsList.appendChild(li);
    });

    const standardsList = document.getElementById("projModalStandards");
    standardsList.innerHTML = "";
    data.standards.forEach(s => {
      const li = document.createElement("li");
      li.textContent = s;
      standardsList.appendChild(li);
    });

    modal.classList.remove("hidden");
  };

  window.closeProjectModal = function() {
    const modal = document.getElementById("projectDetailModal");
    if (modal) modal.classList.add("hidden");
  };

  window.quoteSimilarProject = function() {
    const data = PROJECTS_DATA[selectedProjectKey];
    window.closeProjectModal();
    if (data && data.servicePrefill) {
      sessionStorage.setItem("inmutec_prefill_service", data.servicePrefill);
    }
    window.location.hash = "cotizacion";
  };
}
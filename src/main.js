// ========================================================
// SISTEMA WEB INMUTEC E.I.R.L. - CONTROLADOR GLOBAL MAESTRO CON SUPABASE CMS
// ========================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// 1. Configuración de Conexión a Supabase
const SUPABASE_URL = "https://qcnsrlsolmhbsxlqpqpc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjbnNybHNvbG1oYnN4bHFwcXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1ODA2NDcsImV4cCI6MjEwOTE1NjY0N30.Tsc8SkXyQiA0tl8P890yFpKw-2j1eMS1AHJxkfUzlRw";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const WHATSAPP_PHONE = "51954928201";

// Estado de la sesión del administrador
let isAdminLoggedIn = false;
let currentEditingElement = null;
let currentEditingKey = null;
let isEditingImage = false;

// Estado reactivo de ítems de la Proforma Admin
window.itemsProformaAdmin = [
  {
    descripcion: "Trabajos de fusión y acondicionamiento en varias MUFAS 122 FUSIONES\nInstalación y acondicionamiento de ODF en site 28 FUSIONES\nMEDCIONES CON OTDR EXFO 28 HILOS",
    cant: 1,
    unidad: "UND",
    precio: 3500.00
  }
];

// 2. Configuración de Rutas de Plantillas
const modulesConfig = {
  inicio: {
    html: "./modules/inicio/inicio.html",
    css: "./modules/inicio/inicio.css"
  },
  "quienes-somos": {
    html: "./modules/quienes-somos/quienes-somos.html",
    css: "./modules/quienes-somos/quienes-somos.css"
  },
  servicios: {
    html: "./modules/servicios/servicios.html",
    css: "./modules/servicios/servicios.css"
  },
  portafolio: {
    html: "./modules/portafolio/portafolio.html",
    css: "./modules/portafolio/portafolio.css"
  },
  cotizacion: {
    html: "./modules/cotizacion/cotizacion.html",
    css: "./modules/cotizacion/cotizacion.css"
  }
};

let carouselTimer = null;
let currentSlideIndex = 0;

// Base de conocimientos del Asistente Virtual
const BOT_KNOWLEDGE = [
  {
    keys: ["hola", "buen dia", "buenas", "saludos", "que tal", "inicio"],
    reply: "Hola, te doy la bienvenida a INMUTEC E.I.R.L. Soy tu asistente virtual. ¿En qué especialidad técnica te podemos orientar hoy? Puedes escribir en el teclado o pulsar una de las consultas rápidas."
  },
  {
    keys: ["servicios", "cobertura", "que hacen", "especialidad", "catalogo"],
    reply: "INMUTEC se especializa en 5 divisiones: 1. Internet Dedicado simétrico, 2. Redes de Fibra Óptica (planta externa/interna y OTDR), 3. Montaje de Torres y Puesta a Tierra STP, 4. Laboratorio Técnico de Radiotransmisión y 5. Domótica y Automatización Inteligente."
  },
  {
    keys: ["norma", "stp", "tierra", "pozo a tierra", "ntp 2050", "telurometro", "pararrayo"],
    reply: "Diseñamos e implementamos Sistemas de Protección a Tierra (STP) bajo la Norma Técnica Peruana NTP 2050 y el Código Nacional de Electricidad. Garantizamos valores de resistencia por debajo de 5 Ohmios certificados con telurómetro calibrado."
  },
  {
    keys: ["domotica", "smart", "automatizacion", "casa inteligente", "edificio", "cerraduras"],
    reply: "Nuestra división de Domótica e Inmótica implementa control inteligente de iluminación, cerraduras biométricas, cámaras con IA, sensores perimétricos y automatización de accesos para residencias, empresas e industrias."
  },
  {
    keys: ["fibra", "otdr", "mufa", "fusion", "tendido", "wow", "dorsal"],
    reply: "Contamos con fusionadoras Fujikura de alineación de núcleo y equipos OTDR calibrados. Hemos ejecutado más de 120 km de troncales ópticas para WOW Tel y mantenimiento correctivo en la Red Dorsal Nacional."
  },
  {
    keys: ["laboratorio", "radio", "calibrar", "motorola", "kenwood", "falla"],
    reply: "En nuestro laboratorio técnico de Huancayo (Jr. Salcantay 148, El Tambo) realizamos peritaje, calibración de frecuencia y potencia en banco RF, así como reparación electrónica de transceptores y repetidoras."
  },
  {
    keys: ["ingeniero", "gerente", "marmanillo", "gustavo", "telefono", "whatsapp", "contacto"],
    reply: "Puedes comunicarte directamente con el Gerente General, Ing. Gustavo Marmanillo Baldeón, al número celular / WhatsApp +51 954 928 201."
  }
];

// Mapeo de Fichas Técnicas para el Módulo de Servicios
const serviceDataMap = {
  datos: {
    category: "Conectividad Empresarial",
    title: "Internet Dedicado y Enlaces Simétricos",
    desc: "Servicio de transporte de datos y acceso simétrico a internet garantizado al 1:1, diseñado para entornos corporativos con redundancia física o inalámbrica.",
    iconClass: "bg-cyan-50 text-[#00a8e8] fa-solid fa-wifi",
    serviceName: "Internet Dedicado",
    deliverables: [
      "Monitoreo 24/7/365 en Centro de Operaciones de Red (NOC)",
      "Acuerdo de Nivel de Servicio (SLA) de hasta 99.8% con respaldo",
      "IPs fijas públicas homologadas y configuración de CPE / Routers MikroTik"
    ]
  },
  fibra: {
    category: "Infraestructura de Planta Externa/Interna",
    title: "Redes y Despliegue de Fibra Óptica",
    desc: "Ingeniería de detalle, tendido aéreo o canalizado de fibra monomodo/multimodo, sangrado de mufas troncales y certificación óptica bidireccional.",
    iconClass: "bg-emerald-50 text-[#10b981] fa-solid fa-network-wired",
    serviceName: "Fibra Óptica",
    deliverables: [
      "Pruebas reflectométricas OTDR y tablas de pérdidas por inserción (Power Meter)",
      "Diagramas unifilares y planos de georreferenciación de postes y empalmes",
      "Fusionado de precisión por alineación de núcleo con empalmes < 0.02 dB"
    ]
  },
  estructuras: {
    category: "Electromecánica & Protección de Sitios",
    title: "Estructuras Metálicas & Sistemas STP",
    desc: "Cálculo estructural, izaje, verticalización de mástiles o torres autosoportadas y construcción de pozos a tierra de baja resistividad.",
    iconClass: "bg-amber-50 text-[#f59e0b] fa-solid fa-tower-broadcast",
    serviceName: "Torres & STP",
    deliverables: [
      "Certificado de calibración de telurómetro y protocolo de medición de resistencia < 5 Ohmios",
      "Protocolo de torque de riostras y pernos estructurales bajo norma EM/DGE y NTP 2050",
      "Instalación de puntas captadoras (pararrayos) y conductores de bajada con aislamiento"
    ]
  },
  laboratorio: {
    category: "Electrónica RF & Diagnóstico",
    title: "Laboratorio Técnico de Radiotransmisión",
    desc: "Peritaje especializado, ajuste de modulación, cambio de etapas de potencia PA y mantenimiento a transceptores analógicos y digitales.",
    iconClass: "bg-rose-50 text-[#ef4444] fa-solid fa-microchip",
    serviceName: "Laboratorio",
    deliverables: [
      "Informe pericial de curvas de potencia, frecuencia y sensibilidad en banco RF",
      "Reparación electrónica con componentes originales Motorola / Kenwood",
      "Garantía técnica de mantenimiento y stock permanente de partes"
    ]
  },
  domotica: {
    category: "Automatización & Edificación Smart",
    title: "Domótica y Control Inteligente de Espacios",
    desc: "Diseño y puesta en servicio de ecosistemas inteligentes para hogares, oficinas y naves industriales con analítica de video y control perimétrico.",
    iconClass: "bg-purple-50 text-purple-600 fa-solid fa-house-signal",
    serviceName: "Domótica",
    deliverables: [
      "Integración de cerraduras biométricas, cámaras de analítica con IA y sensores",
      "Panel de control táctil centralizado y configuración remota en dispositivos móviles",
      "Automatización de luminarias LED, persianas y gestión de ahorro de energía"
    ]
  }
};

// Mapeo de Expedientes de Obra para el Módulo de Portafolio
const projectDataMap = {
  wow: {
    tag: "Gran Escala • Fibra Óptica Troncal",
    title: "Despliegue de Red Troncal TR-35 y TR-14",
    client: "Cliente: WOW Tel / LPS GROUP S.A.C.",
    desc: "Tendido de cable de fibra óptica aéreo dieléctrico ADSS, sangrado y empalme en mufas FOSC y pruebas reflectométricas bidireccionales con equipo OTDR.",
    tools: ["Fusionadora Fujikura 90S+ de alineación de núcleo", "Reflectómetro Óptico en el Dominio del Tiempo (OTDR) Anritsu", "Camión grúa canastilla y EPP certificado dieléctrico"],
    standards: ["Recomendación ITU-T G.652.D (Fibra monomodo estándar)", "Código Nacional de Electricidad (Suministro)", "Normativa de seguridad técnica Osinergmin / MTC"]
  },
  dorsal: {
    tag: "Red Dorsal Nacional • Mantenimiento Crítico",
    title: "Mantenimiento Red Dorsal Nacional de Fibra Óptica",
    client: "Cliente: TELRAD S.A.C.",
    desc: "Atención de emergencias por rotura de vanos en zonas de alta montaña (+4,200 msnm), reemplazo de tramos dañados por descargas o heladas e informes periciales.",
    tools: ["Camionetas 4x4 equipadas para rescate y soporte técnico", "Fusionadoras térmicas con calentador para bajas temperaturas", "Bobinas de lanzamiento óptico calibradas"],
    standards: ["Estándares Carrier-Class de disponibilidad (SLA 99.8%)", "Protocolos de seguridad ocupacional en trabajo de alta montaña", "Normativa de intervención en servidumbres eléctricas"]
  },
  tgp: {
    tag: "Satelital & Gasoducto • Telemetría SCADA",
    title: "Interconexión Satelital en Estaciones de Gasoducto TGP",
    client: "Cliente: TELSAT S.R.L. / Gilat Perú",
    desc: "Instalación electromecánica, alineamiento de reflectores parabólicos VSAT en banda Ku/C y cableado de enlace a cuartos de control SCADA.",
    tools: ["Analizador de espectro satelital para calibración de ganancia", "Instrumentos de torque controlado para anclaje de soportes", "Banco de carga y comprobador de baterías de respaldo"],
    standards: ["Normas de seguridad intrínseca para instalaciones de hidrocarburos", "Código Nacional de Electricidad", "Protocolos de comunicación satelital Gilat / Hughes"]
  },
  ifit: {
    tag: "Telefonía Celular & Nodos RAN",
    title: "Estaciones Base Celular RAN y Gabinetes",
    client: "Cliente: IFIT PERÚ S.A.C. / OSC Telecoms",
    desc: "Levantamiento técnico de campo (TSS), montaje de mástiles, sujeción de radio bases y antenas sectoriales para cobertura móvil rural 3G/4G.",
    tools: ["Equipos de izaje de carga homologados", "Llaves dinamométricas para conectorización RF", "Medidor de ROE / Site Master"],
    standards: ["Límites máximos permisibles (LMP) de radiaciones no ionizantes", "Norma de resistencia estructural para torres celulares", "Manual de instalación de operadores nacionales"]
  },
  huancavelica: {
    tag: "Supervisión Estatal & Pozos a Tierra",
    title: "Supervisión y Mantenimiento de 24 Estaciones Base y STP",
    client: "Entidad: DRTC Huancavelica",
    desc: "Peritaje y homologación de sistemas de puesta a tierra en repetidoras de telecomunicaciones del Estado, reducción de resistividad y balance de cargas.",
    tools: ["Telurómetro digital de 4 picas certificado con calibración vigente", "Compuestos químicos ecológicos para reactivación de terreno", "Herramientas de compresión exotérmica para soldadura Cadweld"],
    standards: ["Norma Técnica Peruana NTP 2050 (Código Nacional de Electricidad)", "Norma EM/DGE de telecomunicaciones", "Reglamento Nacional de Edificaciones (RNE)"]
  },
  tambo: {
    tag: "Seguridad Ciudadana • Videovigilancia Urbana",
    title: "Mantenimiento Preventivo y Correctivo de Red de Videovigilancia",
    client: "Entidad: Municipalidad Distrital de El Tambo",
    desc: "Supervisión y soporte correctivo a la red de cámaras domo PTZ y fijas interconectadas por fibra óptica hacia la central de monitoreo distrital.",
    tools: ["Comprobador de enlaces ópticos VFL (lápiz óptico)", "Escaleras dieléctricas y arneses certificados", "Software de gestión y diagnóstico de conmutadores gestionables"],
    standards: ["Estándares de videovigilancia ciudadana del Mininter", "Requisitos de estanqueidad IP66/IP67 para cámaras exteriores", "Normativa de tendido aéreo en postes de baja tensión"]
  }
};

// ========================================================
// 3. ENRUTADOR Y CARGA DINÁMICA CON SUPABASE CMS
// ========================================================
export async function loadModule(moduleName) {
  const container = document.getElementById("moduleContainer");
  if (!container) return;

  const modKey = modulesConfig[moduleName] ? moduleName : "inicio";
  const config = modulesConfig[modKey];
  const timestamp = Date.now();

  // Actualizar botones de navegación
  document.querySelectorAll(".nav-tab").forEach(tab => {
    tab.classList.remove("bg-[#00a8e8]", "text-[#002b49]", "shadow-md");
    tab.classList.add("text-slate-200");
  });
  const activeTab = document.getElementById(`btn-${modKey}`);
  if (activeTab) {
    activeTab.classList.remove("text-slate-200");
    activeTab.classList.add("bg-[#00a8e8]", "text-[#002b49]", "shadow-md");
  }

  // Cargar CSS
  let cssLink = document.getElementById("module-dynamic-css");
  if (!cssLink) {
    cssLink = document.createElement("link");
    cssLink.id = "module-dynamic-css";
    cssLink.rel = "stylesheet";
    document.head.appendChild(cssLink);
  }
  cssLink.href = `${config.css}?v=${timestamp}`;

  // Inyectar HTML
  try {
    const res = await fetch(`${config.html}?v=${timestamp}`);
    if (!res.ok) throw new Error(`No se pudo cargar ${config.html}`);
    container.innerHTML = await res.text();
  } catch (err) {
    console.error("Error al cargar módulo HTML:", err);
    return;
  }

  // Sincronizar textos e imágenes desde la base de datos de Supabase
  await applyCmsValuesToView();

  // Mantener bordes editables si el admin tiene sesión abierta
  if (isAdminLoggedIn) {
    enableAdminEditMode();
  }

  // Inicializar funciones según módulo
  if (modKey === "inicio") {
    initInicioModule();
  } else if (modKey === "cotizacion") {
    await initCotizacionModule();
  }
}

// Sincronización de campos marcados con [data-cms-key]
async function applyCmsValuesToView() {
  try {
    const { data, error } = await supabase.from("cms_content").select("*");
    if (error || !data) return;

    const cmsMap = {};
    data.forEach(item => {
      cmsMap[item.clave] = item.valor;
    });

    document.querySelectorAll("[data-cms-key]").forEach(el => {
      const key = el.getAttribute("data-cms-key");
      if (cmsMap[key]) {
        if (el.tagName === "IMG") {
          el.src = cmsMap[key];
        } else {
          el.innerHTML = cmsMap[key];
        }
      }
    });
  } catch (err) {
    console.error("Error cargando CMS desde Supabase:", err);
  }
}

function enableAdminEditMode() {
  document.querySelectorAll("[data-cms-key]").forEach(el => {
    el.classList.add("admin-editable-active");
  });
}

function disableAdminEditMode() {
  document.querySelectorAll("[data-cms-key]").forEach(el => {
    el.classList.remove("admin-editable-active");
  });
}

// Subida de imagen a Supabase Storage
async function uploadImageToSupabase(file, folder = "cms") {
  const fileExt = file.name.split(".").pop();
  const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from("inmutec-media")
    .upload(fileName, file, { cacheControl: "3600", upsert: true });

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage
    .from("inmutec-media")
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}

// ========================================================
// 4. MÓDULO INICIO: CARRUSEL
// ========================================================
function initInicioModule() {
  const box = document.getElementById("inmutecCarouselBox") || document.getElementById("mainCarousel");
  if (!box) return;

  const slides = box.querySelectorAll(".inmutec-slide, .carousel-slide-item");
  const dots = box.querySelectorAll(".inmutec-dot, .carousel-dot");
  if (!slides.length) return;

  currentSlideIndex = 0;

  function renderSlide(idx) {
    if (idx >= slides.length) currentSlideIndex = 0;
    else if (idx < 0) currentSlideIndex = slides.length - 1;
    else currentSlideIndex = idx;

    slides.forEach((s, i) => {
      if (i === currentSlideIndex) {
        s.classList.remove("opacity-0", "pointer-events-none", "z-0");
        s.classList.add("opacity-100", "z-10");
      } else {
        s.classList.remove("opacity-100", "z-10");
        s.classList.add("opacity-0", "pointer-events-none", "z-0");
      }
    });

    dots.forEach((d, i) => {
      if (i === currentSlideIndex) {
        d.classList.add("bg-[#00a8e8]", "w-6");
        d.classList.remove("bg-white/40", "w-3");
      } else {
        d.classList.remove("bg-[#00a8e8]", "w-6");
        d.classList.add("bg-white/40", "w-3");
      }
    });
  }

  window.inmutecNextSlide = () => renderSlide(currentSlideIndex + 1);
  window.inmutecPrevSlide = () => renderSlide(currentSlideIndex - 1);
  window.inmutecGoToSlide = (i) => renderSlide(i);

  if (carouselTimer) clearInterval(carouselTimer);
  carouselTimer = setInterval(() => renderSlide(currentSlideIndex + 1), 4500);

  box.onmouseenter = () => clearInterval(carouselTimer);
  box.onmouseleave = () => {
    clearInterval(carouselTimer);
    carouselTimer = setInterval(() => renderSlide(currentSlideIndex + 1), 4500);
  };

  renderSlide(0);
}

// ========================================================
// 5. MÓDULO COTIZACIÓN: FORMULARIO, CHATBOT Y PROFORMA ADMIN
// ========================================================
async function initCotizacionModule() {
  const dynamicContainer = document.getElementById("dynamicServiceSection");
  const hiddenSvcInput = document.getElementById("selectedServiceInput");

  // Inyección de la proforma modular si el administrador está activo
  await verificarYMontarAdminProforma();

  window.renderCotizacionCampos = function(serviceName) {
    if (!dynamicContainer) return;
    if (hiddenSvcInput) hiddenSvcInput.value = serviceName;

    document.querySelectorAll(".svc-selector-btn").forEach(b => {
      if (b.getAttribute("data-svc") === serviceName) {
        b.classList.add("active-svc", "border-[#00a8e8]", "bg-cyan-50/50");
      } else {
        b.classList.remove("active-svc", "border-[#00a8e8]", "bg-cyan-50/50");
      }
    });

    if (serviceName === "Laboratorio") {
      dynamicContainer.innerHTML = `
        <div class="border-b border-slate-200 pb-2">
          <span class="text-[10px] font-black uppercase text-[#ef4444] tracking-wider block">Recepción en Laboratorio Técnico RF</span>
          <p class="text-[11px] text-slate-500">Ingresa las especificaciones del equipo para banco de pruebas y calibración.</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="font-bold text-slate-700 block mb-1">Tipo de Equipo y Marca *</label>
            <input id="qLabEquipo" type="text" placeholder="Ej. Radiotransmisor Motorola / Kenwood" class="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00a8e8] bg-white">
          </div>
          <div>
            <label class="font-bold text-slate-700 block mb-1">Cantidad de Equipos *</label>
            <input id="qLabCantidad" type="number" min="1" value="1" class="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00a8e8] bg-white font-mono">
          </div>
        </div>
        <div>
          <label class="font-bold text-slate-700 block mb-1">Detalle de la Falla o Trabajo Requerido *</label>
          <textarea id="qLabFalla" rows="3" placeholder="Indicar si no enciende, pérdida de potencia, calibración de frecuencia o mantenimiento..." class="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00a8e8] bg-white"></textarea>
        </div>
        <div class="flex items-center space-x-2 text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
          <i class="fa-solid fa-location-dot text-[#00a8e8]"></i>
          <span>Recepción oficial: <strong>Jr. Salcantay 148 - El Tambo, Huancayo</strong></span>
        </div>
      `;
    } else if (serviceName === "Domótica") {
      dynamicContainer.innerHTML = `
        <div class="border-b border-amber-200 pb-2 flex items-center justify-between">
          <div>
            <span class="text-[10px] font-black uppercase text-amber-700 tracking-wider block flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              NUEVO: Automatización & Domótica Inteligente (IoT)
            </span>
            <p class="text-[11px] text-slate-500">Marca las soluciones inteligentes requeridas para la implementación.</p>
          </div>
          <span class="text-[9px] bg-amber-500 text-white font-black px-2 py-0.5 rounded-full uppercase">Inmótica / IoT</span>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <label class="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-amber-200 cursor-pointer hover:border-amber-400 transition">
            <input type="checkbox" class="chk-domo-item text-amber-600 rounded" value="Iluminación Smart & Escenas Arquitectónicas" checked>
            <span>💡 Iluminación & Dimerización Smart</span>
          </label>
          <label class="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-amber-200 cursor-pointer hover:border-amber-400 transition">
            <input type="checkbox" class="chk-domo-item text-amber-600 rounded" value="Control de Acceso Biométrico y Cerraduras Digitales" checked>
            <span>🔐 Accesos Digitales & Motores</span>
          </label>
          <label class="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-amber-200 cursor-pointer hover:border-amber-400 transition">
            <input type="checkbox" class="chk-domo-item text-amber-600 rounded" value="CCTV con Detección IA & Audio Bidireccional">
            <span>📷 Seguridad Perimetral con IA</span>
          </label>
          <label class="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-amber-200 cursor-pointer hover:border-amber-400 transition">
            <input type="checkbox" class="chk-domo-item text-amber-600 rounded" value="Monitoreo Energético y Automatización de Tableros">
            <span>⚡ Telemetría Eléctrica & Ahorro</span>
          </label>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label class="font-bold text-slate-700 block mb-1">Tipo de Espacio *</label>
            <select id="qDomTipo" class="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00a8e8] bg-white text-xs">
              <option value="Hogar / Residencia Inteligente">Hogar / Residencia Inteligente</option>
              <option value="Oficinas Corporativas">Oficinas Corporativas</option>
              <option value="Planta Industrial / Accesos">Planta Industrial / Accesos</option>
            </select>
          </div>
          <div>
            <label class="font-bold text-slate-700 block mb-1">Lugar de Implementación *</label>
            <input id="qLugar" type="text" placeholder="Ej. El Tambo, Huancayo, Satipo..." class="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00a8e8] bg-white text-xs" oninput="window.sincronizarConProformaAdmin()">
          </div>
        </div>
        <div>
          <label class="font-bold text-slate-700 block mb-1">Detalle Específico del Proyecto *</label>
          <textarea id="qDetalles" rows="2" placeholder="Especificar cantidad de ambientes, control por voz o integración con tableros..." class="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00a8e8] bg-white text-xs" oninput="window.sincronizarConProformaAdmin()"></textarea>
        </div>
      `;
    } else {
      dynamicContainer.innerHTML = `
        <div class="border-b border-slate-200 pb-2 flex justify-between items-center">
          <div>
            <span class="text-[10px] font-black uppercase text-[#00a8e8] tracking-wider block">Parámetros Operativos del Proyecto</span>
            <p class="text-[11px] text-slate-500">Especifica la ubicación y el alcance técnico de la obra.</p>
          </div>
          <span class="text-[10px] font-mono bg-white px-2.5 py-0.5 rounded border border-slate-200 text-slate-700 font-bold">${serviceName}</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="font-bold text-slate-700 block mb-1">Sede Responsable</label>
            <select id="qSede" class="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00a8e8] bg-white text-xs">
              <option value="Sede Huancayo - Jr. Salcantay 148, El Tambo">Sede Huancayo - Jr. Salcantay 148, El Tambo</option>
              <option value="Sede Huancavelica - Av. Andrés A. Cáceres #698">Sede Huancavelica - Av. Andrés A. Cáceres #698</option>
            </select>
          </div>
          <div>
            <label class="font-bold text-slate-700 block mb-1">Lugar de la Obra *</label>
            <input id="qLugar" type="text" placeholder="Ej. Chilca, La Oroya, Pampas, Satipo..." class="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00a8e8] bg-white text-xs" oninput="window.sincronizarConProformaAdmin()">
          </div>
        </div>
        <div>
          <label class="font-bold text-slate-700 block mb-1">Descripción de la Necesidad Técnica *</label>
          <textarea id="qDetalles" rows="3" placeholder="Indicar metraje estimado de fibra, ancho de banda simétrico, altura de torre o sistema de puesta a tierra..." class="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00a8e8] bg-white text-xs" oninput="window.sincronizarConProformaAdmin()"></textarea>
        </div>
      `;
    }
  };

  const prefill = sessionStorage.getItem("inmutec_prefill_service") || "Internet Dedicado";
  sessionStorage.removeItem("inmutec_prefill_service");
  window.renderCotizacionCampos(prefill);

  initChatbot();
}

// Inyección y Montaje del submódulo Admin Proforma
export async function verificarYMontarAdminProforma() {
  const container = document.getElementById("contenedor_modulo_admin_proforma");
  if (!container) return;

  if (isAdminLoggedIn) {
    try {
      const resp = await fetch("./modules/cotizacion/admin-proforma.html");
      if (resp.ok) {
        container.innerHTML = await resp.text();
        
        // Cargar html2pdf para PC si no existe
        if (!document.getElementById("html2pdf-script")) {
          const script = document.createElement("script");
          script.id = "html2pdf-script";
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
          document.head.appendChild(script);
        }

        window.renderizarItemsAdmin();
        window.sincronizarConProformaAdmin();
      }
    } catch (e) {
      console.error("Error al cargar admin-proforma.html:", e);
    }
  } else {
    container.innerHTML = "";
  }
}

// Funciones globales de la Proforma Admin
window.renderizarItemsAdmin = function() {
  const tbody = document.getElementById("tabla_items_body_admin");
  if (!tbody) return;
  tbody.innerHTML = "";

  window.itemsProformaAdmin.forEach((item, index) => {
    const total = (item.cant * item.precio).toFixed(2);
    const tr = document.createElement("tr");
    tr.className = "border-b border-slate-300";
    tr.innerHTML = `
      <td class="border border-slate-400 px-2 py-1.5 text-center font-bold">${String(index + 1).padStart(2, '0')}</td>
      <td class="border border-slate-400 px-3 py-1.5">
        <textarea class="w-full text-xs p-1 border border-transparent hover:border-slate-300 rounded focus:border-[#00a8e8] outline-none" rows="2" onchange="window.itemsProformaAdmin[${index}].descripcion = this.value">${item.descripcion}</textarea>
      </td>
      <td class="border border-slate-400 px-2 py-1.5 text-center">
        <input type="number" min="1" value="${item.cant}" class="w-12 text-center border border-slate-300 rounded text-xs" oninput="window.itemsProformaAdmin[${index}].cant = parseFloat(this.value)||1; window.renderizarItemsAdmin();">
      </td>
      <td class="border border-slate-400 px-2 py-1.5 text-center font-semibold">
        <input type="text" value="${item.unidad}" class="w-12 text-center border border-slate-300 rounded text-xs" oninput="window.itemsProformaAdmin[${index}].unidad = this.value">
      </td>
      <td class="border border-slate-400 px-3 py-1.5 text-right">
        <input type="number" step="50" min="0" value="${item.precio.toFixed(2)}" class="w-20 text-right border border-slate-300 rounded text-xs" oninput="window.itemsProformaAdmin[${index}].precio = parseFloat(this.value)||0; window.renderizarItemsAdmin();">
      </td>
      <td class="border border-slate-400 px-3 py-1.5 text-right font-bold text-slate-800">S/ ${parseFloat(total).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
      <td class="border border-slate-400 px-1 py-1 text-center print:hidden">
        <button onclick="window.eliminarFilaItem(${index})" class="text-red-500 hover:text-red-700 text-xs px-1" title="Eliminar fila">&times;</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  window.calcularTotalesProformaAdmin();
};

window.eliminarFilaItem = function(idx) {
  if (window.itemsProformaAdmin.length > 1) {
    window.itemsProformaAdmin.splice(idx, 1);
    window.renderizarItemsAdmin();
  } else {
    alert("La cotización debe tener al menos 1 ítem.");
  }
};

window.agregarFilaItem = function() {
  window.itemsProformaAdmin.push({
    descripcion: "Suministro e instalación complementaria para infraestructura técnica.",
    cant: 1,
    unidad: "UND",
    precio: 500.00
  });
  window.renderizarItemsAdmin();
};

window.calcularTotalesProformaAdmin = function() {
  const neto = window.itemsProformaAdmin.reduce((acc, it) => acc + (it.cant * it.precio), 0);
  const inputDcto = document.getElementById("input_descuento_admin");
  const descuento = inputDcto ? (parseFloat(inputDcto.value) || 0) : 0;
  const subtotal = Math.max(0, neto - descuento);
  const igv = subtotal * 0.18;
  const total = subtotal + igv;

  const f = n => `S/ ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (document.getElementById("calc_neto_admin")) {
    document.getElementById("calc_neto_admin").textContent = f(neto);
    document.getElementById("calc_subtotal_admin").textContent = f(subtotal);
    document.getElementById("calc_igv_admin").textContent = f(igv);
    document.getElementById("calc_total_admin").textContent = f(total);
  }
};

window.sincronizarConProformaAdmin = function() {
  const cli = document.getElementById("qRazon")?.value.trim() || "JORGE QUISPE";
  const doc = document.getElementById("qDoc")?.value.trim() || "-";
  const lug = document.getElementById("qLugar")?.value.trim() || "Huancayo";
  const checkedRadio = document.querySelector("input[name='docType']:checked");
  const tipoDoc = checkedRadio ? checkedRadio.value : "RUC";

  if (document.getElementById("prof_vista_cliente")) {
    document.getElementById("prof_vista_cliente").textContent = cli;
    document.getElementById("prof_vista_doc").textContent = `${tipoDoc}: ${doc}`;
    document.getElementById("prof_vista_lugar").textContent = `Lugar de Obra: ${lug}`;
  }
};

window.actualizarCabeceraProforma = function() {
  const num = document.getElementById("admin_prof_numero")?.value || "# 001070";
  const fec = document.getElementById("admin_prof_fecha")?.value || "HUANCAYO, 24 DE AGOSTO 2026";
  if (document.getElementById("prof_vista_numero")) document.getElementById("prof_vista_numero").textContent = num.replace("#", "").trim();
  if (document.getElementById("prof_vista_fecha")) document.getElementById("prof_vista_fecha").textContent = fec;
};

window.cargarPlantillaJorge = function() {
  const inputRazon = document.getElementById("qRazon");
  const inputDoc = document.getElementById("qDoc");
  if (inputRazon) inputRazon.value = "JORGE QUISPE";
  if (inputDoc) inputDoc.value = "10458923145";

  window.itemsProformaAdmin = [{
    descripcion: "Trabajos de fusión y acondicionamiento en varias MUFAS 122 FUSIONES\nInstalación y acondicionamiento de ODF en site 28 FUSIONES\nMEDCIONES CON OTDR EXFO 28 HILOS",
    cant: 1,
    unidad: "UND",
    precio: 3500.00
  }];
  window.renderizarItemsAdmin();
  window.sincronizarConProformaAdmin();
};

window.descargarProformaPDF = function() {
  const element = document.getElementById("documento_proforma_imprimible");
  if (!element || typeof html2pdf === "undefined") {
    alert("Generando motor PDF, intente en 2 segundos...");
    return;
  }
  const cliente = (document.getElementById("prof_vista_cliente")?.textContent || "CLIENTE").replace(/\s+/g, '_');
  const opt = {
    margin: [10, 10, 10, 10],
    filename: `COTIZACION_INMUTEC_${cliente}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(element).save();
};

window.enviarProformaWhatsApp = function() {
  const cli = document.getElementById("prof_vista_cliente")?.textContent || "Cliente";
  const tot = document.getElementById("calc_total_admin")?.textContent || "S/ 0.00";
  const num = document.getElementById("prof_vista_numero")?.textContent || "001070";
  const svc = document.getElementById("selectedServiceInput")?.value || "Servicios Generales";

  let txt = `*MULTISERVICIOS GENERALES INMUTEC E.I.R.L.*\n`;
  txt += `*PROPUESTA TÉCNICA ECONÓMICA PROFORMA Nº ${num}*\n\n`;
  txt += `👤 *Cliente:* ${cli}\n`;
  txt += `🛠 *Servicio:* ${svc}\n\n`;
  txt += `*DETALLE DE PROPUESTA:*\n`;

  window.itemsProformaAdmin.forEach((it, i) => {
    txt += `${i + 1}. ${it.descripcion} (${it.cant} ${it.unidad}) -> S/ ${(it.cant * it.precio).toFixed(2)}\n`;
  });

  txt += `\n*TOTAL FACTURADO (Inc. IGV):* ${tot}\n`;
  txt += `💳 *Cuentas Bancarias:*\n`;
  txt += `• BANCO DE LA NACIÓN: 00-421-038902 (CCI: 018-421-00421038902-81)\n`;
  txt += `• BANCO BBVA: 00110235930201930055 (CCI: 01123500020193005593)\n`;
  txt += `📅 *Validez:* 05 días calendario.`;

  window.open(`https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(txt)}`, "_blank");
};

window.enviarProformaCorreo = function() {
  const cli = document.getElementById("prof_vista_cliente")?.textContent || "Cliente";
  const tot = document.getElementById("calc_total_admin")?.textContent || "S/ 0.00";
  const emailDestino = document.getElementById("qEmail")?.value || "inmuteceirl@gmail.com";

  const subject = `Propuesta Técnica Económica INMUTEC - ${cli}`;
  const body = `Estimados Señores:\n\nAdjuntamos la propuesta técnica comercial por el importe total de ${tot} (100% Facturado).\n\nQuedamos a su atenta respuesta.\n\nCentral Telefónica: 954928201 / 064595829\nEmail: inmuteceirl@gmail.com`;

  window.location.href = `mailto:${emailDestino}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

function initChatbot() {
  const chatMessages = document.getElementById("chatMessages");
  if (!chatMessages) return;

  chatMessages.innerHTML = `
    <div class="flex items-start space-x-2">
      <div class="w-7 h-7 rounded-full bg-[#002b49] text-[#00a8e8] flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-sm">
        <i class="fa-solid fa-robot"></i>
      </div>
      <div class="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm text-slate-700 max-w-[88%] leading-relaxed">
        Hola, soy el asistente técnico de <strong>INMUTEC E.I.R.L.</strong> ¿En qué puedo orientarte hoy? Puedes escribir en el teclado o seleccionar una de las alternativas de abajo.
      </div>
    </div>
  `;
}

function appendBotMessage(text, sender, isButton = false) {
  const chatMessages = document.getElementById("chatMessages");
  if (!chatMessages) return;

  const wrap = document.createElement("div");
  wrap.className = sender === "user" ? "flex justify-end" : "flex items-start space-x-2";

  if (sender === "user") {
    wrap.innerHTML = `
      <div class="bg-[#002b49] text-white p-3 rounded-2xl rounded-tr-none shadow-sm max-w-[85%] leading-relaxed">
        ${text}
      </div>
    `;
  } else {
    let btnHtml = "";
    if (isButton) {
      btnHtml = `
        <div class="mt-2.5 pt-2 border-t border-slate-100">
          <a href="https://wa.me/${WHATSAPP_PHONE}?text=Hola%20Ing.%20Marmanillo,%20solicito%20asistencia%20t%C3%A9cnica%20especializada" target="_blank" class="inline-flex items-center space-x-1.5 bg-[#10b981] hover:bg-[#059669] text-white px-3 py-1.5 rounded-xl font-bold text-[10px] transition shadow">
            <i class="fa-brands fa-whatsapp"></i>
            <span>Consultar con un Ingeniero por WhatsApp</span>
          </a>
        </div>
      `;
    }
    wrap.innerHTML = `
      <div class="w-7 h-7 rounded-full bg-[#002b49] text-[#00a8e8] flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-sm">
        <i class="fa-solid fa-robot"></i>
      </div>
      <div class="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm text-slate-700 max-w-[85%] leading-relaxed">
        ${text}
        ${btnHtml}
      </div>
    `;
  }

  chatMessages.appendChild(wrap);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function processBotQuery(userText) {
  const clean = userText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  let match = null;

  for (const item of BOT_KNOWLEDGE) {
    if (item.keys.some(k => clean.includes(k))) {
      match = item.reply;
      break;
    }
  }

  setTimeout(() => {
    if (match) {
      appendBotMessage(match, "bot");
    } else {
      appendBotMessage(
        "Para brindarte una propuesta o peritaje técnico exacto sobre este requerimiento, es conveniente que uno de nuestros ingenieros revise los detalles.",
        "bot",
        true
      );
    }
  }, 250);
}

// ========================================================
// 6. FUNCIONES GLOBALES PARA MODALES (SERVICIOS Y PORTAFOLIO)
// ========================================================
window.openServiceModal = function(key) {
  const s = serviceDataMap[key];
  if (!s) return;
  document.getElementById("modalCategory").textContent = s.category;
  document.getElementById("modalTitle").textContent = s.title;
  document.getElementById("modalDesc").textContent = s.desc;

  const iconBox = document.getElementById("modalIconBox");
  if (iconBox) {
    iconBox.className = `w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${s.iconClass.split(' ').slice(0, 2).join(' ')}`;
    iconBox.innerHTML = `<i class="${s.iconClass.split(' ').slice(2).join(' ')}"></i>`;
  }

  const delivUl = document.getElementById("modalDeliverables");
  if (delivUl) {
    delivUl.innerHTML = s.deliverables.map(d => `<li>${d}</li>`).join("");
  }

  const actionBtn = document.getElementById("modalActionBtn");
  if (actionBtn) {
    actionBtn.onclick = () => {
      window.closeServiceModal();
      window.goToQuoteService(s.serviceName);
    };
  }

  document.getElementById("serviceDetailModal")?.classList.remove("hidden");
};

window.closeServiceModal = function() {
  document.getElementById("serviceDetailModal")?.classList.add("hidden");
};

window.goToQuoteService = function(serviceName) {
  sessionStorage.setItem("inmutec_prefill_service", serviceName);
  window.location.hash = "cotizacion";
};

window.openProjectModal = function(key) {
  const p = projectDataMap[key];
  if (!p) return;
  document.getElementById("projModalTag").textContent = p.tag;
  document.getElementById("projModalTitle").textContent = p.title;
  document.getElementById("projModalClient").textContent = p.client;
  document.getElementById("projModalDesc").textContent = p.desc;

  const toolsUl = document.getElementById("projModalTools");
  if (toolsUl) {
    toolsUl.innerHTML = p.tools.map(t => `<li>${t}</li>`).join("");
  }

  const stdsUl = document.getElementById("projModalStandards");
  if (stdsUl) {
    stdsUl.innerHTML = p.standards.map(s => `<li>${s}</li>`).join("");
  }

  document.getElementById("projectDetailModal")?.classList.remove("hidden");
};

window.closeProjectModal = function() {
  document.getElementById("projectDetailModal")?.classList.add("hidden");
};

window.quoteSimilarProject = function() {
  window.closeProjectModal();
  window.location.hash = "cotizacion";
};

// ========================================================
// 7. DELEGACIÓN GLOBAL DE EVENTOS (INTERACCIÓN & CMS)
// ========================================================
document.addEventListener("click", async (e) => {
  // A. Clic en Elemento Editable (Solo si el Admin inició sesión)
  const editableTarget = e.target.closest("[data-cms-key]");
  if (editableTarget && isAdminLoggedIn) {
    e.preventDefault();
    currentEditingElement = editableTarget;
    currentEditingKey = editableTarget.getAttribute("data-cms-key");
    isEditingImage = editableTarget.tagName === "IMG";

    const modal = document.getElementById("cmsEditorModal");
    const textBlock = document.getElementById("cmsTextEditorBlock");
    const imgBlock = document.getElementById("cmsImageEditorBlock");
    const title = document.getElementById("cmsModalFieldTitle");

    if (modal && textBlock && imgBlock && title) {
      title.textContent = `Modificar campo: ${currentEditingKey}`;

      if (isEditingImage) {
        textBlock.classList.add("hidden");
        imgBlock.classList.remove("hidden");
        const preview = document.getElementById("cmsImagePreview");
        const placeholder = document.getElementById("cmsImagePlaceholder");
        if (preview && placeholder) {
          preview.src = editableTarget.src;
          preview.classList.remove("hidden");
          placeholder.classList.add("hidden");
        }
      } else {
        imgBlock.classList.add("hidden");
        textBlock.classList.remove("hidden");
        const txtInput = document.getElementById("cmsTextInput");
        if (txtInput) txtInput.value = editableTarget.innerText.trim();
      }

      modal.classList.remove("hidden");
    }
    return;
  }

  // B. Botones de Login y Cierre
  if (e.target.closest("#btnOpenLoginModal")) {
    document.getElementById("loginModal")?.classList.remove("hidden");
    return;
  }
  if (e.target.closest("#btnCloseLoginModal")) {
    document.getElementById("loginModal")?.classList.add("hidden");
    return;
  }
  if (e.target.closest("#btnCloseCmsModal, #btnCancelCms")) {
    document.getElementById("cmsEditorModal")?.classList.add("hidden");
    return;
  }

  // C. Guardar Cambios en Supabase (Texto o Imagen)
  if (e.target.closest("#btnSaveCms")) {
    const saveBtn = document.getElementById("btnSaveCms");
    if (!saveBtn) return;

    saveBtn.disabled = true;
    saveBtn.textContent = "Guardando en Supabase...";

    try {
      if (isEditingImage) {
        const fileInput = document.getElementById("cmsFileInput");
        if (fileInput && fileInput.files.length > 0) {
          const file = fileInput.files[0];
          const newUrl = await uploadImageToSupabase(file, "cms");

          await supabase.from("cms_content").upsert({
            clave: currentEditingKey,
            modulo: "general",
            etiqueta: currentEditingKey,
            valor: newUrl,
            updated_at: new Date().toISOString()
          });

          if (currentEditingElement) currentEditingElement.src = newUrl;
        }
      } else {
        const nuevoTexto = document.getElementById("cmsTextInput")?.value.trim();
        if (nuevoTexto !== undefined) {
          await supabase.from("cms_content").upsert({
            clave: currentEditingKey,
            modulo: "general",
            etiqueta: currentEditingKey,
            valor: nuevoTexto,
            updated_at: new Date().toISOString()
          });

          if (currentEditingElement) currentEditingElement.innerHTML = nuevoTexto;
        }
      }
      document.getElementById("cmsEditorModal")?.classList.add("hidden");
    } catch (err) {
      alert("Error al guardar en base de datos: " + err.message);
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = "Guardar Cambios en Base de Datos";
    }
    return;
  }

  // D. Cerrar Sesión del Administrador
  if (e.target.closest("#btnAdminCerrarSesion")) {
    await supabase.auth.signOut();
    isAdminLoggedIn = false;
    document.getElementById("adminTopBar")?.classList.add("hidden");
    const txtBtn = document.getElementById("txtLoginBtn");
    if (txtBtn) txtBtn.textContent = "Login";
    disableAdminEditMode();
    const proformaContainer = document.getElementById("contenedor_modulo_admin_proforma");
    if (proformaContainer) proformaContainer.innerHTML = "";
    return;
  }

  // E. Pestañas de Navegación del Header
  const navTab = e.target.closest(".nav-tab");
  if (navTab) {
    const targetModule = navTab.getAttribute("data-module");
    if (targetModule) window.location.hash = targetModule;
    return;
  }

  // F. Flechas del Carrusel en Inicio
  if (e.target.closest("#inmutecBtnNext, #carouselNextBtn, #btnNextSlide")) {
    e.preventDefault();
    if (window.inmutecNextSlide) window.inmutecNextSlide();
    return;
  }
  if (e.target.closest("#inmutecBtnPrev, #carouselPrevBtn, #btnPrevSlide")) {
    e.preventDefault();
    if (window.inmutecPrevSlide) window.inmutecPrevSlide();
    return;
  }

  // Carrusel de Integrantes del Equipo (Quiénes Somos)
  if (e.target.closest("#teamNextBtn")) {
    e.preventDefault();
    const track = document.getElementById("teamCarouselTrack");
    if (track && track.firstElementChild) {
      track.appendChild(track.firstElementChild);
    }
    return;
  }
  if (e.target.closest("#teamPrevBtn")) {
    e.preventDefault();
    const track = document.getElementById("teamCarouselTrack");
    if (track && track.lastElementChild) {
      track.insertBefore(track.lastElementChild, track.firstElementChild);
    }
    return;
  }

  // G. Puntos del Carrusel
  const dotBtn = e.target.closest(".inmutec-dot, .carousel-dot");
  if (dotBtn) {
    e.preventDefault();
    const idx = parseInt(dotBtn.getAttribute("data-idx") || dotBtn.getAttribute("data-slide") || "0", 10);
    if (window.inmutecGoToSlide) window.inmutecGoToSlide(idx);
    return;
  }

  // H. Filtros en Servicios
  const svcFilterBtn = e.target.closest(".svc-tab-btn");
  if (svcFilterBtn) {
    e.preventDefault();
    const category = svcFilterBtn.getAttribute("data-category");
    document.querySelectorAll(".svc-tab-btn").forEach(b => {
      b.classList.remove("active-tab", "bg-[#00a8e8]", "text-[#002b49]", "shadow-sm");
      b.classList.add("bg-white", "text-slate-600", "border", "border-slate-200");
    });
    svcFilterBtn.classList.remove("bg-white", "text-slate-600", "border", "border-slate-200");
    svcFilterBtn.classList.add("active-tab", "bg-[#00a8e8]", "text-[#002b49]", "shadow-sm");

    const cards = document.querySelectorAll(".svc-card");
    let count = 0;
    cards.forEach(card => {
      const cat = card.getAttribute("data-cat");
      if (category === "all" || cat === category) {
        card.classList.remove("hidden");
        count++;
      } else {
        card.classList.add("hidden");
      }
    });

    const counter = document.getElementById("svcCounterText");
    if (counter) counter.textContent = `Mostrando ${count} especialidades`;
    return;
  }

  // I. Filtros en Portafolio
  const portFilterBtn = e.target.closest(".port-tab-btn");
  if (portFilterBtn) {
    e.preventDefault();
    const filter = portFilterBtn.getAttribute("data-filter");
    document.querySelectorAll(".port-tab-btn").forEach(b => {
      b.classList.remove("active-tab", "bg-[#00a8e8]", "text-[#002b49]", "shadow-sm");
      b.classList.add("bg-white", "text-slate-600", "border", "border-slate-200");
    });
    portFilterBtn.classList.remove("bg-white", "text-slate-600", "border", "border-slate-200");
    portFilterBtn.classList.add("active-tab", "bg-[#00a8e8]", "text-[#002b49]", "shadow-sm");

    const cards = document.querySelectorAll(".project-card");
    let count = 0;
    cards.forEach(card => {
      const cat = card.getAttribute("data-cat");
      if (filter === "all" || cat === filter) {
        card.classList.remove("hidden");
        count++;
      } else {
        card.classList.add("hidden");
      }
    });

    const counter = document.getElementById("portCounterText");
    if (counter) counter.textContent = `Mostrando ${count} obras principales`;
    return;
  }

  // J. Selector de Servicios en Cotización
  const svcBtn = e.target.closest(".svc-selector-btn");
  if (svcBtn) {
    e.preventDefault();
    const svcName = svcBtn.getAttribute("data-svc");
    if (window.renderCotizacionCampos) window.renderCotizacionCampos(svcName);
    return;
  }

  // K. Chatbot Opciones
  const quickBtn = e.target.closest(".quick-btn");
  if (quickBtn) {
    e.preventDefault();
    const q = quickBtn.textContent.trim();
    appendBotMessage(q, "user");
    processBotQuery(q);
    return;
  }

  // L. Chatbot Reset
  if (e.target.closest("#btnResetChat")) {
    e.preventDefault();
    initChatbot();
    return;
  }
});

// Previsualización de Imagen en Modal CMS
document.addEventListener("change", (e) => {
  if (e.target.id === "cmsFileInput" && e.target.files.length > 0) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const preview = document.getElementById("cmsImagePreview");
      const placeholder = document.getElementById("cmsImagePlaceholder");
      if (preview && placeholder) {
        preview.src = ev.target.result;
        preview.classList.remove("hidden");
        placeholder.classList.add("hidden");
      }
    };
    reader.readAsDataURL(e.target.files[0]);
  }
});

// Validaciones en Tiempo Real de Formularios
document.addEventListener("input", (e) => {
  const target = e.target;

  if (target.id === "qRazon") {
    const err = document.getElementById("errRazon");
    const val = target.value.trim();
    if (!val) {
      showError(target, err, "Este campo es obligatorio.");
    } else if (val.length < 3) {
      showError(target, err, "Debe ingresar al menos 3 caracteres.");
    } else if (/(.)\1{3,}/i.test(val)) {
      showError(target, err, "Nombre no válido. Evite caracteres repetidos.");
    } else if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(val)) {
      showError(target, err, "Debe contener letras válidas.");
    } else {
      clearError(target, err);
    }
    window.sincronizarConProformaAdmin();
  }

  if (target.id === "qDoc") {
    const err = document.getElementById("errDoc");
    const checked = document.querySelector("input[name='docType']:checked");
    const type = checked ? checked.value : "RUC";

    target.value = target.value.replace(/\D/g, "");
    const val = target.value;

    if (!val) {
      showError(target, err, `El número de ${type} es obligatorio.`);
    } else if (type === "DNI" && val.length !== 8) {
      showError(target, err, `El DNI debe tener exactamente 8 dígitos (ingresó ${val.length}).`);
    } else if (type === "RUC" && val.length !== 11) {
      showError(target, err, `El RUC debe tener exactamente 11 dígitos (ingresó ${val.length}).`);
    } else if (type === "RUC" && !val.startsWith("10") && !val.startsWith("20") && !val.startsWith("15") && !val.startsWith("17")) {
      showError(target, err, "RUC no válido. En Perú debe iniciar con 10 o 20.");
    } else {
      clearError(target, err);
    }
    window.sincronizarConProformaAdmin();
  }

  if (target.id === "qEmail") {
    const err = document.getElementById("errEmail");
    const val = target.value.trim();
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!val) {
      showError(target, err, "El correo electrónico es obligatorio.");
    } else if (!regex.test(val)) {
      showError(target, err, "Formato inválido. Debe contener '@' y dominio (ej. contacto@empresa.com).");
    } else {
      clearError(target, err);
    }
  }

  if (target.id === "qPhone") {
    const err = document.getElementById("errPhone");
    target.value = target.value.replace(/\D/g, "");
    const val = target.value;

    if (!val) {
      showError(target, err, "El número de celular es obligatorio.");
    } else if (val.length !== 9) {
      showError(target, err, `Debe tener 9 dígitos (ingresó ${val.length}).`);
    } else if (!val.startsWith("9")) {
      showError(target, err, "En Perú los números celulares inician con 9.");
    } else {
      clearError(target, err);
    }
  }
});

document.addEventListener("change", (e) => {
  if (e.target.name === "docType") {
    const inputDoc = document.getElementById("qDoc");
    if (!inputDoc) return;

    if (e.target.value === "DNI") {
      inputDoc.maxLength = 8;
      inputDoc.placeholder = "Ingrese los 8 dígitos de su DNI";
      if (inputDoc.value.length > 8) inputDoc.value = inputDoc.value.substring(0, 8);
    } else {
      inputDoc.maxLength = 11;
      inputDoc.placeholder = "Ingrese los 11 dígitos de su RUC";
    }

    if (inputDoc.value) {
      inputDoc.dispatchEvent(new Event("input"));
    }
    window.sincronizarConProformaAdmin();
  }
});

// Envíos de Formulario (Login, Cotización WhatsApp + BD, Chatbot)
document.addEventListener("submit", async (e) => {
  // 1. Login del Administrador
  if (e.target.id === "adminLoginForm") {
    e.preventDefault();
    const email = document.getElementById("loginEmail")?.value.trim();
    const pass = document.getElementById("loginPass")?.value.trim();
    const errorEl = document.getElementById("loginErrorMsg");
    const btnSubmit = document.getElementById("btnSubmitLogin");

    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.textContent = "Verificando acceso...";
    }
    if (errorEl) errorEl.classList.add("hidden");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: pass
      });

      if (error) throw error;

      isAdminLoggedIn = true;
      document.getElementById("loginModal")?.classList.add("hidden");
      document.getElementById("adminTopBar")?.classList.remove("hidden");
      const txtBtn = document.getElementById("txtLoginBtn");
      if (txtBtn) txtBtn.textContent = "Admin Activo";

      enableAdminEditMode();
      await verificarYMontarAdminProforma();
    } catch (err) {
      if (errorEl) {
        errorEl.textContent = "Credenciales incorrectas: " + err.message;
        errorEl.classList.remove("hidden");
      }
    } finally {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.textContent = "INGRESAR AL PANEL";
      }
    }
    return;
  }

  // 2. Mesa de Cotización
  if (e.target.id === "quoteForm") {
    e.preventDefault();

    const inputRazon = document.getElementById("qRazon");
    const inputDoc = document.getElementById("qDoc");
    const inputEmail = document.getElementById("qEmail");
    const inputPhone = document.getElementById("qPhone");

    if (inputRazon) inputRazon.dispatchEvent(new Event("input"));
    if (inputDoc) inputDoc.dispatchEvent(new Event("input"));
    if (inputEmail) inputEmail.dispatchEvent(new Event("input"));
    if (inputPhone) inputPhone.dispatchEvent(new Event("input"));

    const hasErrors = document.querySelectorAll("#quoteForm .text-rose-500:not(.hidden)");
    if (hasErrors.length > 0) return;

    const razon = inputRazon.value.trim();
    const checked = document.querySelector("input[name='docType']:checked");
    const docType = checked ? checked.value : "RUC";
    const doc = inputDoc.value.trim();
    const email = inputEmail.value.trim();
    const phone = inputPhone.value.trim();
    const svc = document.getElementById("selectedServiceInput") ? document.getElementById("selectedServiceInput").value : "Internet Dedicado";

    let extra = "";
    if (svc === "Laboratorio") {
      const eq = document.getElementById("qLabEquipo") ? document.getElementById("qLabEquipo").value.trim() : "No indicado";
      const cant = document.getElementById("qLabCantidad") ? document.getElementById("qLabCantidad").value.trim() : "1";
      const falla = document.getElementById("qLabFalla") ? document.getElementById("qLabFalla").value.trim() : "Mantenimiento general";
      extra = `• Equipo/Marca: ${eq}\n• Cantidad: ${cant}\n• Falla: ${falla}\n• Sede: Huancayo (Jr. Salcantay 148)`;
    } else if (svc === "Domótica") {
      const tipo = document.getElementById("qDomTipo") ? document.getElementById("qDomTipo").value : "Residencial";
      const lugar = document.getElementById("qLugar") ? document.getElementById("qLugar").value.trim() : "Huancayo";
      const checks = Array.from(document.querySelectorAll(".chk-domo-item:checked")).map(c => c.value).join(", ");
      const sis = document.getElementById("qDetalles") ? document.getElementById("qDetalles").value.trim() : "Automatización";
      extra = `• Tipo de Proyecto: ${tipo}\n• Ubicación: ${lugar}\n• Módulos IoT: ${checks}\n• Requerimiento: ${sis}`;
    } else {
      const sede = document.getElementById("qSede") ? document.getElementById("qSede").value : "Huancayo";
      const lugar = document.getElementById("qLugar") ? document.getElementById("qLugar").value.trim() : "No indicado";
      const desc = document.getElementById("qDetalles") ? document.getElementById("qDetalles").value.trim() : "General";
      extra = `• Sede Asignada: ${sede}\n• Lugar de la Obra: ${lugar}\n• Requerimiento: ${desc}`;
    }

    try {
      await supabase.from("cotizaciones").insert([
        {
          razon_social: razon,
          tipo_documento: docType,
          numero_documento: doc,
          correo: email,
          celular: phone,
          servicio_solicitado: svc,
          detalles: extra,
          estado: "Pendiente"
        }
      ]);
    } catch (dbErr) {
      console.warn("No se pudo registrar la cotización en Supabase:", dbErr);
    }

    const mensaje = 
      `*SOLICITUD DE COTIZACIÓN TÉCNICA - INMUTEC E.I.R.L.*\n\n` +
      `*Cliente / Razón Social:* ${razon}\n` +
      `*${docType}:* ${doc}\n` +
      `*Correo:* ${email}\n` +
      `*Celular:* +51 ${phone}\n` +
      `*Servicio Solicitado:* ${svc}\n\n` +
      `*ESPECIFICACIONES DEL REQUERIMIENTO:*\n${extra}\n\n` +
      `_Mensaje enviado desde la Mesa de Cotización www.inmutec.com.pe_`;

    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(mensaje)}`, "_blank");
    return;
  }

  // 3. Formulario del Chatbot
  if (e.target.id === "chatForm") {
    e.preventDefault();
    const chatInput = document.getElementById("chatInput");
    if (!chatInput) return;
    const txt = chatInput.value.trim();
    if (!txt) return;

    appendBotMessage(txt, "user");
    chatInput.value = "";
    processBotQuery(txt);
  }
});

function showError(input, errorEl, msg) {
  input.classList.add("border-rose-500", "focus:ring-rose-400");
  input.classList.remove("border-slate-300", "focus:ring-[#00a8e8]");
  if (errorEl) {
    errorEl.textContent = msg;
    errorEl.classList.remove("hidden");
  }
}

function clearError(input, errorEl) {
  input.classList.remove("border-rose-500", "focus:ring-rose-400");
  input.classList.add("border-slate-300", "focus:ring-[#00a8e8]");
  if (errorEl) {
    errorEl.textContent = "";
    errorEl.classList.add("hidden");
  }
}

// Inicialización de la SPA y comprobación de sesión Supabase
window.addEventListener("DOMContentLoaded", async () => {
  // Comprobar si hay una sesión guardada en Supabase
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      isAdminLoggedIn = true;
      document.getElementById("adminTopBar")?.classList.remove("hidden");
      const txtBtn = document.getElementById("txtLoginBtn");
      if (txtBtn) txtBtn.textContent = "Admin Activo";
    }
  } catch (err) {
    console.warn("No se pudo recuperar la sesión:", err);
  }

  window.addEventListener("hashchange", () => {
    const hash = window.location.hash.replace("#", "") || "inicio";
    loadModule(hash);
  });

  const initialHash = window.location.hash.replace("#", "") || "inicio";
  await loadModule(initialHash);
});
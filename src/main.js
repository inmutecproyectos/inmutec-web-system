// =============================================================================
// SISTEMA WEB INMUTEC E.I.R.L. - CONTROLADOR GLOBAL MAESTRO
// =============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// =============================================================================
// MODULO 0: CONFIGURACIÓN GLOBAL Y PARÁMETROS EDITABLES
// =============================================================================
export const CONFIG_INMUTEC = {
  whatsappGeneral: "51954928201",
  telefonoFijo: "(064) 595829",
  centralMovil: "+51 954 928 201",
  correoPrincipal: "inmutecproyectos@gmail.com",
  correoSecundario: "inmuteceirl@gmail.com",
  correoGerencia: "gusmarbal@hotmail.com",
  empresaNombre: "MULTISERVICIOS GENERALES INMUTEC E.I.R.L.",
  ruc: "20568327692",
  gerenteGeneral: "Ing. Gustavo Marmanillo Baldeón",
  direccionHuancayo: "Jr. Salcantay 148 – El Tambo – Huancayo",
  direccionHuancavelica: "Av. Andrés Avelino Cáceres # 698 – Huancavelica"
};

const SUPABASE_URL = "https://qcnsrlsolmhbsxlqpqpc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjbnNybHNvbG1oYnN4bHFwcXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1ODA2NDcsImV4cCI6MjEwOTE1NjY0N30.Tsc8SkXyQiA0tl8P890yFpKw-2j1eMS1AHJxkfUzlRw";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let isAdminLoggedIn = false;
let currentEditingElement = null;
let currentEditingKey = null;
let isEditingImage = false;
let carouselTimer = null;
let currentSlideIndex = 0;

window.itemsProformaAdmin = [];

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

// =============================================================================
// MODULO 1: ENRUTADOR DINÁMICO (SPA) Y MOTOR CMS
// =============================================================================
export async function loadModule(moduleName) {
  const container = document.getElementById("moduleContainer");
  if (!container) return;

  const modKey = modulesConfig[moduleName] ? moduleName : "inicio";
  const config = modulesConfig[modKey];
  const timestamp = Date.now();

  document.querySelectorAll(".nav-tab").forEach(tab => {
    tab.classList.remove("bg-[#00a8e8]", "text-[#002b49]", "shadow-md");
    tab.classList.add("text-slate-200");
  });
  const activeTab = document.getElementById(`btn-${modKey}`);
  if (activeTab) {
    activeTab.classList.remove("text-slate-200");
    activeTab.classList.add("bg-[#00a8e8]", "text-[#002b49]", "shadow-md");
  }

  let cssLink = document.getElementById("module-dynamic-css");
  if (!cssLink) {
    cssLink = document.createElement("link");
    cssLink.id = "module-dynamic-css";
    cssLink.rel = "stylesheet";
    document.head.appendChild(cssLink);
  }
  cssLink.href = `${config.css}?v=${timestamp}`;

  try {
    const res = await fetch(`${config.html}?v=${timestamp}`);
    if (!res.ok) throw new Error(`No se pudo cargar ${config.html}`);
    container.innerHTML = await res.text();
  } catch (err) {
    console.error("Error al cargar módulo HTML:", err);
    container.innerHTML = `<div class="p-8 text-center text-rose-500 font-bold">Error cargando ${modKey}.</div>`;
    return;
  }

  if (modKey === "inicio") {
    initInicioModule();
  } else if (modKey === "cotizacion") {
    await initCotizacionModule();
  }

  await applyCmsValuesToView();

  if (isAdminLoggedIn) {
    enableAdminEditMode();
  }
}

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
  document.querySelectorAll("[data-cms-key]").forEach(el => el.classList.add("admin-editable-active"));
}

function disableAdminEditMode() {
  document.querySelectorAll("[data-cms-key]").forEach(el => el.classList.remove("admin-editable-active"));
}

async function uploadImageToSupabase(file, folder = "cms") {
  const fileExt = file.name.split(".").pop();
  const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

  const { error } = await supabase.storage
    .from("inmutec-media")
    .upload(fileName, file, { cacheControl: "3600", upsert: true });

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage
    .from("inmutec-media")
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}

// =============================================================================
// MODULO 2: VISTA INICIO (CARRUSEL AUTOMÁTICO Y FLECHAS)
// =============================================================================
function initInicioModule() {
  const box = document.getElementById("inmutecCarouselBox");
  if (!box) return;

  const slides = box.querySelectorAll(".inmutec-slide");
  const dots = box.querySelectorAll(".inmutec-dot");
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
        d.classList.remove("bg-white/40", "w-2", "sm:w-3");
      } else {
        d.classList.remove("bg-[#00a8e8]", "w-6");
        d.classList.add("bg-white/40", "w-2", "sm:w-3");
      }
    });
  }

  window.inmutecNextSlide = () => renderSlide(currentSlideIndex + 1);
  window.inmutecPrevSlide = () => renderSlide(currentSlideIndex - 1);
  window.inmutecGoToSlide = (i) => renderSlide(i);

  const btnPrev = document.getElementById("inmutecBtnPrev");
  const btnNext = document.getElementById("inmutecBtnNext");

  if (btnPrev) btnPrev.onclick = (e) => { e.preventDefault(); window.inmutecPrevSlide(); };
  if (btnNext) btnNext.onclick = (e) => { e.preventDefault(); window.inmutecNextSlide(); };

  dots.forEach(dot => {
    dot.onclick = () => {
      const idx = parseInt(dot.getAttribute("data-idx"), 10) || 0;
      window.inmutecGoToSlide(idx);
    };
  });

  if (carouselTimer) clearInterval(carouselTimer);
  carouselTimer = setInterval(() => renderSlide(currentSlideIndex + 1), 4500);

  box.onmouseenter = () => clearInterval(carouselTimer);
  box.onmouseleave = () => {
    clearInterval(carouselTimer);
    carouselTimer = setInterval(() => renderSlide(currentSlideIndex + 1), 4500);
  };

  renderSlide(0);
}

// =============================================================================
// MODULO 3: VISTA SERVICIOS Y PORTAFOLIO (MODALES Y FILTROS)
// =============================================================================
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

window.closeServiceModal = () => document.getElementById("serviceDetailModal")?.classList.add("hidden");

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
  if (toolsUl) toolsUl.innerHTML = p.tools.map(t => `<li>${t}</li>`).join("");

  const stdsUl = document.getElementById("projModalStandards");
  if (stdsUl) stdsUl.innerHTML = p.standards.map(s => `<li>${s}</li>`).join("");

  document.getElementById("projectDetailModal")?.classList.remove("hidden");
};

window.closeProjectModal = () => document.getElementById("projectDetailModal")?.classList.add("hidden");

window.quoteSimilarProject = function() {
  window.closeProjectModal();
  window.location.hash = "cotizacion";
};

// =============================================================================
// FILTRO 1: PORTAFOLIO (Reset infalible de className)
// =============================================================================
window.filtrarPortafolio = function(filtro, btnElement) {
  const contenedor = document.getElementById("portfolioList") || document.getElementById("moduleContainer");
  if (!contenedor) return;

  const contenedorBotones = document.getElementById("portfolioFilterContainer") || btnElement?.closest("#portfolioFilterContainer") || btnElement?.parentElement;
  if (contenedorBotones) {
    const todosBotones = contenedorBotones.querySelectorAll("button, .port-tab-btn");
    todosBotones.forEach(b => {
      b.className = "port-tab-btn shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition bg-white text-slate-600 border border-slate-200 hover:border-[#00a8e8] cursor-pointer";
    });

    if (btnElement) {
      btnElement.className = "port-tab-btn active-tab shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm bg-[#00a8e8] text-[#002b49] cursor-pointer";
    }
  }

  const articulos = contenedor.querySelectorAll(".project-card, article[data-cat]");
  let visibles = 0;

  articulos.forEach(art => {
    const cat = (art.getAttribute("data-cat") || "").trim().toLowerCase();
    const f = (filtro || "all").trim().toLowerCase();

    if (f === "all" || f === "todos" || cat === f) {
      art.style.setProperty("display", "", "");
      art.classList.remove("hidden");
      visibles++;
    } else {
      art.style.setProperty("display", "none", "important");
      art.classList.add("hidden");
    }
  });

  const counterText = document.getElementById("portCounterText");
  if (counterText) {
    counterText.textContent = `Mostrando ${visibles} obra${visibles !== 1 ? 's' : ''} ${filtro === 'all' ? 'principales' : 'filtradas'}`;
  }
};

// =============================================================================
// FILTRO 2: SERVICIOS (Reset infalible de className)
// =============================================================================
window.filtrarServicios = function(categoria, btnElement) {
  const contenedor = document.getElementById("servicesGrid") || document.getElementById("moduleContainer");
  if (!contenedor) return;

  const contenedorBotones = document.getElementById("servicesFilterGroup") || btnElement?.closest("#servicesFilterGroup") || btnElement?.parentElement;
  if (contenedorBotones) {
    const todosBotones = contenedorBotones.querySelectorAll("button, .svc-tab-btn");
    todosBotones.forEach(b => {
      b.className = "svc-tab-btn shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition bg-white text-slate-600 border border-slate-200 hover:border-[#00a8e8] cursor-pointer";
    });

    if (btnElement) {
      btnElement.className = "svc-tab-btn active-tab shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm bg-[#00a8e8] text-[#002b49] cursor-pointer";
    }
  }

  const articulos = contenedor.querySelectorAll(".svc-card, article[data-cat]");
  let visibles = 0;

  articulos.forEach(art => {
    const cat = (art.getAttribute("data-cat") || "").trim().toLowerCase();
    const c = (categoria || "all").trim().toLowerCase();

    if (c === "all" || c === "todos" || cat === c) {
      art.style.setProperty("display", "", "");
      art.classList.remove("hidden");
      visibles++;
    } else {
      art.style.setProperty("display", "none", "important");
      art.classList.add("hidden");
    }
  });

  const counterText = document.getElementById("svcCounterText");
  if (counterText) {
    counterText.textContent = `Mostrando ${visibles} especialidad${visibles !== 1 ? 'es' : ''}`;
  }
};

// =============================================================================
// MODULO 4: VISTA COTIZACIÓN (VALIDACIÓN ESTRICTA + INTERFAZ CALIBRADA)
// =============================================================================
async function initCotizacionModule() {
  const moduleContainer = document.getElementById("moduleContainer");

  // 1. Limpieza visual segura sin destruir referencias del DOM
  if (moduleContainer) {
    moduleContainer.querySelectorAll("*").forEach(el => {
      if (el.children.length === 0 && el.textContent) {
        if (el.textContent.includes("inmuteceirl@gmail.com")) {
          el.textContent = el.textContent.replace(/inmuteceirl@gmail\.com/gi, CONFIG_INMUTEC.correoPrincipal);
        }
        if (el.textContent.includes("gusmarbal@hotmail.com")) {
          el.textContent = el.textContent.replace(/gusmarbal@hotmail\.com/gi, CONFIG_INMUTEC.correoPrincipal);
        }
      }
    });

    moduleContainer.querySelectorAll("button, a").forEach(btn => {
      const txt = (btn.textContent || "").toUpperCase();
      if (txt.includes("ENVIAR COTIZACIÓN") || txt.includes("COTIZACIÓN A WHATSAPP")) {
        btn.id = "btnEnviarCotizacionPublica";
        let sig = btn.nextElementSibling;
        while (sig) {
          const nextEl = sig.nextElementSibling;
          if (sig.tagName === "P" || sig.tagName === "SMALL" || sig.tagName === "SPAN" || sig.tagName === "DIV") {
            sig.style.display = "none";
          }
          sig = nextEl;
        }
      }
    });
  }

  if (isAdminLoggedIn) {
    await verificarYMontarAdminProforma();
  }

  // 2. Validación en tiempo real: solo números en RUC/DNI y Celular
  const inputDoc = document.getElementById("qDoc");
  const inputPhone = document.getElementById("qPhone");
  const inputRazon = document.getElementById("qRazon");
  const inputEmail = document.getElementById("qEmail");

  if (inputDoc) {
    inputDoc.setAttribute("inputmode", "numeric");
    inputDoc.maxLength = 11;
    inputDoc.placeholder = "Ingrese los 11 dígitos de su RUC";
    inputDoc.addEventListener("input", () => {
      const tipo = document.querySelector("input[name='docType']:checked")?.value || "RUC";
      const max = tipo === "DNI" ? 8 : 11;
      inputDoc.value = inputDoc.value.replace(/\D/g, "").slice(0, max);
      window.sincronizarConProformaAdmin?.();
    });
  }

  if (inputPhone) {
    inputPhone.setAttribute("inputmode", "numeric");
    inputPhone.maxLength = 9;
    inputPhone.placeholder = "Ej. 954928201 (9 dígitos)";
    inputPhone.addEventListener("input", () => {
      inputPhone.value = inputPhone.value.replace(/\D/g, "").slice(0, 9);
    });
  }

  if (inputRazon) {
    inputRazon.addEventListener("input", () => {
      inputRazon.value = inputRazon.value.replace(/[<>{}[\]\\]/g, "");
      window.sincronizarConProformaAdmin?.();
    });
  }

  if (inputEmail) {
    inputEmail.type = "email";
    inputEmail.placeholder = "ejemplo@empresa.com";
  }

  // 3. Sincronización dinámica al cambiar entre RUC y DNI
  document.querySelectorAll("input[name='docType']").forEach(radio => {
    radio.addEventListener("change", (e) => {
      const docEl = document.getElementById("qDoc");
      if (!docEl) return;
      if (e.target.value === "DNI") {
        docEl.placeholder = "Ingrese los 8 dígitos de su DNI";
        docEl.maxLength = 8;
        docEl.value = docEl.value.replace(/\D/g, "").slice(0, 8);
      } else {
        docEl.placeholder = "Ingrese los 11 dígitos de su RUC";
        docEl.maxLength = 11;
        docEl.value = docEl.value.replace(/\D/g, "").slice(0, 11);
      }
      window.sincronizarConProformaAdmin?.();
    });
  });

  // 4. Renderizado de parámetros por especialidad (busca el contenedor en vivo)
  window.renderCotizacionCampos = function(serviceName) {
    const dynamicContainer = document.getElementById("dynamicServiceSection");
    const hiddenSvcInput = document.getElementById("selectedServiceInput");
    const modContainer = document.getElementById("moduleContainer");

    if (!dynamicContainer) return;
    if (hiddenSvcInput) hiddenSvcInput.value = serviceName;

    if (modContainer) {
      modContainer.querySelectorAll("button, .cursor-pointer").forEach(card => {
        if (
          card.closest("#dynamicServiceSection") ||
          card.closest("#proformaWorkspaceContainer") ||
          card.closest("#chatForm")
        ) return;

        const txt = (card.textContent || "").trim();
        const esTarjetaServicio =
          txt.includes("Internet Dedicado") ||
          txt.includes("Fibra Óptica") ||
          txt.includes("Torres & STP") ||
          txt.includes("Laboratorio RF") ||
          txt.includes("Domótica & Smart");

        if (esTarjetaServicio) {
          card.classList.remove(
            "active-svc",
            "border-[#00a8e8]",
            "bg-cyan-50/50",
            "ring-2",
            "ring-[#00a8e8]",
            "border-amber-400",
            "border-amber-500",
            "bg-amber-50/40"
          );
          card.classList.add("border-slate-200", "bg-white");

          const coincide =
            (serviceName === "Internet Dedicado" && txt.includes("Internet Dedicado")) ||
            (serviceName === "Fibra Óptica" && txt.includes("Fibra Óptica")) ||
            (serviceName === "Torres & STP" && txt.includes("Torres & STP")) ||
            ((serviceName === "Laboratorio" || serviceName === "Laboratorio RF") && txt.includes("Laboratorio RF")) ||
            ((serviceName === "Domótica" || serviceName === "Domótica & Smart") && txt.includes("Domótica & Smart"));

          if (coincide) {
            card.classList.remove("border-slate-200", "bg-white");
            card.classList.add("active-svc", "border-[#00a8e8]", "bg-cyan-50/50", "ring-2", "ring-[#00a8e8]");
          }
        }
      });
    }

    if (serviceName === "Laboratorio" || serviceName === "Laboratorio RF") {
      dynamicContainer.innerHTML = `
        <div class="border-b border-slate-200 pb-2">
          <span class="text-[10px] font-black uppercase text-[#ef4444] tracking-wider block">Recepción en Laboratorio Técnico RF</span>
          <p class="text-[11px] text-slate-500">Ingresa las especificaciones del equipo para banco de pruebas y calibración.</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="font-bold text-slate-700 block mb-1">Tipo de Equipo y Marca *</label>
            <input id="qLabEquipo" type="text" placeholder="Ej. Radiotransmisor Motorola / Kenwood" class="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00a8e8] bg-white text-xs">
          </div>
          <div>
            <label class="font-bold text-slate-700 block mb-1">Cantidad de Equipos *</label>
            <input id="qLabCantidad" type="number" min="1" value="1" class="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00a8e8] bg-white font-mono text-xs">
          </div>
        </div>
        <div>
          <label class="font-bold text-slate-700 block mb-1">Detalle de la Falla o Trabajo Requerido *</label>
          <textarea id="qLabFalla" rows="3" placeholder="Indicar si no enciende, pérdida de potencia, calibración de frecuencia o mantenimiento..." class="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00a8e8] bg-white text-xs"></textarea>
        </div>
        <div class="flex items-center space-x-2 text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
          <i class="fa-solid fa-location-dot text-[#00a8e8]"></i>
          <span>Recepción oficial: <strong>${CONFIG_INMUTEC.direccionHuancayo}</strong></span>
        </div>
      `;
    } else if (serviceName === "Domótica" || serviceName === "Domótica & Smart") {
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
            <input type="checkbox" class="chk-domo-item text-amber-600 rounded" value="Iluminación Smart & Escenas Arquitectónicas" checked onchange="window.sincronizarConProformaAdmin()">
            <span>💡 Iluminación & Dimerización Smart</span>
          </label>
          <label class="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-amber-200 cursor-pointer hover:border-amber-400 transition">
            <input type="checkbox" class="chk-domo-item text-amber-600 rounded" value="Control de Acceso Biométrico y Cerraduras Digitales" checked onchange="window.sincronizarConProformaAdmin()">
            <span>🔐 Accesos Digitales & Motores</span>
          </label>
          <label class="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-amber-200 cursor-pointer hover:border-amber-400 transition">
            <input type="checkbox" class="chk-domo-item text-amber-600 rounded" value="CCTV con Detección IA & Audio Bidireccional" onchange="window.sincronizarConProformaAdmin()">
            <span>📷 Seguridad Perimetral con IA</span>
          </label>
          <label class="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-amber-200 cursor-pointer hover:border-amber-400 transition">
            <input type="checkbox" class="chk-domo-item text-amber-600 rounded" value="Monitoreo Energético y Automatización de Tableros" onchange="window.sincronizarConProformaAdmin()">
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

  // 5. Envío validado del formulario público de cotización a WhatsApp
  window.enviarCotizacionPublicaWhatsApp = async function() {
    const razon = document.getElementById("qRazon")?.value.trim() || "";
    const tipoDoc = document.querySelector("input[name='docType']:checked")?.value || "RUC";
    const numDoc = document.getElementById("qDoc")?.value.trim() || "";
    const email = document.getElementById("qEmail")?.value.trim() || "";
    const phone = document.getElementById("qPhone")?.value.trim() || "";
    const servicio = document.getElementById("selectedServiceInput")?.value || "Internet Dedicado";

    if (razon.length < 3 || !/[a-zA-ZáéíóúÁÉÍÓÚñÑ]{2,}/.test(razon)) {
      alert("Por favor ingrese un Nombre completo o Razón Social válida (mínimo 3 caracteres con letras).");
      document.getElementById("qRazon")?.focus();
      return;
    }

    if (tipoDoc === "RUC" && !/^\d{11}$/.test(numDoc)) {
      alert("El número de RUC debe tener exactamente 11 dígitos numéricos.");
      document.getElementById("qDoc")?.focus();
      return;
    }
    if (tipoDoc === "DNI" && !/^\d{8}$/.test(numDoc)) {
      alert("El número de DNI debe tener exactamente 8 dígitos numéricos.");
      document.getElementById("qDoc")?.focus();
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      alert("Por favor ingrese un correo electrónico válido (ejemplo: contacto@empresa.com).");
      document.getElementById("qEmail")?.focus();
      return;
    }

    if (!/^9\d{8}$/.test(phone)) {
      alert("Por favor ingrese un número celular válido de 9 dígitos que inicie con 9.");
      document.getElementById("qPhone")?.focus();
      return;
    }

    let detalleExtra = "";
    if (servicio === "Laboratorio" || servicio === "Laboratorio RF") {
      const eq = document.getElementById("qLabEquipo")?.value.trim() || "";
      const cant = document.getElementById("qLabCantidad")?.value || "1";
      const falla = document.getElementById("qLabFalla")?.value.trim() || "";
      if (!eq || !falla) {
        alert("Por favor complete el Tipo de Equipo y el Detalle de la Falla.");
        return;
      }
      detalleExtra = `• *Equipo:* ${eq} (Cant: ${cant})\n• *Falla/Trabajo:* ${falla}`;
    } else if (servicio === "Domótica" || servicio === "Domótica & Smart") {
      const checks = Array.from(document.querySelectorAll(".chk-domo-item:checked")).map(c => c.value).join(", ") || "Solución Integral Smart";
      const tipoEsp = document.getElementById("qDomTipo")?.value || "-";
      const lugar = document.getElementById("qLugar")?.value.trim() || "";
      const det = document.getElementById("qDetalles")?.value.trim() || "";
      if (!lugar || !det) {
        alert("Por favor indique el Lugar de Implementación y el Detalle del Proyecto.");
        return;
      }
      detalleExtra = `• *Soluciones:* ${checks}\n• *Espacio:* ${tipoEsp}\n• *Lugar:* ${lugar}\n• *Detalle:* ${det}`;
    } else {
      const sede = document.getElementById("qSede")?.value || "-";
      const lugar = document.getElementById("qLugar")?.value.trim() || "";
      const det = document.getElementById("qDetalles")?.value.trim() || "";
      if (!lugar || !det) {
        alert("Por favor indique el Lugar de la Obra y la Descripción Técnica.");
        return;
      }
      detalleExtra = `• *Sede:* ${sede}\n• *Lugar:* ${lugar}\n• *Detalle:* ${det}`;
    }

    try {
      await supabase.from("cotizaciones_web").insert([{
        cliente: razon,
        tipo_doc: tipoDoc,
        num_doc: numDoc,
        correo: email,
        celular: phone,
        servicio: servicio,
        detalle: detalleExtra,
        creado_el: new Date().toISOString()
      }]);
    } catch (e) {
      console.warn("Registro en tabla cotizaciones_web omitido:", e);
    }

    const msg =
      `*SOLICITUD DE COTIZACIÓN WEB - INMUTEC E.I.R.L.*\n\n` +
      `👤 *Cliente / Empresa:* ${razon}\n` +
      `🪪 *${tipoDoc}:* ${numDoc}\n` +
      `📧 *Correo:* ${email}\n` +
      `📱 *Celular:* ${phone}\n` +
      `🛠 *Especialidad:* ${servicio}\n\n` +
      `*PARÁMETROS TÉCNICOS:*\n${detalleExtra}`;

    const url = `https://api.whatsapp.com/send?phone=${CONFIG_INMUTEC.whatsappGeneral}&text=${encodeURIComponent(msg)}`;
    const win = window.open(url, "_blank");
    if (!win || win.closed || typeof win.closed === "undefined") {
      window.location.href = url;
    }
  };

  const prefill = sessionStorage.getItem("inmutec_prefill_service") || "Internet Dedicado";
  sessionStorage.removeItem("inmutec_prefill_service");
  window.renderCotizacionCampos(prefill);

  initChatbot();
}

export async function verificarYMontarAdminProforma() {
  const container = document.getElementById("contenedor_modulo_admin_proforma");
  if (!container) return;

  if (isAdminLoggedIn) {
    try {
      const resp = await fetch("./modules/cotizacion/admin-proforma.html?v=" + Date.now());
      if (resp.ok) {
        container.innerHTML = await resp.text();

        if (!document.getElementById("html2pdf-script")) {
          const script = document.createElement("script");
          script.id = "html2pdf-script";
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
          document.head.appendChild(script);
        }

        const { numero } = await window.obtenerSiguienteNumeroProforma();
        const badge = document.getElementById("admin_proforma_counter_badge");
        if (badge) {
          badge.textContent = `Siguiente: #${numero}`;
        }
      }
    } catch (e) {
      console.error("Error al cargar admin-proforma.html:", e);
    }
  } else {
    container.innerHTML = "";
  }
}

// =============================================================================
// MODULO 5: EMISOR OFICIAL DE PROFORMAS TÉCNICAS (CONECTADO A SUPABASE)
// =============================================================================

window.proformaActualGuardada = false;

window.obtenerSiguienteNumeroProforma = async function() {
  const NUMERO_BASE = 1072;

  try {
    const { data, error } = await supabase
      .from("proformas")
      .select("numero_correlativo")
      .order("numero_correlativo", { ascending: false })
      .limit(1);

    if (error) throw error;

    let siguienteNumero = NUMERO_BASE;
    if (data && data.length > 0 && data[0].numero_correlativo) {
      siguienteNumero = parseInt(data[0].numero_correlativo, 10) + 1;
    }

    const formateado = String(siguienteNumero).padStart(6, "0");

    const inputNum = document.getElementById("admin_prof_numero");
    const vistaNum = document.getElementById("prof_vista_numero");
    if (inputNum) inputNum.value = formateado;
    if (vistaNum) vistaNum.textContent = formateado;

    return { numero: formateado, correlativo: siguienteNumero };
  } catch (err) {
    console.warn("No se pudo obtener correlativo de Supabase, usando respaldo:", err);
    const guardado = localStorage.getItem("inmutec_ultimo_correlativo") || "1072";
    const fallback = String(parseInt(guardado, 10)).padStart(6, "0");
    return { numero: fallback, correlativo: parseInt(fallback, 10) };
  }
};

window.generarFechaHoraHuancayo = function() {
  const meses = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SETIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
  const ahora = new Date();
  const dia = ahora.getDate();
  const mes = meses[ahora.getMonth()];
  const anio = ahora.getFullYear();

  let horas = ahora.getHours();
  const minutos = String(ahora.getMinutes()).padStart(2, "0");
  const ampm = horas >= 12 ? "PM" : "AM";
  horas = horas % 12;
  horas = horas ? horas : 12;

  return `HUANCAYO, ${dia} DE ${mes} ${anio} - ${horas}:${minutos} ${ampm}`;
};

window.toggleProformaWorkspace = async function() {
  const box = document.getElementById("proformaWorkspaceContainer");
  const txt = document.getElementById("btnToggleProformaText");
  const icon = document.getElementById("btnToggleIcon");
  if (!box) return;

  if (box.classList.contains("hidden")) {
    box.classList.remove("hidden");
    if (txt) txt.textContent = "Ocultar Mesa de Proforma";
    if (icon) icon.classList.add("rotate-180");

    const { numero } = await window.obtenerSiguienteNumeroProforma();
    const fechaHora = window.generarFechaHoraHuancayo();

    const inputNum = document.getElementById("admin_prof_numero");
    const inputFecha = document.getElementById("admin_prof_fecha");
    if (inputNum) inputNum.value = numero;
    if (inputFecha) inputFecha.value = fechaHora;

    const servicioActual = document.getElementById("selectedServiceInput")?.value || "Internet Dedicado";
    window.aplicarPlantillaServicio(servicioActual);
    window.sincronizarConProformaAdmin();
    window.bloquearAccionesDespacho();
    await window.cargarHistorialProformas();
  } else {
    box.classList.add("hidden");
    if (txt) txt.textContent = "Realizar Nueva Proforma";
    if (icon) icon.classList.remove("rotate-180");
  }
};

window.bloquearAccionesDespacho = function() {
  window.proformaActualGuardada = false;
  const btns = ["btnDescargarPDF", "btnEnviarWhatsApp", "btnEnviarCorreo"];
  btns.forEach(id => {
    const b = document.getElementById(id);
    if (b) {
      b.disabled = true;
      b.classList.add("cursor-not-allowed", "opacity-60", "bg-slate-700", "text-slate-400");
      b.classList.remove("bg-[#00a8e8]", "text-[#002b49]", "bg-[#25D366]", "text-white", "hover:bg-[#0092ca]", "hover:bg-[#20ba5a]");
    }
  });
};

window.desbloquearAccionesDespacho = function() {
  window.proformaActualGuardada = true;
  
  const bPdf = document.getElementById("btnDescargarPDF");
  if (bPdf) {
    bPdf.disabled = false;
    bPdf.classList.remove("cursor-not-allowed", "opacity-60", "bg-slate-700", "text-slate-400");
    bPdf.classList.add("bg-[#00a8e8]", "hover:bg-[#0092ca]", "text-[#002b49]", "cursor-pointer");
  }

  const bWa = document.getElementById("btnEnviarWhatsApp");
  if (bWa) {
    bWa.disabled = false;
    bWa.classList.remove("cursor-not-allowed", "opacity-60", "bg-slate-700", "text-slate-400");
    bWa.classList.add("bg-[#25D366]", "hover:bg-[#20ba5a]", "text-white", "cursor-pointer");
  }

  const bMail = document.getElementById("btnEnviarCorreo");
  if (bMail) {
    bMail.disabled = false;
    bMail.classList.remove("cursor-not-allowed", "opacity-60", "bg-slate-700", "text-slate-400");
    bMail.classList.add("bg-slate-800", "hover:bg-slate-700", "text-slate-200", "cursor-pointer");
  }
};

window.guardarProformaOficial = async function() {
  const btnGuardar = document.getElementById("btnGuardarProforma");
  if (btnGuardar) {
    btnGuardar.disabled = true;
    btnGuardar.textContent = "Guardando...";
  }

  try {
    const { numero, correlativo } = await window.obtenerSiguienteNumeroProforma();

    const cliente = document.getElementById("prof_edit_cliente")?.value.trim() || "EMPRESA REGISTRADA";
    const doc = document.getElementById("prof_edit_doc")?.value.trim() || "-";
    const lugar = document.getElementById("prof_edit_lugar")?.value.trim() || "Huancayo";
    const total = document.getElementById("calc_total_admin")?.textContent || "S/ 0.00";

    const { error } = await supabase
      .from("proformas")
      .insert([
        {
          numero_proforma: numero,
          numero_correlativo: correlativo,
          cliente: cliente,
          ruc_dni: doc,
          lugar: lugar,
          total: total,
          items: JSON.parse(JSON.stringify(window.itemsProformaAdmin)),
          creado_el: new Date().toISOString()
        }
      ]);

    if (error) throw error;

    localStorage.setItem("inmutec_ultimo_correlativo", correlativo);

    window.desbloquearAccionesDespacho();
    await window.cargarHistorialProformas();

    alert(`¡Proforma Nº ${numero} guardada con éxito en la base de datos!\n\nSe han activado las opciones para Descargar PDF y enviar.`);
  } catch (err) {
    console.error("Error al guardar proforma en Supabase:", err);
    alert("Error al guardar en base de datos: " + err.message);
  } finally {
    if (btnGuardar) {
      btnGuardar.disabled = false;
      btnGuardar.textContent = "Guardar Proforma";
    }
  }
};

window.cargarHistorialProformas = async function() {
  const tbody = document.getElementById("historial_proformas_body");
  const badge = document.getElementById("historial_count_badge");
  if (!tbody) return;

  try {
    const { data: historial, error } = await supabase
      .from("proformas")
      .select("*")
      .order("creado_el", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Error al consultar historial:", error);
      return;
    }

    if (badge) badge.textContent = `${historial ? historial.length : 0} registrada(s)`;

    if (!historial || historial.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="py-4 text-center text-slate-500 italic">No hay proformas emitidas en la base de datos.</td></tr>`;
      return;
    }

    tbody.innerHTML = "";
    historial.forEach(item => {
      const numProf = String(item.numero_proforma || "").trim();
      const tr = document.createElement("tr");
      tr.className = "hover:bg-slate-800/50 transition";
      tr.innerHTML = `
        <td class="py-2.5 px-2 font-mono font-bold text-amber-400">${numProf}</td>
        <td class="py-2.5 px-2 text-slate-400 text-[10px]">${item.creado_el ? new Date(item.creado_el).toLocaleDateString() : '-'}</td>
        <td class="py-2.5 px-3 font-semibold text-white max-w-[200px] truncate">${item.cliente || '-'}</td>
        <td class="py-2.5 px-2 text-right font-mono font-bold text-cyan-300">${item.total || '-'}</td>
        <td class="py-2.5 px-3 text-center space-x-1.5 whitespace-nowrap">
          <button type="button" data-del-proforma="${numProf}" class="btn-borrar-proforma px-2 py-1 rounded bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition cursor-pointer" title="Eliminar de la base de datos">
            <i class="fa-solid fa-trash-can pointer-events-none"></i>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Error inesperado en cargarHistorialProformas:", err);
  }
};

window.eliminarProformaHistorial = async function(numeroProforma) {
  const numLimpio = String(numeroProforma || "").trim();
  if (!numLimpio) {
    alert("Error: No se recibió ningún número de proforma para borrar.");
    return;
  }

  const confirmar = confirm(`¿Estás seguro de que deseas eliminar la proforma Nº ${numLimpio} de la base de datos?`);
  if (!confirmar) return;

  try {
    let { data, error } = await supabase
      .from("proformas")
      .delete()
      .eq("numero_proforma", numLimpio)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      const numInt = parseInt(numLimpio, 10);
      if (!isNaN(numInt)) {
        const intento2 = await supabase
          .from("proformas")
          .delete()
          .eq("numero_correlativo", numInt)
          .select();
        
        if (!intento2.error && intento2.data && intento2.data.length > 0) {
          data = intento2.data;
        }
      }
    }

    if (!data || data.length === 0) {
      alert(`La base de datos respondió sin filas eliminadas para la proforma ${numLimpio}. Posiblemente ya no existe.`);
    } else {
      alert(`¡Proforma Nº ${numLimpio} eliminada con éxito de Supabase!`);
    }

    await window.cargarHistorialProformas();
    if (typeof window.obtenerSiguienteNumeroProforma === "function") {
      await window.obtenerSiguienteNumeroProforma();
    }
  } catch (err) {
    alert("Error devuelto por Supabase al borrar: " + (err.message || JSON.stringify(err)));
  }
};

window.aplicarPlantillaServicio = function(servicio) {
  document.querySelectorAll(".srv-admin-filter").forEach(b => {
    b.classList.remove("ring-2", "ring-[#00a8e8]", "bg-slate-700");
    if (b.dataset.filter === servicio) b.classList.add("ring-2", "ring-[#00a8e8]", "bg-slate-700");
  });

  const textoAsunto = `PROPUESTA TÉCNICA ECONÓMICA: SERVICIO DE ${servicio.toUpperCase()}`;
  const inputAsunto = document.getElementById("prof_edit_asunto");
  const printAsunto = document.getElementById("prof_print_asunto");
  if (inputAsunto) inputAsunto.value = textoAsunto;
  if (printAsunto) printAsunto.textContent = textoAsunto;

  if (servicio === "Fibra Óptica") {
    window.itemsProformaAdmin = [
      {
        descripcion: "Tendido de fibra óptica monomodo ADSS, sangrado de mufas troncales FOSC y pruebas reflectométricas OTDR por hilo.",
        cant: 1,
        unidad: "GLB",
        precio: 3500.00
      }
    ];
  } else if (servicio === "Torres & STP") {
    window.itemsProformaAdmin = [
      {
        descripcion: "Mantenimiento preventivo de torre ventada, cambio de retenidas y protocolo de resistividad STP NTP 2050 (< 5 Ohmios).",
        cant: 1,
        unidad: "SERV",
        precio: 2800.00
      }
    ];
  } else if (servicio === "Laboratorio RF" || servicio === "Laboratorio") {
    window.itemsProformaAdmin = [
      {
        descripcion: "Diagnóstico en banco RF, calibración de potencias, alineamiento de frecuencia y mantenimiento electrónico de transceptores.",
        cant: 1,
        unidad: "UND",
        precio: 1400.00
      }
    ];
  } else if (servicio === "Domótica & Smart" || servicio === "Domótica") {
    const checks = Array.from(document.querySelectorAll(".chk-domo-item:checked")).map(c => "• " + c.value);
    const detalleDomo = checks.length > 0 
      ? `Implementación integral de sistema smart residencial/corporativo:\n${checks.join("\n")}`
      : "Implementación integral de sistema smart residencial/corporativo (Iluminación, Accesos y Cámaras IP IA).";

    window.itemsProformaAdmin = [
      {
        descripcion: detalleDomo,
        cant: 1,
        unidad: "GLB",
        precio: 4200.00
      }
    ];
  } else {
    window.itemsProformaAdmin = [
      {
        descripcion: "Suministro e instalación de enlace de Internet Dedicado corporativo simétrico 1:1 con SLA 99.8% y monitoreo NOC 24/7.",
        cant: 1,
        unidad: "MES",
        precio: 1800.00
      }
    ];
  }

  window.renderizarItemsAdmin();
  window.actualizarDocumentoEnVivo();
  window.bloquearAccionesDespacho();
};

window.renderizarItemsAdmin = function() {
  const tbody = document.getElementById("tabla_items_body_admin");
  if (!tbody) return;
  tbody.innerHTML = "";

  window.itemsProformaAdmin.forEach((item, index) => {
    const total = (item.cant * item.precio).toFixed(2);
    const tr = document.createElement("tr");
    tr.className = "border-b border-slate-300";
    tr.innerHTML = `
      <td class="border border-slate-400 px-2 py-2 text-center font-bold text-slate-800">${String(index + 1).padStart(2, '0')}</td>
      <td class="border border-slate-400 px-3 py-1.5">
        <textarea class="w-full text-xs p-1 border border-transparent hover:border-slate-300 rounded focus:border-[#00a8e8] outline-none proforma-input-edit" rows="2" onchange="window.itemsProformaAdmin[${index}].descripcion = this.value; window.bloquearAccionesDespacho();">${item.descripcion}</textarea>
        <div class="hidden proforma-print-view text-xs leading-relaxed text-slate-800 font-medium whitespace-pre-line">${item.descripcion}</div>
      </td>
      <td class="border border-slate-400 px-2 py-1.5 text-center">
        <input type="number" min="1" value="${item.cant}" class="w-12 text-center border border-slate-300 rounded text-xs py-0.5 font-bold proforma-input-edit" oninput="window.itemsProformaAdmin[${index}].cant = parseFloat(this.value)||1; window.renderizarItemsAdmin(); window.bloquearAccionesDespacho();">
        <span class="hidden proforma-print-view font-bold text-xs">${item.cant}</span>
      </td>
      <td class="border border-slate-400 px-2 py-1.5 text-center font-semibold">
        <input type="text" value="${item.unidad}" class="w-12 text-center border border-slate-300 rounded text-xs py-0.5 proforma-input-edit" oninput="window.itemsProformaAdmin[${index}].unidad = this.value; window.bloquearAccionesDespacho();">
        <span class="hidden proforma-print-view text-xs font-semibold">${item.unidad}</span>
      </td>
      <td class="border border-slate-400 px-3 py-1.5 text-right font-mono">
        <input type="number" step="50" min="0" value="${item.precio.toFixed(2)}" class="w-20 text-right border border-slate-300 rounded text-xs py-0.5 proforma-input-edit" oninput="window.itemsProformaAdmin[${index}].precio = parseFloat(this.value)||0; window.renderizarItemsAdmin(); window.bloquearAccionesDespacho();">
        <span class="hidden proforma-print-view text-xs font-mono font-medium">${parseFloat(item.precio).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </td>
      <td class="border border-slate-400 px-3 py-1.5 text-right font-bold text-slate-900 font-mono">
        ${parseFloat(total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </td>
      <td class="border border-slate-400 px-1 py-1 text-center proforma-ui-tool">
        <button onclick="window.eliminarFilaItem(${index})" class="text-rose-500 hover:text-rose-700 text-xs px-1 font-black" title="Eliminar fila">&times;</button>
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
    window.bloquearAccionesDespacho();
  } else {
    alert("La proforma debe contener al menos un ítem cotizado.");
  }
};

window.agregarFilaItem = function() {
  window.itemsProformaAdmin.push({
    descripcion: "Trabajos o suministros complementarios para infraestructura técnica.",
    cant: 1,
    unidad: "UND",
    precio: 350.00
  });
  window.renderizarItemsAdmin();
  window.bloquearAccionesDespacho();
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

window.actualizarDocumentoEnVivo = function() {
  const num = document.getElementById("admin_prof_numero")?.value || "001072";
  const fec = document.getElementById("admin_prof_fecha")?.value || window.generarFechaHoraHuancayo();

  if (document.getElementById("prof_vista_numero")) document.getElementById("prof_vista_numero").textContent = num;
  if (document.getElementById("prof_vista_fecha")) document.getElementById("prof_vista_fecha").textContent = fec;
};

window.sincronizarConProformaAdmin = function() {
  const cli = document.getElementById("qRazon")?.value.trim();
  const doc = document.getElementById("qDoc")?.value.trim();
  const lug = document.getElementById("qLugar")?.value.trim();
  const checkedRadio = document.querySelector("input[name='docType']:checked");
  const tipoDoc = checkedRadio ? checkedRadio.value : "RUC";

  const editCli = document.getElementById("prof_edit_cliente");
  const editDoc = document.getElementById("prof_edit_doc");
  const editLug = document.getElementById("prof_edit_lugar");

  if (editCli && cli) editCli.value = cli;
  if (editDoc && doc) editDoc.value = `${tipoDoc}: ${doc}`;
  if (editLug && lug) editLug.value = lug;

  window.actualizarDocumentoEnVivo();
};

window.sincronizarCamposInversos = function(tipo) {
  window.bloquearAccionesDespacho();
  if (tipo === 'cliente') {
    const val = document.getElementById("prof_edit_cliente")?.value;
    const inputRazon = document.getElementById("qRazon");
    if (inputRazon) inputRazon.value = val;
  } else if (tipo === 'doc') {
    const val = document.getElementById("prof_edit_doc")?.value.replace(/\D/g, "");
    const inputDoc = document.getElementById("qDoc");
    if (inputDoc && val) inputDoc.value = val;
  } else if (tipo === 'lugar') {
    const val = document.getElementById("prof_edit_lugar")?.value;
    const inputLug = document.getElementById("qLugar");
    if (inputLug) inputLug.value = val;
  }
};

window.descargarProformaPDF = function() {
  if (!window.proformaActualGuardada) {
    alert("Debes presionar 'Guardar Proforma' antes de poder descargar el PDF oficial.");
    return null;
  }

  const element = document.getElementById("documento_proforma_imprimible");
  if (!element || typeof html2pdf === "undefined") {
    alert("Cargando motor de PDF. Intente nuevamente en 2 segundos.");
    return null;
  }

  const valCliente = document.getElementById("prof_edit_cliente")?.value || "CLIENTE REGISTRADO";
  const valDoc = document.getElementById("prof_edit_doc")?.value || "-";
  const valLugar = document.getElementById("prof_edit_lugar")?.value || "Huancayo";
  const valAsunto = document.getElementById("prof_edit_asunto")?.value || "PROPUESTA TÉCNICA ECONÓMICA";
  const valIntro = document.getElementById("prof_edit_intro")?.value || "";
  const valPago = document.getElementById("prof_edit_pago")?.value || "";
  const valValidez = document.getElementById("prof_edit_validez")?.value || "";
  const valDcto = document.getElementById("input_descuento_admin")?.value || "0.00";

  const printCli = document.getElementById("prof_print_cliente");
  const printDoc = document.getElementById("prof_print_doc");
  const printLug = document.getElementById("prof_print_lugar");
  const printAsu = document.getElementById("prof_print_asunto");
  const printIntro = document.getElementById("prof_print_intro");
  const printPago = document.getElementById("prof_print_pago");
  const printVal = document.getElementById("prof_print_validez");
  const printDcto = document.getElementById("print_descuento_admin");

  if (printCli) printCli.textContent = valCliente;
  if (printDoc) printDoc.textContent = valDoc;
  if (printLug) printLug.textContent = valLugar;
  if (printAsu) printAsu.textContent = valAsunto;
  if (printIntro) printIntro.textContent = valIntro;
  if (printPago) printPago.textContent = valPago;
  if (printVal) printVal.textContent = valValidez;
  if (printDcto) printDcto.textContent = `S/ ${parseFloat(valDcto).toFixed(2)}`;

  document.querySelectorAll(".proforma-ui-tool").forEach(el => el.style.setProperty("display", "none", "important"));
  document.querySelectorAll(".proforma-input-edit").forEach(el => el.style.setProperty("display", "none", "important"));

  if (printCli) printCli.classList.remove("hidden");
  if (printDoc) printDoc.classList.remove("hidden");
  if (printLug) printLug.classList.remove("hidden");
  if (printAsu) printAsu.classList.remove("hidden");
  if (printIntro) printIntro.classList.remove("hidden");
  if (printPago) printPago.classList.remove("hidden");
  if (printVal) printVal.classList.remove("hidden");
  if (printDcto) printDcto.classList.remove("hidden");
  document.querySelectorAll(".proforma-print-view").forEach(el => el.classList.remove("hidden"));

  const clienteLimpio = valCliente.trim().replace(/[^a-zA-Z0-9]/g, '_');
  const num = document.getElementById("admin_prof_numero")?.value || "001072";
  const nombreArchivo = `PROFORMA_${num}_INMUTEC_${clienteLimpio}.pdf`;

  const opt = {
    margin: [5, 5, 5, 5],
    filename: nombreArchivo,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      scrollY: 0,
      scrollX: 0
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait'
    }
  };

  html2pdf().set(opt).from(element).save().then(() => {
    document.querySelectorAll(".proforma-ui-tool").forEach(el => el.style.removeProperty("display"));
    document.querySelectorAll(".proforma-input-edit").forEach(el => el.style.removeProperty("display"));

    if (printCli) printCli.classList.add("hidden");
    if (printDoc) printDoc.classList.add("hidden");
    if (printLug) printLug.classList.add("hidden");
    if (printAsu) printAsu.classList.add("hidden");
    if (printIntro) printIntro.classList.add("hidden");
    if (printPago) printPago.classList.add("hidden");
    if (printVal) printVal.classList.add("hidden");
    if (printDcto) printDcto.classList.add("hidden");
    document.querySelectorAll(".proforma-print-view").forEach(el => el.classList.add("hidden"));
  });

  return nombreArchivo;
};

window.enviarProformaWhatsApp = function() {
  if (!window.proformaActualGuardada) {
    alert("Debes presionar 'Guardar Proforma' antes de despachar por WhatsApp.");
    return;
  }

  const inputPhone = document.getElementById("qPhone")?.value.trim() || "";
  let destinatario = prompt("Ingresa el número celular de WhatsApp del cliente (9 dígitos):", inputPhone);

  if (!destinatario) return;

  destinatario = destinatario.replace(/\D/g, "");
  if (destinatario.startsWith("51") && destinatario.length === 11) {
    destinatario = destinatario.substring(2);
  }

  if (destinatario.length !== 9 || !destinatario.startsWith("9")) {
    alert("Número celular no válido. Ingrese un número de 9 dígitos que empiece con 9.");
    return;
  }

  window.descargarProformaPDF();

  const cli = document.getElementById("prof_edit_cliente")?.value.trim() || "Cliente";
  const mensaje = `Hola estimado ${cli}, le adjunto su proforma de cotización, estaré al tanto de su respuesta por este medio, gracias.`;

  const urlWhatsapp = `https://api.whatsapp.com/send?phone=51${destinatario}&text=${encodeURIComponent(mensaje)}`;

  setTimeout(() => {
    const win = window.open(urlWhatsapp, "_blank");
    if (!win || win.closed || typeof win.closed === "undefined") {
      window.location.href = urlWhatsapp;
    }
  }, 600);
};

window.enviarProformaCorreo = function() {
  if (!window.proformaActualGuardada) {
    alert("Debes presionar 'Guardar Proforma' antes de despachar por Correo.");
    return;
  }

  const inputEmail = document.getElementById("qEmail")?.value.trim() || "";
  let emailDestino = prompt("Ingresa el correo electrónico del cliente para el envío:", inputEmail);

  if (!emailDestino) return;
  emailDestino = emailDestino.trim();

  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!regex.test(emailDestino)) {
    alert("Formato de correo no válido.");
    return;
  }

  window.descargarProformaPDF();

  const cli = document.getElementById("prof_edit_cliente")?.value.trim() || "Cliente";
  const num = document.getElementById("admin_prof_numero")?.value || "001072";

  const subject = `Proforma de Cotización Nº ${num} - INMUTEC E.I.R.L.`;
  const body = `Hola estimado ${cli}, le adjunto su proforma de cotización, estaré al tanto de su respuesta por este medio, gracias.`;

  setTimeout(() => {
    window.location.href = `mailto:${emailDestino}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, 600);
};

// =============================================================================
// MODULO 6: CHATBOT ASISTENTE TÉCNICO PRO (MOTOR DE RESPUESTAS COMPLETAS)
// =============================================================================
const BOT_KNOWLEDGE = [
  {
    keys: ["hola", "buen dia", "buenas", "saludos", "que tal", "inicio", "hey", "aló", "alo"],
    reply: `¡Hola! Bienvenido a <strong>${CONFIG_INMUTEC.empresaNombre}</strong>. Soy tu asistente técnico virtual. Puedo informarte sobre nuestros servicios, precios/cotizaciones, certificaciones NTP 2050, sedes o proyectos ejecutados. ¿Qué deseas consultar?`
  },
  {
    keys: ["servicio", "ofrece", "ofrecen", "cobertura", "que hacen", "especialidad", "catalogo", "trabajo", "realizan", "dedican", "brindan", "soluciones", "venden"],
    reply: "En <strong>INMUTEC E.I.R.L.</strong> brindamos 5 divisiones especializadas:<br>1. <strong>Internet Dedicado:</strong> Enlaces simétricos 1:1 con IP fija y SLA 99.8%.<br>2. <strong>Fibra Óptica:</strong> Tendido aéreo/canalizado, fusión y certificación OTDR.<br>3. <strong>Torres & STP:</strong> Montaje de estructuras y pozos a tierra bajo norma NTP 2050.<br>4. <strong>Laboratorio RF:</strong> Reparación y calibración de radios Motorola/Kenwood.<br>5. <strong>Domótica & Smart:</strong> Casas/oficinas inteligentes, cerraduras biométricas y cámaras IA."
  },
  {
    keys: ["internet", "dedicado", "simetrico", "ancho de banda", "megas", "mbps", "enlace", "noc", "ip fija"],
    reply: "Nuestro servicio de <strong>Internet Dedicado Empresarial</strong> garantiza velocidad simétrica 1:1 (misma subida y bajada), IPs públicas fijas, monitoreo NOC 24/7 y respaldo de redundancia con disponibilidad SLA del 99.8%."
  },
  {
    keys: ["fibra", "optica", "otdr", "mufa", "fusion", "tendido", "adss", "fujikura", "cableado"],
    reply: "Ejecutamos ingeniería de planta externa e interna en <strong>Fibra Óptica</strong>: tendido ADSS/canalizado, sangrado de mufas troncales, empalmes por fusión con equipos Fujikura (< 0.02 dB) y entrega de protocolos reflectométricos OTDR."
  },
  {
    keys: ["norma", "stp", "tierra", "pozo", "ntp 2050", "telurometro", "pararrayo", "resistencia", "torre", "mastil", "estructura"],
    reply: "Diseñamos, construimos y certificamos <strong>Sistemas de Protección a Tierra (STP)</strong> y pararrayos bajo la Norma Técnica Peruana <strong>NTP 2050</strong>. Entregamos protocolo firmado con telurómetro calibrado garantizando resistencia menor a 5 Ohmios, además de izaje y mantenimiento de torres."
  },
  {
    keys: ["domotica", "smart", "automatizacion", "casa inteligente", "edificio", "cerradura", "camara", "iot", "seguridad", "cctv"],
    reply: "En <strong>Domótica e Inmótica</strong> implementamos iluminación inteligente dimerizable, cerraduras biométricas/digitales, cámaras con analítica IA, sensores perimétricos y automatización de tableros eléctricos con control desde el celular."
  },
  {
    keys: ["laboratorio", "radio", "calibrar", "motorola", "kenwood", "falla", "reparacion", "antena", "transceptor", "repetidora"],
    reply: `En nuestro <strong>Laboratorio Técnico RF</strong> de Huancayo (${CONFIG_INMUTEC.direccionHuancayo}) realizamos diagnóstico en banco de pruebas, ajuste de frecuencia/potencia y reparación con repuestos originales de radios Motorola, Kenwood y repetidoras.`
  },
  {
    keys: ["precio", "costo", "tarifa", "cotiz", "presupuesto", "cuanto cuesta", "proforma", "valor", "cobran"],
    reply: "Nuestras cotizaciones se calculan a medida según el alcance técnico (metraje de fibra, velocidad del enlace, altura de torre o cantidad de equipos). Completa el formulario de la izquierda y pulsa <strong>ENVIAR COTIZACIÓN A WHATSAPP</strong> para enviarte tu proforma formal hoy mismo."
  },
  {
    keys: ["pago", "cuenta", "banco", "bbva", "nacion", "factura", "igv", "ruc", "detraccion"],
    reply: `Emitimos Factura Electrónica (RUC: <strong>${CONFIG_INMUTEC.ruc}</strong>). Trabajamos con cuentas corrientes autorizadas en <strong>BBVA</strong> y <strong>Banco de la Nación</strong>, con modalidad estándar 50% adelanto y 50% contra entrega y conformidad técnica.`
  },
  {
    keys: ["cliente", "experiencia", "obra", "proyecto", "wow", "dorsal", "tgp", "huancavelica", "tambo", "garantia", "empresa", "quienes son"],
    reply: "Somos una empresa de ingeniería con amplia trayectoria ejecutando proyectos críticos para <strong>WOW Tel</strong> (redes troncales), <strong>Red Dorsal Nacional</strong> (Telrad), <strong>Transportadora de Gas del Perú (TGP)</strong>, <strong>DRTC Huancavelica</strong> y municipalidades."
  },
  {
    keys: ["direccion", "ubicacion", "donde estan", "oficina", "sede", "huancayo", "huancavelica", "horario", "atienden"],
    reply: `Atendemos de Lunes a Sábado de 8:00 AM a 6:30 PM (y soporte NOC 24/7) en nuestras sedes:<br>• <strong>Huancayo:</strong> ${CONFIG_INMUTEC.direccionHuancayo}<br>• <strong>Huancavelica:</strong> ${CONFIG_INMUTEC.direccionHuancavelica}`
  },
  {
    keys: ["ingeniero", "gerente", "marmanillo", "gustavo", "telefono", "whatsapp", "contacto", "correo", "email", "numero", "llamar"],
    reply: `Puedes comunicarte directamente con el Gerente General, <strong>${CONFIG_INMUTEC.gerenteGeneral}</strong>:<br>• <strong>WhatsApp / Móvil:</strong> ${CONFIG_INMUTEC.centralMovil}<br>• <strong>Fijo:</strong> ${CONFIG_INMUTEC.telefonoFijo}<br>• <strong>Correo oficial:</strong> ${CONFIG_INMUTEC.correoPrincipal}`
  }
];

function initChatbot() {
  const chatMessages = document.getElementById("chatMessages");
  if (!chatMessages) return;

  chatMessages.innerHTML = `
    <div class="flex items-start space-x-2">
      <div class="w-7 h-7 rounded-full bg-[#002b49] text-[#00a8e8] flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-sm">
        <i class="fa-solid fa-robot"></i>
      </div>
      <div class="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm text-slate-700 max-w-[88%] leading-relaxed">
        Hola, soy el asistente técnico de <strong>INMUTEC E.I.R.L.</strong> ¿En qué puedo orientarte hoy? Puedes escribir cualquier consulta sobre servicios, precios, normas o sedes, o elegir una opción rápida abajo.
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
          <a href="https://wa.me/${CONFIG_INMUTEC.whatsappGeneral}?text=Hola%20Ing.%20Marmanillo,%20solicito%20asistencia%20t%C3%A9cnica%20especializada" target="_blank" class="inline-flex items-center space-x-1.5 bg-[#10b981] hover:bg-[#059669] text-white px-3 py-1.5 rounded-xl font-bold text-[10px] transition shadow">
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
  let bestMatch = null;
  let maxHits = 0;

  for (const item of BOT_KNOWLEDGE) {
    const hits = item.keys.filter(k => clean.includes(k)).length;
    if (hits > maxHits) {
      maxHits = hits;
      bestMatch = item.reply;
    }
  }

  setTimeout(() => {
    if (bestMatch) {
      appendBotMessage(bestMatch, "bot");
    } else {
      appendBotMessage(
        "Para brindarte una propuesta o peritaje técnico exacto sobre este requerimiento, uno de nuestros ingenieros puede atenderte directamente por WhatsApp.",
        "bot",
        true
      );
    }
  }, 200);
}

// =============================================================================
// MODULO 7: INICIALIZACIÓN GLOBAL DE EVENTOS (UNIFICADO)
// =============================================================================
async function inicializarSistemaCompleto() {
  window.addEventListener("hashchange", () => {
    const mod = window.location.hash.replace("#", "") || "inicio";
    loadModule(mod);
  });

  document.querySelectorAll(".nav-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      const target = tab.getAttribute("data-module");
      if (target) window.location.hash = target;
    });
  });

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      isAdminLoggedIn = true;
      document.getElementById("adminTopBar")?.classList.remove("hidden");
      const txtLogin = document.getElementById("txtLoginBtn");
      if (txtLogin) txtLogin.textContent = "Admin";
    }
  } catch (err) {
    console.warn("Verificación de sesión omitida:", err);
  }

  const initialHash = window.location.hash.replace("#", "") || "inicio";
  await loadModule(initialHash);

  const btnOpenLogin = document.getElementById("btnOpenLoginModal");
  const loginModal = document.getElementById("loginModal");
  const btnCloseLogin = document.getElementById("btnCloseLoginModal");
  const adminLoginForm = document.getElementById("adminLoginForm");

  if (btnOpenLogin && loginModal) {
    btnOpenLogin.addEventListener("click", () => {
      if (isAdminLoggedIn) {
        window.location.hash = "cotizacion";
      } else {
        loginModal.classList.remove("hidden");
      }
    });
  }

  if (btnCloseLogin && loginModal) {
    btnCloseLogin.addEventListener("click", () => loginModal.classList.add("hidden"));
  }

  if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPass").value.trim();
      const errSpan = document.getElementById("loginErrorMsg");

      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        isAdminLoggedIn = true;
        loginModal.classList.add("hidden");
        document.getElementById("adminTopBar")?.classList.remove("hidden");
        const txtLogin = document.getElementById("txtLoginBtn");
        if (txtLogin) txtLogin.textContent = "Admin";

        enableAdminEditMode();
        if (window.location.hash === "#cotizacion") {
          await verificarYMontarAdminProforma();
        }
      } catch (err) {
        if (errSpan) {
          errSpan.textContent = "Credenciales incorrectas de Supabase.";
          errSpan.classList.remove("hidden");
        }
      }
    });
  }

  const btnCerrarSesion = document.getElementById("btnAdminCerrarSesion");
  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener("click", async () => {
      await supabase.auth.signOut();
      isAdminLoggedIn = false;
      document.getElementById("adminTopBar")?.classList.add("hidden");
      const txtLogin = document.getElementById("txtLoginBtn");
      if (txtLogin) txtLogin.textContent = "Login";
      disableAdminEditMode();
      await verificarYMontarAdminProforma();
    });
  }

  // ===========================================================================
  // CONTROLADOR ÚNICO DE EVENTOS CLICK (SIN DUPLICADOS)
  // ===========================================================================
  document.addEventListener("click", (e) => {
    // 1. Carrusel
    const prevBtn = e.target.closest("#btnCarouselPrev, #inmutecBtnPrev, .carousel-prev, [data-carousel='prev']");
    if (prevBtn) {
      e.preventDefault();
      window.inmutecPrevSlide?.();
      return;
    }

    const nextBtn = e.target.closest("#btnCarouselNext, #inmutecBtnNext, .carousel-next, [data-carousel='next']");
    if (nextBtn) {
      e.preventDefault();
      window.inmutecNextSlide?.();
      return;
    }

    // 2. Filtro de Portafolio
    const portBtn = e.target.closest("#portfolioFilterContainer button, .port-tab-btn, [data-filter]");
    if (portBtn && portBtn.closest("#moduleContainer")) {
      e.preventDefault();
      e.stopPropagation();
      const filtro = portBtn.getAttribute("data-filter") || "all";
      window.filtrarPortafolio?.(filtro, portBtn);
      return;
    }

    // 3. Filtro de Servicios
    const svcTabBtn = e.target.closest("#servicesFilterGroup button, .svc-tab-btn, [data-category]");
    if (svcTabBtn && svcTabBtn.closest("#moduleContainer")) {
      e.preventDefault();
      e.stopPropagation();
      const cat = svcTabBtn.getAttribute("data-category") || "all";
      window.filtrarServicios?.(cat, svcTabBtn);
      return;
    }

    // 4. Selector de Servicios en Cotización (5 tarjetas superiores)
    if (window.location.hash.includes("cotizacion")) {
      const svcCardBtn = e.target.closest("button, .cursor-pointer");
      if (
        svcCardBtn &&
        !svcCardBtn.closest("#dynamicServiceSection") &&
        !svcCardBtn.closest("#proformaWorkspaceContainer") &&
        !svcCardBtn.closest("#chatForm") &&
        svcCardBtn.closest("#moduleContainer")
      ) {
        const txt = (svcCardBtn.textContent || "").trim();
        let svcName = null;

        if (txt.includes("Internet Dedicado")) svcName = "Internet Dedicado";
        else if (txt.includes("Fibra Óptica")) svcName = "Fibra Óptica";
        else if (txt.includes("Torres & STP")) svcName = "Torres & STP";
        else if (txt.includes("Laboratorio RF")) svcName = "Laboratorio";
        else if (txt.includes("Domótica & Smart")) svcName = "Domótica";

        if (svcName) {
          e.preventDefault();
          e.stopPropagation();

          window.renderCotizacionCampos?.(svcName);
          window.aplicarPlantillaServicio?.(svcName);
          return;
        }
      }

      // 4B. Botón verde "ENVIAR COTIZACIÓN A WHATSAPP" del formulario público
      const btnCotPublica = e.target.closest("#btnEnviarCotizacionPublica, button[type='submit']");
      if (
        btnCotPublica &&
        btnCotPublica.closest("#moduleContainer") &&
        !btnCotPublica.closest("#proformaWorkspaceContainer") &&
        !btnCotPublica.closest("#chatForm")
      ) {
        const txtBtn = (btnCotPublica.textContent || "").toUpperCase();
        if (txtBtn.includes("ENVIAR COTIZACIÓN") || txtBtn.includes("COTIZACIÓN A WHATSAPP")) {
          e.preventDefault();
          e.stopPropagation();
          window.enviarCotizacionPublicaWhatsApp?.();
          return;
        }
      }
    }

    // 5. Botones rápidos del Chatbot
    if (e.target.classList.contains("quick-btn")) {
      const q = e.target.textContent.trim();
      appendBotMessage(q, "user");
      processBotQuery(q);
      return;
    }
    if (e.target.id === "btnResetChat" || e.target.closest("#btnResetChat")) {
      initChatbot();
      return;
    }

    // 6. Eliminar proforma del historial
    const btnDel = e.target.closest(".btn-borrar-proforma, [data-del-proforma]");
    if (btnDel) {
      e.preventDefault();
      e.stopPropagation();
      const numProf = btnDel.getAttribute("data-del-proforma");
      window.eliminarProformaHistorial?.(numProf);
      return;
    }

    // 7. Clics de Edición CMS (Solo Administrador)
    if (isAdminLoggedIn) {
      const editableTarget = e.target.closest("[data-cms-key]");
      if (!editableTarget) return;

      e.preventDefault();
      currentEditingElement = editableTarget;
      currentEditingKey = editableTarget.getAttribute("data-cms-key");
      isEditingImage = editableTarget.tagName === "IMG";

      const modal = document.getElementById("cmsEditorModal");
      const title = document.getElementById("cmsModalFieldTitle");
      const textBlock = document.getElementById("cmsTextEditorBlock");
      const imageBlock = document.getElementById("cmsImageEditorBlock");
      const textInput = document.getElementById("cmsTextInput");
      const imgPreview = document.getElementById("cmsImagePreview");
      const imgPlaceholder = document.getElementById("cmsImagePlaceholder");

      if (modal && title) {
        title.textContent = `Editando: ${currentEditingKey}`;
        if (isEditingImage) {
          textBlock.classList.add("hidden");
          imageBlock.classList.remove("hidden");
          imgPreview.src = editableTarget.src;
          imgPreview.classList.remove("hidden");
          imgPlaceholder.classList.add("hidden");
        } else {
          imageBlock.classList.add("hidden");
          textBlock.classList.remove("hidden");
          textInput.value = editableTarget.innerHTML.trim();
        }
        modal.classList.remove("hidden");
      }
    }
  });

  document.addEventListener("submit", (e) => {
    if (e.target && e.target.id === "chatForm") {
      e.preventDefault();
      const input = document.getElementById("chatInput");
      const msg = input.value.trim();
      if (!msg) return;
      appendBotMessage(msg, "user");
      input.value = "";
      processBotQuery(msg);
      return;
    }

    if (
      e.target &&
      e.target.closest("#moduleContainer") &&
      window.location.hash.includes("cotizacion") &&
      !e.target.closest("#proformaWorkspaceContainer")
    ) {
      e.preventDefault();
      window.enviarCotizacionPublicaWhatsApp?.();
    }
  });

  const btnSaveCms = document.getElementById("btnSaveCms");
  const btnCancelCms = document.getElementById("btnCancelCms");
  const btnCloseCmsModal = document.getElementById("btnCloseCmsModal");
  const cmsModal = document.getElementById("cmsEditorModal");

  const closeCmsModal = () => {
    if (cmsModal) cmsModal.classList.add("hidden");
    currentEditingElement = null;
    currentEditingKey = null;
  };

  if (btnCancelCms) btnCancelCms.onclick = closeCmsModal;
  if (btnCloseCmsModal) btnCloseCmsModal.onclick = closeCmsModal;

  if (btnSaveCms) {
    btnSaveCms.onclick = async () => {
      if (!currentEditingElement || !currentEditingKey) return;
      btnSaveCms.disabled = true;
      btnSaveCms.textContent = "Guardando...";

      try {
        let nuevoValor = "";
        if (isEditingImage) {
          const fileInput = document.getElementById("cmsFileInput");
          if (fileInput.files.length > 0) {
            nuevoValor = await uploadImageToSupabase(fileInput.files[0]);
            currentEditingElement.src = nuevoValor;
          } else {
            nuevoValor = currentEditingElement.src;
          }
        } else {
          nuevoValor = document.getElementById("cmsTextInput").value;
          currentEditingElement.innerHTML = nuevoValor;
        }

        await supabase.from("cms_content").upsert({
          clave: currentEditingKey,
          valor: nuevoValor,
          actualizado_el: new Date().toISOString()
        });

        closeCmsModal();
      } catch (err) {
        alert("Error al guardar en base de datos: " + err.message);
      } finally {
        btnSaveCms.disabled = false;
        btnSaveCms.textContent = "Guardar Cambios en Base de Datos";
      }
    };
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", inicializarSistemaCompleto);
} else {
  inicializarSistemaCompleto();
}
import { supabase } from "../../src/supabaseClient.js";

const WHATSAPP_PHONE = "51954928201";

// Proforma-Date fir den Administrateur-Modus
window.itemsProformaAdmin = [
  {
    descripcion: "Trabajos de fusión y acondicionamiento en varias MUFAS 122 FUSIONES\nInstalación y acondicionamiento de ODF en site 28 FUSIONES\nMEDCIONES CON OTDR EXFO 28 HILOS",
    cant: 1,
    unidad: "UND",
    precio: 3500.00
  }
];

export function init() {
  const quoteForm = document.getElementById("quoteForm");
  const inputRazon = document.getElementById("qRazon");
  const inputDoc = document.getElementById("qDoc");
  const inputEmail = document.getElementById("qEmail");
  const inputPhone = document.getElementById("qPhone");
  const dynamicContainer = document.getElementById("dynamicServiceSection");
  const hiddenSvcInput = document.getElementById("selectedServiceInput");
  const svcButtons = document.querySelectorAll(".svc-selector-btn");

  const errRazon = document.getElementById("errRazon");
  const errDoc = document.getElementById("errDoc");
  const errEmail = document.getElementById("errEmail");
  const errPhone = document.getElementById("errPhone");

  // Kontrolléieren ob den Administrateur ugemellt ass
  verificarYMontarAdminProforma();

  if (!quoteForm || !inputRazon || !inputDoc || !inputEmail || !inputPhone) {
    return;
  }

  // 1. DYNAMESCH FELDER FIR D'SERVICES RENDERING
  function renderServiceFields(serviceName) {
    if (!dynamicContainer) return;

    if (serviceName === "Laboratorio") {
      dynamicContainer.innerHTML = `
        <div class="border-b border-slate-200 pb-2">
          <span class="text-[10px] font-black uppercase text-[#ef4444] tracking-wider block">Recepción en Laboratorio Técnico RF</span>
          <p class="text-[11px] text-slate-500">Ingresa las especificaciones del equipo para banco de pruebas y calibración.</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="font-bold text-slate-700 block mb-1">Tipo de Equipo y Marca *</label>
            <input id="qLabEquipo" type="text" placeholder="Ej. Radiotransmisor Motorola / Kenwood / Repetidora" class="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00a8e8] bg-white">
          </div>
          <div>
            <label class="font-bold text-slate-700 block mb-1">Cantidad de Equipos *</label>
            <input id="qLabCantidad" type="number" min="1" value="1" class="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00a8e8] bg-white font-mono">
          </div>
        </div>
        <div>
          <label class="font-bold text-slate-700 block mb-1">Detalle de la Falla o Trabajo Requerido *</label>
          <textarea id="qLabFalla" rows="3" placeholder="Indicar si no enciende, pérdida de potencia, calibración de frecuencia o mantenimiento general..." class="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00a8e8] bg-white"></textarea>
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
          <textarea id="qDetalles" rows="2" placeholder="Especificar cantidad de ambientes, control por voz (Alexa/Google) o integración con tableros..." class="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00a8e8] bg-white text-xs" oninput="window.sincronizarConProformaAdmin()"></textarea>
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
          <textarea id="qDetalles" rows="3" placeholder="Indicar metraje estimado de fibra, ancho de banda simétrico, altura de torre o sistema de puesta a tierra requerido..." class="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00a8e8] bg-white text-xs" oninput="window.sincronizarConProformaAdmin()"></textarea>
        </div>
      `;
    }
  }

  function setService(name) {
    if (hiddenSvcInput) hiddenSvcInput.value = name;
    svcButtons.forEach(btn => {
      if (btn.getAttribute("data-svc") === name) {
        btn.classList.add("active-svc");
      } else {
        btn.classList.remove("active-svc");
      }
    });
    renderServiceFields(name);
    window.sincronizarConProformaAdmin();
  }

  svcButtons.forEach(btn => {
    btn.onclick = () => setService(btn.getAttribute("data-svc"));
  });

  const prefill = sessionStorage.getItem("inmutec_prefill_service");
  if (prefill) {
    setService(prefill);
    sessionStorage.removeItem("inmutec_prefill_service");
  } else {
    setService("Internet Dedicado");
  }

  // 2. VALIDATIOUNEN
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

  function validateRazon() {
    const val = inputRazon.value.trim();
    if (!val) {
      showError(inputRazon, errRazon, "Este campo es obligatorio.");
      return false;
    }
    if (val.length < 3) {
      showError(inputRazon, errRazon, "Debe ingresar al menos 3 caracteres.");
      return false;
    }
    clearError(inputRazon, errRazon);
    window.sincronizarConProformaAdmin();
    return true;
  }

  function getDocType() {
    const checked = document.querySelector("input[name='docType']:checked");
    return checked ? checked.value : "RUC";
  }

  function validateDoc() {
    const type = getDocType();
    let val = inputDoc.value.replace(/\D/g, "");
    inputDoc.value = val;

    if (!val) {
      showError(inputDoc, errDoc, `El número de ${type} es obligatorio.`);
      return false;
    }
    if (type === "DNI" && val.length !== 8) {
      showError(inputDoc, errDoc, `El DNI debe tener 8 dígitos (ingresó ${val.length}).`);
      return false;
    }
    if (type === "RUC" && val.length !== 11) {
      showError(inputDoc, errDoc, `El RUC debe tener 11 dígitos (ingresó ${val.length}).`);
      return false;
    }
    clearError(inputDoc, errDoc);
    window.sincronizarConProformaAdmin();
    return true;
  }

  document.querySelectorAll("input[name='docType']").forEach(radio => {
    radio.addEventListener("change", () => {
      const type = getDocType();
      if (type === "DNI") {
        inputDoc.maxLength = 8;
        inputDoc.placeholder = "Ingrese los 8 dígitos de su DNI";
      } else {
        inputDoc.maxLength = 11;
        inputDoc.placeholder = "Ingrese los 11 dígitos de su RUC";
      }
      validateDoc();
    });
  });

  function validateEmail() {
    const val = inputEmail.value.trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!val || !emailRegex.test(val)) {
      showError(inputEmail, errEmail, "Formato de correo inválido.");
      return false;
    }
    clearError(inputEmail, errEmail);
    return true;
  }

  function validatePhone() {
    let val = inputPhone.value.replace(/\D/g, "");
    inputPhone.value = val;
    if (val.length !== 9 || !val.startsWith("9")) {
      showError(inputPhone, errPhone, "Debe ingresar un celular válido de 9 dígitos que inicie con 9.");
      return false;
    }
    clearError(inputPhone, errPhone);
    return true;
  }

  inputRazon.addEventListener("input", validateRazon);
  inputDoc.addEventListener("input", validateDoc);
  inputEmail.addEventListener("input", validateEmail);
  inputPhone.addEventListener("input", validatePhone);

  // 3. WHATSAPP-VERSAND VUM CLIENT
  quoteForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateRazon() || !validateDoc() || !validateEmail() || !validatePhone()) return;

    const razon = inputRazon.value.trim();
    const type = getDocType();
    const doc = inputDoc.value.trim();
    const email = inputEmail.value.trim();
    const phone = inputPhone.value.trim();
    const svc = hiddenSvcInput.value;

    let detallesExtra = "";
    if (svc === "Laboratorio") {
      const eq = document.getElementById("qLabEquipo")?.value.trim() || "No indicado";
      const cant = document.getElementById("qLabCantidad")?.value.trim() || "1";
      const falla = document.getElementById("qLabFalla")?.value.trim() || "Revisión general";
      detallesExtra = `• Equipo/Marca: ${eq}\n• Cantidad: ${cant}\n• Falla: ${falla}`;
    } else if (svc === "Domótica") {
      const tipo = document.getElementById("qDomTipo")?.value || "Residencial";
      const lugar = document.getElementById("qLugar")?.value.trim() || "Huancayo";
      const checks = Array.from(document.querySelectorAll(".chk-domo-item:checked")).map(c => c.value).join(", ");
      const extra = document.getElementById("qDetalles")?.value.trim() || "Automatización completa";
      detallesExtra = `• Tipo: ${tipo}\n• Lugar: ${lugar}\n• Módulos IoT: ${checks}\n• Requerimiento: ${extra}`;
    } else {
      const sede = document.getElementById("qSede")?.value || "Huancayo";
      const lugar = document.getElementById("qLugar")?.value.trim() || "No indicado";
      const desc = document.getElementById("qDetalles")?.value.trim() || "General";
      detallesExtra = `• Sede: ${sede}\n• Lugar: ${lugar}\n• Requerimiento: ${desc}`;
    }

    // Späicheren an der Supabase-Datebank wann aktiv
    if (supabase) {
      try {
        await supabase.from("cotizaciones").insert([{
          cliente: razon,
          documento: `${type}: ${doc}`,
          email: email,
          telefono: phone,
          servicio: svc,
          detalles: detallesExtra,
          created_at: new Date().toISOString()
        }]);
      } catch (err) {
        console.warn("Notice: Non-blocking Supabase insert error:", err);
      }
    }

    const msg = `*SOLICITUD DE COTIZACIÓN TÉCNICA - INMUTEC E.I.R.L.*\n\n` +
      `*Cliente:* ${razon}\n*${type}:* ${doc}\n*Correo:* ${email}\n*Celular:* +51 ${phone}\n*Servicio:* ${svc}\n\n` +
      `*ESPECIFICACIONES:*\n${detallesExtra}\n\n_Enviado desde www.inmutec.com.pe_`;

    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`, "_blank");
  });

  // 4. CHATBOT ASISTENT
  const chatMessages = document.getElementById("chatMessages");
  const chatForm = document.getElementById("chatForm");
  const chatInput = document.getElementById("chatInput");
  const btnReset = document.getElementById("btnResetChat");
  const quickBtns = document.querySelectorAll(".quick-btn");

  const KNOWLEDGE = [
    { keys: ["hola", "buen dia", "buenas", "saludos"], reply: "Hola, te doy la bienvenida a INMUTEC E.I.R.L. Soy tu asistente virtual. ¿En qué especialidad técnica te podemos orientar hoy?" },
    { keys: ["servicios", "cobertura", "especialidades"], reply: "INMUTEC es especialista en: 1. Internet Dedicado 1:1, 2. Redes de Fibra Óptica, 3. Torres & Puesta a Tierra STP (NTP 2050), 4. Laboratorio RF y 5. Nueva división de Domótica & Smart IoT. Atendemos a nivel nacional." },
    { keys: ["norma", "stp", "tierra", "ntp 2050"], reply: "Diseñamos e instalamos Pozos a Tierra bajo la Norma NTP 2050 con valor certificado menor a 5 Ohmios con telurómetro calibrado." },
    { keys: ["domotica", "smart", "automatizacion", "iot"], reply: "Nuestra nueva división de Domótica e Inmótica implementa control inteligente de iluminación, cerraduras biométricas, cámaras con IA y monitoreo de tableros para residencias y empresas." },
    { keys: ["ingeniero", "gerente", "marmanillo", "contacto"], reply: "Puedes coordinar directamente con el Gerente General, Ing. Gustavo Marmanillo, al celular / WhatsApp +51 954 928 201." }
  ];

  function addMsg(text, sender, isButton = false) {
    if (!chatMessages) return;
    const wrap = document.createElement("div");
    wrap.className = sender === "user" ? "flex justify-end" : "flex items-start space-x-2";

    if (sender === "user") {
      wrap.innerHTML = `<div class="bg-[#002b49] text-white p-3 rounded-2xl rounded-tr-none shadow-sm max-w-[85%] leading-relaxed">${text}</div>`;
    } else {
      let btnHtml = isButton ? `<div class="mt-2.5 pt-2 border-t border-slate-100"><a href="https://wa.me/${WHATSAPP_PHONE}" target="_blank" class="inline-flex items-center space-x-1.5 bg-[#10b981] text-white px-3 py-1.5 rounded-xl font-bold text-[10px]"><i class="fa-brands fa-whatsapp"></i><span>Consultar con un Ingeniero</span></a></div>` : "";
      wrap.innerHTML = `
        <div class="w-7 h-7 rounded-full bg-[#002b49] text-[#00a8e8] flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-sm"><i class="fa-solid fa-robot"></i></div>
        <div class="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm text-slate-700 max-w-[85%] leading-relaxed">${text}${btnHtml}</div>
      `;
    }
    chatMessages.appendChild(wrap);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function handleBot(query) {
    const clean = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    let match = KNOWLEDGE.find(item => item.keys.some(k => clean.includes(k)))?.reply;
    setTimeout(() => {
      if (match) addMsg(match, "bot");
      else addMsg("Para una propuesta técnica a medida o peritaje de obra, coordina directamente con nuestra gerencia técnica.", "bot", true);
    }, 200);
  }

  if (chatForm) {
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const txt = chatInput.value.trim();
      if (!txt) return;
      addMsg(txt, "user");
      chatInput.value = "";
      handleBot(txt);
    });
  }

  quickBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const q = btn.textContent.trim();
      addMsg(q, "user");
      handleBot(q);
    });
  });

  function startChat() {
    if (!chatMessages) return;
    chatMessages.innerHTML = `
      <div class="flex items-start space-x-2">
        <div class="w-7 h-7 rounded-full bg-[#002b49] text-[#00a8e8] flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-sm"><i class="fa-solid fa-robot"></i></div>
        <div class="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm text-slate-700 max-w-[88%] leading-relaxed">
          Hola, soy el asistente técnico de <strong>INMUTEC E.I.R.L.</strong> ¿En qué puedo orientarte hoy? Puedes escribir en el teclado o seleccionar una de las alternativas de abajo.
        </div>
      </div>
    `;
  }
  if (btnReset) btnReset.addEventListener("click", startChat);
  startChat();
}

// =========================================================================
// 5. GESTIOUN VUN DER PROFORMA FIR DEN ADMINISTRATEUR (SUPABASE CMS CHECK)
// =========================================================================
export async function verificarYMontarAdminProforma() {
  const container = document.getElementById("contenedor_modulo_admin_proforma");
  if (!container) return;

  let esAdmin = false;
  if (supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) esAdmin = true;
    } catch (e) {
      console.warn("Supabase session check error:", e);
    }
  }

  if (esAdmin) {
    try {
      const resp = await fetch("modules/cotizacion/admin-proforma.html");
      if (resp.ok) {
        container.innerHTML = await resp.text();
        
        // Dynamik an PDF Bibliothéik preparéieren
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
      console.error("Feeler beim Luede vun admin-proforma.html:", e);
    }
  } else {
    container.innerHTML = "";
  }
}

// Globaal Funktiounen fir den Admin-Modul
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
  const tipoDoc = document.querySelector("input[name='docType']:checked")?.value || "RUC";

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

// PDF eroflueden (PC / Laptop)
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

// Iwwer WhatsApp schécken (Smartphone)
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

// Iwwer E-Mail verschécken
window.enviarProformaCorreo = function() {
  const cli = document.getElementById("prof_vista_cliente")?.textContent || "Cliente";
  const tot = document.getElementById("calc_total_admin")?.textContent || "S/ 0.00";
  const emailDestino = document.getElementById("qEmail")?.value || "inmuteceirl@gmail.com";

  const subject = `Propuesta Técnica Económica INMUTEC - ${cli}`;
  const body = `Estimados Señores:\n\nAdjuntamos la propuesta técnica comercial por el importe total de ${tot} (100% Facturado).\n\nQuedamos a su atenta respuesta.\n\nCentral Telefónica: 954928201 / 064595829\nEmail: inmuteceirl@gmail.com`;

  window.location.href = `mailto:${emailDestino}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

if (document.readyState === "complete" || document.readyState === "interactive") {
  setTimeout(init, 50);
}
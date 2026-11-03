const WHATSAPP_PHONE = "51954928201";

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

  if (!quoteForm || !inputRazon || !inputDoc || !inputEmail || !inputPhone) {
    return;
  }

  // 1. RENDERIZADO DE CAMPOS ESPECÍFICOS SEGÚN SERVICIO
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
        <div class="border-b border-slate-200 pb-2">
          <span class="text-[10px] font-black uppercase text-purple-600 tracking-wider block">Automatización & Domótica Inteligente</span>
          <p class="text-[11px] text-slate-500">Sistemas inteligentes para viviendas, oficinas o plantas corporativas.</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="font-bold text-slate-700 block mb-1">Tipo de Espacio *</label>
            <select id="qDomTipo" class="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00a8e8] bg-white">
              <option value="Hogar / Residencia Inteligente">Hogar / Residencia Inteligente</option>
              <option value="Oficinas Corporativas">Oficinas Corporativas</option>
              <option value="Planta Industrial / Accesos">Planta Industrial / Accesos</option>
            </select>
          </div>
          <div>
            <label class="font-bold text-slate-700 block mb-1">Lugar de Implementación *</label>
            <input id="qLugar" type="text" placeholder="Ej. Huancayo, El Tambo, Jauja..." class="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00a8e8] bg-white">
          </div>
        </div>
        <div>
          <label class="font-bold text-slate-700 block mb-1">Sistemas Requeridos *</label>
          <textarea id="qDetalles" rows="3" placeholder="Ej. Control de iluminación, cerraduras biométricas, cámaras con IA, sensores perimétricos o control por voz..." class="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00a8e8] bg-white"></textarea>
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
            <select id="qSede" class="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00a8e8] bg-white">
              <option value="Sede Huancayo - Jr. Salcantay 148, El Tambo">Sede Huancayo - Jr. Salcantay 148, El Tambo</option>
              <option value="Sede Huancavelica - Av. Andrés A. Cáceres #698">Sede Huancavelica - Av. Andrés A. Cáceres #698</option>
            </select>
          </div>
          <div>
            <label class="font-bold text-slate-700 block mb-1">Lugar de la Obra *</label>
            <input id="qLugar" type="text" placeholder="Ej. Chilca, La Oroya, Pampas, Satipo..." class="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00a8e8] bg-white">
          </div>
        </div>
        <div>
          <label class="font-bold text-slate-700 block mb-1">Descripción de la Necesidad Técnica *</label>
          <textarea id="qDetalles" rows="3" placeholder="Indicar metraje estimado de fibra, ancho de banda simétrico, altura de torre o sistema de puesta a tierra requerido..." class="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00a8e8] bg-white"></textarea>
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

  // 2. VALIDACIONES DE CAMPOS
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
    if (/(.)\1{3,}/i.test(val)) {
      showError(inputRazon, errRazon, "Nombre no válido. Evite caracteres repetidos.");
      return false;
    }
    if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(val)) {
      showError(inputRazon, errRazon, "Debe contener letras válidas.");
      return false;
    }
    clearError(inputRazon, errRazon);
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

    if (type === "DNI") {
      if (val.length !== 8) {
        showError(inputDoc, errDoc, `El DNI debe tener exactamente 8 dígitos (ingresó ${val.length}).`);
        return false;
      }
    } else {
      if (val.length !== 11) {
        showError(inputDoc, errDoc, `El RUC debe tener exactamente 11 dígitos (ingresó ${val.length}).`);
        return false;
      }
      if (!val.startsWith("10") && !val.startsWith("20") && !val.startsWith("15") && !val.startsWith("17")) {
        showError(inputDoc, errDoc, "RUC no válido. En Perú debe iniciar con 10 o 20.");
        return false;
      }
    }

    clearError(inputDoc, errDoc);
    return true;
  }

  document.querySelectorAll("input[name='docType']").forEach(radio => {
    radio.addEventListener("change", () => {
      const type = getDocType();
      if (type === "DNI") {
        inputDoc.maxLength = 8;
        inputDoc.placeholder = "Ingrese los 8 dígitos de su DNI";
        if (inputDoc.value.length > 8) {
          inputDoc.value = inputDoc.value.substring(0, 8);
        }
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

    if (!val) {
      showError(inputEmail, errEmail, "El correo electrónico es obligatorio.");
      return false;
    }
    if (!emailRegex.test(val)) {
      showError(inputEmail, errEmail, "Formato inválido. Debe contener '@' y dominio (ej. contacto@empresa.com).");
      return false;
    }
    clearError(inputEmail, errEmail);
    return true;
  }

  function validatePhone() {
    let val = inputPhone.value.replace(/\D/g, "");
    inputPhone.value = val;

    if (!val) {
      showError(inputPhone, errPhone, "El número de celular es obligatorio.");
      return false;
    }
    if (val.length !== 9) {
      showError(inputPhone, errPhone, `Debe tener 9 dígitos (ingresó ${val.length}).`);
      return false;
    }
    if (!val.startsWith("9")) {
      showError(inputPhone, errPhone, "En Perú los números celulares inician con 9.");
      return false;
    }
    clearError(inputPhone, errPhone);
    return true;
  }

  inputRazon.addEventListener("input", validateRazon);
  inputDoc.addEventListener("input", validateDoc);
  inputEmail.addEventListener("input", validateEmail);
  inputPhone.addEventListener("input", validatePhone);

  // 3. ENVÍO DIRECTO A WHATSAPP
  quoteForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const ok1 = validateRazon();
    const ok2 = validateDoc();
    const ok3 = validateEmail();
    const ok4 = validatePhone();

    if (!ok1 || !ok2 || !ok3 || !ok4) return;

    const razon = inputRazon.value.trim();
    const type = getDocType();
    const doc = inputDoc.value.trim();
    const email = inputEmail.value.trim();
    const phone = inputPhone.value.trim();
    const svc = hiddenSvcInput.value;

    let detallesExtra = "";

    if (svc === "Laboratorio") {
      const eq = document.getElementById("qLabEquipo") ? document.getElementById("qLabEquipo").value.trim() : "No indicado";
      const cant = document.getElementById("qLabCantidad") ? document.getElementById("qLabCantidad").value.trim() : "1";
      const falla = document.getElementById("qLabFalla") ? document.getElementById("qLabFalla").value.trim() : "Revisión general";

      detallesExtra = 
        `• Equipo/Marca: ${eq}\n` +
        `• Cantidad: ${cant}\n` +
        `• Falla o Servicio: ${falla}\n` +
        `• Sede de Ingreso: Huancayo (Jr. Salcantay 148)`;
    } else if (svc === "Domótica") {
      const tipo = document.getElementById("qDomTipo") ? document.getElementById("qDomTipo").value : "Residencial";
      const lugar = document.getElementById("qLugar") ? document.getElementById("qLugar").value.trim() : "Huancayo";
      const sis = document.getElementById("qDetalles") ? document.getElementById("qDetalles").value.trim() : "Automatización";

      detallesExtra = 
        `• Tipo de Proyecto: ${tipo}\n` +
        `• Lugar: ${lugar}\n` +
        `• Sistemas requeridos: ${sis}`;
    } else {
      const sede = document.getElementById("qSede") ? document.getElementById("qSede").value : "Huancayo";
      const lugar = document.getElementById("qLugar") ? document.getElementById("qLugar").value.trim() : "No indicado";
      const desc = document.getElementById("qDetalles") ? document.getElementById("qDetalles").value.trim() : "General";

      detallesExtra = 
        `• Sede Asignada: ${sede}\n` +
        `• Lugar de la Obra: ${lugar}\n` +
        `• Requerimiento: ${desc}`;
    }

    const mensajeWhatsApp = 
      `*SOLICITUD DE COTIZACIÓN TÉCNICA - INMUTEC E.I.R.L.*\n\n` +
      `*Cliente / Razón Social:* ${razon}\n` +
      `*${type}:* ${doc}\n` +
      `*Correo:* ${email}\n` +
      `*Celular:* +51 ${phone}\n` +
      `*Servicio Solicitado:* ${svc}\n\n` +
      `*ESPECIFICACIONES DEL REQUERIMIENTO:*\n${detallesExtra}\n\n` +
      `_Mensaje enviado desde la Mesa de Cotización www.inmutec.com.pe_`;

    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(mensajeWhatsApp)}`;
    window.open(url, "_blank");
  });

  // 4. CHATBOT ASISTENTE
  const chatMessages = document.getElementById("chatMessages");
  const chatForm = document.getElementById("chatForm");
  const chatInput = document.getElementById("chatInput");
  const btnReset = document.getElementById("btnResetChat");
  const quickBtns = document.querySelectorAll(".quick-btn");

  const KNOWLEDGE = [
    {
      keys: ["hola", "buen dia", "buenas", "saludos", "que tal", "inicio"],
      reply: "Hola, te doy la bienvenida a INMUTEC E.I.R.L. Soy tu asistente virtual. ¿En qué especialidad técnica te puedo orientar hoy? Puedes escribir tu consulta o seleccionar una de las opciones rápidas de abajo."
    },
    {
      keys: ["servicios", "cobertura", "que hacen", "especialidades", "que ofrecen"],
      reply: "INMUTEC es especialista en 5 divisiones: 1. Internet Dedicado simétrico 1:1, 2. Redes de Fibra Óptica (troncales, mufas y OTDR), 3. Montaje de Torres y Puesta a Tierra STP, 4. Laboratorio Técnico de Radiotransmisión y 5. Domótica y Automatización Inteligente. Atendemos en Junín, Huancavelica y a nivel nacional."
    },
    {
      keys: ["norma", "stp", "tierra", "pozo a tierra", "ntp 2050", "telurometro", "pararrayo"],
      reply: "Diseñamos e instalamos Sistemas de Protección a Tierra (STP) bajo la Norma Técnica Peruana NTP 2050 y el Código Nacional de Electricidad. Garantizamos valores de resistividad certificados por debajo de 5 Ohmios con telurómetro calibrado."
    },
    {
      keys: ["domotica", "smart", "automatizacion", "casa inteligente", "camaras", "cerraduras"],
      reply: "Nuestra nueva división de Domótica e Inmótica implementa control inteligente de iluminación, cerraduras digitales biométricas, sensores de presencia, climatización y automatización de accesos para residencias, oficinas y plantas industriales."
    },
    {
      keys: ["fibra", "otdr", "mufa", "fusion", "tendido", "wow"],
      reply: "Disponemos de fusionadoras Fujikura y reflectómetros OTDR calibrados. Hemos ejecutado más de 120 km de troncales ópticas urbanas para operadores como WOW Tel y contratos de mantenimiento sobre la Red Dorsal Nacional."
    },
    {
      keys: ["laboratorio", "radio", "calibrar", "motorola", "kenwood", "falla"],
      reply: "En nuestro laboratorio técnico de Huancayo (Jr. Salcantay 148, El Tambo) realizamos diagnóstico, calibración de frecuencia y potencia en banco RF, así como reparación de radiotransmisores y repetidoras con stock de repuestos."
    },
    {
      keys: ["ingeniero", "gerente", "marmanillo", "gustavo", "telefono", "whatsapp", "contacto"],
      reply: "Puedes comunicarte directamente con el Gerente General, Ing. Gustavo Marmanillo Baldeón, al número celular / WhatsApp +51 954 928 201."
    }
  ];

  function addMsg(text, sender, isButton = false) {
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

  function handleBot(query) {
    const clean = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    let match = null;

    for (const item of KNOWLEDGE) {
      if (item.keys.some(k => clean.includes(k))) {
        match = item.reply;
        break;
      }
    }

    setTimeout(() => {
      if (match) {
        addMsg(match, "bot");
      } else {
        addMsg(
          "Para brindarte un peritaje técnico o una propuesta exacta para esta necesidad, es recomendable coordinar directamente con nuestra área de ingeniería.",
          "bot",
          true
        );
      }
    }, 250);
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
        <div class="w-7 h-7 rounded-full bg-[#002b49] text-[#00a8e8] flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-sm">
          <i class="fa-solid fa-robot"></i>
        </div>
        <div class="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm text-slate-700 max-w-[88%] leading-relaxed">
          Hola, soy el asistente técnico de <strong>INMUTEC E.I.R.L.</strong> ¿En qué puedo orientarte hoy? Puedes escribir en el teclado o seleccionar una de las alternativas de abajo.
        </div>
      </div>
    `;
  }

  if (btnReset) {
    btnReset.addEventListener("click", startChat);
  }

  startChat();
}

// Auto-arranque por seguridad en caso de carga directa
if (document.readyState === "complete" || document.readyState === "interactive") {
  setTimeout(init, 50);
}
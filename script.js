let UID_ACTUAL = null;



function loginFirebase(usuario, password, callback) {
  

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      // UID ya quedó disponible vía onAuthStateChanged
      if (callback) callback(true);
    })
    .catch(err => {
      alert("Error Firebase: " + err.message);
      if (callback) callback(false);
    });
}








// helper
function getUID() {
  return UID_ACTUAL;
}


function guardarUsuariosEnNube(usuarios){
  const uid = getUID();
  if (!uid) return;

  db.ref(`usuarios/${uid}`).set(usuarios);
}






function leerUsuariosDeNube(callback){
  const uid = getUID();
if (!uid) return;
  db.ref(`usuarios/${uid}`).once("value", snap=>{
    callback(snap.val());
  });
}

     function guardarEnNube(clave, datos) {
  const uid = getUID();
  if (!uid) return;

  db.ref(`${clave}/${uid}`).set(datos);
}
       



function leerDeNube(clave, callback){

  const uid = getUID();

  if (!uid) {
    console.warn("leerDeNube cancelado: sin uid");
    callback(null);
    return;
  }

  db.ref(`${clave}/${uid}`).once("value", snap=>{
    callback(snap.val());
  });

}

document.addEventListener("DOMContentLoaded", () => {

  const loginScreen = document.getElementById("loginScreen");
  const app = document.getElementById("app");

  app.style.display = "none";
  loginScreen.style.display = "flex";

auth.onAuthStateChanged(user => {
  if (user) {

    const estadoSesion = document.getElementById("estadoSesion");
    if (estadoSesion) {
  estadoSesion.className = "estado-activa";
  estadoSesion.textContent = "🟢 Sesión activa";
}
    UID_ACTUAL = user.uid;

    loginScreen.style.display = "none";
    app.style.display = "block";

    const spanUsuario = document.getElementById("usuarioMostrado");
    if (spanUsuario) {
      spanUsuario.textContent = "👤 " + user.email;
    }

    

    leerDeNube("prestamos", data => {
      prestamos = data || [];
      localStorage.setItem("prestamos", JSON.stringify(prestamos));
      mostrarPrestamos();
      cargarAniosDisponibles();
    });

  } else {
    UID_ACTUAL = null;
    prestamos = [];
    
    app.style.display = "none";
    loginScreen.style.display = "flex";
limpiarDatosLocales();
    const estadoSesion = document.getElementById("estadoSesion");

if (estadoSesion) {
  estadoSesion.className = "estado-inactiva";
  estadoSesion.textContent = "🔴 Sesión cerrada";
}

    const spanUsuario = document.getElementById("usuarioMostrado");
    if (spanUsuario) {
      spanUsuario.textContent = "";
    }
  }
});
 });


 




  // VARIABLES GLOBALES *//
let prestamos = [];

  const addBtn = document.getElementById('addBtn'); 
  const modal = document.getElementById('modal'); 
  const emptyMsg = document.getElementById('emptyMsg'); 
  const reportBtn = document.getElementById('reportBtn');
   const reportSection = document.getElementById('reportSection'); 
   const yearSelector = document.getElementById('yearSelector');
   
   // CONFIGURACIÓN INICIAL //
   document.addEventListener('DOMContentLoaded', () => { 
   
    // Establecer fecha actual por defecto en el input //
     const fechaInput = document.getElementById('fechaOtorgamiento');
      if (fechaInput) {
         fechaInput.value = new Date().toISOString().split('T')[0]; 
        } 
        
        // Asignar eventos a botones //
        if (addBtn) addBtn.onclick = abrirModalNuevo; 
        if (reportBtn) reportBtn.onclick = toggleReportSection;
        
        // Cargar años disponibles para el informe//
         cargarAniosDisponibles(); 
         
                 });
        
         // FUNCIONES DE MODAL //
function cerrarModal() { 
    if (modal) modal.style.display = 'none'; 
} 

function abrirModalNuevo() { 
    const modalTitulo = document.getElementById('modalTitulo');
     const prestamoIdInput = document.getElementById('prestamoId'); 
     const nombreInput = document.getElementById('nombre'); 
     const fechaInput = document.getElementById('fechaOtorgamiento'); 
     const montoInput = document.getElementById('monto'); 
     const cuotasInput = document.getElementById('cuotas');
      const frecuenciaSelect = document.getElementById('frecuenciaPago');
       const montoOriginalInput = document.getElementById('montoOriginal');
       
       if (modalTitulo) modalTitulo.textContent = 'Agregar Préstamo';
        if (prestamoIdInput) prestamoIdInput.value = ''; 
        if (nombreInput) nombreInput.value = ''; 
        if (fechaInput) fechaInput.value = new Date().toISOString().split('T')[0]; 
        if (montoInput) montoInput.value = ''; if (cuotasInput) cuotasInput.value = '';
         if (frecuenciaSelect) frecuenciaSelect.value = 'mensual'; 
         if (montoOriginalInput) montoOriginalInput.value = ''; 
         if (modal) modal.style.display = 'block';
         const telefonoInput = document.getElementById('telefono');
if (telefonoInput) telefonoInput.value = '';
         } 
         
function abrirModalEditar(id) { 
    const prestamo = prestamos.find(p => p.id === id);
     if (!prestamo) return;
     const telefonoInput = document.getElementById('telefono');
if (telefonoInput) telefonoInput.value = prestamo.telefono || '';
      const modalTitulo = document.getElementById('modalTitulo');
      const prestamoIdInput = document.getElementById('prestamoId'); 
      const nombreInput = document.getElementById('nombre');
       const fechaInput = document.getElementById('fechaOtorgamiento');
        const montoInput = document.getElementById('monto'); 
        const cuotasInput = document.getElementById('cuotas');
         const frecuenciaSelect = document.getElementById('frecuenciaPago');
          const montoOriginalInput = document.getElementById('montoOriginal');
           if (montoOriginalInput) { 
            montoOriginalInput.value = prestamo.montoOriginal;
         } 
         if (modalTitulo) modalTitulo.textContent = 'Editar Préstamo';
          if (prestamoIdInput) prestamoIdInput.value = prestamo.id;
           if (nombreInput) nombreInput.value = prestamo.nombre;
            if (fechaInput) fechaInput.value = prestamo.fechaOtorgamiento; 
            if (montoInput) montoInput.value = prestamo.monto; 
            if (cuotasInput) cuotasInput.value = prestamo.cantidadCuotas; 
            if (frecuenciaSelect) frecuenciaSelect.value = prestamo.frecuenciaPago; 
            if (modal) modal.style.display = 'block'; 
        } 
        
        // FUNCIONES DE GESTIÓN DE CUOTAS//
        
        function generarFechasCuotas(fechaOtorgamiento, cantidadCuotas, frecuencia) { 
            const cuotas = []; 
            const fechaBase = new Date(fechaOtorgamiento);
             let fechaVencimiento = new Date(fechaBase); 
           const incrementarFecha = (fecha, freq) => {
  switch(freq) {
    case 'mensual':
      fecha.setMonth(fecha.getMonth() + 1);
      break;
    case 'semanal':
      fecha.setDate(fecha.getDate() + 7);
      break;
    case 'quincenal':
      fecha.setDate(fecha.getDate() + 15);
      break;
  }
  return fecha;
};
                      
                    
                    
// Generar cada cuota//

 for (let i = 1; i <= cantidadCuotas; i++) { 
    fechaVencimiento = incrementarFecha(new Date(fechaVencimiento), frecuencia); 
    cuotas.push({ numero: i, fechaVencimiento: fechaVencimiento.toISOString().split('T')[0],
         pagada: false,
          fechaPago: null 
        }); 
    } 
    return cuotas;
 } 
    
   function calcularInteresAtraso(cuota, montoCuotaBase) { 

    const hoy = new Date(); 
    const fechaVencimiento = new Date(cuota.fechaVencimiento); 

    if (fechaVencimiento >= hoy) return 0;

    const diferenciaMs = hoy - fechaVencimiento; 
    const diasAtraso = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24)); 

    return parseFloat((montoCuotaBase * 0.01 * diasAtraso).toFixed(2));
}

    
function toggleCuotas(prestamoId) { 
  const seccion = document.getElementById(`cuotas-${prestamoId}`); 

  if (seccion) {
    seccion.style.display = 
      seccion.style.display === 'block' ? 'none' : 'block';
  }
}

function cambiarEstadoCuota(prestamoId, cuotaNumero, nuevoEstado) { 
    const prestamoIndex = prestamos.findIndex(p => p.id === prestamoId);
    if (prestamoIndex === -1) return;

    const cuotaIndex = prestamos[prestamoIndex].cuotas.findIndex(c => c.numero === cuotaNumero);
    if (cuotaIndex === -1) return; 

    const cuota = prestamos[prestamoIndex].cuotas[cuotaIndex];

    if (nuevoEstado) {

        // 🔥 CALCULAR INTERÉS ANTES DE MARCAR COMO PAGADA
        const interesGenerado = calcularInteresAtraso(cuota, prestamos[prestamoIndex].montoCuotaBase);

        cuota.pagada = true;
        cuota.fechaPago = new Date().toISOString().split('T')[0];
        cuota.interesPagado = interesGenerado;

        if (nuevoEstado) {

    const interesGenerado = calcularInteresAtraso(cuota, prestamos[prestamoIndex].montoCuotaBase);

    cuota.interesPagado = Number(interesGenerado) || 0;  // 👈 FORZAR NÚMERO
    cuota.pagada = true;
    cuota.fechaPago = new Date().toISOString().split('T')[0];

}


    } else {

        cuota.pagada = false;
        cuota.fechaPago = null;
        cuota.interesPagado = 0;

    }

    localStorage.setItem('prestamos', JSON.stringify(prestamos));
    guardarEnNube("prestamos", prestamos); 
    mostrarPrestamos(); 
    cargarAniosDisponibles(); 
}


          // FUNCIONES DE GESTIÓN DE PRÉSTAMOS 
function borrarPrestamo(id) { 
  if (!confirm('¿Estás seguro de borrar este préstamo?')) return;

  prestamos = prestamos.filter(p => p.id !== id);

  localStorage.setItem('prestamos', JSON.stringify(prestamos));
  guardarEnNube("prestamos", prestamos);

  mostrarPrestamos();
  cargarAniosDisponibles();
  generarInformeMensual();
}

 function guardarPrestamo() {
     const prestamoIdInput = document.getElementById('prestamoId'); 
     const nombreInput = document.getElementById('nombre'); 
     const telefonoInput = document.getElementById('telefono');
const telefono = telefonoInput ? telefonoInput.value.trim() : '';
if (!telefono) {
  alert('Ingresa el teléfono del cliente');
  telefonoInput.focus();
  return;
}
     const fechaInput = document.getElementById('fechaOtorgamiento');
      const montoInput = document.getElementById('monto'); 
      const cuotasInput = document.getElementById('cuotas'); 
      
      
      const frecuenciaSelect = document.getElementById('frecuenciaPago');
       const montoOriginalInput = document.getElementById('montoOriginal');
        if (!montoOriginalInput) { alert("No existe el campo montoOriginal en el HTML");
             return; } 
             
            const montoOriginal = parseFloat(montoOriginalInput.value); 
             if (isNaN(montoOriginal) || montoOriginal <= 0) { alert('Ingresa un monto original válido');
                 montoOriginalInput.focus(); 
                 return;
                 } 
                 // Validar que existan todos los inputs //
                 if (!nombreInput || !fechaInput || !montoInput || !cuotasInput || !frecuenciaSelect) 
                    { alert('Error en los elementos del formulario'); 
                        return;
                     } 
                     const id = prestamoIdInput.value;
                      const nombre = nombreInput.value.trim(); 
                      const fechaOtorgamiento = fechaInput.value;
                       const monto = parseFloat(montoInput.value);
                        const cantidadCuotas = parseInt(cuotasInput.value); 
                        const frecuenciaPago = frecuenciaSelect.value; 
                        // Validar datos ingresados//
                         if (!nombre) { alert('Ingresa el nombre del cliente'); 
                            nombreInput.focus();
                             return; } 
                             if (!fechaOtorgamiento) { 
                                alert('Selecciona la fecha de otorgamiento'); 
                                fechaInput.focus(); 
                                return; } 
                                if (isNaN(monto) || monto <= 0) { 
                                    alert('Ingresa un monto válido mayor a cero'); 
                                    montoInput.focus(); 
                                    return; } 
                                    if (isNaN(cantidadCuotas) || cantidadCuotas <= 0) { 
                                        alert('Ingresa una cantidad de cuotas válida mayor a cero');
                                         cuotasInput.focus();
                                          return; } 
                                          const montoCuotaBase = parseFloat((monto / cantidadCuotas).toFixed(2));
                                           const cuotas = generarFechasCuotas(fechaOtorgamiento, cantidadCuotas, frecuenciaPago); 
                                           if (id) { 
                                            // Editar préstamo existente//
                                             const prestamoIndex = prestamos.findIndex(p => p.id === parseInt(id)); 
                                             if (prestamoIndex !== -1) {
                                      prestamos[prestamoIndex] = {
     id: parseInt(id),
   nombre,
   telefono,
   fechaOtorgamiento,
   monto,
   cantidadCuotas,
   frecuenciaPago,
   montoCuotaBase,
   montoOriginal,
   cuotas
};
 
                                                    } } 
                                                    else { 
                                                        // Agregar nuevo préstamo//
                                                        prestamos.push({
   id: Date.now(),
  nombre,
  telefono,
  fechaOtorgamiento,
  monto,
  cantidadCuotas,
  frecuenciaPago,
  montoCuotaBase,
  montoOriginal,
  cuotas
});

                                                         } 
                                                         
                                                // Guardar y actualizar vista//
                                            
    localStorage.setItem('prestamos', JSON.stringify(prestamos)); 
    guardarEnNube("prestamos", prestamos);
     mostrarPrestamos(); 
     cargarAniosDisponibles(); 
     // Actualizar años después de guardar//
      cerrarModal();
     } 
     
function renderPrestamos() {

  const container = document.getElementById('container');
  if (!container) return;

  container.innerHTML = '';

  if (prestamos.length === 0) {
    emptyMsg.style.display = 'block';
    return;
  } else {
    emptyMsg.style.display = 'none';
  }

  prestamos.forEach(p => {

    const estaFinalizado = p.cuotas.every(c => c.pagada);
    const estadoClase = estaFinalizado ? 'estado-finalizado' : 'estado-activo';
    const estadoTexto = estaFinalizado ? 'FINALIZADO' : 'ACTIVO';

    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <h3>${p.nombre}
        <span class="${estadoClase}">${estadoTexto}</span>
      </h3>
    `;

    container.appendChild(card);
  });

}

                   
// Construir HTML completo de la tarjeta 
// Construir HTML completo de la tarjeta 
function mostrarPrestamos() {

    const uid = getUID();   // 🔥 usar UID real
    if (!uid) return;

    if (emptyMsg) {
        emptyMsg.style.display = prestamos.length === 0 ? 'block' : 'none';
    }

    const container = document.getElementById('container');
    if (!container) return;

    container.innerHTML = '';

    prestamos.forEach(p => {

// 🔥 LIMPIEZA PROFESIONAL DE CELULAR

let telefonoLimpio = p.telefono ? p.telefono.replace(/\D/g, '') : '';

if (telefonoLimpio.startsWith('0')) {
    telefonoLimpio = telefonoLimpio.substring(1);
}

if (telefonoLimpio.startsWith('15')) {
    telefonoLimpio = telefonoLimpio.substring(2);
}

if (telefonoLimpio.startsWith('54')) {
    telefonoLimpio = telefonoLimpio.substring(2);
}

// 🔎 VALIDACIÓN ARGENTINA (debe quedar 10 dígitos: ej 1123456789)
const telefonoValido = telefonoLimpio.length === 10;

const telefonoWhatsApp = telefonoLimpio ? `549${telefonoLimpio}` : '';
        const estaFinalizado = p.cuotas.every(c => c.pagada);
        const estadoClase = estaFinalizado ? 'estado-finalizado' : 'estado-activo';
        const estadoTexto = estaFinalizado ? 'FINALIZADO' : 'ACTIVO';

        const card = document.createElement('div');
        card.className = 'card';

        card.innerHTML = `
        <h3 class="cliente-nombre" onclick="toggleDetalle(${p.id})">
   ▶ ${p.nombre}
   <span class="estado-prestamo ${estadoClase}">
      ${estadoTexto}
   </span>
</h3>


<small class="${telefonoValido ? '' : 'telefono-invalido'}">
   📞 ${p.telefono || 'Sin teléfono'}

   ${telefonoValido ? `
      <a href="tel:${telefonoLimpio}" class="btn-llamar">
         📲
      </a>

      <a href="https://wa.me/${telefonoWhatsApp}?text=${encodeURIComponent("Hola, te contacto por el préstamo pendiente.")}" 
         target="_blank" 
         class="btn-whatsapp">
         💬
      </a>
   ` : `
      <span class="mensaje-error">⚠ Número inválido</span>
   `}
</small>

            <div class="detalle-prestamo" id="detalle-${p.id}" style="display:none;">
                <p>Fecha de otorgamiento: ${p.fechaOtorgamiento}</p>
                <p>Monto total: $${p.monto.toFixed(2)}</p>
                <p>Frecuencia de pago: ${p.frecuenciaPago}</p>
                <p>Cantidad de cuotas: ${p.cantidadCuotas}</p>
                <p>Monto cuota base: $${p.montoCuotaBase.toFixed(2)}</p>
                <p>Monto original: $${(p.montoOriginal || 0).toFixed(2)}</p>
            </div>

            <div class="cuotas-seccion" id="cuotas-${p.id}" style="display:none;">
                <h4>Detalle de cuotas:</h4>
                ${p.cuotas.map(c => {

                let interes = 0;

if (c.pagada) {
    interes = typeof c.interesPagado === "number"
        ? c.interesPagado
        : 0;
} else {
    interes = calcularInteresAtraso(c, p.montoCuotaBase);
}


                    const total = parseFloat((p.montoCuotaBase + interes).toFixed(2));
                    const fechaPagoTexto = c.pagada ? ` - Pagada el: ${c.fechaPago}` : '';
                    const claseCuota = c.pagada 
                        ? 'cuota-pagada' 
                        : (interes > 0 ? 'cuota-atrasada' : '');

                    return `
                        <div class="cuota-item ${claseCuota}">
                            <div class="cuota-numero">Cuota #${c.numero}</div>
                            <div class="cuota-fechas">
                                Vencimiento: ${c.fechaVencimiento}${fechaPagoTexto}
                            </div>
                            <div class="cuota-montos">
                                <p>Monto base: $${p.montoCuotaBase.toFixed(2)}</p>
                                ${interes > 0 ? 
                                    `<p class="cuota-atraso">Interés por atraso: $${interes.toFixed(2)}</p>` 
                                    : ''
                                }
                                <p class="cuota-total">Total a pagar: $${total.toFixed(2)}</p>
                            </div>
                          <div class="cuota-acciones">
  ${c.pagada 
    ? `
      <button class="btn-desabonar" onclick="cambiarEstadoCuota(${p.id}, ${c.numero}, false)">
        Marcar pendiente
      </button>

      <button class="btn-recibo" onclick="exportarRecibo(${p.id}, ${c.numero})">
        🧾 Generar Recibo
      </button>
    `
    : `
      <button class="btn-abonar" onclick="cambiarEstadoCuota(${p.id}, ${c.numero}, true)">
        Marcar abonada
      </button>
    `
  }
</div>
                        </div>
                    `;
                }).join('')}
            </div>

            <div class="card-acciones">
                <button class="btn-editar" onclick="abrirModalEditar(${p.id})">Editar</button>
                <button class="btn-borrar" onclick="borrarPrestamo(${p.id})">Borrar</button>
            </div>
        `;

        container.appendChild(card);
    });
}






 function toggleDetalle(id) {
  const detalle = document.getElementById(`detalle-${id}`);
  const cuotas = document.getElementById(`cuotas-${id}`);

  if (!detalle || !cuotas) return;

  const visible = detalle.style.display === "block";

  detalle.style.display = visible ? "none" : "block";
  cuotas.style.display = visible ? "none" : "block";
}

    // FUNCIONES DEL INFORME MENSUAL //
     function toggleReportSection() { 
     if (!reportSection) return;
      if (reportSection.style.display === 'block') {
         reportSection.style.display = 'none'; 
        } else { reportSection.style.display = 'block'; 
            generarInformeMensual();
             // Generar informe al abrir 
             } 
            } 
function cargarAniosDisponibles() { 
    if (!yearSelector) return;

    const años = new Set();
    const añoActual = new Date().getFullYear(); 
    años.add(añoActual);

    if (!prestamos || prestamos.length === 0) {
        yearSelector.innerHTML = `<option value="${añoActual}">${añoActual}</option>`;
        return;
    }

    prestamos.forEach(p => {
        if (!p.cuotas) return;

        p.cuotas.forEach(c => {
            if (c.pagada && c.fechaPago) {
                const año = new Date(c.fechaPago).getFullYear();
                años.add(año);
            }
        });
    });

    yearSelector.innerHTML = '';

    Array.from(años)
        .sort((a, b) => b - a)
        .forEach(año => {
            const option = document.createElement('option');
            option.value = año;
            option.textContent = año;
            yearSelector.appendChild(option);
        });
}

         
function generarInformeMensual() {

    const reportData = document.getElementById('reportData');
    const yearSelector = document.getElementById('yearSelector');

    if (!reportData || !yearSelector || !Array.isArray(prestamos)) return;

    const añoSeleccionado = parseInt(yearSelector.value);

    const meses = [
        'Enero','Febrero','Marzo','Abril','Mayo','Junio',
        'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
    ];

    const datosInforme = meses.map(() => ({
        cantidad: 0,
        monto: 0,
        interes: 0,
        ganancia: 0
    }));

    prestamos.forEach(p => {

        if (!Array.isArray(p.cuotas)) return;

        p.cuotas.forEach(c => {

            if (!c.pagada || !c.fechaPago) return;

            const partes = c.fechaPago.split("-");
            if (partes.length < 2) return;

            const añoPago = parseInt(partes[0]);
            const mesPago = parseInt(partes[1]) - 1;

            if (añoPago !== añoSeleccionado) return;

            const montoBase = p.montoCuotaBase || 0;
            const interesAtraso = c.interesPagado || 0;

            const totalCuota = montoBase + interesAtraso;

            const costoRealCuota = p.montoOriginal && p.cuotas.length
                ? p.montoOriginal / p.cuotas.length
                : 0;

            const gananciaCuota = (montoBase - costoRealCuota) + interesAtraso;

            datosInforme[mesPago].cantidad++;
            datosInforme[mesPago].monto += totalCuota;
            datosInforme[mesPago].interes += interesAtraso;
            datosInforme[mesPago].ganancia += gananciaCuota;

        });
    });

    const totalCuotas = datosInforme.reduce((s, m) => s + m.cantidad, 0);
    const totalMonto = datosInforme.reduce((s, m) => s + m.monto, 0);
    const totalInteres = datosInforme.reduce((s, m) => s + m.interes, 0);
    const totalGanancia = datosInforme.reduce((s, m) => s + m.ganancia, 0);

    const hayDatos = datosInforme.some(m => m.cantidad > 0);

    if (!hayDatos) {
        reportData.innerHTML = "<div>No hay cuotas pagadas</div>";
        return;
    }

    let html = "";

    // 🔹 Tarjetas por mes
    datosInforme.forEach((m, i) => {
        if (m.cantidad > 0) {
            html += `
            <div class="report-month-card">
                <h4>${meses[i]}</h4>
                <p>Cuotas pagadas: ${m.cantidad}</p>
                <p>Monto total cobrado: $${m.monto.toFixed(2)}</p>
                <p>Intereses por atraso: $${m.interes.toFixed(2)}</p>
                <p>Ganancia total: $${m.ganancia.toFixed(2)}</p>
            </div>`;
        }
    });

    // 🔥 AQUÍ VA EL BLOQUE TOTAL (CORRECTAMENTE COLOCADO)
    html += `
    <div class="report-month-card total">
        <h4>TOTAL ${añoSeleccionado}</h4>
        <p>Total cuotas: ${totalCuotas}</p>
        <p>Total cobrado: $${totalMonto.toFixed(2)}</p>
        <p>Total intereses por atraso: $${totalInteres.toFixed(2)}</p>
        <p>Total ganancia: $${totalGanancia.toFixed(2)}</p>
    </div>`;

    reportData.innerHTML = html;
}





function crearUsuarioFirebase(email, password){
  return auth.createUserWithEmailAndPassword(email, password);

}


function login(){ 
  const emailInput = document.getElementById("emailLogin");
  const passInput = document.getElementById("pass");

  if(!emailInput || !passInput){
    alert("Error en los campos");
    return;
  }

  const email = emailInput.value.trim();
  const password = passInput.value.trim();

  if(!email || !password){
    alert("Completa todos los campos");
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then(()=>{
      console.log("Login correcto");
    })
    .catch(err=>{
      alert("Correo o Contraseña Incorrecta Intente Nuevamente ");
    });
}




function abrirRegistro(){ 
    const modal = document.getElementById("modalRegistro");
    if(modal) modal.style.display = "flex";
} 

function cerrarRegistro(){ 
    const modal = document.getElementById("modalRegistro");
    if(modal) modal.style.display = "none";
}


function crearUsuario(){ 
  const emailInput = document.getElementById("emailRegistro");
  const passInput = document.getElementById("passRegistro");

  if(!emailInput || !passInput){
    alert("Error: no se encuentran los campos del formulario");
    return;
  }

  const email = emailInput.value.trim();
  const password = passInput.value.trim();

  if(!email || !password){
    alert("Completa todos los campos");
    return;
  }

  if(password.length < 6){
    alert("La contraseña debe tener mínimo 6 caracteres");
    return;
  }

  crearUsuarioFirebase(email, password)
    .then(() => {
      limpiarDatosLocales();          // 🔹 Limpiar datos de sesión previa
      limpiarFormularioRegistro();    // 🔹 Limpiar inputs del formulario
      alert("✅ Usuario creado correctamente");
      cerrarRegistro();
    })
    .catch(err=>{
      alert("Error: Formato de Correo Incorrecto ");
    });
}

 function guardarNuevaClave(){

  const user = auth.currentUser;
  const email = user.email;

  const claveActual = document.getElementById("oldPass").value.trim();
  const nuevaClave = document.getElementById("newPass").value.trim();

  if (!user) {
    alert("No hay sesión activa");
    return;
  }

  if (!claveActual || !nuevaClave) {
    alert("Completa todos los campos");
    return;
  }

  if (nuevaClave.length < 6) {
    alert("La nueva contraseña debe tener mínimo 6 caracteres");
    return;
  }

  const credencial = firebase.auth.EmailAuthProvider.credential(email, claveActual);

  user.reauthenticateWithCredential(credencial)
    .then(() => {
      return user.updatePassword(nuevaClave);
    })
    .then(() => {
      alert("✅ Contraseña actualizada correctamente");
      cerrarCambio();
    })
    .catch(err => {
      alert("Error: Contraseña Actual Incorrecta");
    });
}



function recuperarClave() {

  const email = prompt("Ingresa tu correo electrónico:");
  if (!email) return;

  const actionCodeSettings = {
    url: window.location.origin,
    handleCodeInApp: false
  };

  auth.sendPasswordResetEmail(email, actionCodeSettings)
    .then(() => {
      alert("📧 Revisa tu correo (y spam). El enlace dura 1 hora.");
    })
    .catch(err => {
      alert("Error: Formato de Correo Incorrecto ");
    });
}


function limpiarDatosLocales() {
  prestamos = [];
  UID_ACTUAL = null;

  localStorage.removeItem("prestamos");
  localStorage.clear(); // si quieres limpiar TODO

  const container = document.getElementById("container");
  if (container) container.innerHTML = "";

  const reportData = document.getElementById("reportData");
  if (reportData) reportData.innerHTML = "";

  console.log("🧹 Datos locales eliminados");
}

function logout() {
  auth.signOut().then(() => {
    // 🔹 Limpiar variables y localStorage
    limpiarDatosLocales();

    // 🔹 Limpiar inputs de login
    const emailInput = document.getElementById("emailLogin");
    const passInput = document.getElementById("pass");

    if (emailInput) emailInput.value = "";
    if (passInput) passInput.value = "";

    // 🔹 Mostrar pantalla de login
    const loginScreen = document.getElementById("loginScreen");
    const app = document.getElementById("app");

    if (loginScreen) loginScreen.style.display = "flex";
    if (app) app.style.display = "none";

    console.log("🔴 Sesión cerrada correctamente");
  }).catch(err => {
    console.error("Error al cerrar sesión:", err);
  });
}


function limpiarFormularioRegistro() {
  const emailInput = document.getElementById("emailRegistro");
  const passInput = document.getElementById("passRegistro");

  if (emailInput) emailInput.value = "";
  if (passInput) passInput.value = "";
}



function exportarPrestamos(){

 const datos = prestamos;

 if(!datos || datos.length === 0){
   alert("No hay préstamos para exportar");
   return;
 }

 const archivo = new Blob(
   [JSON.stringify(datos,null,2)],
   {type:"application/json"}
 );

 const link = document.createElement("a");
 link.href = URL.createObjectURL(archivo);
 link.download = "prestamos.json";
 link.click();
}



async function exportarPDF(){

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  const datos = prestamos;

  if(!datos || datos.length === 0){
    alert("No hay préstamos");
    return;
  }

  let y = 10;

  pdf.setFontSize(14);
  pdf.text("REPORTE DE PRÉSTAMOS", 10, y);
  y += 10;

  datos.forEach((p, i) => {

    if(y > 270){
      pdf.addPage();
      y = 10;
    }

    pdf.setFontSize(12);
    pdf.text(`${i+1}) Cliente: ${p.nombre}`, 10, y); y+=6;
    pdf.text(`Fecha de otorgamiento: ${p.fechaOtorgamiento}`, 10, y); y+=6;
    pdf.text(`Monto total: $${p.monto.toFixed(2)}`, 10, y); y+=6;
   // pdf.text(`Monto original: $${(p.montoOriginal || 0).toFixed(2)}`, 10, y); y+=6;   *//
    pdf.text(`Cantidad de cuotas: ${p.cantidadCuotas}`, 10, y); y+=6;
    pdf.text(`Frecuencia: ${p.frecuenciaPago}`, 10, y); y+=8;

    pdf.setFontSize(11);
    pdf.text("Detalle de cuotas:", 10, y); 
    y += 6;

    p.cuotas.forEach(c => {

      if(y > 270){
        pdf.addPage();
        y = 10;
      }

      const interes = c.interesPagado || 0;
      const total = p.montoCuotaBase + interes;

      pdf.text(`Cuota #${c.numero}`, 12, y); y+=5;
      pdf.text(`Vencimiento: ${c.fechaVencimiento}`, 14, y); y+=5;

      if(c.pagada){
        pdf.text(`Estado: PAGADA`, 14, y); y+=5;
        pdf.text(`Fecha de pago: ${c.fechaPago}`, 14, y); y+=5;
        pdf.text(`Monto base: $${p.montoCuotaBase.toFixed(2)}`, 14, y); y+=5;

        if(interes > 0){
          pdf.text(`Interés por atraso: $${interes.toFixed(2)}`, 14, y); y+=5;
        }

        pdf.text(`Total pagado: $${total.toFixed(2)}`, 14, y); y+=6;

      } else {
        pdf.text(`Estado: PENDIENTE`, 14, y); y+=6;
      }

    });

    y += 4;
  });

  pdf.save("prestamos_detallado.pdf");
}

function abrirCambio(){ 
    document.getElementById("modalClave").style.display="flex";
 } 
 
 function cerrarCambio(){ 
    document.getElementById("modalClave").style.display="none";
 } 










 async function exportarRecibo(prestamoId, cuotaNumero){

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  const prestamo = prestamos.find(p => p.id === prestamoId);
  if(!prestamo) return;

  const cuota = prestamo.cuotas.find(c => c.numero === cuotaNumero);
  if(!cuota || !cuota.pagada){
    alert("La cuota no está pagada");
    return;
  }

  // 🔹 NUMERO DE RECIBO
  let numeroRecibo = localStorage.getItem("numeroRecibo") || 1;
  numeroRecibo = parseInt(numeroRecibo);
  localStorage.setItem("numeroRecibo", numeroRecibo + 1);

  const interes = cuota.interesPagado || 0;
  const subtotal = prestamo.montoCuotaBase;
  const total = subtotal + interes;

  const COLOR = [30, 58, 138]; // Azul profesional (#1E3A8A)

  // ==============================
  // 🔹 BARRA SUPERIOR CORPORATIVA
  // ==============================

  pdf.setFillColor(...COLOR);
  pdf.rect(0, 0, 210, 30, "F");

  // ==============================
  // 🔹 LOGO (PEGA TU BASE64 AQUÍ)
  // ==============================

// LOGO REAL
const logo = "data:image/jpeg;base64,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";

pdf.addImage(logo, "PNG", 15, 5, 20, 20);

  // ==============================
  // 🔹 NOMBRE EMPRESA
  // ==============================

  pdf.setTextColor(255,255,255);
  pdf.setFontSize(18);
  pdf.setFont("helvetica","bold");
  pdf.text("PORTFOLIO MANAGEMENT", 70, 18);

  pdf.setTextColor(0,0,0);

  let y = 45;

  // ==============================
  // 🔹 INFO RECIBO
  // ==============================

  pdf.setFontSize(11);
  pdf.setFont("helvetica","normal");

  pdf.text(`Recibo N°: ${numeroRecibo}`, 150, 40);
  pdf.text(`Fecha: ${new Date().toISOString().split('T')[0]}`, 150, 45);y+=6

  pdf.line(10, y, 200, y);
  y += 10;

  // ==============================
  // 🔹 DATOS CLIENTE
  // ==============================

  pdf.text(`Cliente: ${prestamo.nombre}`, 10, y); y+=6;
  pdf.text(`Fecha otorgamiento: ${prestamo.fechaOtorgamiento}`, 10, y); y+=6;
  pdf.text(`Cuota N°: ${cuota.numero}`, 10, y); y+=6;
  pdf.text(`Fecha pago: ${cuota.fechaPago}`, 10, y); y+=10;

  // ==============================
  // 🔹 TABLA PROFESIONAL
  // ==============================

  pdf.setFillColor(230,230,230);
  pdf.rect(10, y-5, 190, 8, "F");

  pdf.setFont("helvetica","bold");
  pdf.text("Descripción", 15, y);
  pdf.text("Monto", 185, y, {align: "right"});
  y+=8;

  pdf.setFont("helvetica","normal");

  pdf.text("Cuota base", 15, y);
  pdf.text(`$${subtotal.toFixed(2)}`, 185, y, {align: "right"});
  y+=8;

  if(interes > 0){
    pdf.text("Interés por atraso", 15, y);
    pdf.text(`$${interes.toFixed(2)}`, 185, y, {align: "right"});
    y+=8;
  }

  pdf.line(10, y, 200, y);
  y+=10;

  pdf.setFont("helvetica","bold");
  pdf.setFontSize(14);
  pdf.text("TOTAL PAGADO:", 15, y);
  pdf.text(`$${total.toFixed(2)}`, 185, y, {align: "right"});
  y+=20;

  // ==============================
  // 🔹 FIRMA
  // ==============================

  //  pdf.setFontSize(10);
  //  pdf.setFont("helvetica","normal");

  //  pdf.line(70, y, 150, y);
  //  y+=6;
  //  pdf.text("Firma Autorizada", 95, y);

   pdf.save(`Recibo_${prestamo.nombre}_Cuota_${cuota.numero}.pdf`);
}


const telefonoInput = document.getElementById('telefono');
const telefonoError = document.getElementById('telefonoError');

if (telefonoInput) {

    telefonoInput.addEventListener('input', function () {

        // 🔥 Limpieza automática
        let valor = this.value.replace(/\D/g, '');

        if (valor.startsWith('0')) {
            valor = valor.substring(1);
        }

        if (valor.startsWith('15')) {
            valor = valor.substring(2);
        }

        if (valor.startsWith('54')) {
            valor = valor.substring(2);
        }

        this.value = valor;

        // 🔎 Validación argentina (10 dígitos)
        if (valor.length === 10) {
            this.classList.remove('input-invalido');
            this.classList.add('input-valido');
            telefonoError.textContent = "✔ Número válido";
            telefonoError.className = "mensaje-validacion valido";
        } else {
            this.classList.remove('input-valido');
            this.classList.add('input-invalido');
            telefonoError.textContent = "Debe tener 10 dígitos (ej: 1123456789)";
            telefonoError.className = "mensaje-validacion invalido";
        }

    });

}
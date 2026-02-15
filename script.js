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
         } 
         
function abrirModalEditar(id) { 
    const prestamo = prestamos.find(p => p.id === id);
     if (!prestamo) return;
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

        const estaFinalizado = p.cuotas.every(c => c.pagada);
        const estadoClase = estaFinalizado ? 'estado-finalizado' : 'estado-activo';
        const estadoTexto = estaFinalizado ? 'FINALIZADO' : 'ACTIVO';

        const card = document.createElement('div');
        card.className = 'card';

        card.innerHTML = `
           <h3 class="cliente-nombre" onclick="toggleDetalle(${p.id})">
                 ▶ ${p.nombre}
                <span class="estado-prestamo ${estadoClase}">${estadoTexto}</span>
            </h3>

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
                                    ? `<button class="btn-desabonar" onclick="cambiarEstadoCuota(${p.id}, ${c.numero}, false)">Marcar pendiente</button>` 
                                    : `<button class="btn-abonar" onclick="cambiarEstadoCuota(${p.id}, ${c.numero}, true)">Marcar abonada</button>`
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
      alert("Error: " + err.message);
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
      alert("Error Firebase: " + err.message);
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
      alert("Error: " + err.message);
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
      alert("Error: " + err.message);
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

 let y=10;
 pdf.text(`Préstamos`,10,y);
 y+=10;

 datos.forEach((p,i)=>{
   pdf.text(`${i+1}) ${p.nombre}`,10,y); y+=6;
   pdf.text(`Monto: $${p.monto}`,10,y); y+=6;
   pdf.text(`Cuotas: ${p.cantidadCuotas}`,10,y); y+=6;
   pdf.text(`Frecuencia: ${p.frecuenciaPago}`,10,y); y+=10;

   if(y>270){
     pdf.addPage();
     y=10;
   }
 });

 pdf.save(`prestamos.pdf`);
}

function abrirCambio(){ 
    document.getElementById("modalClave").style.display="flex";
 } 
 
 function cerrarCambio(){ 
    document.getElementById("modalClave").style.display="none";
 } 

 
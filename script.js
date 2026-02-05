// 🔥 Firebase helpers

function guardarEnNube(clave, datos){
   const usuario = localStorage.getItem("usuarioActivo");
   if(!usuario) return;

   db.ref(`${clave}/${usuario}`).set(datos);
}


function leerDeNube(clave, callback){
   const usuario = localStorage.getItem("usuarioActivo");
   if(!usuario) return;

   db.ref(`${clave}/${usuario}`).once("value", snap=>{
      callback(snap.val());
   });
}



document.addEventListener("DOMContentLoaded",()=>{

   // Estado inicial
   app.style.display = "none";
   loginScreen.style.display = "flex";

   // Si hay usuario activo
   if(localStorage.getItem("usuarioActivo")){

      loginScreen.style.display = "none";
      app.style.display = "block";

      mostrarUsuarioActivo();

      leerDeNube("prestamos", data=>{
         if(data){
            prestamos = data;
            localStorage.setItem("prestamos", JSON.stringify(data));
            mostrarPrestamos();
         }
      });
   }

});



leerDeNube("usuarios", data => {
   if (data) {
      localStorage.setItem("usuarios", JSON.stringify(data));
   } else {
      localStorage.setItem("usuarios", JSON.stringify([]));
      guardarEnNube("usuarios", []);
   }
});






// VARIABLES GLOBALES
let prestamos = JSON.parse(localStorage.getItem('prestamos')) || [];
const addBtn = document.getElementById('addBtn');
const modal = document.getElementById('modal');
const emptyMsg = document.getElementById('emptyMsg');
const reportBtn = document.getElementById('reportBtn');
const reportSection = document.getElementById('reportSection');
const yearSelector = document.getElementById('yearSelector');

// CONFIGURACIÓN INICIAL
document.addEventListener('DOMContentLoaded', () => {
    // Establecer fecha actual por defecto en el input
    const fechaInput = document.getElementById('fechaOtorgamiento');
    if (fechaInput) {
        fechaInput.value = new Date().toISOString().split('T')[0];
    }

    // Asignar eventos a botones
    if (addBtn) addBtn.onclick = abrirModalNuevo;
    if (reportBtn) reportBtn.onclick = toggleReportSection;

    // Cargar años disponibles para el informe
    cargarAniosDisponibles();
    
    // Cargar préstamos al iniciar
    mostrarPrestamos();
});

// FUNCIONES DE MODAL
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
    if (montoInput) montoInput.value = '';
    if (cuotasInput) cuotasInput.value = '';
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

// FUNCIONES DE GESTIÓN DE CUOTAS
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
            default:
                fecha.setMonth(fecha.getMonth() + 1);
        }
        return fecha;
    };

    // Generar cada cuota
    for (let i = 1; i <= cantidadCuotas; i++) {
        fechaVencimiento = incrementarFecha(new Date(fechaVencimiento), frecuencia);
        cuotas.push({
            numero: i,
            fechaVencimiento: fechaVencimiento.toISOString().split('T')[0],
            pagada: false,
            fechaPago: null
        });
    }

    return cuotas;
}

function calcularInteresAtraso(cuota, montoCuotaBase) {
    if (cuota.pagada) return 0;

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
        seccion.style.display = seccion.style.display === 'block' ? 'none' : 'block';
    }
}

function cambiarEstadoCuota(prestamoId, cuotaNumero, nuevoEstado) {
    const prestamoIndex = prestamos.findIndex(p => p.id === prestamoId);
    if (prestamoIndex === -1) return;

    const cuotaIndex = prestamos[prestamoIndex].cuotas.findIndex(c => c.numero === cuotaNumero);
    if (cuotaIndex === -1) return;

    prestamos[prestamoIndex].cuotas[cuotaIndex].pagada = nuevoEstado;
   prestamos[prestamoIndex].cuotas[cuotaIndex].fechaPago = nuevoEstado 
        ? new Date().toLocaleDateString('en-CA')
        : null;


    // Guardar cambios en localStorage
    localStorage.setItem('prestamos', JSON.stringify(prestamos));
   guardarEnNube("prestamos", prestamos);



    mostrarPrestamos();
    cargarAniosDisponibles(); // Actualizar años si hay nuevas cuotas pagadas
}

// FUNCIONES DE GESTIÓN DE PRÉSTAMOS
function borrarPrestamo(id) {
    if (confirm('¿Estás seguro de borrar este préstamo? Esta acción no se puede deshacer.')) {
       prestamos = prestamos.filter(
   p => p.id !== id || p.usuario !== localStorage.getItem("usuarioActivo")
);

        localStorage.setItem('prestamos', JSON.stringify(prestamos));
        guardarEnNube("prestamos", prestamos);


        mostrarPrestamos();
        cargarAniosDisponibles(); // Actualizar años después de borrar
        generarInformeMensual(); // Actualizar informe si está abierto
    }
}

function guardarPrestamo() {
    const prestamoIdInput = document.getElementById('prestamoId');
    const nombreInput = document.getElementById('nombre');
    const fechaInput = document.getElementById('fechaOtorgamiento');
    const montoInput = document.getElementById('monto');
    const cuotasInput = document.getElementById('cuotas');
    const frecuenciaSelect = document.getElementById('frecuenciaPago');
 
    const montoOriginalInput = document.getElementById('montoOriginal');

if (!montoOriginalInput) {
    alert("No existe el campo montoOriginal en el HTML");
    return;
}

const montoOriginal = parseFloat(montoOriginalInput.value);


if (isNaN(montoOriginal) || montoOriginal <= 0) {
    alert('Ingresa un monto original válido');
    montoOriginalInput.focus();
    return;
}


    // Validar que existan todos los inputs
    if (!nombreInput || !fechaInput || !montoInput || !cuotasInput || !frecuenciaSelect) {
        alert('Error en los elementos del formulario');
        return;
    }

    const id = prestamoIdInput.value;
    const nombre = nombreInput.value.trim();
    const fechaOtorgamiento = fechaInput.value;
    const monto = parseFloat(montoInput.value);
    const cantidadCuotas = parseInt(cuotasInput.value);
    const frecuenciaPago = frecuenciaSelect.value;

    // Validar datos ingresados
    if (!nombre) {
        alert('Ingresa el nombre del cliente');
        nombreInput.focus();
        return;
    }

    if (!fechaOtorgamiento) {
        alert('Selecciona la fecha de otorgamiento');
        fechaInput.focus();
        return;
    }

    if (isNaN(monto) || monto <= 0) {
        alert('Ingresa un monto válido mayor a cero');
        montoInput.focus();
        return;
    }

    if (isNaN(cantidadCuotas) || cantidadCuotas <= 0) {
        alert('Ingresa una cantidad de cuotas válida mayor a cero');
        cuotasInput.focus();
        return;
    }

    const montoCuotaBase = parseFloat((monto / cantidadCuotas).toFixed(2));
    const cuotas = generarFechasCuotas(fechaOtorgamiento, cantidadCuotas, frecuenciaPago);

    if (id) {
        // Editar préstamo existente
        const prestamoIndex = prestamos.findIndex(p => p.id === parseInt(id));
        if (prestamoIndex !== -1) {
            prestamos[prestamoIndex] = {
    id: parseInt(id),
    usuario: prestamos[prestamoIndex].usuario,
    nombre,
    fechaOtorgamiento,
    monto,
    cantidadCuotas,
    frecuenciaPago,
    montoCuotaBase,
    montoOriginal,
    cuotas
};
        }
    } else {
        // Agregar nuevo préstamo
        prestamos.push({
    id: Date.now(),
    usuario: localStorage.getItem("usuarioActivo"),
    nombre: nombre,
    fechaOtorgamiento: fechaOtorgamiento,
    monto: monto,
    cantidadCuotas: cantidadCuotas,
    frecuenciaPago: frecuenciaPago,
    montoCuotaBase: montoCuotaBase,
    montoOriginal: montoOriginal,
    cuotas: cuotas
});

    }

    // Guardar y actualizar vista
    localStorage.setItem('prestamos', JSON.stringify(prestamos));
    guardarEnNube("prestamos", prestamos);


    mostrarPrestamos();
    cargarAniosDisponibles(); // Actualizar años después de guardar
    cerrarModal();
}

// FUNCIÓN DE VISUALIZACIÓN DE PRÉSTAMOS
function mostrarPrestamos() {

const usuario = localStorage.getItem("usuarioActivo");

const prestamosUsuario = prestamos.filter(
   p => p.usuario === usuario
);


    if (emptyMsg) {
       emptyMsg.style.display = prestamosUsuario.length === 0 ? 'block' : 'none';

    }

    const container = document.getElementById('container');
    if (!container) return;

    container.innerHTML = '';

    prestamosUsuario.forEach(p => {

        const estaFinalizado = p.cuotas.every(c => c.pagada);
        const estadoClase = estaFinalizado ? 'estado-finalizado' : 'estado-activo';
        const estadoTexto = estaFinalizado ? 'FINALIZADO' : 'ACTIVO';
         

        const card = document.createElement('div');
        card.className = 'card';
        
        // Construir HTML completo de la tarjeta
        card.innerHTML = `
           <h3 class="cliente-nombre" onclick="toggleDetalle(${p.id})">

                 ▶ ${p.nombre}
                <span class="estado-prestamo ${estadoClase}">${estadoTexto}</span>
            </h3>
          <div class="detalle-prestamo" id="detalle-${p.id}">

                <p>Fecha de otorgamiento: ${p.fechaOtorgamiento}</p>
                <p>Monto total: $${p.monto.toFixed(2)}</p>
                <p>Frecuencia de pago: ${p.frecuenciaPago}</p>
                <p>Cantidad de cuotas: ${p.cantidadCuotas}</p>
                <p>Monto cuota base: $${p.montoCuotaBase.toFixed(2)}</p>
          <p>Monto original: $${(p.montoOriginal || 0).toFixed(2)}</p>

            </div>
            <div class="cuotas-seccion" id="cuotas-${p.id}">
                <h4>Detalle de cuotas:</h4>
                ${p.cuotas.map(c => {
                    const interes = calcularInteresAtraso(c, p.montoCuotaBase);
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
                                    `<p class="cuota-atraso">Interés por atraso (${Math.floor((new Date() - new Date(c.fechaVencimiento)) / (1000 * 60 * 60 * 24))} días): $${interes.toFixed(2)}</p>` 
                                    : ''
                                }
                                <p class="cuota-total">Total a pagar: $${total.toFixed(2)}</p>
                              
                            </div>
                            <div class="cuota-acciones">
                                ${c.pagada ? 
                                    `<button class="btn-desabonar" onclick="cambiarEstadoCuota(${p.id}, ${c.numero}, false)">Marcar como pendiente</button>` 
                                    : `<button class="btn-abonar" onclick="cambiarEstadoCuota(${p.id}, ${c.numero}, true)">Marcar como abonada</button>`
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



// FUNCIONES DEL INFORME MENSUAL
function toggleReportSection() {
    if (!reportSection) return;
    
    if (reportSection.style.display === 'block') {
        reportSection.style.display = 'none';
    } else {
        reportSection.style.display = 'block';
        generarInformeMensual(); // Generar informe al abrir
    }
}

function cargarAniosDisponibles() {
    if (!yearSelector) return;

    // Obtener todos los años con cuotas pagadas + año actual
    const años = new Set();
    const añoActual = new Date().getFullYear();
    años.add(añoActual);

    const usuario = localStorage.getItem("usuarioActivo");

prestamos
 .filter(p => p.usuario === usuario)
 .forEach(p => {
        p.cuotas.forEach(c => {
            if (c.pagada && c.fechaPago) {
                const año = new Date(c.fechaPago).getFullYear();
                años.add(año);
            }
        });
    });

    // Limpiar selector y agregar opciones
    yearSelector.innerHTML = '';
    Array.from(años).sort((a, b) => b - a).forEach(año => {
        const option = document.createElement('option');
        option.value = año;
        option.textContent = año;
        yearSelector.appendChild(option);
    });
}

function generarInformeMensual() {

    const reportData = document.getElementById('reportData');
    if (!reportData || !yearSelector) return;

    const añoSeleccionado = parseInt(yearSelector.value);

    const meses = [
        'Enero','Febrero','Marzo','Abril','Mayo','Junio',
        'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
    ];

    const datosInforme = meses.map(() => ({ 
    cantidad: 0, 
    monto: 0,
    ganancia: 0
}));


    const usuario = localStorage.getItem("usuarioActivo");

    prestamos
        .filter(p => p.usuario === usuario)
        .forEach(p => {
            p.cuotas.forEach(c => {

                if (c.pagada && c.fechaPago) {

                    const partes = c.fechaPago.split("-");
                    const añoPago = parseInt(partes[0]);
                    const mesPago = parseInt(partes[1]) - 1;

                    if (añoPago === añoSeleccionado) {

                       const totalCuota = p.montoCuotaBase;

// Cálculo de ganancia por cuota
const costoRealCuota = p.montoOriginal / p.cuotas.length;
const gananciaCuota = totalCuota - costoRealCuota;

datosInforme[mesPago].cantidad++;
datosInforme[mesPago].monto += totalCuota;
datosInforme[mesPago].ganancia += gananciaCuota;

                    }
                }

            });
        });

    // Render
    reportData.innerHTML = "";

    const hayDatos = datosInforme.some(m => m.cantidad > 0);
    if (!hayDatos) {
        reportData.innerHTML = "<div>No hay cuotas pagadas</div>";
        return;
    }

    datosInforme.forEach((m, i) => {
        if (m.cantidad > 0) {
            reportData.innerHTML += `
                <div class="report-month-card">
                    <h4>${meses[i]}</h4>
                    <p>Cuotas pagadas: ${m.cantidad}</p>
                  <p>Monto total: $${m.monto.toFixed(2)}</p>
<p>Ganancia: $${m.ganancia.toFixed(2)}</p>

                </div>
            `;
        }
    });

  const totalCuotas = datosInforme.reduce((s,m)=>s+m.cantidad,0);
const totalMonto = datosInforme.reduce((s,m)=>s+m.monto,0);
const totalGanancia = datosInforme.reduce((s,m)=>s+m.ganancia,0);


    reportData.innerHTML += `
        <div class="report-month-card total">
            <h4>TOTAL ${añoSeleccionado}</h4>
            <p>Total cuotas: ${totalCuotas}</p>
            <p>Total monto: $${totalMonto.toFixed(2)}</p>
<p>Total ganancia: $${totalGanancia.toFixed(2)}</p>

        </div>
    `;
}

    
function login(){

    const userInput = document.getElementById("user");
    const passInput = document.getElementById("pass");

    if(!userInput || !passInput){
        alert("Inputs de login no encontrados");
        return;
    }

    const u = userInput.value.trim();
    const p = passInput.value.trim();

    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    const existe = usuarios.find(
        x => x.user === u && x.pass === p
    );

    if(existe){

        localStorage.setItem("usuarioActivo", u);

        leerDeNube("prestamos", data=>{
            prestamos = data || [];
            localStorage.setItem("prestamos", JSON.stringify(prestamos));
            mostrarPrestamos();
        });

        mostrarUsuarioActivo();

        loginScreen.classList.add("fadeOut");

        setTimeout(()=>{
            loginScreen.style.display="none";
            app.style.display="block";
        },600);

    }else{
        msg.textContent="Usuario o contraseña incorrectos";
    }
}


function abrirRegistro(){
   modalRegistro.style.display="flex";
}

function cerrarRegistro(){
   modalRegistro.style.display="none";
}

function crearUsuario(){

   const newUserInput = document.getElementById("newUser");
   const newPassInput = document.getElementById("newPassUser");
   const preguntaInput = document.getElementById("preguntaUser");
   const respuestaInput = document.getElementById("respuestaUser");

   if(!newUserInput || !newPassInput || !preguntaInput || !respuestaInput){
      alert("Campos de registro no encontrados");
      return;
   }

   const u = newUserInput.value.trim();
   const p = newPassInput.value.trim();
   const preg = preguntaInput.value.trim();
   const resp = respuestaInput.value.trim();

   if(!u || !p || !preg || !resp){
     alert("Completa todos los campos");
     return;
   }

   const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

   if(usuarios.some(x => x.user === u)){
     alert("Ese usuario ya existe");
     return;
   }

   usuarios.push({
     user: u,
     pass: p,
     pregunta: preg,
     respuesta: resp.toLowerCase()
   });

   localStorage.setItem("usuarios", JSON.stringify(usuarios));
   guardarEnNube("usuarios", usuarios);

   alert("Usuario creado");
   cerrarRegistro();
}

function guardarNuevaClave(){

   const usuario = changeUser.value.trim();
   const claveActual = oldPass.value;
   const nuevaClave = newPass.value;

   if(!usuario || !claveActual || !nuevaClave){
      alert("Completa todos los campos");
      return;
   }

   const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

   const userObj = usuarios.find(u => u.user === usuario);

   if(!userObj){
      alert("Usuario no existe");
      return;
   }

   if(userObj.pass !== claveActual){
      alert("Clave actual incorrecta");
      return;
   }

   userObj.pass = nuevaClave;
   localStorage.setItem("usuarios", JSON.stringify(usuarios));
   guardarEnNube("usuarios", usuarios);


   alert("Contraseña actualizada correctamente");

   changeUser.value="";
   oldPass.value="";
   newPass.value="";

   cerrarCambio();
}


function recuperarClave(){

   const u = prompt("Usuario:");
   if(!u) return;

  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

   const userObj = usuarios.find(x => x.user === u);

   if(!userObj){
      alert("Usuario no existe");
      return;
   }

   const resp = prompt(userObj.pregunta);

   if(!resp){
      alert("Operación cancelada");
      return;
   }

   if(resp.toLowerCase() === userObj.respuesta){
      alert("Tu contraseña es: " + userObj.pass);
   }else{
      alert("Respuesta incorrecta");
   }
}

function logout(){
   localStorage.removeItem("usuarioActivo");
   location.reload();
}




function exportarPrestamos(){

 const usuario = localStorage.getItem("usuarioActivo");

 const datos = prestamos.filter(
    p => p.usuario === usuario
 );

 if(datos.length===0){
   alert("No hay préstamos para exportar");
   return;
 }

 const archivo = new Blob(
   [JSON.stringify(datos,null,2)],
   {type:"application/json"}
 );

 const link = document.createElement("a");
 link.href = URL.createObjectURL(archivo);
 link.download = "prestamos_"+usuario+".json";
 link.click();
}


async function exportarPDF(){

 const { jsPDF } = window.jspdf;
 const pdf = new jsPDF();

 const usuario = localStorage.getItem("usuarioActivo");
 const datos = prestamos.filter(p=>p.usuario===usuario);

 if(datos.length===0){
   alert("No hay préstamos");
   return;
 }

 let y=10;
 pdf.text(`Préstamos de: ${usuario}`,10,y);
 y+=10;

 datos.forEach((p,i)=>{
   pdf.text(`${i+1}) ${p.nombre}`,10,y); y+=6;
   pdf.text(`Monto: $${p.monto}`,10,y); y+=6;
   pdf.text(`Cuotas: ${p.cantidadCuotas}`,10,y); y+=6;
   pdf.text(`Frecuencia: ${p.frecuenciaPago}`,10,y); y+=10;
   pdf.text(`montoCuotaBase: ${p.montoCuotaBase}`,10,y); y+=10;
    pdf.text(`fechaOtorgamiento: ${p.fechaOtorgamiento}`,10,y); y+=10;
   

   if(y>270){
     pdf.addPage();
     y=10;
   }
 });
 pdf.save(`prestamos_${usuario}.pdf`);
}

function abrirCambio(){
   document.getElementById("modalClave").style.display="flex";
}

function cerrarCambio(){
   document.getElementById("modalClave").style.display="none";
}

function mostrarUsuarioActivo(){
   const u = localStorage.getItem("usuarioActivo");
   if(u){
      const span = document.getElementById("usuarioMostrado");
      if(span){
         span.textContent = "👤 " + u;
      }
   }
}





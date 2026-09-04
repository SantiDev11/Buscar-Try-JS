/**
 * ============================================================================
 * EJERCICIO: BUSCADOR DE USUARIOS DE GITHUB
 * Tecnologías: HTML5 Semántico, CSS3, JavaScript Moderno (Fetch, Async/Await)
 * ============================================================================
 */

// 1. SELECCIÓN DE ELEMENTOS DEL DOM
const formulario = document.getElementById('formulario-usuario');
const inputUsuario = document.getElementById('input-usuario');
const btnBuscar = document.getElementById('btn-buscar');
const mensajeEstado = document.getElementById('mensaje-estado');

// Elementos de la tarjeta de usuario
const tarjetaUsuario = document.getElementById('tarjeta-usuario');
const avatarUsuario = document.getElementById('avatar-usuario');
const nombreUsuario = document.getElementById('nombre-usuario');
const loginUsuario = document.getElementById('login-usuario');
const reposUsuario = document.getElementById('repos-usuario');
const enlaceGithub = document.getElementById('enlace-github');

// 2. EXPRESIÓN REGULAR PARA VALIDAR NOMBRE DE USUARIO DE GITHUB
// Reglas oficiales de GitHub:
// - Solo caracteres alfanuméricos y guiones medios (-).
// - No puede comenzar ni terminar con guion medio.
// - No puede contener dos guiones seguidos ni superar los 39 caracteres.
// - No permite espacios ni caracteres como '@'.
const REGEX_GITHUB_USERNAME = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

/**
 * Muestra un mensaje de error visible para el usuario en la interfaz.
 * @param {string} mensaje - Texto descriptivo del error.
 */
function mostrarError(mensaje) {
  mensajeEstado.textContent = mensaje;
  mensajeEstado.className = 'mensaje-estado mensaje-estado--visible mensaje-estado--error';
  tarjetaUsuario.hidden = true;
}

/**
 * Activa el estado visual de carga y deshabilita temporalmente el botón.
 */
function mostrarCarga() {
  mensajeEstado.textContent = 'Buscando usuario en GitHub...';
  mensajeEstado.className = 'mensaje-estado mensaje-estado--visible mensaje-estado--cargando';
  btnBuscar.disabled = true;
  tarjetaUsuario.hidden = true;
}

/**
 * Restaura el estado del botón y limpia el indicador de carga.
 */
function ocultarCarga() {
  btnBuscar.disabled = false;
  // Si estaba en estado de carga, se oculta el mensaje
  if (mensajeEstado.classList.contains('mensaje-estado--cargando')) {
    mensajeEstado.className = 'mensaje-estado';
    mensajeEstado.textContent = '';
  }
}

/**
 * Renderiza los datos del usuario en el DOM de forma segura mediante textContent.
 * @param {Object} usuario - Objeto recibido de la API de GitHub.
 */
function renderizarUsuario(usuario) {
  // Ocultar cualquier mensaje de error o estado previo
  mensajeEstado.className = 'mensaje-estado';
  mensajeEstado.textContent = '';

  // Asignar datos a los elementos correspondientes
  // Si el usuario no tiene nombre público configurado, se muestra su nombre de cuenta (login)
  nombreUsuario.textContent = usuario.name || usuario.login;
  loginUsuario.textContent = `@${usuario.login}`;
  reposUsuario.textContent = usuario.public_repos;

  // Atributos de imagen
  avatarUsuario.src = usuario.avatar_url;
  avatarUsuario.alt = `Avatar de ${usuario.login}`;

  // Atributos del enlace al perfil
  enlaceGithub.href = usuario.html_url;

  // Mostrar la tarjeta en pantalla
  tarjetaUsuario.hidden = false;
}

/**
 * Función principal asíncrona encargada de consultar la API oficial de GitHub.
 * @param {string} username - Nombre de usuario previamente validado.
 */
async function buscarUsuario(username) {
  console.log(`Iniciando fetch para "${username}"...`);

  try {
    const respuesta = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}`
    );

    // fetch() no rechaza la promesa ante códigos de error HTTP como 404 o 500.
    // Por ende, debemos comprobar explícitamente si respuesta.ok es true.
    if (!respuesta.ok) {
      if (respuesta.status === 404) {
        throw new Error('USUARIO_NO_ENCONTRADO');
      }
      throw new Error(`ERROR_HTTP_${respuesta.status}`);
    }

    // Convertir el cuerpo de la respuesta a un objeto JSON utilizable
    const usuario = await respuesta.json();
    renderizarUsuario(usuario);

  } catch (error) {
    // Clasificación y manejo seguro de los errores
    if (error.message === 'USUARIO_NO_ENCONTRADO') {
      mostrarError('No se encontró el usuario de GitHub.');
    } else if (error instanceof TypeError || error.name === 'TypeError') {
      // TypeError es lanzado por fetch cuando existe una falla de red (sin conexión, DNS, etc.)
      mostrarError('No se pudo conectar con GitHub. Inténtalo nuevamente.');
    } else {
      // Error inesperado: mensaje amigable sin exponer trazas técnicas al usuario
      mostrarError('Ocurrió un error inesperado. Por favor, intenta de nuevo.');
    }

    console.error('Detalle técnico del error:', error);

  } finally {
    // El bloque finally se ejecuta SIEMPRE, ya sea que la petición haya sido exitosa o haya fallado
    ocultarCarga();
  }
}

// 3. CONTROLADOR DEL FORMULARIO Y VALIDACIÓN PREVIA AL FETCH
formulario.addEventListener('submit', (evento) => {
  evento.preventDefault();

  // Obtener el valor ingresado y eliminar espacios al inicio y final
  const usernameLimpio = inputUsuario.value.trim();

  // VALIDACIÓN 1: Campo vacío
  if (usernameLimpio === '') {
    mostrarError('Debes escribir un nombre de usuario.');
    inputUsuario.focus();
    return;
  }

  // VALIDACIÓN 2: Presencia del caracter '@'
  // IMPORTANTE: Se valida antes de la petición, sin usar catch.
  if (usernameLimpio.includes('@')) {
    mostrarError('Escribe un nombre de usuario de GitHub válido.');
    inputUsuario.focus();
    return;
  }

  // VALIDACIÓN 3: Caracteres o formato no permitido
  if (!REGEX_GITHUB_USERNAME.test(usernameLimpio)) {
    mostrarError('Escribe un nombre de usuario de GitHub válido.');
    inputUsuario.focus();
    return;
  }

  // Si todas las validaciones pasan, se muestra la carga y se realiza la consulta
  mostrarCarga();
  buscarUsuario(usernameLimpio);
});

/**
 * ============================================================================
 * EJERCICIO: BUSCADOR DE USUARIOS DE GITHUB
 * Tecnologías: HTML5 Semántico, CSS3, JavaScript Moderno (Fetch, Async/Await)
 * ============================================================================
 */

'use strict';

// 1. SELECCIÓN DE ELEMENTOS DEL DOM
const loaderInicial = document.getElementById('loader-inicial');

const formulario = document.getElementById('formulario-usuario');
const inputUsuario = document.getElementById('input-usuario');
const campoBusqueda = inputUsuario.closest('.barra-busqueda__campo');
const btnBuscar = document.getElementById('btn-buscar');
const btnBuscarTexto = btnBuscar.querySelector('.barra-busqueda__boton-texto');

const mensajeEstado = document.getElementById('mensaje-estado');
const mensajeIcono = document.getElementById('mensaje-icono');
const mensajeTexto = document.getElementById('mensaje-texto');
const estadoVacio = document.getElementById('estado-vacio');

// Tarjeta de perfil
const tarjetaUsuario = document.getElementById('tarjeta-usuario');
const avatarUsuario = document.getElementById('avatar-usuario');
const nombreUsuario = document.getElementById('nombre-usuario');
const loginUsuario = document.getElementById('login-usuario');
const bioUsuario = document.getElementById('bio-usuario');
const ubicacionUsuario = document.getElementById('ubicacion-usuario');
const ubicacionTexto = document.getElementById('ubicacion-texto');
const enlaceGithub = document.getElementById('enlace-github');

// Estadísticas
const seccionEstadisticas = document.getElementById('seccion-estadisticas');
const statRepos = document.getElementById('stat-repos');
const statSeguidores = document.getElementById('stat-seguidores');
const statSiguiendo = document.getElementById('stat-siguiendo');
const statConsultados = document.getElementById('stat-consultados');
const statEstrellas = document.getElementById('stat-estrellas');

// Repositorios
const seccionRepositorios = document.getElementById('seccion-repositorios');
const listaRepositorios = document.getElementById('lista-repositorios');
const repositoriosVacio = document.getElementById('repositorios-vacio');

// 2. EXPRESIÓN REGULAR PARA VALIDAR NOMBRE DE USUARIO DE GITHUB
// Reglas oficiales de GitHub:
// - Solo caracteres alfanuméricos y guiones medios (-).
// - No puede comenzar ni terminar con guion medio.
// - No puede contener dos guiones seguidos ni superar los 39 caracteres.
// - No permite espacios ni caracteres como '@'.
const REGEX_GITHUB_USERNAME = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

// Iconos fijos (definidos en el propio código, nunca con datos externos) para el sistema de mensajes.
const ICONOS_MENSAJE = {
  error: '<svg viewBox="0 0 24 24"><path d="M12 9v4m0 4h.01M10.3 3.9 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  exito: '<svg viewBox="0 0 24 24"><path d="m4 12.5 5 5L20 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  cargando: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-dasharray="34 20" stroke-linecap="round"/></svg>',
};

// Iconos de estrella y fork para las tarjetas de repositorio.
const ICONO_ESTRELLA = '<svg viewBox="0 0 24 24"><path d="m12 3 2.6 5.9 6.4.6-4.8 4.3 1.4 6.3L12 17l-5.6 3.1 1.4-6.3L3 9.5l6.4-.6L12 3Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';
const ICONO_FORK = '<svg viewBox="0 0 24 24"><circle cx="7" cy="6" r="2.1" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="17" cy="6" r="2.1" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="18" r="2.1" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M7 8.1V11a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3V8.1M12 14v2" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';

// Colores de lenguaje inspirados en los que GitHub usa en sus propios listados de repositorios.
const COLORES_LENGUAJE = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5', Java: '#b07219',
  HTML: '#e34c26', CSS: '#563d7c', Ruby: '#701516', Go: '#00ADD8', 'C++': '#f34b7d',
  C: '#555555', 'C#': '#178600', PHP: '#4F5D95', Shell: '#89e051', Rust: '#dea584',
  Swift: '#F05138', Kotlin: '#A97BFF', Vue: '#41b883', Dart: '#00B4AB',
};
const COLOR_LENGUAJE_DEFECTO = '#6e7681';

/**
 * ============================================================================
 * LOADER INICIAL DE LA PÁGINA
 * ============================================================================
 */

function ocultarLoaderInicial() {
  if (!loaderInicial || loaderInicial.classList.contains('loader-inicial--oculto')) {
    return;
  }
  loaderInicial.classList.add('loader-inicial--oculto');
  loaderInicial.addEventListener('transitionend', () => loaderInicial.remove(), { once: true });
  // Salvaguarda: si la transición no se dispara, se elimina igualmente.
  setTimeout(() => loaderInicial.remove(), 600);
}

// Pequeño retardo para que el loader sea perceptible antes de mostrar la app.
window.addEventListener('load', () => setTimeout(ocultarLoaderInicial, 400));
// Salvaguarda final: el loader nunca debe bloquear la página indefinidamente.
setTimeout(ocultarLoaderInicial, 4000);

/**
 * ============================================================================
 * SISTEMA DE MENSAJES DINÁMICOS (éxito, error, carga, validación)
 * ============================================================================
 */

let temporizadorMensaje = null;

/**
 * Muestra un mensaje contextual con icono, tipo visual y animación de entrada.
 * @param {'error'|'exito'|'cargando'} tipo
 * @param {string} texto
 * @param {{ autoOcultarMs?: number }} [opciones]
 */
function mostrarMensaje(tipo, texto, { autoOcultarMs } = {}) {
  clearTimeout(temporizadorMensaje);
  mensajeIcono.innerHTML = ICONOS_MENSAJE[tipo] || '';
  mensajeTexto.textContent = texto;
  mensajeEstado.className = `mensaje mensaje--visible mensaje--${tipo}`;

  if (autoOcultarMs) {
    temporizadorMensaje = setTimeout(ocultarMensaje, autoOcultarMs);
  }
}

/**
 * Oculta el mensaje contextual activo, con transición de salida.
 */
function ocultarMensaje() {
  clearTimeout(temporizadorMensaje);
  mensajeEstado.className = 'mensaje';
  mensajeTexto.textContent = '';
  mensajeIcono.innerHTML = '';
}

/**
 * Muestra un mensaje de error visible para el usuario en la interfaz.
 * @param {string} mensaje - Texto descriptivo del error.
 */
function mostrarError(mensaje) {
  mostrarMensaje('error', mensaje);
}

/**
 * ============================================================================
 * VALIDACIÓN Y UTILIDADES DE INTERFAZ
 * ============================================================================
 */

/**
 * Valida el nombre de usuario ANTES de realizar cualquier petición a la API.
 * @param {string} username
 * @returns {{ valido: boolean, mensaje: string }}
 */
function validarUsuario(username) {
  if (username === '') {
    return { valido: false, mensaje: 'Debes escribir un nombre de usuario.' };
  }

  if (username.includes('@')) {
    return { valido: false, mensaje: 'No utilices "@". Escribe solamente el nombre de usuario.' };
  }

  if (!REGEX_GITHUB_USERNAME.test(username)) {
    return { valido: false, mensaje: 'Escribe un nombre de usuario de GitHub válido.' };
  }

  return { valido: true, mensaje: '' };
}

/**
 * Valida en vivo mientras el usuario escribe, sin esperar al envío del formulario.
 * Marca visualmente el campo y muestra u oculta el mensaje de validación.
 */
function validarEnVivo() {
  const valor = inputUsuario.value.trim();

  if (valor === '') {
    campoBusqueda.classList.remove('barra-busqueda__campo--error');
    if (mensajeEstado.classList.contains('mensaje--error')) {
      ocultarMensaje();
    }
    return;
  }

  const validacion = validarUsuario(valor);
  if (validacion.valido) {
    campoBusqueda.classList.remove('barra-busqueda__campo--error');
    if (mensajeEstado.classList.contains('mensaje--error')) {
      ocultarMensaje();
    }
  } else {
    campoBusqueda.classList.add('barra-busqueda__campo--error');
    mostrarMensaje('error', validacion.mensaje);
  }
}

inputUsuario.addEventListener('input', validarEnVivo);

/**
 * Limpia los resultados de una búsqueda anterior antes de lanzar una nueva.
 */
function limpiarResultados() {
  tarjetaUsuario.hidden = true;
  seccionEstadisticas.hidden = true;
  seccionRepositorios.hidden = true;
  listaRepositorios.replaceChildren();
  estadoVacio.hidden = false;
}

/**
 * Activa el estado visual de carga y deshabilita temporalmente el botón.
 */
function mostrarLoading() {
  estadoVacio.hidden = true;
  mostrarMensaje('cargando', 'Buscando usuario en GitHub…');
  btnBuscar.disabled = true;
  btnBuscar.setAttribute('aria-busy', 'true');
  btnBuscarTexto.textContent = 'Buscando…';
}

/**
 * Restaura el estado del botón y limpia el indicador de carga (si sigue activo).
 */
function ocultarLoading() {
  btnBuscar.disabled = false;
  btnBuscar.removeAttribute('aria-busy');
  btnBuscarTexto.textContent = 'Buscar';
  if (mensajeEstado.classList.contains('mensaje--cargando')) {
    ocultarMensaje();
  }
}

/**
 * ============================================================================
 * CONSUMO DE LA API DE GITHUB
 * ============================================================================
 */

/**
 * Consulta el perfil público de un usuario en la API oficial de GitHub.
 * @param {string} username - Nombre de usuario previamente validado.
 * @returns {Promise<Object>}
 */
async function buscarUsuario(username) {
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

  return respuesta.json();
}

/**
 * Consulta los repositorios públicos de un usuario en la API oficial de GitHub.
 * @param {string} username - Nombre de usuario previamente validado.
 * @returns {Promise<Array<Object>>}
 */
async function obtenerRepositorios(username) {
  const respuesta = await fetch(
    `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100`
  );

  if (!respuesta.ok) {
    throw new Error(`ERROR_HTTP_${respuesta.status}`);
  }

  return respuesta.json();
}

/**
 * ============================================================================
 * RENDERIZADO EN EL DOM (sin innerHTML para datos externos)
 * ============================================================================
 */

/**
 * Renderiza los datos del perfil en la tarjeta de usuario.
 * @param {Object} usuario - Objeto recibido de la API de GitHub.
 */
function mostrarUsuario(usuario) {
  avatarUsuario.src = usuario.avatar_url;
  avatarUsuario.alt = `Avatar de ${usuario.login}`;

  // Si el usuario no tiene nombre público configurado, se muestra su login.
  nombreUsuario.textContent = usuario.name || usuario.login;
  loginUsuario.textContent = `@${usuario.login}`;

  if (usuario.bio) {
    bioUsuario.textContent = usuario.bio;
    bioUsuario.hidden = false;
  } else {
    bioUsuario.hidden = true;
  }

  if (usuario.location) {
    ubicacionTexto.textContent = usuario.location;
    ubicacionUsuario.hidden = false;
  } else {
    ubicacionUsuario.hidden = true;
  }

  enlaceGithub.href = usuario.html_url;

  estadoVacio.hidden = true;
  tarjetaUsuario.hidden = false;
}

/**
 * Calcula y renderiza las estadísticas del perfil y de los repositorios obtenidos.
 * @param {Object} usuario
 * @param {Array<Object>} repos
 */
function mostrarEstadisticas(usuario, repos) {
  const totalEstrellas = repos.reduce((total, repo) => total + repo.stargazers_count, 0);

  statRepos.textContent = usuario.public_repos;
  statSeguidores.textContent = usuario.followers;
  statSiguiendo.textContent = usuario.following;
  statConsultados.textContent = repos.length;
  statEstrellas.textContent = totalEstrellas;

  seccionEstadisticas.hidden = false;
}

/**
 * Crea el elemento de lista correspondiente a un repositorio.
 * @param {Object} repo
 * @param {number} indice - Posición en la lista, usada para escalonar la animación.
 * @returns {HTMLLIElement}
 */
function crearTarjetaRepositorio(repo, indice) {
  const item = document.createElement('li');

  const articulo = document.createElement('article');
  articulo.className = 'repositorio';
  articulo.style.animationDelay = `${Math.min(indice * 45, 360)}ms`;

  const nombre = document.createElement('h3');
  nombre.className = 'repositorio__nombre';

  const enlaceNombre = document.createElement('a');
  enlaceNombre.href = repo.html_url;
  enlaceNombre.target = '_blank';
  enlaceNombre.rel = 'noopener noreferrer';
  enlaceNombre.textContent = repo.name;
  nombre.append(enlaceNombre);

  const descripcion = document.createElement('p');
  descripcion.className = 'repositorio__descripcion';
  descripcion.textContent = repo.description || 'Sin descripción disponible.';

  const meta = document.createElement('div');
  meta.className = 'repositorio__meta';

  const lenguaje = document.createElement('span');
  const puntoLenguaje = document.createElement('span');
  puntoLenguaje.className = 'repositorio__lenguaje-punto';
  puntoLenguaje.style.backgroundColor = COLORES_LENGUAJE[repo.language] || COLOR_LENGUAJE_DEFECTO;
  lenguaje.append(puntoLenguaje, document.createTextNode(repo.language || 'Sin lenguaje'));

  const estrellas = document.createElement('span');
  estrellas.innerHTML = ICONO_ESTRELLA; // Icono fijo del código, no proviene de la API.
  estrellas.append(document.createTextNode(String(repo.stargazers_count)));

  const forks = document.createElement('span');
  forks.innerHTML = ICONO_FORK; // Icono fijo del código, no proviene de la API.
  forks.append(document.createTextNode(String(repo.forks_count)));

  meta.append(lenguaje, estrellas, forks);
  articulo.append(nombre, descripcion, meta);
  item.append(articulo);

  return item;
}

/**
 * Renderiza la lista de repositorios públicos, ordenados por estrellas descendente.
 * @param {Array<Object>} repos
 */
function mostrarRepositorios(repos) {
  listaRepositorios.replaceChildren();

  if (repos.length === 0) {
    repositoriosVacio.hidden = false;
    listaRepositorios.hidden = true;
  } else {
    repositoriosVacio.hidden = true;
    listaRepositorios.hidden = false;

    const repositoriosOrdenados = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count);

    const fragmento = document.createDocumentFragment();
    repositoriosOrdenados.forEach((repo, indice) => fragmento.append(crearTarjetaRepositorio(repo, indice)));
    listaRepositorios.append(fragmento);
  }

  seccionRepositorios.hidden = false;
}

/**
 * ============================================================================
 * CONTROLADOR PRINCIPAL DEL FORMULARIO
 * ============================================================================
 */
formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const username = inputUsuario.value.trim();

  // VALIDACIÓN PREVIA: ocurre siempre antes de cualquier fetch, sin usar catch.
  const validacion = validarUsuario(username);
  if (!validacion.valido) {
    campoBusqueda.classList.add('barra-busqueda__campo--error');
    limpiarResultados();
    mostrarError(validacion.mensaje);
    inputUsuario.focus();
    return;
  }

  campoBusqueda.classList.remove('barra-busqueda__campo--error');
  limpiarResultados();
  mostrarLoading();

  try {
    const usuario = await buscarUsuario(username);
    const repos = await obtenerRepositorios(username);

    mostrarUsuario(usuario);
    mostrarEstadisticas(usuario, repos);
    mostrarRepositorios(repos);
    mostrarMensaje('exito', 'Usuario encontrado correctamente.', { autoOcultarMs: 1800 });

  } catch (error) {
    limpiarResultados();

    if (error.message === 'USUARIO_NO_ENCONTRADO') {
      mostrarError('No se encontró ningún usuario con ese nombre en GitHub.');
    } else if (error instanceof TypeError) {
      // TypeError es lanzado por fetch cuando existe una falla de red (sin conexión, DNS, etc.)
      mostrarError('No se pudo conectar con GitHub. Revisa tu conexión e inténtalo nuevamente.');
    } else {
      // Error inesperado: mensaje amigable sin exponer trazas técnicas al usuario
      mostrarError('Ocurrió un error inesperado. Por favor, intenta de nuevo.');
    }

    console.error('Detalle técnico del error:', error);

  } finally {
    // El bloque finally se ejecuta SIEMPRE, ya sea que la petición haya sido exitosa o haya fallado.
    ocultarLoading();
  }
});

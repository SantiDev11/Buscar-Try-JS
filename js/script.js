/**
 * ============================================================================
 * EJERCICIO: BUSCADOR DE USUARIOS DE GITHUB
 * Tecnologías: HTML5 Semántico, CSS3 Moderno, JavaScript ES6+ (Fetch, Async/Await)
 * ============================================================================
 */

'use strict';

// ============================================================================
// 1. SELECCIÓN DE ELEMENTOS DEL DOM
// ============================================================================
const loaderInicial = document.getElementById('loader-inicial');

// Consola y Formulario
const formulario = document.getElementById('formulario-usuario');
const inputUsuario = document.getElementById('input-usuario');
const campoBusqueda = inputUsuario.closest('.barra-busqueda__campo');
const iconoValido = document.getElementById('icono-valido');
const btnBuscar = document.getElementById('btn-buscar');
const btnSpinner = document.getElementById('btn-spinner');
const btnBuscarTexto = document.getElementById('btn-buscar-texto');

// Mensajes contextuales y estado inicial
const mensajeEstado = document.getElementById('mensaje-estado');
const mensajeIcono = document.getElementById('mensaje-icono');
const mensajeTexto = document.getElementById('mensaje-texto');
const estadoVacio = document.getElementById('estado-vacio');
const chipsSugerencias = document.querySelectorAll('.sugerencias__chip');

// Tarjeta de Perfil
const tarjetaUsuario = document.getElementById('tarjeta-usuario');
const avatarUsuario = document.getElementById('avatar-usuario');
const nombreUsuario = document.getElementById('nombre-usuario');
const loginUsuario = document.getElementById('login-usuario');
const bioUsuario = document.getElementById('bio-usuario');
const ubicacionUsuario = document.getElementById('ubicacion-usuario');
const ubicacionTexto = document.getElementById('ubicacion-texto');
const empresaUsuario = document.getElementById('empresa-usuario');
const empresaTexto = document.getElementById('empresa-texto');
const blogUsuario = document.getElementById('blog-usuario');
const blogEnlace = document.getElementById('blog-enlace');
const enlaceGithub = document.getElementById('enlace-github');

// Sección de Estadísticas (4 métricas)
const seccionEstadisticas = document.getElementById('seccion-estadisticas');
const statRepos = document.getElementById('stat-repos');
const statSeguidores = document.getElementById('stat-seguidores');
const statSiguiendo = document.getElementById('stat-siguiendo');
const statEstrellas = document.getElementById('stat-estrellas');

// Sección de Repositorios
const seccionRepositorios = document.getElementById('seccion-repositorios');
const repositoriosContador = document.getElementById('repositorios-contador');
const listaRepositorios = document.getElementById('lista-repositorios');
const repositoriosVacio = document.getElementById('repositorios-vacio');

// ============================================================================
// 2. CONSTANTES Y CONFIGURACIONES
// ============================================================================

// Formato de números con separador de miles en español (ej. 23.930)
const formateadorNumeros = new Intl.NumberFormat('es-ES');

// Expresión regular para validar nombres de usuario oficiales de GitHub:
// - Solo caracteres alfanuméricos y guiones medios (-)
// - Longitud entre 1 y 39 caracteres
// - No puede iniciar ni terminar con guion
// - No puede tener dos guiones consecutivos
const REGEX_GITHUB_USERNAME = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

// Iconos vectoriales seguros (código propio, no de APIs externas)
const ICONOS_SISTEMA = {
  error: '<svg viewBox="0 0 24 24"><path d="M12 9v4m0 4h.01M10.3 3.9 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  validacion: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="m9.5 9.5 5 5m0-5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  exito: '<svg viewBox="0 0 24 24"><path d="m4 12.5 5 5L20 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  cargando: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-dasharray="34 20" stroke-linecap="round"/></svg>',
  info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 16v-4m0-4h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  estrella: '<svg viewBox="0 0 24 24"><path d="m12 3 2.6 5.9 6.4.6-4.8 4.3 1.4 6.3L12 17l-5.6 3.1 1.4-6.3L3 9.5l6.4-.6L12 3Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
  fork: '<svg viewBox="0 0 24 24"><circle cx="7" cy="6" r="2.1" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="17" cy="6" r="2.1" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="18" r="2.1" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M7 8.1V11a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3V8.1M12 14v2" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
};

// Paleta de colores oficiales para lenguajes comunes en GitHub
const COLORES_LENGUAJE = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Ruby: '#701516',
  Go: '#00ADD8',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  PHP: '#4F5D95',
  Shell: '#89e051',
  Rust: '#dea584',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Vue: '#41b883',
  Dart: '#00B4AB',
};
const COLOR_LENGUAJE_DEFECTO = '#6e7681';

// ============================================================================
// 3. LOADER INICIAL DE LA APLICACIÓN
// ============================================================================
function ocultarLoaderInicial() {
  if (!loaderInicial || loaderInicial.classList.contains('loader-inicial--oculto')) {
    return;
  }
  loaderInicial.classList.add('loader-inicial--oculto');
  loaderInicial.addEventListener('transitionend', () => loaderInicial.remove(), { once: true });
  // Salvaguarda: garantiza eliminación incluso si transitionend no se dispara
  setTimeout(() => {
    if (loaderInicial && loaderInicial.parentElement) {
      loaderInicial.remove();
    }
  }, 600);
}

// Al cargar los recursos de la página, ocultar con suave retardo
window.addEventListener('load', () => setTimeout(ocultarLoaderInicial, 350));
// Salvaguarda absoluta: nunca bloquear la pantalla más de 3 segundos
setTimeout(ocultarLoaderInicial, 3000);

// ============================================================================
// 4. SISTEMA DE MENSAJES DINÁMICOS Y TOAST
// ============================================================================
let temporizadorMensaje = null;

/**
 * Muestra un mensaje contextual con soporte para 5 estados:
 * 'exito' | 'error' | 'validacion' | 'cargando' | 'info'
 * @param {'exito'|'error'|'validacion'|'cargando'|'info'} tipo
 * @param {string} texto
 * @param {{ autoOcultarMs?: number }} [opciones]
 */
function mostrarMensaje(tipo, texto, { autoOcultarMs } = {}) {
  clearTimeout(temporizadorMensaje);

  mensajeIcono.innerHTML = ICONOS_SISTEMA[tipo] || '';
  mensajeTexto.textContent = texto;
  mensajeEstado.className = `mensaje mensaje--visible mensaje--${tipo}`;

  if (autoOcultarMs) {
    temporizadorMensaje = setTimeout(ocultarMensaje, autoOcultarMs);
  }
}

/**
 * Oculta el mensaje contextual activo con animación de salida.
 */
function ocultarMensaje() {
  clearTimeout(temporizadorMensaje);
  mensajeEstado.className = 'mensaje';
  mensajeTexto.textContent = '';
  mensajeIcono.innerHTML = '';
}

/**
 * Muestra un error visible para el usuario.
 * @param {string} mensaje
 */
function mostrarError(mensaje) {
  mostrarMensaje('error', mensaje);
}

// ============================================================================
// 5. VALIDACIÓN DINÁMICA
// ============================================================================

/**
 * Valida estrictamente el nombre de usuario ANTES de cualquier petición.
 * @param {string} username
 * @returns {{ valido: boolean, tipo: string, mensaje: string }}
 */
function validarUsuario(username) {
  if (!username || username.trim() === '') {
    return {
      valido: false,
      tipo: 'error',
      mensaje: 'Debes escribir un nombre de usuario.',
    };
  }

  const limpio = username.trim();

  if (limpio.includes('@')) {
    return {
      valido: false,
      tipo: 'validacion',
      mensaje: '❌ No utilices @. Escribe solamente el nombre de usuario.',
    };
  }

  if (/\s/.test(limpio)) {
    return {
      valido: false,
      tipo: 'validacion',
      mensaje: 'El nombre de usuario no debe contener espacios.',
    };
  }

  if (!REGEX_GITHUB_USERNAME.test(limpio)) {
    return {
      valido: false,
      tipo: 'validacion',
      mensaje: 'Escribe un nombre de usuario de GitHub válido.',
    };
  }

  return { valido: true, tipo: 'exito', mensaje: '' };
}

/**
 * Validador en vivo mientras el usuario teclea en el input.
 * Provee feedback visual instantáneo (clases de error/válido e iconos).
 */
function validarEnVivo() {
  const valor = inputUsuario.value;

  if (valor === '') {
    campoBusqueda.classList.remove('barra-busqueda__campo--error', 'barra-busqueda__campo--valido');
    iconoValido.hidden = true;
    if (mensajeEstado.classList.contains('mensaje--error') || mensajeEstado.classList.contains('mensaje--validacion')) {
      ocultarMensaje();
    }
    return;
  }

  const validacion = validarUsuario(valor);

  if (validacion.valido) {
    campoBusqueda.classList.remove('barra-busqueda__campo--error');
    campoBusqueda.classList.add('barra-busqueda__campo--valido');
    iconoValido.hidden = false;
    if (mensajeEstado.classList.contains('mensaje--error') || mensajeEstado.classList.contains('mensaje--validacion')) {
      ocultarMensaje();
    }
  } else {
    campoBusqueda.classList.remove('barra-busqueda__campo--valido');
    campoBusqueda.classList.add('barra-busqueda__campo--error');
    iconoValido.hidden = true;
    mostrarMensaje(validacion.tipo, validacion.mensaje);
  }
}

inputUsuario.addEventListener('input', validarEnVivo);

// ============================================================================
// 6. CONTROL DE ESTADOS DE CARGA Y RESULTADOS
// ============================================================================

/**
 * Limpia la pantalla de resultados anteriores.
 */
function limpiarResultados() {
  tarjetaUsuario.hidden = true;
  seccionEstadisticas.hidden = true;
  seccionRepositorios.hidden = true;
  listaRepositorios.replaceChildren();
  estadoVacio.hidden = false;
}

/**
 * Activa el indicador de carga y deshabilita el botón durante la búsqueda.
 */
function mostrarLoading() {
  estadoVacio.hidden = true;
  mostrarMensaje('cargando', 'Buscando usuario en GitHub…');

  btnBuscar.disabled = true;
  btnBuscar.setAttribute('aria-busy', 'true');
  btnSpinner.hidden = false;
  btnBuscarTexto.textContent = 'Buscando…';
}

/**
 * Restaura el botón de búsqueda y retira el mensaje de carga.
 */
function ocultarLoading() {
  btnBuscar.disabled = false;
  btnBuscar.removeAttribute('aria-busy');
  btnSpinner.hidden = true;
  btnBuscarTexto.textContent = 'Buscar';

  if (mensajeEstado.classList.contains('mensaje--cargando')) {
    ocultarMensaje();
  }
}

// ============================================================================
// 7. CONSUMO DE LA API OFICIAL DE GITHUB
// ============================================================================

/**
 * Consulta la información del usuario en la API oficial de GitHub.
 * @param {string} username
 * @returns {Promise<Object>}
 */
async function buscarUsuario(username) {
  const respuesta = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`);

  if (!respuesta.ok) {
    if (respuesta.status === 404) {
      throw new Error('USUARIO_NO_ENCONTRADO');
    }
    if (respuesta.status === 403) {
      throw new Error('LIMITE_API_EXCEDIDO');
    }
    throw new Error(`ERROR_HTTP_${respuesta.status}`);
  }

  return respuesta.json();
}

/**
 * Consulta los repositorios públicos de un usuario en la API oficial de GitHub.
 * @param {string} username
 * @returns {Promise<Array<Object>>}
 */
async function obtenerRepositorios(username) {
  const respuesta = await fetch(
    `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100`
  );

  if (!respuesta.ok) {
    if (respuesta.status === 403) {
      throw new Error('LIMITE_API_EXCEDIDO');
    }
    throw new Error(`ERROR_HTTP_${respuesta.status}`);
  }

  return respuesta.json();
}

// ============================================================================
// 8. RENDERIZADO EN EL DOM (Seguridad: sin innerHTML en datos de terceros)
// ============================================================================

/**
 * Renderiza los datos del perfil del usuario respetando valores nulos o inexistentes.
 * @param {Object} usuario
 */
function mostrarUsuario(usuario) {
  avatarUsuario.src = usuario.avatar_url;
  avatarUsuario.alt = `Avatar oficial de ${usuario.login}`;

  nombreUsuario.textContent = usuario.name || usuario.login;
  loginUsuario.textContent = `@${usuario.login}`;

  // Bio opcional
  if (usuario.bio && usuario.bio.trim() !== '') {
    bioUsuario.textContent = usuario.bio.trim();
    bioUsuario.hidden = false;
  } else {
    bioUsuario.hidden = true;
  }

  // Ubicación opcional
  if (usuario.location && usuario.location.trim() !== '') {
    ubicacionTexto.textContent = usuario.location.trim();
    ubicacionUsuario.hidden = false;
  } else {
    ubicacionUsuario.hidden = true;
  }

  // Empresa opcional
  if (usuario.company && usuario.company.trim() !== '') {
    empresaTexto.textContent = usuario.company.trim();
    empresaUsuario.hidden = false;
  } else {
    empresaUsuario.hidden = true;
  }

  // Blog / Sitio web opcional
  if (usuario.blog && usuario.blog.trim() !== '') {
    const urlLimpia = usuario.blog.trim().startsWith('http')
      ? usuario.blog.trim()
      : `https://${usuario.blog.trim()}`;
    blogEnlace.href = urlLimpia;
    blogEnlace.textContent = usuario.blog.trim().replace(/^https?:\/\//, '');
    blogUsuario.hidden = false;
  } else {
    blogUsuario.hidden = true;
  }

  enlaceGithub.href = usuario.html_url;

  estadoVacio.hidden = true;
  tarjetaUsuario.hidden = false;
}

/**
 * Muestra las 4 estadísticas requeridas con datos reales de la API.
 * @param {Object} usuario
 * @param {Array<Object>} repos
 */
function mostrarEstadisticas(usuario, repos) {
  // Suma real de estrellas calculada a partir de los repositorios obtenidos
  const totalEstrellas = repos.reduce((acumulado, repo) => acumulado + repo.stargazers_count, 0);

  statRepos.textContent = formateadorNumeros.format(usuario.public_repos);
  statSeguidores.textContent = formateadorNumeros.format(usuario.followers);
  statSiguiendo.textContent = formateadorNumeros.format(usuario.following);
  statEstrellas.textContent = formateadorNumeros.format(totalEstrellas);

  seccionEstadisticas.hidden = false;
}

/**
 * Crea una tarjeta moderna e interactiva para un repositorio público.
 * @param {Object} repo
 * @param {number} indice
 * @returns {HTMLLIElement}
 */
function crearTarjetaRepositorio(repo, indice) {
  const item = document.createElement('li');

  const articulo = document.createElement('article');
  articulo.className = 'repositorio';
  articulo.style.animationDelay = `${Math.min(indice * 40, 360)}ms`;

  // Título con enlace
  const nombre = document.createElement('h3');
  nombre.className = 'repositorio__nombre';

  const enlace = document.createElement('a');
  enlace.href = repo.html_url;
  enlace.target = '_blank';
  enlace.rel = 'noopener noreferrer';
  enlace.textContent = repo.name;
  nombre.append(enlace);

  // Descripción
  const descripcion = document.createElement('p');
  descripcion.className = 'repositorio__descripcion';
  descripcion.textContent = repo.description || 'Sin descripción disponible.';

  // Metadatos (lenguaje, estrellas, forks)
  const meta = document.createElement('div');
  meta.className = 'repositorio__meta';

  // Lenguaje
  const bloqueLenguaje = document.createElement('span');
  const puntoLenguaje = document.createElement('span');
  puntoLenguaje.className = 'repositorio__lenguaje-punto';
  puntoLenguaje.style.backgroundColor = COLORES_LENGUAJE[repo.language] || COLOR_LENGUAJE_DEFECTO;
  bloqueLenguaje.append(puntoLenguaje, document.createTextNode(repo.language || 'Sin especificar'));

  // Estrellas
  const bloqueEstrellas = document.createElement('span');
  bloqueEstrellas.innerHTML = ICONOS_SISTEMA.estrella;
  bloqueEstrellas.append(document.createTextNode(formateadorNumeros.format(repo.stargazers_count)));

  // Forks
  const bloqueForks = document.createElement('span');
  bloqueForks.innerHTML = ICONOS_SISTEMA.fork;
  bloqueForks.append(document.createTextNode(formateadorNumeros.format(repo.forks_count)));

  meta.append(bloqueLenguaje, bloqueEstrellas, bloqueForks);
  articulo.append(nombre, descripcion, meta);
  item.append(articulo);

  return item;
}

/**
 * Renderiza el listado de repositorios ordenados por mayor cantidad de estrellas.
 * @param {Array<Object>} repos
 */
function mostrarRepositorios(repos) {
  listaRepositorios.replaceChildren();

  repositoriosContador.textContent = formateadorNumeros.format(repos.length);

  if (repos.length === 0) {
    repositoriosVacio.hidden = false;
    listaRepositorios.hidden = true;
  } else {
    repositoriosVacio.hidden = true;
    listaRepositorios.hidden = false;

    // Ordenar de mayor a menor según número de estrellas
    const reposOrdenados = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count);

    const fragmento = document.createDocumentFragment();
    reposOrdenados.forEach((repo, indice) => {
      fragmento.append(crearTarjetaRepositorio(repo, indice));
    });
    listaRepositorios.append(fragmento);
  }

  seccionRepositorios.hidden = false;
}

// ============================================================================
// 9. FLUJO PRINCIPAL DE BÚSQUEDA
// ============================================================================

/**
 * Ejecuta el proceso completo de consulta y renderizado para un usuario dado.
 * @param {string} usernameRaw
 */
async function ejecutarBusqueda(usernameRaw) {
  const username = usernameRaw.trim();

  // Validación previa estricta antes de disparar peticiones de red
  const validacion = validarUsuario(username);
  if (!validacion.valido) {
    campoBusqueda.classList.remove('barra-busqueda__campo--valido');
    campoBusqueda.classList.add('barra-busqueda__campo--error');
    iconoValido.hidden = true;
    limpiarResultados();
    mostrarMensaje(validacion.tipo, validacion.mensaje);
    inputUsuario.focus();
    return;
  }

  campoBusqueda.classList.remove('barra-busqueda__campo--error');
  campoBusqueda.classList.add('barra-busqueda__campo--valido');
  iconoValido.hidden = false;

  limpiarResultados();
  mostrarLoading();

  try {
    // Peticiones paralelas o secuenciales a la API de GitHub
    const usuario = await buscarUsuario(username);
    const repos = await obtenerRepositorios(username);

    mostrarUsuario(usuario);
    mostrarEstadisticas(usuario, repos);
    mostrarRepositorios(repos);
    mostrarMensaje('exito', 'Usuario encontrado correctamente.', { autoOcultarMs: 2200 });

  } catch (error) {
    limpiarResultados();

    if (error.message === 'USUARIO_NO_ENCONTRADO') {
      mostrarError('No se encontró ningún usuario con ese nombre en GitHub.');
    } else if (error.message === 'LIMITE_API_EXCEDIDO') {
      mostrarError('Límite de peticiones de GitHub excedido. Por favor, espera unos minutos.');
    } else if (error instanceof TypeError) {
      // Fallo de red (sin conexión, DNS, etc.)
      mostrarError('No se pudo conectar con GitHub. Revisa tu conexión a internet.');
    } else {
      mostrarError('Ocurrió un error inesperado al consultar la API de GitHub.');
    }

    console.error('Detalle técnico:', error);

  } finally {
    // El bloque finally se ejecuta SIEMPRE para reactivar la interfaz
    ocultarLoading();
  }
}

// Escuchador de envío del formulario
formulario.addEventListener('submit', (evento) => {
  evento.preventDefault();
  ejecutarBusqueda(inputUsuario.value);
});

// Chips interactivos de sugerencias rápidas
chipsSugerencias.forEach((chip) => {
  chip.addEventListener('click', () => {
    const usuario = chip.getAttribute('data-usuario');
    if (usuario) {
      inputUsuario.value = usuario;
      validarEnVivo();
      ejecutarBusqueda(usuario);
    }
  });
});

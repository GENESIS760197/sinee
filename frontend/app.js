const API = 'http://localhost:3000';
const respuestas = {};

function mostrar(id) {
  document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
  document.getElementById(id).classList.add('activa');
}

// Genera los botones de opciones para cada pregunta
function iniciarCuestionario() {
  const etiquetas = ['1\nNunca', '2\nCasi nunca', '3\nA veces', '4\nCasi siempre', '5\nSiempre'];
  for (let i = 1; i <= 25; i++) {
    const contenedor = document.querySelector(`#q${i} .opciones`);
    contenedor.innerHTML = '';
    etiquetas.forEach((etiqueta, idx) => {
      const btn = document.createElement('button');
      btn.textContent = etiqueta;
      btn.onclick = () => seleccionar(i, idx + 1, btn);
      contenedor.appendChild(btn);
    });
  }
}

function seleccionar(pregunta, valor, btn) {
  respuestas[`p${pregunta}`] = valor;
  const botones = document.querySelectorAll(`#q${pregunta} .opciones button`);
  botones.forEach(b => b.classList.remove('seleccionado'));
  btn.classList.add('seleccionado');
}

async function registro() {
  const nombre = document.getElementById('reg-nombre').value;
  const edad = document.getElementById('reg-edad').value;
  const correo = document.getElementById('reg-correo').value;
  const contrasena = document.getElementById('reg-contrasena').value;
  const nivel_educativo = document.getElementById('reg-nivel').value;
  const error = document.getElementById('reg-error');

  if (!nombre || !edad || !correo || !contrasena) {
    error.textContent = 'Por favor llena todos los campos';
    return;
  }

  try {
    const res = await fetch(`${API}/usuarios/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, edad: parseInt(edad), correo, contrasena, nivel_educativo })
    });

    const data = await res.json();

    if (!res.ok) {
      error.textContent = data.message || 'Error al registrarse';
      return;
    }

    alert('¡Registro exitoso! Ahora inicia sesión');
    mostrar('pantalla-login');
  } catch (e) {
    error.textContent = 'Error de conexión con el servidor';
  }
}

async function login() {
  const correo = document.getElementById('login-correo').value;
  const contrasena = document.getElementById('login-contrasena').value;
  const error = document.getElementById('login-error');

  if (!correo || !contrasena) {
    error.textContent = 'Por favor llena todos los campos';
    return;
  }

  try {
    const res = await fetch(`${API}/usuarios/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, contrasena })
    });

    const data = await res.json();

    if (!res.ok) {
      error.textContent = data.message || 'Correo o contraseña incorrectos';
      return;
    }

    localStorage.setItem('usuario', JSON.stringify(data.usuario));
    iniciarCuestionario();
    mostrar('pantalla-cuestionario');
  } catch (e) {
    error.textContent = 'Error de conexión con el servidor';
  }
}

function calcularResultados() {
  const secciones = {
    'Carga académica': [1,2,3,4,5,6],
    'Organización y tiempo': [7,8,9,10,11],
    'Salud física y mental': [12,13,14,15,16,17],
    'Ansiedad y emociones': [18,19,20,21,22],
    'Factores externos y sociales': [23,24,25]
  };

  let totalPuntos = 0;
  const resultadosSecciones = {};

  for (const [nombre, preguntas] of Object.entries(secciones)) {
    let sumaSec = 0;
    preguntas.forEach(n => { sumaSec += (respuestas[`p${n}`] || 0); });
    const puntajeSec = (sumaSec / (preguntas.length * 5)) * 100;
    resultadosSecciones[nombre] = Math.round(puntajeSec);
    totalPuntos += respuestas[`p${Object.keys(respuestas).find(k => k === `p${preguntas[0]}`)}` ] || 0;
  }

  let total = 0;
  for (let i = 1; i <= 25; i++) total += (respuestas[`p${i}`] || 0);
  const puntajeGeneral = Math.round((total / (25 * 5)) * 100);

  return { puntajeGeneral, resultadosSecciones };
}

function obtenerClasificacion(puntaje) {
  if (puntaje <= 20) return { nivel: 'Bajo', clase: 'nivel-bajo' };
  if (puntaje <= 40) return { nivel: 'Medio-bajo', clase: 'nivel-medio-bajo' };
  if (puntaje <= 60) return { nivel: 'Medio', clase: 'nivel-medio' };
  if (puntaje <= 80) return { nivel: 'Medio-alto', clase: 'nivel-medio-alto' };
  return { nivel: 'Alto', clase: 'nivel-alto' };
}

function obtenerColorBarra(puntaje) {
  if (puntaje <= 20) return '#43a047';
  if (puntaje <= 40) return '#8bc34a';
  if (puntaje <= 60) return '#ffc107';
  if (puntaje <= 80) return '#ff9800';
  return '#f44336';
}

async function enviarCuestionario() {
  const error = document.getElementById('cuestionario-error');

  for (let i = 1; i <= 25; i++) {
    if (!respuestas[`p${i}`]) {
      error.textContent = `Por favor responde la pregunta ${i}`;
      document.getElementById(`q${i}`).scrollIntoView({ behavior: 'smooth' });
      return;
    }
  }

  error.textContent = '';
  const { puntajeGeneral, resultadosSecciones } = calcularResultados();
  const { nivel, clase } = obtenerClasificacion(puntajeGeneral);

  // Mostrar resultado general
  document.getElementById('resultado-general').innerHTML = `
    <div class="resultado-nivel ${clase}">
      <h2>Nivel de estrés: ${nivel}</h2>
      <p style="font-size:2rem; font-weight:bold">${puntajeGeneral}%</p>
    </div>
  `;

  // Mostrar resultados por sección
  let htmlSecciones = '<h2 style="color:#444; margin-bottom:12px">Resultados por área</h2>';
  for (const [nombre, puntaje] of Object.entries(resultadosSecciones)) {
    const color = obtenerColorBarra(puntaje);
    htmlSecciones += `
      <div class="seccion-resultado">
        <h3>${nombre}: ${puntaje}%</h3>
        <div class="barra-progreso">
          <div class="barra-fill" style="width:${puntaje}%; background:${color}"></div>
        </div>
      </div>
    `;
  }
  document.getElementById('resultado-secciones').innerHTML = htmlSecciones;

  // Recomendaciones según nivel general
  const recomendaciones = {
    'Bajo': ['¡Vas muy bien! Mantén tus hábitos actuales.', 'Sigue organizando tu tiempo de manera efectiva.', 'Continúa cuidando tu descanso y alimentación.'],
    'Medio-bajo': ['Mantén un horario regular de sueño.', 'Usa técnicas de organización como listas de tareas.', 'Dedica tiempo a actividades que disfrutes.'],
    'Medio': ['Practica técnicas de respiración o meditación.', 'Divide tus tareas en partes pequeñas.', 'Habla con amigos o familia sobre cómo te sientes.'],
    'Medio-alto': ['Considera hablar con un orientador escolar.', 'Prioriza actividades y aprende a decir no.', 'Establece límites entre tiempo de estudio y descanso.'],
    'Alto': ['Busca apoyo profesional o de un orientador.', 'Reduce compromisos temporalmente.', 'Prioriza tu bienestar sobre las calificaciones.']
  };

  let htmlRec = '<h2 style="color:#444; margin:16px 0 12px">Recomendaciones</h2>';
  recomendaciones[nivel].forEach(rec => {
    htmlRec += `<div class="recomendacion">💡 ${rec}</div>`;
  });
  document.getElementById('resultado-recomendaciones').innerHTML = htmlRec;

  mostrar('pantalla-resultados');
}
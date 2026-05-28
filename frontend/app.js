const API = 'http://localhost:3000';

function mostrar(id) {
  document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
  document.getElementById(id).classList.add('activa');
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
    alert(`¡Bienvenido ${data.usuario.nombre}!`);
    mostrar('pantalla-cuestionario');
  } catch (e) {
    error.textContent = 'Error de conexión con el servidor';
  }
}
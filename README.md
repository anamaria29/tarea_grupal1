# Tarea Grupal #1

## Miembros:
- Adrián González
- Kristhel Porras
- Ana María Ramírez
- Aaron Vargas

=======

# Noty

Noty es una aplicacion web educativa para gestionar notas. El proyecto muestra, de forma simple y didactica, como construir una app full-stack con frontend vanilla, backend con Node.js/Express, API REST, SQLite y autenticacion con JWT.

## Caracteristicas

- Registro de usuarios.
- Inicio de sesion con JWT.
- Hash de contrasenas con bcrypt.
- CRUD completo de notas.
- Proteccion de rutas privadas.
- Validacion de propiedad: cada usuario solo accede a sus propias notas.
- Editor de notas con formato basico.
- Exportacion de notas a PDF mediante impresion del navegador.
- Frontend y backend servidos desde Express en un solo puerto.
- Codigo separado por responsabilidades y comentado por secciones.

## Tecnologias

- HTML5
- CSS3
- JavaScript Vanilla
- Fetch API
- Node.js
- Express.js
- SQLite
- sqlite3
- bcrypt
- JSON Web Token (JWT)
- CORS
- dotenv
- nodemon
- localStorage
- contenteditable
- document.execCommand

## Estructura

```text
Noty/
├── backend/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── notes.controller.js
│   ├── database/
│   │   └── database.js
│   ├── middleware/
│   │   └── auth.middleware.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── notes.routes.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── api.js
│   │   ├── auth.js
│   │   └── notes.js
│   ├── dashboard.html
│   ├── index.html
│   ├── login.html
│   └── register.html
├── .gitignore
└── README.md
```

## Instalacion

Clona el repositorio:

```bash
git clone https://github.com/alitoxSB/Noty.git
cd Noty
```

Instala las dependencias del backend:

```bash
cd backend
npm install
```

Crea el archivo de variables de entorno:

```bash
cp .env.example .env
```

Puedes editar `.env` si quieres cambiar el puerto o la clave JWT:

```env
PORT=3000
JWT_SECRET=educational_secret_key_change_this
```

## Ejecucion

Desde la carpeta `backend`:

```bash
npm start
```

Para desarrollo con reinicio automatico:

```bash
npm run dev
```

Abre la app en:

```text
http://localhost:3000
```

Paginas principales:

```text
http://localhost:3000/register.html
http://localhost:3000/login.html
http://localhost:3000/dashboard.html
```

## API REST

Rutas publicas:

```text
POST /api/auth/register
POST /api/auth/login
```

Rutas protegidas con JWT:

```text
GET    /api/notes
GET    /api/notes/:id
POST   /api/notes
PUT    /api/notes/:id
DELETE /api/notes/:id
```

Las rutas protegidas reciben el token asi:

```text
Authorization: Bearer TOKEN_AQUI
```

## Base de datos

Noty usa SQLite. Al iniciar el servidor, `backend/database/database.js` crea automaticamente la base de datos local y las tablas necesarias:

- `users`
- `notes`

La base local `backend/database/noty.sqlite` no se sube al repositorio porque es un archivo generado en ejecucion.

## Flujo de uso

1. El usuario crea una cuenta en `register.html`.
2. Inicia sesion en `login.html`.
3. El backend valida credenciales y devuelve un JWT.
4. El frontend guarda el token en `localStorage`.
5. El usuario entra al dashboard.
6. Puede crear, editar, eliminar y exportar notas.
7. Al cerrar sesion, el token se elimina del navegador.

## Enfoque educativo

Este proyecto evita frameworks de frontend para que sea mas facil estudiar:

- estructura HTML;
- estilos CSS;
- DOM y eventos con JavaScript;
- consumo de API con `fetch`;
- rutas REST;
- middleware;
- controladores;
- persistencia con SQLite;
- autenticacion con JWT.

## Nota de seguridad

Noty esta pensado para aprendizaje. Para produccion se recomienda agregar validaciones mas estrictas, sanitizacion HTML avanzada, cookies httpOnly, HTTPS obligatorio, gestion robusta de errores y una estrategia formal de migraciones de base de datos.

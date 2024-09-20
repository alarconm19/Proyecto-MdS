const express = require('express');
const router = express.Router();
const profileController = require('../controllers/ProfileController');
const databaseController = require('../controllers/DatabaseController');

// Middleware para verificar la sesión
const addSessionData = (req, res, next) => {
    res.locals.loggedin = req.session.loggedin || false;
    res.locals.username = req.session.username || '';
    res.locals.userRole = req.session.role || ''; 
    next();
};

// Aplicar el middleware a todas las rutas
router.use(addSessionData);

// Rutas principales
router.get('/', (req, res) => {
    res.render('index', { username: req.session.username });
});

router.get('/profile', (req, res) => {
    if (req.session.loggedin) {
        res.render('profile', {
            username: req.session.username,
            email: req.session.email,
            direccion: req.session.direccion,
            telefono: req.session.telefono
        });
    } else {
        res.render(''); // Asegúrate de renderizar algo aquí o redirigir
    }
});

router.get('/servicios', (req, res) => {
    res.render('servicios', { username: req.session.username });
});

router.get('/noticias', (req, res) => {
    res.render('noticias', { username: req.session.username });
});

router.get('/empleos', (req, res) => {
    res.render('empleos', { username: req.session.username });
});

// Ruta para reservar un turno
router.post('/servicios', databaseController.insertQuery);
router.get('/reserved-slots', databaseController.sendReservedSlots);

// Ruta para mostrar los comentarios
router.get('/comentarios', (req, res) => {
    req.conn.query('SELECT * FROM comentarios ORDER BY fecha DESC', (err, results) => {
        if (err) {
            console.error('Error al obtener los comentarios:', err);
            return res.status(500).send('Error al obtener los comentarios.');
        }
        res.render('comentarios', { 
            comentarios: results
        });
    });
});

// Ruta para añadir un nuevo comentario
router.post('/comentarios', (req, res) => {
    const { nombre, comentario } = req.body;
    if (!nombre || !comentario) {
        return res.status(400).send('Todos los campos son obligatorios.');
    }

    const newComment = {
        nombre: nombre,
        comentario: comentario,
        fecha: new Date()
    };

    req.conn.query('INSERT INTO comentarios SET ?', newComment, (err) => {
        if (err) {
            console.error('Error al añadir el comentario:', err);
            return res.status(500).send('Error al añadir el comentario.');
        }
        res.redirect('/comentarios');
    });
});

// Ruta para crear consulta
router.post('/consultas/crear', databaseController.crearConsulta);

// Ruta para obtener consultas del cliente
router.get('/mis-consultas', databaseController.obtenerConsultasCliente);

// Middleware para verificar si el usuario es empleado
function isEmpleado(req, res, next) {
    console.log('Middleware isEmpleado ejecutado');
    console.log('Rol de usuario:', req.session.role);
    if (req.session.loggedin && req.session.role === 'empleado') {
        return next();
    }
    console.log('Acceso denegado');
    res.redirect('/'); // Redirige si no es empleado
}


// Ruta para obtener todas las consultas (empleados)
router.get('/todas', isEmpleado, (req, res) => {
    databaseController.obtenerTodasConsultas(req, res, (err, consultas) => {
        if (err) {
            return res.status(500).send('Error al obtener consultas.');
        }
        res.render('todas-consultas', {
            consultas: consultas
        });
    });
});

// Ruta para responder a una consulta
router.post('/responder/:id', isEmpleado, databaseController.responderConsulta);

// Middleware para manejar errores 404 (Página no encontrada)
router.use((req, res, next) => {
    res.status(404).render('404');
});

// Exporta el router
module.exports = router;

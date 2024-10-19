const express = require('express');
const router = express.Router();

// // Middleware para verificar la sesión
// const addSessionData = (req, res, next) => {
//     res.locals.loggedin = req.session.loggedin || false;
//     res.locals.username = req.session.username || '';
//     res.locals.userRole = req.session.role || '';
//     next();
// };

// // Aplicar el middleware a todas las rutas
// router.use(addSessionData);

// Rutas principales
router.get('/', (req, res) => {
    res.render('index', { username: req.session.username });
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


router.get('/comentarios', (req, res) => {
    req.conn.query('SELECT * FROM comentarios ORDER BY fecha DESC', (err, results) => {
        if (err) {
            console.error('Error al obtener los comentarios:', err);
            return res.render('404');
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

// Middleware para manejar errores 404 (Página no encontrada)
router.use((req, res, next) => {
    res.render('404');
});

// Exporta el router
module.exports = router;

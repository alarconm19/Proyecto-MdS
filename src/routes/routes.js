const express = require('express');
const router = express.Router();
const profileController = require('../controllers/ProfileController');

// Rutas principales
router.get('/', (req, res) => {
    res.render('spa/index', { username: req.session.username , role: req.session.role != 'cliente' });
});

router.get('/servicios', (req, res) => {
    // Asegúrate de tener la conexión de base de datos disponible como req.conn
    req.conn.query('SELECT * FROM servicios', (err, results) => {
        if (err) {
            console.error('Error al obtener los servicios:', err);
            return res.status(500).send('Error al cargar los servicios');
        }

        // Renderiza la vista pasando el username y la lista de servicios obtenidos
        res.render('spa/servicios', { username: req.session.username, servicios: results });
    });
});

router.get('/noticias', (req, res) => {
    res.render('spa/noticias', { username: req.session.username });
});

router.get('/empleos', (req, res) => {
    res.render('spa/empleos', { username: req.session.username });
});

router.get('/profile', profileController.showProfile);

router.get('/profile/update', profileController.updateProfile);

router.get('/comentarios', (req, res) => {
    req.conn.query('SELECT * FROM comentarios ORDER BY fecha DESC', (err, results) => {
        if (err) {
            console.error('Error al obtener los comentarios:', err);
            return res.render('spa/404');
        }
        res.render('spa/comentarios', { comentarios: results });
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
    res.render('spa/404');
});

// Exporta el router
module.exports = router;

const express = require('express');
const router = express.Router();
const profileController = require('../controllers/ProfileController');
const DbController = require('../controllers/DatabaseController');

// Rutas
router.get('/', (req, res) => {
    if(req.session.loggedin) res.render('index', { username: req.session.username });
    else res.render('index');
});

router.get('/profile', (req, res) => {
    if(req.session.loggedin) res.render('profile', {
        username: req.session.username,
        email: req.session.email,
        direccion : req.session.direccion,
        telefono : req.session.telefono
    });
    else res.render('');
});

router.get('/profile', profileController.showProfile);
router.post('/profile/update', profileController.updateProfile);

router.get('/about', (req, res) => {
    if(req.session.loggedin) res.render('about', { username: req.session.username });
    else res.render('about');
});

router.post('/about', DbController.guardarTurno);

router.get('/contact', (req, res) => {
    if(req.session.loggedin) res.render('contact', { username: req.session.username });
    else res.render('contact');
});

// Middleware para manejar errores 404 (Página no encontrada)
router.use((req, res, next) => {
    res.status(404).render('404');
});


// Exporta el router
module.exports = router;

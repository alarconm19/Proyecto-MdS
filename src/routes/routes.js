const express = require('express');
const router = express.Router();
const profileController = require('../controllers/ProfileController');
const databaseController = require('../controllers/DatabaseController');

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

router.get('/servicios', (req, res) => {
    if(req.session.loggedin) res.render('servicios', { username: req.session.username });
    else res.render('servicios');
});

router.get('/noticias', (req, res) => {
    if(req.session.loggedin) res.render('noticias', { username: req.session.username });
    else res.render('noticias');
});

router.get('/empleos', (req, res) => {
    if(req.session.loggedin) res.render('empleos', { username: req.session.username });
    else res.render('empleos');
});

// Ruta para reservar un turno
router.post('/servicios', databaseController.insertQuery);

router.get('/reserved-slots', databaseController.sendReservedSlots);


// Middleware para manejar errores 404 (Página no encontrada)
router.use((req, res, next) => {
    res.status(404).render('404');
});


// Exporta el router
module.exports = router;

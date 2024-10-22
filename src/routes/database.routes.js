const express = require('express');
const router = express.Router();
const databaseController = require('../controllers/DatabaseController');

router.get('/cancelar-turno/:id', databaseController.cancelarTurno);

// Ruta para reservar un turno
router.post('/servicios', databaseController.insertQuery);
router.get('/reserved-slots', databaseController.sendReservedSlots);
router.get('/obtenerServicios', databaseController.obtenerSevicios);

// Ruta para crear consulta
router.post('/consultas/crear', databaseController.crearConsulta);

// Ruta para obtener consultas del cliente
router.get('/mis-consultas', databaseController.obtenerConsultasCliente);

// Ruta para responder a una consulta
router.post('/responder/:id', isEmpleado, databaseController.responderConsulta);

// Middleware para verificar si el usuario es empleado
function isEmpleado(req, res, next) {
    console.log('Middleware isEmpleado ejecutado');
    console.log('Rol de usuario:', req.session.role);
    if (req.session.loggedin && req.session.role !== 'cliente') {
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
        res.render('spa/todas-consultas', {
            consultas: consultas
        });
    });
});


module.exports = router;
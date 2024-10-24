const express = require('express');
const router = express.Router();
const adminController = require('../controllers/AdminController');
const informesController = require('../controllers/InformesController');

router.get('/admin', (req, res) => {
    if (req.session.role === 'admin' || req.session.role === 'profesional') {
        res.redirect('/admin/clientes');
    } else if (req.session.role === 'secretaria') {
        res.redirect('/admin/informe-ingresos');
    } else {
        // Si el rol no coincide con ninguno, podrías redirigir a una página de error o hacer otra acción
        res.redirect('/');
    }
});

router.get('/admin/clientes', adminController.getClientes);
router.get('/admin/turnosPorDia', adminController.getTurnosPorDia);
router.get('/admin/clientes-profesional', adminController.getClientesPorProfesional);

// Rutas para la generación de informes solo accesibles para administradores
router.get('/admin/informe-ingresos', informesController.renderInformeIngresos);
router.post('/admin/generar-informe-ingresos', informesController.generarInformeIngresos);
// router.get('/admin/descargar-informe-ingresos-pdf', informesController.descargarInformeIngresosPDF);

router.get('/admin/informe-servicios', informesController.renderInformeServicios);
router.post('/admin/generar-informe-servicios', informesController.generarInformeServicios);
// router.get('/admin/descargar-informe-servicios-pdf', informesController.descargarInformeServiciosPDF);


module.exports = router;
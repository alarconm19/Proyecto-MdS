const express = require('express');
const router = express.Router();
const adminController = require('../controllers/AdminController');

router.get('/admin', (req, res) => {
    if (!req.session.loggedin || req.session.role == 'cliente') {
        return res.redirect('/');
    } else {
        res.render('admin/dashboard', {
            layout: 'admin',
            username: req.session.username,
            admin: req.session.role == 'admin',
            profesional: req.session.role == 'profesional',
            secretaria: req.session.role == 'secretaria',
        });
    }
});

router.get('/admin/clientes', adminController.getClientes);
router.get('/admin/turnosPorDia', adminController.getTurnosPorDia);
router.get('/admin/clientes-profesional', adminController.getClientesPorProfesional);


module.exports = router;
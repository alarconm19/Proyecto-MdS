const express = require('express');
const router = express.Router();
const adminController = require('../controllers/AdminController');

router.get('/admin', (req, res) => {
    res.render('admin/dashboard', { layout: 'admin', title: 'Admin - Dashboard', username: req.session.username});
});

router.get('/admin/clientes', adminController.getClientes);

router.get('/admin/turnosPorDia', adminController.getTurnosPorDia);

router.get('/admin/clientes-profesional', adminController.getClientesPorProfesional);


module.exports = router;
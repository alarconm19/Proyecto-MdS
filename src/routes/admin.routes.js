const express = require('express');
const router = express.Router();
const { createPDF } = require('../utils/pdfGenerator');
const { isAdmin } = require('../controllers/LoginController');

// Renderizar el formulario para el informe de ingresos
router.get('/ingresos', isAdmin, (req, res) => {
    res.render('admin/informes_ingresos', { username: req.session.username, stylesheet: 'styles.css' });
});

// Procesar el formulario e imprimir el informe de ingresos
router.post('/ingresos', isAdmin, (req, res) => {
    const { start_date, end_date, payment_type } = req.body;
    
    let query = `SELECT * FROM pagos WHERE fecha >= ? AND fecha <= ?`;
    const values = [start_date, end_date];
    
    if (payment_type !== 'all') {
        query += ` AND tipo_pago = ?`;
        values.push(payment_type);
    }

    req.getConnection((err, conn) => {
        if (err) return res.send(err);

        conn.query(query, values, (err, pagos) => {
            if (err) return res.send(err);
            
            const pdfPath = createPDF('Informe de Ingresos', pagos);
            res.download(pdfPath);  // Descargar el PDF generado
        });
    });
});

// Renderizar el formulario para el informe de servicios
router.get('/servicios', isAdmin, (req, res) => {
    res.render('admin/informes_servicios', { username: req.session.username, stylesheet: 'styles.css' });
});

// Procesar el formulario e imprimir el informe de servicios
router.post('/servicios', isAdmin, (req, res) => {
    const { start_date, end_date, professional } = req.body;

    const query = `SELECT * FROM turnos WHERE fecha >= ? AND fecha <= ? AND profesional_id = ?`;
    const values = [start_date, end_date, professional];

    req.getConnection((err, conn) => {
        if (err) return res.send(err);

        conn.query(query, values, (err, turnos) => {
            if (err) return res.send(err);

            const pdfPath = createPDF('Informe de Servicios', turnos);
            res.download(pdfPath);  // Descargar el PDF generado
        });
    });
});

// Ruta para el dashboard del administrador
router.get('/admin', isAdmin, (req, res) => {
    res.render('admin/dashboard', { username: req.session.username, stylesheet: 'styles.css' });
});

module.exports = router;

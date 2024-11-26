const express = require('express');
const router = express.Router();
const profileController = require('../controllers/ProfileController');
const MobileDetect = require('mobile-detect');



// Rutas principales
router.get('/', (req, res) => {
    res.render('spa/index', { username: req.session.username , role: req.session.role != 'cliente' });
    const md = new MobileDetect(req.headers['user-agent']);
    if (md.mobile()) {
        console.log("Es un móvil");
    } else {
        console.log("No es un móvil");
    }
});

router.get('/servicios', (req, res) => {
    res.render('spa/servicios', { username: req.session.username, role: req.session.role != 'cliente' });
});

router.get('/noticias', (req, res) => {
    res.render('spa/noticias', { username: req.session.username, role: req.session.role != 'cliente' });
});

router.get('/empleos', (req, res) => {
    res.render('spa/empleos', { username: req.session.username, role: req.session.role != 'cliente' });
});

router.get('/profile', profileController.showProfile);
router.post('/profile/update', profileController.updateProfile);

router.get('/comentarios', (req, res) => {
    req.conn.query('SELECT * FROM comentarios ORDER BY fecha DESC', (err, results) => {
        if (err) {
            console.error('Error al obtener los comentarios:', err);
            return res.render('spa/404');
        }
        res.render('spa/comentarios', { comentarios: results, username: req.session.username, role: req.session.role != 'cliente' });
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

// Ruta para mostrar el formulario de pago
router.get('/payment/:servicio/:id', (req, res) => {
    const servicio = req.params.servicio;
    const id = req.params.id;
    res.render('spa/payment', { servicio, id, username: req.session.username });
});


//Ruta para procesar el pago
router.post('/process-payment', (req, res) => {
    const { cardType, servicio, id } = req.body;

    // Primero obtenemos el monto del turno
    req.conn.query('SELECT precio FROM servicios WHERE nombre = ?', [servicio], (err, precio) => {
        if (err) {
            console.error('Error al obtener el turno:', err);
            return res.redirect('/payment/${servicio}/${id}');
        }


        if (!precio) {
            console.error('Precio no encontrado');
            return res.redirect('/payment/${servicio}/${id}');
        }

        const monto = precio[0].precio;
        
        const md = new MobileDetect(req.headers['user-agent']);
        if (md.mobile()) {
            console.log("Es un móvil, aplicando descuento de 10%");
            monto = monto * 0.9; }


        // Insertar el pago
        const query = 'INSERT INTO pagos (cliente_email, turno_id, tipo, monto) VALUES (?, ?, ?, ?)';

        req.conn.query(query, [req.session.email, id, cardType, monto], (err) => {
            if (err) {
                console.error('Error al guardar el pago:', err);
                return res.redirect('/payment/${servicio}/${id}');
            }
            // Actualizar el turno como pagado
            const updateQuery =
                `UPDATE turnos
                SET pagado = 1
                WHERE id = ?`;

            req.conn.query(updateQuery, [id], (err) => {
                if (err) {
                    console.error('Error al actualizar el estado del turno:', err);
                    return res.redirect('/payment/${servicio}/${id}');
                }

                // Redirigir al perfil después de actualizar
                res.redirect('/profile');
            });
        });
    });
});


// Middleware para manejar errores 404 (Página no encontrada)
router.use((req, res, next) => {
    res.render('spa/404', { username: req.session.username, role: req.session.role != 'cliente' });
});

// Exporta el router
module.exports = router;

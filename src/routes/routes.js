const express = require('express');
const router = express.Router();

// Rutas principales
router.get('/', (req, res) => {
    res.render('spa/index', { username: req.session.username });
});

/* router.get('/servicios', (req, res) => {
    res.render('servicios', { username: req.session.username, servicios: servicios });
}); */

router.get('/servicios', (req, res) => {
    // Asegúrate de tener la conexión de base de datos disponible como req.conn
    req.conn.query('SELECT * FROM servicios', (err, results) => {
        if (err) {
            console.error('Error al obtener los servicios:', err);
            return res.status(500).send('Error al cargar los servicios');
        }

        // Renderiza la vista pasando el username y la lista de servicios obtenidos
        res.render('spa/servicios', {
            username: req.session.username,
            servicios: results // Aquí envías los servicios obtenidos de la base de datos
        });
    });
});

router.get('/noticias', (req, res) => {
    res.render('spa/noticias', { username: req.session.username });
});

router.get('/empleos', (req, res) => {
    res.render('spa/empleos', { username: req.session.username });
});

/*
router.get('/profile', (req, res) => {
    if (req.session.loggedin) {
        res.render('spa/profile', {
            username: req.session.username,
            email: req.session.email,
            direccion: req.session.direccion,
            telefono: req.session.telefono
        });
    } else {
        res.render('spa/'); // Asegúrate de renderizar algo aquí o redirigir
    }
});

router.get('/profile', (req, res) => {
    // Verificar si el usuario está autenticado
    if (!req.session.loggedin) {
        return res.redirect('/login'); // Redirigir al login si no está autenticado
    }

    // Consulta para obtener los datos del usuario
    const userId = req.session.user_id; // Obtener el ID del usuario desde la sesión

    // Consulta para obtener los turnos del usuario
    req.conn.query('SELECT * FROM turnos WHERE cliente_id = ?', [userId], (err, turnos) => {
        if (err) {
            console.error('Error al obtener los turnos:', err);
            return res.status(500).send('Error al cargar los turnos');
        }

        // Renderizar la vista del perfil, pasando los datos del usuario y los turnos
        res.render('spa/profile', {
            username: req.session.username,
            email: req.session.email,
            direccion: req.session.direccion,
            telefono: req.session.telefono,
            turnos: turnos // Enviamos la lista de turnos
        });
    });
}); */

router.get('/profile', (req, res) => {
    // Verificar si el usuario está autenticado
    if (!req.session.loggedin) {
        return res.redirect('/login'); // Redirigir al login si no está autenticado
    }

    const userId = req.session.user_id; // Obtener el ID del usuario desde la sesión

    if (!userId) {
        console.error('Error: user_id no está definido en la sesión');
        return res.status(500).send('Error de sesión');
    }

    // Consulta para obtener los turnos del usuario con el nombre del servicio
    const query = `
        SELECT
            t.turno_id,
            s.nombre_servicio AS servicio,
            DATE_FORMAT(t.fecha, '%Y-%m-%d') AS fecha,
            TIME_FORMAT(t.hora, '%H:%i:%s') AS hora
        FROM
            turnos t
        JOIN
            servicios s ON t.servicio_id = s.id
        WHERE
            t.cliente_id = ?
        ORDER BY
            t.fecha, t.hora
    `;

    req.conn.query(query, [userId], (err, turnos) => {
        if (err) {
            console.error('Error al obtener los turnos:', err);
            console.error('Query:', query);
            console.error('UserId:', userId);
            return res.status(500).send('Error al cargar los turnos: ' + err.message);
        }

        console.log('Turnos obtenidos:', turnos); // Log para verificar los datos recibidos

        // Renderizar la vista del perfil, pasando los datos del usuario y los turnos
        res.render('spa/profile', {
            username: req.session.username,
            email: req.session.email,
            direccion: req.session.direccion,
            telefono: req.session.telefono,
            turnos: turnos // Enviamos la lista de turnos con la información completa
        });
    });
});



router.get('/comentarios', (req, res) => {
    req.conn.query('SELECT * FROM comentarios ORDER BY fecha DESC', (err, results) => {
        if (err) {
            console.error('Error al obtener los comentarios:', err);
            return res.render('spa/404');
        }
        res.render('spa/comentarios', {
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
    res.render('spa/404');
});

// Exporta el router
module.exports = router;

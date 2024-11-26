function insertQuery(req, res) {
    if (req.session && req.session.email) {
        const { selectedtreatment, selecteddate, selectedtime } = req.body;

        // Consulta para obtener el profesional con menos turnos que NO tenga turnos en la misma fecha y hora
        const queryProfesional = `
            SELECT email FROM users
            WHERE role = "profesional"
            AND NOT EXISTS (
                SELECT 1 FROM turnos
                WHERE turnos.profesional_email = users.email
                AND turnos.fecha = ?
                AND turnos.hora = ?
            )
            ORDER BY (SELECT COUNT(*) FROM turnos WHERE profesional_email = users.email) ASC
            LIMIT 1`;

        // Pasar fecha y hora seleccionadas para la validación
        req.conn.query(queryProfesional, [selecteddate, selectedtime], (err, results) => {
            if (err) {
                console.error('Error al obtener profesional:', err);
                return res.status(500).send('Error al obtener profesional.');
            }

            const profesionalEmail = results[0] ? results[0].email : null;

            if (!profesionalEmail) {
                return res.status(400).send('No hay profesionales disponibles para esta fecha y hora.');
            }

            const query = 'INSERT INTO turnos (cliente_email, profesional_email, nombre_servicio, fecha, hora) VALUES (?, ?, ?, ?, ?)';
            const values = [req.session.email, profesionalEmail, selectedtreatment, selecteddate, selectedtime];

            req.conn.query(query, values, (err, results) => {
                if (err) {
                    console.error('Error al guardar el turno:', err);
                    return res.status(500).send('Error al guardar el turno.');
                }

                res.redirect('/servicios'); // Redirigir a una página de éxito o a la vista de perfil
            });
        });
    } else {
        console.error('No autorizado');
        res.redirect('/inicio'); // Redirigir a la página de inicio
    }
}

function sendReservedSlots(req, res) {
    const query = 'SELECT fecha, hora FROM turnos WHERE fecha >= CURDATE()';

    req.conn.query(query, (err, results) => {
        if (err) console.error('Error en la consulta de turnos:', err);

        // Formatear los resultados en un objeto donde las claves sean las fechas y los valores arrays de horas
        const reservedSlots = {};

        results.forEach(turno => {
            const date = turno.fecha.toISOString().split('T')[0]; // Convertir la fecha a formato YYYY-MM-DD
            const time = turno.hora.slice(0, 5); // Formatear la hora a HH:MM

            if (!reservedSlots[date]) {
                reservedSlots[date] = [];
            }
            reservedSlots[date].push(time);
        });

        // Enviar los turnos reservados al frontend
        res.json(reservedSlots);
    });
}

function cancelarTurno(req, res) {
    const turnoId = req.params.id;

    req.conn.query('DELETE FROM turnos WHERE id = ?', [turnoId], (err, result) => {
        if (err) {
            console.error('Error al cancelar el turno:', err);
            return res.status(500).send('Error al cancelar el turno');
        }
        // Redirigir de vuelta al perfil del usuario
        res.redirect('/profile');
    });
}

function obtenerSevicios(req, res) {
    // Asegúrate de tener la conexión de base de datos disponible como req.conn
    req.conn.query('SELECT * FROM servicios', (err, results) => {
        if (err) {
            console.error('Error al obtener los servicios:', err);
            return res.status(500).send('Error al cargar los servicios');
        }

        // Renderiza la vista pasando el username y la lista de servicios obtenidos
        //res.render('spa/servicios', { username: req.session.username, servicios: results, role: req.session.role != 'cliente' });
        res.json(results);
    });
}

// Función para crear una consulta
function crearConsulta(req, res) {
    const consulta = {
        cliente_email: req.session.email,
        consulta: req.body.consulta
    };
    const sql = 'INSERT INTO consultas (cliente_email, consulta) VALUES (?, ?)';
    req.conn.query(sql, [consulta.cliente_id, consulta.consulta], (err, results) => {
        if (err) {
            console.error('Error al crear la consulta:', err);
            return res.status(500).send('Error al crear la consulta.');
        }
        res.redirect('/mis-consultas'); // Redirigir a la vista de consultas
    });
}

// Función para obtener consultas del cliente
function obtenerConsultasCliente(req, res) {
    const cliente_email = req.session.email;
    const sql = 'SELECT * FROM consultas WHERE cliente_email = ?';
    req.conn.query(sql, [cliente_email], (err, results) => {
        if (err) {
            console.error('Error al obtener consultas:', err);
            return res.status(500).send('Error al obtener consultas.');
        }
        res.render('spa/misConsultas', { consultas: results }); // Renderizar vista
    });
}

function obtenerTodasConsultas(req, res) {
    const sql = `
        SELECT consultas.*, users.username AS cliente_nombre
        FROM consultas
        JOIN users ON consultas.cliente_email = users.email`;
    req.conn.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener todas las consultas:', err);
            return res.status(500).send('Error al obtener todas las consultas.');
        }
        res.render('spa/todasConsultas', { consultas: results }); // Renderizar vista con nombre del cliente
    });
}


// Función para responder una consulta
function responderConsulta(req, res) {
    const consulta_id = req.params.id;
    const respuesta = req.body.respuesta;
    const sql = 'UPDATE consultas SET respuesta = ?, fecha = NOW() WHERE id = ?';
    req.conn.query(sql, [respuesta, consulta_id], (err, results) => {
        if (err) {
            console.error('Error al responder la consulta:', err);
            return res.status(500).send('Error al responder la consulta.');
        }
        res.redirect('/todas'); // Redirigir a la vista de todas las consultas
    });
}

module.exports = {
    insertQuery,
    sendReservedSlots,
    cancelarTurno,
    obtenerSevicios,
    crearConsulta,
    obtenerConsultasCliente,
    obtenerTodasConsultas,
    responderConsulta
};
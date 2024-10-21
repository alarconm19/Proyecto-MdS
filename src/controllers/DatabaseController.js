function insertQuery(req, res) {
    if (process.env.ENVIRONMENT === 'production') {

        fetch('https://proyectomdsapidb.azurewebsites.net/api/httptriggerinsertshift', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: req.body.user_id,
                selectedtreatment: req.body.selectedtreatment,
                selecteddate: req.body.selecteddate,
                selectedtime: req.body.selectedtime
            })
        })
        .then(response => response.json())
        .then(result => {
            if (result.error) {
                console.error('Error al guardar el turno:', result.error);
                res.redirect('/');
            }
            else {
                console.log('Turno reservado con éxito');
                res.redirect('/servicios'); // Redirigir a una página de éxito o a la vista de perfil
            }
        })
        .catch(err => {
            console.error('Error al guardar el turno:', err);
            res.status(500).send('Error al guardar el turno.');
        });
    } else {
        // Asegurarse de que el usuario esté autenticado y obtener su ID
        if (req.session && req.session.user_id) {
            const query = 'INSERT INTO turnos (cliente_id,  profesional_id, servicio_id, fecha, hora) VALUES (?, ?, ?, ?, ?)';
            const values = [req.session.user_id, 1, req.body.selectedtreatment, req.body.selecteddate, req.body.selectedtime];

            req.conn.query(query, values, (err, results) => {
                if (err) console.error('Error al guardar el turno:', err);

                res.redirect('/servicios'); // Redirigir a una página de éxito o a la vista de perfil
            });
        } else {
            console.error('No autorizado');
            res.redirect('/'); // Redirigir a la página de inicio
        }
    }
}

function sendReservedSlots(req, res) {
    if (process.env.ENVIRONMENT === 'production') {
        fetch('https://proyectomdsapidb.azurewebsites.net/api/httptriggerreservedslots', {
            method: 'GET'
        })
        .then(response => response.json())
        .then(result => {
            // Formatear los resultados en un objeto donde las claves sean las fechas y los valores arrays de horas
            const reservedSlots = {};

            result.forEach(turno => {
                const date = turno.fecha.toISOString().split('T')[0]; // Convertir la fecha a formato YYYY-MM-DD
                const time = turno.hora.slice(0, 5); // Formatear la hora a HH:MM

                if (!reservedSlots[date]) {
                    reservedSlots[date] = [];
                }
                reservedSlots[date].push(time);
            });
            // Enviar los turnos reservados al frontend
            res.json(reservedSlots);
        })
        .catch(err => {
            console.error('Error al obtener los turnos:', err);
        });
    } else {
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
}

// Función para crear una consulta
function crearConsulta(req, res) {
    const consulta = {
        cliente_id: req.session.user_id,
        consulta: req.body.consulta
    };
    const sql = 'INSERT INTO consultas (cliente_id, consulta) VALUES (?, ?)';
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
    const cliente_id = req.session.user_id;
    const sql = 'SELECT * FROM consultas WHERE cliente_id = ?';
    req.conn.query(sql, [cliente_id], (err, results) => {
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
        JOIN users ON consultas.cliente_id = users.user_id`;
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
    const sql = 'UPDATE consultas SET respuesta = ?, fecha_respuesta = NOW() WHERE consulta_id = ?';
    req.conn.query(sql, [respuesta, consulta_id], (err, results) => {
        if (err) {
            console.error('Error al responder la consulta:', err);
            return res.status(500).send('Error al responder la consulta.');
        }
        res.redirect('/todas'); // Redirigir a la vista de todas las consultas
    });
}

// Función para obtener solo los usuarios con rol de cliente
function obtenerClientes(req, res) {
    const sql = 'SELECT user_id, username, email, telefono, direccion FROM users WHERE role = "cliente"';

    req.conn.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener los clientes:', err);
            return res.status(500).send('Error al obtener los clientes.');
        }
        res.render('spa/clientes', { clientes: results }); // Renderizar la vista 'clientes' pasando los datos
    });
}



module.exports = {
    insertQuery,
    sendReservedSlots,
    crearConsulta,
    obtenerConsultasCliente,
    obtenerTodasConsultas,
    responderConsulta,
    obtenerClientes
};
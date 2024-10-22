function getClientes(req, res) {
    const query = 'SELECT email, username, nombre, apellido, telefono, direccion, role FROM users WHERE role = "cliente"';

    req.conn.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener los clientes:', err);
            return res.status(500).send('Error al obtener los datos de clientes.');
        }

        // Renderiza la vista y pasa los datos obtenidos
        //res.render('admin/clientes', { layout: 'admin', username: req.session.username, clientes: results});

        if (!req.session.loggedin || req.session.role == 'cliente') {
            return res.redirect('/');
        } else {
            res.render('admin/clientes', {
                layout: 'admin',
                username: req.session.username,
                admin: req.session.role == 'admin',
                profesional: req.session.role == 'profesional',
                secretaria: req.session.role == 'secretaria',
                clientes: results
            });
        }
    });
};

function getTurnosPorDia(req, res) {
    const fecha = new Date().toISOString().split('T')[0];

    // Consulta para obtener los turnos por fecha
    const queryTurnos = `
        SELECT t.id,
               c.username AS cliente, c.nombre as nombreCliente, c.apellido as apellidoCliente,
               p.username AS profesional, p.nombre as nombreProfesional, p.apellido as apellidoProfesional,
               s.nombre AS servicio,
               DATE_FORMAT(t.fecha, '%d-%m-%Y') AS fecha, TIME_FORMAT(t.hora, '%H:%i') AS hora

        FROM turnos t

        JOIN users c ON t.cliente_email = c.email
        JOIN users p ON t.profesional_email = p.email
        JOIN servicios s ON t.nombre_servicio = s.nombre

        WHERE t.fecha = ?`;

    req.conn.query(queryTurnos, [fecha], (err, results) => {
        if (err) {
            console.error('Error al obtener turnos:', err);
            return res.status(500).send('Error al obtener turnos.');
        }
        //res.render('admin/turnosPorDia', { layout: 'admin', username: req.session.username, turnos: results, fecha });
        if (!req.session.loggedin || req.session.role == 'cliente') {
            return res.redirect('/');
        } else {
            res.render('admin/turnosPorDia', {
                layout: 'admin',
                username: req.session.username,
                admin: req.session.role == 'admin',
                profesional: req.session.role == 'profesional',
                secretaria: req.session.role == 'secretaria',
                turnos: results,
                fecha
            });
        }
    });
};

function getClientesPorProfesional(req, res) {
    const fecha = new Date().toISOString().split('T')[0];

    const queryTurnos = `
    SELECT p.email AS emailProfesional, p.username AS profesional, p.nombre AS nombreProfesional, p.apellido AS apellidoProfesional,
           c.email AS emailCliente, c.username AS cliente, c.nombre AS nombreCliente, c.apellido AS apellidoCliente,
           s.nombre AS servicio,
           DATE_FORMAT(t.fecha, '%d-%m-%Y') AS fecha, TIME_FORMAT(t.hora, '%H:%i') AS hora

    FROM users p

    LEFT JOIN turnos t ON p.email = t.profesional_email
    LEFT JOIN users c ON t.cliente_email = c.email
    LEFT JOIN servicios s ON t.nombre_servicio = s.nombre

    WHERE p.role = 'profesional'

    ORDER BY p.username, t.fecha, t.hora`;

    req.conn.query(queryTurnos, (err, results) => {
        if (err) {
            console.error('Error al obtener turnos:', err);
            return res.status(500).send('Error al obtener turnos.');
        }
        //res.render('admin/clientesPorProfesional', { layout: 'admin', username: req.session.username, turnos: results, fecha });

        if (!req.session.loggedin || req.session.role == 'cliente') {
            return res.redirect('/');
        } else {
            res.render('admin/clientesPorProfesional', {
                layout: 'admin',
                username: req.session.username,
                admin: req.session.role == 'admin',
                profesional: req.session.role == 'profesional',
                secretaria: req.session.role == 'secretaria',
                turnos: results,
                fecha
            });
        }
    });
}

module.exports = {
    getClientes,
    getTurnosPorDia,
    getClientesPorProfesional
};
function getClientes(req, res) {
    //autorize(req, res);
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
    //autorize(req, res);
    // Usa la fecha enviada por el usuario o, si no se ha enviado, la fecha actual
    const fecha = req.query.fecha || new Date().toISOString().split('T')[0];

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
                fecha // Pasa la fecha seleccionada a la vista
            });
        }
    });
};


function getClientesPorProfesional(req, res) {
    //autorize(req, res);
    const fecha = new Date().toISOString().split('T')[0];

    // Obtén el nombre de usuario del profesional desde la consulta o deja vacío si no se selecciona ninguno
    const profesionalSeleccionado = req.query.profesional || '';

    // Consulta para obtener la lista de profesionales
    const queryProfesionales = `SELECT username, nombre, apellido FROM users WHERE role = 'profesional'`;

    // Consulta para obtener los turnos por profesional seleccionado
    let queryTurnos = `
        SELECT t.id,
               c.username AS cliente, c.nombre as nombreCliente, c.apellido as apellidoCliente,
               p.username AS profesional, p.nombre as nombreProfesional, p.apellido as apellidoProfesional,
               s.nombre AS servicio,
               DATE_FORMAT(t.fecha, '%d-%m-%Y') AS fecha, TIME_FORMAT(t.hora, '%H:%i') AS hora
        FROM turnos t
        JOIN users c ON t.cliente_email = c.email
        JOIN users p ON t.profesional_email = p.email
        JOIN servicios s ON t.nombre_servicio = s.nombre`;

    // Si se ha seleccionado un profesional, agregamos un filtro a la consulta
    if (profesionalSeleccionado) {
        queryTurnos += ` WHERE p.username = ?`;
    }

    // Ejecuta ambas consultas en paralelo
    req.conn.query(queryProfesionales, (err, profesionales) => {
        if (err) {
            console.error('Error al obtener profesionales:', err);
            return res.status(500).send('Error al obtener profesionales.');
        }

        req.conn.query(queryTurnos, profesionalSeleccionado ? [profesionalSeleccionado] : [], (err, turnos) => {
            if (err) {
                console.error('Error al obtener turnos:', err);
                return res.status(500).send('Error al obtener turnos.');
            }

            // Renderiza la vista con los turnos y los profesionales
            res.render('admin/clientesPorProfesional', {
                layout: 'admin',
                username: req.session.username,
                admin: req.session.role === 'admin',
                profesional: req.session.role === 'profesional',
                secretaria: req.session.role === 'secretaria',
                turnos,
                profesionales,
                profesionalSeleccionado,
                fecha
            });
        });
    });
}

function autorize(req, res) {
    if (req.session.role === 'admin' || req.session.role === 'profesional') {
        res.redirect('/admin/clientes');
    } else if (req.session.role === 'secretaria') {
        res.redirect('/admin/informe-ingresos');
    } else {
        // Si el rol no coincide con ninguno, podrías redirigir a una página de error o hacer otra acción
        res.redirect('/');
    }
}

module.exports = {
    getClientes,
    getTurnosPorDia,
    getClientesPorProfesional
};
function getClientes(req, res) {
    const query = 'SELECT user_id, username, email, telefono, direccion, role FROM users WHERE role = "cliente"';

    req.conn.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener los clientes:', err);
            return res.status(500).send('Error al obtener los datos de clientes.');
        }

        // Renderiza la vista y pasa los datos obtenidos
        res.render('admin/clientes', { layout: 'admin', username: req.session.username, clientes: results});

    });
};

function getTurnosPorDia(req, res) {
    // Suponiendo que tienes acceso a la conexión de la base de datos a través de req.conn
    const fecha = new Date().toISOString().split('T')[0];

    // Consulta para obtener los turnos por fecha
    const queryTurnos = `
        SELECT t.turno_id, c.username AS cliente, p.username AS profesional, s.nombre_servicio AS servicio, t.fecha, t.hora
        FROM turnos t
        JOIN users c ON t.cliente_id = c.user_id
        JOIN users p ON t.profesional_id = p.user_id
        JOIN servicios s ON t.servicio_id = s.id
        WHERE t.fecha = ?
    `;

    req.conn.query(queryTurnos, [fecha], (err, results) => {
        if (err) {
            console.error('Error al obtener turnos:', err);
            return res.status(500).send('Error al obtener turnos.');
        }
        res.render('admin/turnosPorDia', { layout: 'admin', username: req.session.username, turnos: results, fecha });
    });
};

function getClientesPorProfesional(req, res) {
    const fecha = new Date().toISOString().split('T')[0];

    const queryTurnos = `
    SELECT p.user_id AS profesional_id, p.username AS profesional,
           c.username AS cliente, s.nombre_servicio AS servicio,
           t.fecha, t.hora
    FROM users p
    LEFT JOIN turnos t ON p.user_id = t.profesional_id
    LEFT JOIN users c ON t.cliente_id = c.user_id
    LEFT JOIN servicios s ON t.servicio_id = s.id
    WHERE p.role = 'profesional'
    ORDER BY p.username, t.fecha, t.hora
`;

req.conn.query(queryTurnos, (err, results) => {
    if (err) {
        console.error('Error al obtener turnos:', err);
        return res.status(500).send('Error al obtener turnos.');
    }
    res.render('admin/clientesPorProfesional', { layout: 'admin', username: req.session.username, turnos: results, fecha });
});
}

module.exports = {
    getClientes,
    getTurnosPorDia,
    getClientesPorProfesional
};
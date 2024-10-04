function insertQuery(req, res) {
    // Asegurarse de que el usuario esté autenticado y obtener su ID
    if (req.session && req.session.user_id) {
        const query = 'INSERT INTO Turnos (cliente_id, nombre_servicio, fecha, hora) VALUES (?, ?, ?, ?)';
        const values = [req.session.user_id, req.body.selectedtreatment, req.body.selecteddate, req.body.selectedtime];

        req.conn.query(query, values, (err, results) => {
            if (err) console.error('Error al guardar el turno:', err);

            console.log('Turno reservado con éxito');
            res.redirect('/servicios'); // Redirigir a una página de éxito o a la vista de perfil
        });
    } else {
        console.error('No autorizado');
        res.redirect('/'); // Redirigir a la página de inicio
    }
}

function sendReservedSlots(req, res) {
    const query = 'SELECT fecha, hora FROM Turnos WHERE fecha >= CURDATE()';

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

module.exports = {
    insertQuery,
    sendReservedSlots
};

function insertQuery(req, res) {
    // Aquí debes asegurarte de que el usuario esté autenticado y obtener su ID

    if (req.session) {
        req.getConnection((err, conn) => {
            conn.query('INSERT INTO turnos (cliente_id, nombre_servicio, fecha, hora) VALUES (?, ?, ?, ?)', [req.session.user_id, req.body.selectedtreatment, req.body.selecteddate, req.body.selectedtime], (err, results) => {
                if (err) {
                    console.error(err);
                    console.err('Error al guardar el turno');
                }
                console.log('Turno reservado con éxito');
                res.redirect('/'); // Redirigir a una página de éxito o a la vista de perfil
            });
        });
    } else {
        console.err('No autorizado');

        res.redirect('/'); // Redirigir a la página de inicio
    }
}

function sendReservedSlots(req, res) {
    req.getConnection((err, conn) => {
        if (err) {
            console.error('Error en la conexión a la base de datos:', err);
        }

        // Consulta para obtener fechas y horas de turnos reservados
        const query = 'SELECT fecha, hora FROM turnos WHERE fecha >= CURDATE()';

        conn.query(query, (err, results) => {
            if (err) {
                console.error('Error en la consulta de turnos:', err);
            }

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
    });
}

module.exports = {
    insertQuery,
    sendReservedSlots
};
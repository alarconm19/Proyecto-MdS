let contadorUsuario = 0;

function guardarTurno(req, res) {
    let date = req.body.fecha;
    let time = req.body.hora;
    let service = req.body.servicio;
    const clientId = req.session.loggedin;
    
    if (clientId) {
        console.log('legue');
        req.getConnection((err, conn) => {
            conn.query('INSERT INTO turnos (cliente_id, nombre_servicio, fecha, hora) VALUES (?, ?, ?, ?)', [req.session.userId, service, date, time], (err, results) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ success: false, message: 'Error al guardar el turno' });
                }
                console.log('Turno reservado con éxito');
                res.redirect('/'); // Redirigir a una página de éxito o a la vista de perfil
            });
        });
    } else {
        console.log('No autorizado/Sesion no iniciada');
        res.status(401).json({ success: false, message: 'No autorizado' });
        res.redirect('/'); // Redirigir a la página de inicio
    }
}

module.exports = {
    guardarTurno
}
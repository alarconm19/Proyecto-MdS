
function insertQuery(req, res) {
    // Aquí debes asegurarte de que el usuario esté autenticado y obtener su ID

    if (req.session) {
        req.getConnection((err, conn) => {
            conn.query('INSERT INTO turnos (cliente_id, nombre_servicio, fecha, hora) VALUES (?, ?, ?, ?)', [req.session.user_id, req.body.selectedtreatment, req.body.selecteddate, req.body.selectedtime], (err, results) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ success: false, message: 'Error al guardar el turno' });
                }
                console.log('Turno reservado con éxito');
                res.redirect('/'); // Redirigir a una página de éxito o a la vista de perfil
            });
        });
    } else {
        console.log('No autorizado');

        res.redirect('/'); // Redirigir a la página de inicio
    }
}

module.exports = {
    insertQuery
};
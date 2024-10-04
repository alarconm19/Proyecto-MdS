
// Mostrar perfil
const showProfile = (req, res) => {
    if (req.session.loggedin) {
        res.render('profile', {
            username: req.session.username,
            email: req.session.email,
            direccion: req.session.direccion,
            telefono: req.session.telefono
        });
    } else {
        res.redirect('/login');
    }
};

// Actualizar perfil
const updateProfile = (req, res) => {
    const { username, email, direccion, telefono } = req.body;

    // Verificar si la conexión a la base de datos está disponible
    if (req.conn) {
        const query = 'UPDATE users SET email = ?, direccion = ?, telefono = ? WHERE username = ?';
        const values = [email, direccion, telefono, req.session.username];

        req.conn.query(query, values, (err, result) => {
            if (err) console.error('Error al actualizar el perfil:', err);

            // Actualizar los datos de la sesión
            req.session.username = username;
            req.session.email = email;
            req.session.direccion = direccion;
            req.session.telefono = telefono;

            // Redirigir al perfil actualizado
            res.redirect('/profile');
        });
    } else console.error('Conexión a la base de datos no disponible');

};

module.exports = { showProfile, updateProfile };

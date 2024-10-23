// Mostrar perfil
const showProfile = (req, res) => {
    // Verificar si el usuario está autenticado
    if (!req.session.loggedin) {
        return res.redirect('/login'); // Redirigir al login si no está autenticado
    }

    if (!req.session.email) {
        console.error('Error: email no está definido en la sesión');
        return res.status(500).send('Error de sesión');
    }

    // Consulta para obtener los turnos del usuario con el nombre del servicio
    const query = `
        SELECT
            t.id,
            s.nombre AS servicio,
            DATE_FORMAT(t.fecha, '%d-%m-%Y') AS fecha,
            TIME_FORMAT(t.hora, '%H:%i') AS hora,
            t.estado
        FROM
            turnos t
        JOIN
            servicios s ON t.nombre_servicio = s.nombre
        WHERE
            t.cliente_email = ?
        ORDER BY
            t.fecha, t.hora`;

    req.conn.query(query, [req.session.email], (err, turnos) => {
        if (err) {
            console.error('Error al obtener los turnos:', err);
            console.error('Query:', query);
            console.error('Email:', email);
            return res.status(500).send('Error al cargar los turnos: ' + err.message);
        }

        //console.log('Turnos obtenidos:', turnos); // Log para verificar los datos recibidos

        // Renderizar la vista del perfil, pasando los datos del usuario y los turnos
        res.render('spa/profile', {
            email: req.session.email,
            username: req.session.username,
            nombre: req.session.nombre,
            apellido: req.session.apellido,
            direccion: req.session.direccion,
            telefono: req.session.telefono,
            turnos: turnos // Enviamos la lista de turnos con la información completa
        });
    });
};

// Actualizar perfil
const updateProfile = (req, res) => {
    const { username, email, nombre, apellido, telefono, direccion } = req.body;

    // Verificar si la conexión a la base de datos está disponible
    if (req.conn) {
        // Consultar si el nuevo email o username ya están registrados
        const checkUserQuery = `
            SELECT * FROM users
            WHERE (email = ? AND email != ?) OR
                  (username = ? AND username != ?)`;
        req.conn.query(checkUserQuery, [email, req.session.email, username, req.session.username], (err, results) => {
            if (err) {
                console.error('Error al verificar el email o username:', err);
                return res.status(500).send('Error al actualizar el perfil.');
            }

            // Si el email o username ya existe en otra cuenta, manejar el error
            if (results.length > 0) {
                return res.render('profile', { error: 'Error: El correo electrónico o el nombre de usuario ya están en uso.' });
            }

            // Actualizar los datos del usuario
            const query = `
                UPDATE users
                SET email = ?, username = ?, nombre = ?, apellido = ?, telefono = ?, direccion = ?
                WHERE email = ?`;
            const values = [
                email,
                username,
                nombre,
                apellido,
                telefono,
                direccion,
                req.session.email
            ];

            req.conn.query(query, values, (err, result) => {
                if (err) {
                    console.error('Error al actualizar el perfil:', err);
                    return res.status(500).send('Error al actualizar el perfil.');
                }

                // Actualizar los datos de la sesión
                req.session.email = email; // Actualiza el email en la sesión si ha cambiado
                req.session.username = username;
                req.session.nombre = nombre;
                req.session.apellido = apellido;
                req.session.telefono = telefono;
                req.session.direccion = direccion;

                // Redirigir al perfil actualizado
                res.redirect('/profile');
            });
        });
    } else {
        console.error('Conexión a la base de datos no disponible');
        res.status(500).send('Error de conexión a la base de datos.');
    }
};

module.exports = { showProfile, updateProfile };

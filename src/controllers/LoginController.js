const bcrypt = require('bcryptjs');

function login(req, res) {
    if (req.session.loggedin) {
        res.redirect('/');
    } else {
        res.render('spa/login/login');
    }
}

// Función de login (acepta usuario o correo electrónico)
function auth(req, res) {
    const data = req.body;

    req.conn.query(
        'SELECT * FROM users WHERE username = ? OR email = ?',
        [data.login, data.login],
        (err, results) => {
            if (err) {
                console.error("Error en la consulta de la base de datos:", err);
                res.status(500).send("Error en el inicio de sesión.");
            } else if (results.length === 0) {
                res.render('spa/login/login', { error: "Usuario no encontrado" });
            } else {
                const user = results[0];
                // Verificar la contraseña
                bcrypt.compare(data.password, user.password, (err, isMatch) => {
                    if (err) {
                        console.error("Error al verificar la contraseña:", err);
                        res.status(500).send("Error en el inicio de sesión.");
                    } else if (isMatch) {
                        // Guardar datos en la sesión
                        req.session.loggedin = true;
                        req.session.email = user.email;
                        req.session.username = user.username;
                        req.session.nombre = user.nombre;
                        req.session.apellido = user.apellido;
                        req.session.direccion = user.direccion;
                        req.session.telefono = user.telefono;
                        req.session.role = user.role;

                        res.redirect('/');
                    } else {
                        res.render('spa/login/login', { error: "Contraseña incorrecta" });
                    }
                });
            }
        }
    );
}

function register(req, res) {
    if (req.session.loggedin) {
        res.redirect('/');
    } else {
        res.render('spa/login/register');
    }
}

// Función de registro (verifica usuario y correo electrónico)
function storeUser(req, res) {
    const data = req.body;

    // Encriptar la contraseña antes de enviarla a la API o DB local
    bcrypt.hash(data.password, 10, (err, hashedPassword) => {
        if (err) {
            console.error("Error al encriptar la contraseña:", err);
            res.status(500).send("Error en el registro.");
            return;
        }

        data.password = hashedPassword;

        // Verificar si el nombre de usuario o correo ya existe
        const queryCheckUser = 'SELECT * FROM users WHERE username = ? OR email = ?';
        req.conn.query(queryCheckUser, [data.username, data.email], (err, userdata) => {
            if (err) {
                console.error('Error en la consulta SQL:', err);
                res.status(500).send('Error en el registro.');
                return;
            }

            if (userdata.length > 0) {
                res.render('spa/login/register', { error: 'Error: El nombre de usuario o correo ya existe.' });
            } else {
                // Insertar nuevo usuario con nombre de usuario, correo y contraseña encriptada
                const queryInsertUser = 'INSERT INTO users SET ?';
                req.conn.query(queryInsertUser, [data], (err, result) => {
                    if (err) {
                        console.error('Error al insertar el usuario:', err);
                        res.status(500).send('Error en el registro.');
                        return;
                    }

                    // Guardar datos en la sesión
                    req.session.loggedin = true;
                    req.session.email = data.email;
                    req.session.username = data.username;
                    req.session.nombre = data.nombre;
                    req.session.apellido = data.apellido;
                    req.session.direccion = data.direccion;
                    req.session.telefono = data.telefono;
                    req.session.role = 'cliente';

                    res.redirect('/');
                });
            }
        });
    });
}

function logout(req, res) {
    if (req.session.loggedin) {
        req.session.destroy();
    }
    res.redirect('/');
}

module.exports = {
    login,
    register,
    storeUser,
    auth,
    logout
};
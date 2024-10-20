const argon2 = require('argon2');

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

    // Determina si estás en producción o desarrollo
    if (process.env.ENVIRONMENT === 'production') {
        // En producción, usa la API
        console.log("Usando API para autenticación");

        // Enviar la información a la API para autenticar
        fetch('https://proyectomdsapidb.azurewebsites.net/api/httpTriggerAuth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                login: data.login,
                password: data.password
            })
        })
            .then(response => response.json())
            .then(result => {
                if (result.error) {
                    res.render('spa/login/login', { error: result.error });
                } else {
                    // Guardar datos en la sesión
                    req.session.loggedin = true;
                    req.session.user_id = result.user_id;
                    req.session.username = result.username;
                    req.session.email = result.email;
                    req.session.direccion = result.direccion;
                    req.session.telefono = result.telefono;

                    res.redirect('/');
                }
            })
            .catch(err => {
                console.error('Error en la API:', err);
                res.status(500).send('Error en el inicio de sesión.');
            });
    } else {
        // En desarrollo, usa la base de datos local
        console.log("Usando base de datos local para autenticación");

        req.conn.query(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [data.login, data.login],
            async (err, results) => {
                if (err) {
                    console.error("Error en la consulta de la base de datos:", err);
                    res.status(500).send("Error en el inicio de sesión.");
                } else if (results.length === 0) {
                    res.render('spa/login/login', { error: "Usuario no encontrado" });
                } else {
                    const user = results[0];
                    try {
                        // Verificar la contraseña
                        if (await argon2.verify(user.password, data.password)) {
                            // Guardar datos en la sesión
                            req.session.loggedin = true;
                            req.session.user_id = user.user_id;
                            req.session.username = user.username;
                            req.session.email = user.email;
                            req.session.direccion = user.direccion;
                            req.session.telefono = user.telefono;

                            res.redirect('/');
                        } else {
                            res.render('spa/login/login', { error: "Contraseña incorrecta" });
                        }
                    } catch (err) {
                        console.error("Error al verificar la contraseña:", err);
                        res.status(500).send("Error en el inicio de sesión.");
                    }
                }
            }
        );
    }
};

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
    argon2.hash(data.password)
        .then(hashedPassword => {
            data.password = hashedPassword;

            if (process.env.ENVIRONMENT === 'production') {
                // En producción, usar la API
                console.log("Usando API para registro");

                fetch('https://proyectomdsapidb.azurewebsites.net/api/httptriggerstoreuser', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: data.username,
                        email: data.email,
                        password: data.password,
                        direccion: data.direccion,
                        telefono: data.telefono
                    })
                })
                    .then(response => response.json())
                    .then(result => {
                        if (result.error) {
                            res.render('spa/login/register', { error: result.error });
                        } else {
                            // Guardar datos en la sesión
                            req.session.loggedin = true;
                            req.session.user_id = result.userId;
                            req.session.username = data.username;
                            req.session.email = data.email;
                            req.session.direccion = data.direccion;
                            req.session.telefono = data.telefono;

                            res.redirect('/');
                        }
                    })
                    .catch(err => {
                        console.error('Error en la API:', err);
                        res.status(500).send('Error en el registro.');
                    });
            } else {
                // En desarrollo, usar la base de datos local
                console.log("Usando base de datos local para registro");

                // Verificar si el nombre de usuario o correo ya existe
                const queryCheckUser = 'SELECT * FROM users WHERE username = ? OR email = ?';
                req.conn.query(queryCheckUser, [data.username, data.email], (err, userdata) => {
                    if (err) {
                        console.error('Error en la consulta SQL:', err);
                        res.status(500).send('Error en el registro.');
                        return;
                    }

                    if (userdata.length > 0) {
                        res.render('spa/spa/login/register', { error: 'Error: El nombre de usuario o correo ya existe.' });
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
                            req.session.user_id = result.insertId; // ID del nuevo usuario
                            req.session.username = data.username;
                            req.session.email = data.email;
                            req.session.direccion = data.direccion;
                            req.session.telefono = data.telefono;

                            res.redirect('/');
                        });
                    }
                });
            }
        })
        .catch(err => {
            console.error("Error al encriptar la contraseña:", err);
            res.status(500).send("Error en el registro.");
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

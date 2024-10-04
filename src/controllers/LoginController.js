const argon2 = require('argon2');

function login (req, res) {
	if (req.session.loggedin) res.redirect('/');
	else res.render('login/login');
}

// Función de login (acepta usuario o correo electrónico)
function auth (req, res) {
    const data = req.body;
    const query = data.login.includes('@') ? 'SELECT * FROM users WHERE email = ?' : 'SELECT * FROM users WHERE username = ?';

    req.conn.query(query, [data.login], (err, results) => {
        if (err) {
            console.error('Error en la consulta SQL:', err);
            return;
        }

        if (results.length > 0) {
            // Comparar la contraseña encriptada
            argon2.verify(results[0].password, data.password)
                .then(isMatch => {
                    if (!isMatch) {
                        res.render('login/login', { error: 'Error: Contraseña incorrecta.' });
                    } else {
                        // Guardar datos en la sesión
                        req.session.loggedin = true;
                        req.session.user_id = results[0].user_id;
                        req.session.username = results[0].username;
                        req.session.email = results[0].email;
                        req.session.direccion = results[0].direccion;
                        req.session.telefono = results[0].telefono;

                        res.redirect('/');
                    }
                })
        } else
            res.render('login/login', { error: 'Error: Usuario o correo no encontrado.' });

    });
};


function register (req, res) {
	if (req.session.loggedin) res.redirect('/');
	else res.render('login/register');
}

// Función de registro (verifica usuario y correo electrónico)
function storeUser(req, res) {
    const data = req.body;

    // Encriptar la contraseña antes de enviarla a la API
    argon2.hash(data.password)
        .then(hashedPassword => {
            // Actualizar la contraseña en los datos con la versión encriptada
            data.password = hashedPassword;

            // Enviar la información a la API
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
                    // Mostrar error si el nombre de usuario o correo ya existen
                    res.render('login/register', { error: result.error });
                } else {
                    // Guardar datos en la sesión
                    req.session.loggedin = true;
                    req.session.user_id = result.userId;
                    req.session.username = data.username;
                    req.session.email = data.email;
                    req.session.direccion = data.direccion;
                    req.session.telefono = data.telefono;

                    // Redirigir al inicio
                    res.redirect('/');
                }
            })
            .catch(err => {
                console.error('Error en la API:', err);
                res.status(500).send('Error en el registro.');
            });
        });
}


function logout(req, res) {
	if(req.session.loggedin) {
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
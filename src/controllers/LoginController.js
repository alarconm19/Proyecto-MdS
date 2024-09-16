const bcrypt = require('bcryptjs');

function login (req, res) {
	if (req.session.loggedin) res.redirect('/');
	else res.render('login/login');
}

// Función de login (acepta usuario o correo electrónico)
function auth(req, res) {
    const data = req.body;

    req.getConnection((err, conn) => {
        // Verificar si el campo de login es un correo o un usuario
        const query = data.login.includes('@') ? 'SELECT * FROM users WHERE email = ?' : 'SELECT * FROM users WHERE username = ?';

        conn.query(query, [data.login], (err, userdata) => {
            if (userdata.length > 0) {
                // Comparar la contraseña encriptada
                bcrypt.compare(data.password, userdata[0].password, (err, isMatch) => {
                    if (!isMatch) {
                        res.render('login/login', { error: 'Error: Contraseña incorrecta.' });
                    } else {
                        req.session.loggedin = true;
                        req.session.user_id = userdata[0].user_id; // Guardar el ID de usuario en sesión
                        req.session.username = userdata[0].username; // Guardar el nombre de usuario en sesión
                        req.session.email = userdata[0].email; // Guardar el correo en sesión
                        req.session.direccion = userdata[0].direccion; // Guardar la dirección en sesión
                        req.session.telefono = userdata[0].telefono; // Guardar el teléfono en sesión

                        res.redirect('/');
                    }
                });
            } else {
                res.render('login/login', { error: 'Error: Usuario o correo no encontrado.' });
            }
        });
    });
}

function register (req, res) {
	if (req.session.loggedin) res.redirect('/');
	else res.render('login/register');
}

// Función de registro (verifica usuario y correo electrónico)
function storeUser(req, res) {
    const data = req.body;

    req.getConnection((err, conn) => {
        // Verificar si el nombre de usuario o correo ya existe
        conn.query('SELECT * FROM users WHERE username = ? OR email = ?', [data.username, data.email], (err, userdata) => {
            if (userdata.length > 0) {
                res.render('login/register', { error: 'Error: El nombre de usuario o correo ya existe.' });
            } else {
                // Encriptar la contraseña
                bcrypt.hash(data.password, 10).then((hash) => {
                    data.password = hash;

                    req.getConnection((err, conn) => {
                        // Insertar nuevo usuario con nombre de usuario, correo y contraseña
                        conn.query('INSERT INTO users SET ?', [data], (err, rows) => {
                            req.session.loggedin = true;
                            req.session.user_id = userdata[0].user_id; // Guardar el ID de usuario en sesión
                            req.session.username = userdata[0].username; // Guardar el nombre de usuario en sesión
                            req.session.email = userdata[0].email; // Guardar el correo en sesión
                            req.session.direccion = userdata[0].direccion; // Guardar la dirección en sesión
                            req.session.telefono = userdata[0].telefono; // Guardar el teléfono en sesión

                            res.redirect('/');
                        });
                    });
                });
            }
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
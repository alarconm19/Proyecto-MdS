const bcrypt = require('bcryptjs');

function login (req, res) {
	if (req.session.loggedin) res.redirect('/');
	else res.render('login/login');
}

// Función de login (acepta usuario o correo electrónico)
// function auth(req, res) {
//     const data = req.body;

//     req.getConnection((err, conn) => {
//         // Verificar si el campo de login es un correo o un usuario
//         const query = data.login.includes('@') ? 'SELECT * FROM users WHERE email = ?' : 'SELECT * FROM users WHERE username = ?';

//         conn.query(query, [data.login], (err, userdata) => {
//             if (userdata.length > 0) {
//                 // Comparar la contraseña encriptada
//                 bcrypt.compare(data.password, userdata[0].password, (err, isMatch) => {
//                     if (!isMatch) {
//                         res.render('login/login', { error: 'Error: Contraseña incorrecta.' });
//                     } else {
//                         req.session.loggedin = true;
//                         req.session.user_id = userdata[0].user_id; // Guardar el ID de usuario en sesión
//                         req.session.username = userdata[0].username; // Guardar el nombre de usuario en sesión
//                         req.session.email = userdata[0].email; // Guardar el correo en sesión
//                         req.session.direccion = userdata[0].direccion; // Guardar la dirección en sesión
//                         req.session.telefono = userdata[0].telefono; // Guardar el teléfono en sesión

//                         res.redirect('/');
//                     }
//                 });
//             } else {
//                 res.render('login/login', { error: 'Error: Usuario o correo no encontrado.' });
//             }
//         });
//     });
// }

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
            bcrypt.compare(data.password, results[0].password, (err, isMatch) => {
                if (err || !isMatch)
                    res.render('login/login', { error: 'Error: Contraseña incorrecta.' });
                else {
                    // Guardar datos en la sesión
                    req.session.loggedin = true;
                    req.session.user_id = results[0].user_id;
                    req.session.username = results[0].username;
                    req.session.email = results[0].email;
                    req.session.direccion = results[0].direccion;
                    req.session.telefono = results[0].telefono;
                    req.session.role = results[0].role; 
                    console.log('Rol guardado en sesión:', req.session.role);

                    res.redirect('/');
                }
            });
        } else
            res.render('login/login', { error: 'Error: Usuario o correo no encontrado.' });

    });
};


function register (req, res) {
	if (req.session.loggedin) res.redirect('/');
	else res.render('login/register');
}

// Función de registro (verifica usuario y correo electrónico)
// function storeUser(req, res) {
//     const data = req.body;

//     req.getConnection((err, conn) => {
//         // Verificar si el nombre de usuario o correo ya existe
//         conn.query('SELECT * FROM users WHERE username = ? OR email = ?', [data.username, data.email], (err, userdata) => {
//             if (userdata.length > 0) {
//                 res.render('login/register', { error: 'Error: El nombre de usuario o correo ya existe.' });
//             } else {
//                 // Encriptar la contraseña
//                 bcrypt.hash(data.password, 10).then((hash) => {
//                     data.password = hash;

//                     req.getConnection((err, conn) => {
//                         // Insertar nuevo usuario con nombre de usuario, correo y contraseña
//                         conn.query('INSERT INTO users SET ?', [data], (err, rows) => {
//                             req.session.loggedin = true;
//                             req.session.user_id = userdata[0].user_id; // Guardar el ID de usuario en sesión
//                             req.session.username = userdata[0].username; // Guardar el nombre de usuario en sesión
//                             req.session.email = userdata[0].email; // Guardar el correo en sesión
//                             req.session.direccion = userdata[0].direccion; // Guardar la dirección en sesión
//                             req.session.telefono = userdata[0].telefono; // Guardar el teléfono en sesión

//                             res.redirect('/');
//                         });
//                     });
//                 });
//             }
//         });
//     });
// }

function storeUser(req, res) {
    const data = req.body;

    // Verificar si el nombre de usuario o correo ya existe
    const queryCheckUser = 'SELECT * FROM users WHERE username = ? OR email = ?';

    req.conn.query(queryCheckUser, [data.username, data.email], (err, userdata) => {
        if (err) {
            console.error('Error en la consulta SQL:', err);
            res.status(500).send('Error en el registro.');
            return;
        }

        if (userdata.length > 0)
            res.render('login/register', { error: 'Error: El nombre de usuario o correo ya existe.' });
        else {
            // Encriptar la contraseña
            bcrypt.hash(data.password, 10).then((hash) => {
                data.password = hash;

                // Insertar nuevo usuario con nombre de usuario, correo y contraseña
                const queryInsertUser = 'INSERT INTO users SET ?';

                req.conn.query(queryInsertUser, [data], (err, result) => {
                    if (err) {
                        console.error('Error al insertar el usuario:', err);
                        res.status(500).send('Error en el registro.');
                        return;
                    }

                    // Guardar los datos del nuevo usuario en la sesión
                    req.session.loggedin = true;
                    req.session.user_id = result.insertId; // Guardar el ID de usuario en sesión
                    req.session.username = data.username; // Guardar el nombre de usuario en sesión
                    req.session.email = data.email; // Guardar el correo en sesión
                    req.session.direccion = data.direccion; // Guardar la dirección en sesión (si existe)
                    req.session.telefono = data.telefono; // Guardar el teléfono en sesión (si existe)

                    res.redirect('/');
                });
            }).catch((err) => {
                console.error('Error al encriptar la contraseña:', err);
            });
        }
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
const bcrypt = require('bcryptjs');

function login (req, res) {
	if (req.session.loggedin) res.redirect('/');
	else res.render('login/login');
}

function auth(req, res) {
	const data = req.body;

	req.getConnection((err, conn) => {
		conn.query('SELECT * FROM users WHERE username = ?', [data.username], (err, userdata) => {
			if (userdata.length > 0) {
				bcrypt.compare(data.password, userdata[0].password, (err, isMatch) => {
					if(!isMatch) {
						res.render('login/login', { error: 'Error: Contraseña incorrecta.' });
					}
					else {
						req.session.loggedin = true;
						req.session.username = data.username;

						res.redirect('/');
					}
				});
			}
			else {
				res.render('login/login', { error: 'Error: Usuario no encontrado.' });
			}
		});
	});
}

function register (req, res) {
	if (req.session.loggedin) res.redirect('/');
	else res.render('login/register');
}

function storeUser(req, res) {
	const data = req.body;

	req.getConnection((err, conn) => {
		conn.query('SELECT * FROM users WHERE username = ?', [data.username], (err, userdata) => {
			if (userdata.length > 0) {
				res.render('login/register', { error: 'Error: Ese nombre de usuario ya existe.' });
				console.log(data);
			}
			else {
				bcrypt.hash(data.password, 10).then((hash) => {
					data.password = hash;

					req.getConnection((err, conn) => {
						conn.query('INSERT INTO users SET ?', [data], (err, rows) => {
							req.session.loggedin = true;
							req.session.username = data.username;

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
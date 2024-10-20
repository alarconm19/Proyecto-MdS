const argon2 = require('argon2');

function login (req, res) {
	if (req.session.loggedin) res.redirect('/');
	else res.render('login/login');
}

// Función de login (acepta usuario o correo electrónico)
function auth (req, res) {
    const data = req.body;

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
            res.render('login/login', { error: result.error });
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
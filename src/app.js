const express = require ('express');
const { engine } = require ('express-handlebars');
const myconection = require ('express-myconnection');
const mysql = require ('mysql');
const session = require ('express-session');
const bodyParser = require ('body-parser');
const path = require('path');
require('dotenv').config();

const loginRoutes = require('./routes/login');

const app = express();
app.set('port', 4000);

app.set('views', __dirname + '/views');
app.engine('.hbs', engine ({
    extname: '.hbs'
}));
app.set('view engine', '.hbs');

// Configura la carpeta public para archivos estáticos
app.use(express.static(path.join(__dirname,'..' , 'public')));

app.use(myconection(mysql, {
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASS,
    port: 3306,
    database: 'pweb'
}, 'single'));

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.listen(app.get('port'), () => {
    console.log('Server on port', app.get('port'));
});

app.use('/', loginRoutes);

app.get('/', (req, res) => {
    if(req.session.loggedin) res.render('index', { username: req.session.username });
    else res.render('index');

    // if (!req.session.loggedin) res.redirect('/login');
	// else res.render('home');
});

app.get('/about', (req, res) => {
    if(req.session.loggedin) res.render('about', { username: req.session.username });
    else res.render('about');
});

app.get('/contact', (req, res) => {
    if(req.session.loggedin) res.render('contact', { username: req.session.username });
    else res.render('contact');
});

app.get('/shop', (req, res) => {
    if(req.session.loggedin) res.render('shop', { username: req.session.username });
    else res.render('shop');
});

// Middleware para manejar errores 404 (Página no encontrada)
app.use((req, res, next) => {
    res.status(404).render('404');
});

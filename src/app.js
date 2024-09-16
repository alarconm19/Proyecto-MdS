const express = require ('express');
const { engine } = require ('express-handlebars');
const myconection = require ('express-myconnection');
const mysql = require ('mysql');
const session = require ('express-session');
const bodyParser = require ('body-parser');
const path = require('path');
require('dotenv').config();

const loginRoutes = require('./routes/login');
const routes = require('./routes/routes');

const app = express();
const PORT = process.env.PORT || 8080;

app.set('views', __dirname + '/views');
app.engine('.hbs', engine ({
    extname: '.hbs'
}));
app.set('view engine', '.hbs');

// Configura la carpeta public para archivos estáticos
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(myconection(mysql, {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    port: 3306,
    database: 'pweb'
}, 'single'));

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Cambia a true si usas HTTPS
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.listen(PORT, () => {
    console.log(`Server on port ${PORT}`);
});

app.use('/', loginRoutes);
app.use('/', routes);


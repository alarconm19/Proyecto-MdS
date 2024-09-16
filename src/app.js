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
app.set('port', 4000);

app.set('views', __dirname + '/views');
app.engine('.hbs', engine ({
    extname: '.hbs'
}));
app.set('view engine', '.hbs');

// Configura la carpeta public para archivos estáticos
app.use(express.static(path.join(__dirname, '..', 'public')));

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
app.use('/', routes);


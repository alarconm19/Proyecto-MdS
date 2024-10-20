const express = require ('express');
const { engine } = require ('express-handlebars');
const session = require ('express-session');
const path = require('path');
const mysql2 = require('mysql2');
const fs = require('fs');
const loginRoutes = require('./routes/login');
const routes = require('./routes/routes');
const certPath = path.join(__dirname, '../certificates/DigiCertGlobalRootCA.crt.pem');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 8080;

app.set('views', __dirname + '/views');
app.engine('.hbs', engine ({
    extname: '.hbs'
}));
app.set('view engine', '.hbs');

// Configura la carpeta public para archivos estáticos
app.use(express.static(path.join(__dirname, '..', 'public')));

var config =
{
    host: process.env.AZDB_HOST,
    user: process.env.AZDB_USER,
    password: process.env.AZDB_PASS,
    database: 'pweb',
    port: 3306,
    ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync(certPath, "utf8")
    }
};


// Middleware para conectar la base de datos
app.use((req, res, next) => {
    req.conn = mysql2.createConnection(config);
    req.conn.connect(function (err) {
        if (err) {
            console.log("!!! Cannot connect !!! Error:");
            next(err);
        } else {
            next();
        }
    });
});

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

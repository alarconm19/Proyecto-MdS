const express = require ('express');
const { engine } = require ('express-handlebars');
const session = require ('express-session');
const path = require('path');
const mysql2 = require('mysql2');
const fs = require('fs');
//const hbs = require('hbs');
const adminRoutes = require('./routes/admin.routes');
const databaseRoutes = require('./routes/database.routes');
const loginRoutes = require('./routes/login.routes');
const routes = require('./routes/routes');
const certPath = path.join(__dirname, '../certificates/DigiCertGlobalRootCA.crt.pem');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 3000;

app.set('views', __dirname + '/views');
app.engine('.hbs', engine ({
    extname: '.hbs'
}));
app.set('view engine', '.hbs');


// Configura la carpeta public para archivos estáticos
app.use(express.static(path.join(__dirname, '..', 'public')));
// Registrar los partials
//hbs.registerPartials(path.join(__dirname, 'views/partials'));

var AZURE_DB =
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

var AWS_DB =
{
    host: process.env.AWS_HOST,
    user: process.env.AWS_USER,
    password: process.env.AWS_PASS,
    database: 'pweb',
    port: 3306,
};

var Local_DB =
{
    host: "localhost",
    user: "root",
    password: "",
    database: 'pweb',
    port: 3306
};

// Middleware para conectar la base de datos
app.use((req, res, next) => {
    if (process.env.ENVIRONMENT === 'production') {
        //console.log("Usando API para la autenticación y conexión remota.");
        // Aquí puedes conectar a la API en lugar de la base de datos local
        req.conn = mysql2.createConnection(AWS_DB);
    } else {
        //console.log("Usando base de datos local para desarrollo.");
        req.conn = mysql2.createConnection(AZURE_DB);
    }

    req.conn.connect(function (err) {
        if (err) {
            console.log("!!! No se puede conectar !!! Error:");
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
app.use('/', adminRoutes);
app.use('/', databaseRoutes);
app.use('/', routes);
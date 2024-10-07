const express = require ('express');
const { engine } = require ('express-handlebars');
//const myconection = require ('express-myconnection');
//const mysql = require ('mysql');
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
    helpers: {
        eq: (a, b) => a === b },
    extname: '.hbs'
}));
app.set('view engine', '.hbs');


// Configura la carpeta public para archivos estáticos
app.use(express.static(path.join(__dirname, '..', 'public')));

// app.use(myconection(mysql, {
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASS,
//     port: 3306,
//     database: 'pweb'
// }, 'single'));

var config =
{
    host: 'localhost',
    user: 'root',
    password: 'iara1611',
    database: 'pweb',
    port: 3306,
    // ssl: {
    //     rejectUnauthorized: true,
    //     ca: fs.readFileSync(certPath, "utf8")
    // }
};

// const conn = new mysql2.createConnection(config);
// conn.connect(
//     function (err) {
//     if (err) {
//         console.log("!!! Cannot connect !!! Error:");
//         throw err;
//     }
//     else
//     {
//         console.log("Connection established.");
//     }
// });

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



// const mysql2 = require('promise-mysql');

// // createUnixSocketPool initializes a Unix socket connection pool for
// // a Cloud SQL instance of MySQL.
// const createUnixSocketPool = async config => {
//   // Note: Saving credentials in environment variables is convenient, but not
//   // secure - consider a more secure solution such as
//   // Cloud Secret Manager (https://cloud.google.com/secret-manager) to help
//   // keep secrets safe.
//   return mysql2.createPool({
//     user: process.env.DB_USER, // e.g. 'my-db-user'
//     password: process.env.DB_PASS, // e.g. 'my-db-password'
//     database: 'pweb', // e.g. 'my-database'
//     socketPath: process.env.INSTANCE_UNIX_SOCKET, // e.g. '/cloudsql/project:region:instance'
//     // Specify additional properties here.
//     ...config,
//   });
// };


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
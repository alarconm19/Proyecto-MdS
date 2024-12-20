const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

function renderInformeIngresos(req, res){
    //res.render('admin/informe_ingresos', { layout: 'admin', title: 'Informe de Ingresos' });
    if (!req.session.loggedin || req.session.role == 'cliente') {
        return res.redirect('/');
    } else {
        res.render('admin/informe_ingresos', {
            layout: 'admin',
            username: req.session.username,
            admin: req.session.role == 'admin',
            profesional: req.session.role == 'profesional',
            secretaria: req.session.role == 'secretaria',
        });
    }
};

function generarInformeIngresos(req, res){
    const { fechaInicio, fechaFin, tipoPago } = req.body;

    if (!fechaInicio || !fechaFin || !tipoPago) {
        return res.status(400).send('Faltan parámetros requeridos');
    }

    const consultaSQL = `
        SELECT DATE_FORMAT(t.fecha, '%d-%m-%Y') AS fecha, p.tipo, p.monto, u.nombre, u.apellido, t.nombre_servicio
        FROM pagos p
        JOIN users u ON p.cliente_email = u.email
        JOIN turnos t ON p.turno_id = t.id
        WHERE DATE(p.fecha) BETWEEN ? AND ? AND p.tipo = ?`;

    console.log('Consulta SQL:', consultaSQL);
    console.log('Parámetros:', [fechaInicio, fechaFin, tipoPago]);

    req.conn.query(consultaSQL, [fechaInicio, fechaFin, tipoPago], (error, resultados) => {
        if (error) {
            console.error('Error detallado:', error);
            return res.status(500).send('Error en la consulta a la base de datos: ' + error.message);
        }

        console.log('Resultados:', resultados);

        if (!req.session.loggedin || req.session.role == 'cliente') {
            return res.redirect('/');
        } else {
            res.render('admin/informe_ingresos_resultado', {
                layout: 'admin',
                username: req.session.username,
                admin: req.session.role == 'admin',
                profesional: req.session.role == 'profesional',
                secretaria: req.session.role == 'secretaria',
                resultados,
                fechaInicio,
                fechaFin,
                tipoPago
            });
        }
    });
};

// function descargarInformeIngresosPDF(req, res){
//   const { fechaInicio, fechaFin, tipoPago } = req.query;

//   const consultaSQL = `
//         SELECT DATE(p.fecha) as fecha, p.tipo, p.monto, u.nombre, u.apellido, t.nombre_servicio
//         FROM pagos p
//         JOIN users u ON p.cliente_email = u.email
//         JOIN turnos t ON p.turno_id = t.id
//         WHERE DATE(p.fecha) BETWEEN ? AND ? AND p.tipo = ?`;

//   req.conn.query(consultaSQL, [fechaInicio, fechaFin, tipoPago], (error, resultados) => {
//         if (error) {
//             console.error('Error detallado:', error);
//             return res.status(500).send('Error en la consulta a la base de datos: ' + error.message);
//         }

//         // Obtén la URL base de tu aplicación
//         const baseUrl = `${req.protocol}://${req.get('host')}`;
//         const logoUrl = `${baseUrl}/images/logo.png`; // Ajusta esta ruta según donde esté tu logo

//         res.render('admin/informe_ingresos_pdf', {
//             layout: false, // Esto evita que se use cualquier layout
//             resultados,
//             fechaInicio,
//             fechaFin,
//             tipoPago,
//             logoUrl
//         }, (err, html) => {
//             if (err) {
//                 console.error('Error al generar HTML:', err);
//                 return res.status(500).send('Error al generar el informe PDF');
//             }

//             const options = {
//                 format: 'A4',
//                 border: {
//                     top: "20mm",
//                     right: "20mm",
//                     bottom: "20mm",
//                     left: "20mm"
//                 }
//             };

//             pdf.create(html, options).toBuffer((err, buffer) => {
//                 if (err) {
//                     console.error('Error al crear PDF:', err);
//                     return res.status(500).send('Error al generar el informe PDF');
//                 }

//                 res.type('application/pdf');
//                 res.send(buffer);
//             });
//         });
//     });
// };


// function descargarInformeIngresosPDF = async (req, res){
//     const { fechaInicio, fechaFin, tipoPago } = req.query;

//     const consultaSQL = `
//         SELECT DATE(p.fecha) as fecha, p.tipo, p.monto, u.nombre, u.apellido, t.nombre_servicio
//         FROM pagos p
//         JOIN users u ON p.cliente_email = u.email
//         JOIN turnos t ON p.turno_id = t.id
//         WHERE DATE(p.fecha) BETWEEN ? AND ? AND p.tipo = ?`;

//     req.conn.query(consultaSQL, [fechaInicio, fechaFin, tipoPago], async (error, resultados) => {
//         if (error) {
//             console.error('Error detallado:', error);
//             return res.status(500).send('Error en la consulta a la base de datos: ' + error.message);
//         }

//         const baseUrl = `${req.protocol}://${req.get('host')}`;
//         const logoUrl = `${baseUrl}/images/logo.png`;

//         // Renderizar la vista HTML
//         res.render('admin/informe_ingresos_pdf', {
//             layout: false,
//             resultados,
//             fechaInicio,
//             fechaFin,
//             tipoPago,
//             logoUrl
//         }, async (err, html) => {
//             if (err) {
//                 console.error('Error al generar HTML:', err);
//                 return res.status(500).send('Error al generar el informe PDF');
//             }

//             try {
//                 // Lanzar Puppeteer y generar el PDF
//                 const browser = await puppeteer.launch();
//                 const page = await browser.newPage();
//                 await page.setContent(html, { waitUntil: 'networkidle0' });
//                 const pdfBuffer = await page.pdf({
//                     format: 'A4',
//                     margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
//                 });

//                 await browser.close();

//                 // Enviar el PDF al cliente
//                 res.type('application/pdf');
//                 res.send(pdfBuffer);
//             } catch (err) {
//                 console.error('Error al crear PDF con Puppeteer:', err);
//                 res.status(500).send('Error al generar el informe PDF');
//             }
//         });
//     });
// };


function renderInformeServicios(req, res){
    if (!req.session.loggedin || req.session.role == 'cliente') {
        return res.redirect('/');
    } else {
        res.render('admin/informe_servicios', {
            layout: 'admin',
            username: req.session.username,
            admin: req.session.role == 'admin',
            profesional: req.session.role == 'profesional',
            secretaria: req.session.role == 'secretaria',
        });
    }
};

function generarInformeServicios(req, res){
    const { fechaInicio, fechaFin, profesionalEmail } = req.body;

    if (!fechaInicio || !fechaFin || !profesionalEmail) {
        return res.status(400).send('Faltan parámetros requeridos');
    }

    const consultaSQL = `SELECT
        DATE_FORMAT(t.fecha, '%d-%m-%Y') AS fecha,
        TIME_FORMAT(t.hora, '%H:%i') AS hora,
        t.nombre_servicio,
            uc.nombre as nombre_cliente, uc.apellido as apellido_cliente,
            up.nombre as nombre_profesional, up.apellido as apellido_profesional
        FROM turnos t
        JOIN users uc ON t.cliente_email = uc.email
        JOIN users up ON t.profesional_email = up.email
        WHERE t.fecha BETWEEN ? AND ? AND t.profesional_email = ? AND t.pagado = 1`;

    console.log('Consulta SQL:', consultaSQL);
    console.log('Parámetros:', [fechaInicio, fechaFin, profesionalEmail]);

    req.conn.query(consultaSQL, [fechaInicio, fechaFin, profesionalEmail], (error, resultados) => {
        if (error) {
            console.error('Error detallado:', error);
            return res.status(500).send('Error en la consulta a la base de datos: ' + error.message);
        }

        console.log('Resultados:', resultados);

        // Cargar el logo
        const logoPath = path.join(__dirname, '../../public/images/logo.png');
        let logoBase64 = '';
        try {
            const logoData = fs.readFileSync(logoPath);
            logoBase64 = logoData.toString('base64');
        } catch (error) {
            console.error('Error al cargar el logo:', error);
        }

        if (!req.session.loggedin || req.session.role == 'cliente') {
            return res.redirect('/');
        } else {
            res.render('admin/informe_servicios_resultado', {
                layout: 'admin',
                username: req.session.username,
                admin: req.session.role == 'admin',
                profesional: req.session.role == 'profesional',
                secretaria: req.session.role == 'secretaria',
                resultados,
                fechaInicio,
                fechaFin,
                profesionalEmail,
                logoBase64
            });
        }
    });
};

// function descargarInformeServiciosPDF(req, res){
//   const { fechaInicio, fechaFin, profesionalEmail } = req.query;

//   const consultaSQL = `
//     SELECT DATE(t.fecha) as fecha, t.hora, t.nombre_servicio,
//            uc.nombre as nombre_cliente, uc.apellido as apellido_cliente,
//            up.nombre as nombre_profesional, up.apellido as apellido_profesional
//     FROM turnos t
//     JOIN users uc ON t.cliente_email = uc.email
//     JOIN users up ON t.profesional_email = up.email
//     WHERE t.fecha BETWEEN ? AND ? AND t.profesional_email = ? AND t.estado = 'realizado'`;

//   req.conn.query(consultaSQL, [fechaInicio, fechaFin, profesionalEmail], (error, resultados) => {
//         if (error) {
//         console.error('Error detallado:', error);
//         return res.status(500).send('Error en la consulta a la base de datos: ' + error.message);
//         }

//         // Obtén la URL base de tu aplicación
//         const baseUrl = `${req.protocol}://${req.get('host')}`;
//         const logoUrl = `${baseUrl}/images/logo.png`; // Ajusta esta ruta según donde esté tu logo

//         res.render('admin/informe_servicios_pdf', {
//             layout: false, // Esto evita que se use cualquier layout
//                 resultados,
//                 fechaInicio,
//                 fechaFin,
//                 profesionalEmail,
//                 logoUrl
//             }, (err, html) => {
//                 if (err) {
//                     console.error('Error al generar HTML:', err);
//                     return res.status(500).send('Error al generar el informe PDF');
//                 }

//                 const options = {
//                     format: 'A4',
//                     border: {
//                         top: "20mm",
//                         right: "20mm",
//                         bottom: "20mm",
//                         left: "20mm"
//                     }
//                 };

//                 pdf.create(html, options).toBuffer((err, buffer) => {
//                     if (err) {
//                         console.error('Error al crear PDF:', err);
//                         return res.status(500).send('Error al generar el informe PDF');
//                     }

//                     res.type('application/pdf');
//                     res.send(buffer);
//                 });
//         });
//     });
// };


module.exports = {
    renderInformeIngresos,
    generarInformeIngresos,
    // descargarInformeIngresosPDF,
    renderInformeServicios,
    generarInformeServicios,
    // descargarInformeServiciosPDF
};
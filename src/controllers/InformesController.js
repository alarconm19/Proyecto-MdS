const pdf = require('html-pdf');
const fs = require('fs');
const path = require('path');

exports.renderInformeIngresos = (req, res) => {
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

exports.generarInformeIngresos = (req, res) => {
    const { fechaInicio, fechaFin, tipoPago } = req.body;

    if (!fechaInicio || !fechaFin || !tipoPago) {
        return res.status(400).send('Faltan parámetros requeridos');
    }

    const consultaSQL = `
        SELECT DATE(p.fecha) as fecha, p.tipo, p.monto, u.nombre, u.apellido, t.nombre_servicio
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
        // res.render('admin/informe_ingresos_resultado', {
        //     layout: 'admin',
        //     resultados,
        //     title: 'Resultado Informe de Ingresos',
        //     fechaInicio,
        //     fechaFin,
        //     tipoPago
        // });
    });
};

exports.descargarInformeIngresosPDF = (req, res) => {
  const { fechaInicio, fechaFin, tipoPago } = req.query;

  const consultaSQL = `
        SELECT DATE(p.fecha) as fecha, p.tipo, p.monto, u.nombre, u.apellido, t.nombre_servicio
        FROM pagos p
        JOIN users u ON p.cliente_email = u.email
        JOIN turnos t ON p.turno_id = t.id
        WHERE DATE(p.fecha) BETWEEN ? AND ? AND p.tipo = ?`;

  req.conn.query(consultaSQL, [fechaInicio, fechaFin, tipoPago], (error, resultados) => {
        if (error) {
            console.error('Error detallado:', error);
            return res.status(500).send('Error en la consulta a la base de datos: ' + error.message);
        }

        // Obtén la URL base de tu aplicación
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const logoUrl = `${baseUrl}/images/logo.png`; // Ajusta esta ruta según donde esté tu logo

        res.render('admin/informe_ingresos_pdf', {
            layout: false, // Esto evita que se use cualquier layout
            resultados,
            fechaInicio,
            fechaFin,
            tipoPago,
            logoUrl
        }, (err, html) => {
            if (err) {
                console.error('Error al generar HTML:', err);
                return res.status(500).send('Error al generar el informe PDF');
            }

            const options = {
                format: 'A4',
                border: {
                    top: "20mm",
                    right: "20mm",
                    bottom: "20mm",
                    left: "20mm"
                }
            };

            pdf.create(html, options).toBuffer((err, buffer) => {
                if (err) {
                    console.error('Error al crear PDF:', err);
                    return res.status(500).send('Error al generar el informe PDF');
                }

                res.type('application/pdf');
                res.send(buffer);
            });
        });
    });
};

exports.renderInformeServicios = (req, res) => {
    res.render('admin/informe_servicios', { layout: 'admin', title: 'Informe de Servicios' });
};

exports.generarInformeServicios = (req, res) => {
    const { fechaInicio, fechaFin, profesionalEmail } = req.body;

    if (!fechaInicio || !fechaFin || !profesionalEmail) {
        return res.status(400).send('Faltan parámetros requeridos');
    }

    const consultaSQL = `
        SELECT t.fecha, t.hora, t.nombre_servicio,
            uc.nombre as nombre_cliente, uc.apellido as apellido_cliente,
            up.nombre as nombre_profesional, up.apellido as apellido_profesional
        FROM turnos t
        JOIN users uc ON t.cliente_email = uc.email
        JOIN users up ON t.profesional_email = up.email
        WHERE t.fecha BETWEEN ? AND ? AND t.profesional_email = ? AND t.estado = 'realizado'
    `;

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
            res.render('admin/informe_ingresos_resultado', {
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

exports.descargarInformeServiciosPDF = (req, res) => {
  const { fechaInicio, fechaFin, profesionalEmail } = req.query;

  const consultaSQL = `
    SELECT DATE(t.fecha) as fecha, t.hora, t.nombre_servicio,
           uc.nombre as nombre_cliente, uc.apellido as apellido_cliente,
           up.nombre as nombre_profesional, up.apellido as apellido_profesional
    FROM turnos t
    JOIN users uc ON t.cliente_email = uc.email
    JOIN users up ON t.profesional_email = up.email
    WHERE t.fecha BETWEEN ? AND ? AND t.profesional_email = ? AND t.estado = 'realizado'`;

  req.conn.query(consultaSQL, [fechaInicio, fechaFin, profesionalEmail], (error, resultados) => {
        if (error) {
        console.error('Error detallado:', error);
        return res.status(500).send('Error en la consulta a la base de datos: ' + error.message);
        }

        // Obtén la URL base de tu aplicación
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const logoUrl = `${baseUrl}/images/logo.png`; // Ajusta esta ruta según donde esté tu logo

        res.render('admin/informe_servicios_pdf', {
            layout: false, // Esto evita que se use cualquier layout
                resultados,
                fechaInicio,
                fechaFin,
                profesionalEmail,
                logoUrl
            }, (err, html) => {
                if (err) {
                    console.error('Error al generar HTML:', err);
                    return res.status(500).send('Error al generar el informe PDF');
                }

                const options = {
                    format: 'A4',
                    border: {
                        top: "20mm",
                        right: "20mm",
                        bottom: "20mm",
                        left: "20mm"
                    }
                };

                pdf.create(html, options).toBuffer((err, buffer) => {
                    if (err) {
                        console.error('Error al crear PDF:', err);
                        return res.status(500).send('Error al generar el informe PDF');
                    }

                    res.type('application/pdf');
                    res.send(buffer);
                });
        });
    });
};

const PDFDocument = require('pdfkit');
const fs = require('fs');

function createPDF(title, data) {
   const doc = new PDFDocument();
   const filePath = `./reports/${title}.pdf`;
   
   doc.pipe(fs.createWriteStream(filePath));

   // Agregar logo del spa en el encabezado
   doc.image('./public/images/logo.png', 50, 50, {width: 100});

   // Título del informe
   doc.fontSize(25).text(title, 150, 100);

   // Insertar los datos del informe en el PDF
   data.forEach((item, index) => {
      doc.text(`${index + 1}. ${item.nombre || item.servicio} - ${item.monto || item.fecha}`, 100, 150 + (index * 20));
   });

   doc.end();
   return filePath;
}

module.exports = { createPDF };

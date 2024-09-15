function seleccionTurno (req, res) {
    
}

function seleccionServicio (req, res) {    
    if(req.session.loggedin) {
        console.log('ok sesion iniciada si');
        res.redirect('/');
    } else {        
        console.log('no sesion iniciada no');
        res.redirect('/');
    }
}

function guardarTurno(req, res) {
    
}

module.exports = {
    seleccionServicio,
    seleccionTurno,
    guardarTurno
};
// controllers/profileController.js
const express = require('express');


// Mostrar perfil
const showProfile = (req, res) => {
    if (req.session.loggedin) {
        res.render('profile', {
            username: req.session.username,
            email: req.session.email,
            direccion: req.session.direccion,
            telefono: req.session.telefono
        });
    } else {
        res.redirect('/login');
    }
};

// Actualizar perfil
const updateProfile = (req, res) => {
    const { username, email, direccion, telefono } = req.body;

    req.getConnection((err, conn) => {
        if (err) throw err;

        conn.query('UPDATE users SET email = ?, direccion = ?, telefono = ? WHERE username = ?', [email, direccion, telefono, req.session.username], (err, result) => {
            if (err) throw err;

            req.session.username = username;
            req.session.email = email;
            req.session.direccion = direccion;
            req.session.telefono = telefono;

            res.redirect('/profile');
        });
    });
};

module.exports = { showProfile, updateProfile };

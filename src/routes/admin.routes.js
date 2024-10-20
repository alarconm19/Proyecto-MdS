const express = require('express');
const router = express.Router();

router.get('/admin', (req, res) => {
    res.render('admin/dashboard', { layout: 'admin', title: 'Admin - Dashboard', username: req.session.username, stylesheet: 'styles.css'});
});

module.exports = router;
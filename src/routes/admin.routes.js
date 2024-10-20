const express = require('express');
const router = express.Router();

router.get('/admin', (req, res) => {
    res.render('admin/dashboard', { username: req.session.username, stylesheet: 'styles.css'});
});

module.exports = router;
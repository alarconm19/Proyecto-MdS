const express = require('express');
const router = express.Router();
const LoginController = require('../controllers/LoginController');

router.get('/login', LoginController.login);
router.post('/login', LoginController.auth);
router.get('/register', LoginController.register);
router.post('/register', LoginController.storeUser);
router.get('/logout', LoginController.logout);

router.get('/check-session', (req, res) => {
    if (req.session.email) {
        console.log(req.session.email);
        res.json({ loggedin: true, user: req.session.email });
    } else {
        console.log('No hay sesión');
        res.json({ loggedin: false });
    }
});

module.exports = router;
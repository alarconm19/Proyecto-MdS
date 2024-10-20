const express = require('express');
const router = express.Router();
const LoginController = require('../controllers/LoginController');

router.get('/login', LoginController.login);
router.post('/login', LoginController.auth);
router.get('/register', LoginController.register);
router.post('/register', LoginController.storeUser);
router.get('/logout', LoginController.logout);

module.exports = router;
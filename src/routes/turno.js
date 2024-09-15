const express = require('express');
const TurnoController = require('../controllers/TurnoController');

const router = express.Router();

router.post('/', TurnoController.seleccionServicio);

module.exports = router;
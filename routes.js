const express = require('express');
const multer = require('multer');
const upload = multer();
const authController = require('./authController');

const router = express.Router();

router.post('/registro', upload.single('imagenFacial'), authController.registerUser);
router.post('/login-paso1', authController.loginStep1);
router.post('/login-paso2', authController.loginStep2);

module.exports = router;
const express = require('express');
const router = express.Router();

const userController = require('../controllers/UserController');
const authController = require('../controllers/AuthController');
const isAuth = require('../middlewares/Authentication');

//유저 CRUD
router.post('/signup', userController.signup);
router.get('/', isAuth, userController.getInfo);
router.patch('/nickname', isAuth, userController.editNickname);
router.patch('/password', userController.editPassword);
router.delete('/', isAuth, userController.withdraw);

//인증
router.post('/login', authController.login);
router.post('/logout', isAuth, authController.logout);

module.exports = router;
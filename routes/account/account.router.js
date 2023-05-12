const express = require('express');
const asyncify = require('express-asyncify');
const router = asyncify(express.Router());

const check = require('../common/common.check');
const controller = require('./account.controller');

// * 전처리
router.use(async (req, res, next) => {
    next();
});

// * account 화면
router.route('/login').get(check.checkSessionEmpty, controller.getLogin);
router.route('/regist').get(check.checkSessionEmpty, controller.getRegist);
router.route('/password').get(check.checkSessionEmpty, controller.getPassword);

// * login 관련
router.route('/login/check').post(controller.postLoginCheck);
router.route('/logout').post(controller.postLogout);

// * regist 관련
router.route('/email/check').post(controller.postEmailCheck);
router.route('/email/confirm').post(controller.postEmailConfirm);
router.route('/phone/check').post(controller.postPhoneCheck);
router.route('/phone/confirm').post(controller.postPhoneConfirm);
router.route('/regist').post(controller.postRegist);

// * password 관련
router.route('/password/find').post(controller.postPasswordFind);
router.route('/password/reset').post(controller.postPasswordReset);

module.exports = router;

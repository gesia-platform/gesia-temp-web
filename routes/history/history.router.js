const express = require('express');
const asyncify = require('express-asyncify');
const router = asyncify(express.Router());

const check = require('../common/common.check');
const controller = require('./history.controller');

// * 전처리
router.use(async (req, res, next) => {
    next();
});

router.route('/').get((req, res, next) => res.redirect('/history/deposit'));
router.route('/deposit').get(check.checkSessionExist, controller.getDeposit);

router.route('/deposit/transfers').get(controller.getDepositTransfer);

module.exports = router;

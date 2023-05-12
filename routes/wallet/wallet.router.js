const express = require('express');
const asyncify = require('express-asyncify');
const router = asyncify(express.Router());

const check = require('../common/common.check');
const controller = require('./wallet.controller');

// * 전처리
router.use(async (req, res, next) => {
    next();
});

router.route('/').get(check.checkSessionExist, controller.getWallet);
router.route('/ethbalance').get(controller.getBalanceETH);
router.route('/balance').get(controller.getBalance);
router.route('/marketprice').get(controller.getMarketPrice);

router.route('/create').post(check.checkSessionExistApi, controller.postCreate);

module.exports = router;

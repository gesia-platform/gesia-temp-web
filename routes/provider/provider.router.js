const express = require('express');
const asyncify = require('express-asyncify');
const router = asyncify(express.Router());

const check = require('../common/common.check');
const controller = require('./provider.controller');

// * 전처리
router.use(async (req, res, next) => {
    next();
});

router.route('/').get(controller.getProviderList);
router.route('/:provider_id').get(controller.getProviderDetail);

module.exports = router;

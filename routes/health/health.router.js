const express = require('express');
const asyncify = require('express-asyncify');
const router = asyncify(express.Router());

// * 전처리
router.use(async (req, res, next) => {
    next();
});

router.route('/check').get((req, res, next) => res.send());

module.exports = router;

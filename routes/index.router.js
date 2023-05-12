const express = require('express');
const router = express.Router();

// * 전처리
router.use((req, res, next) => {
    next();
});

router.route('/').get((req, res, next) => res.redirect('/providers'));

module.exports = router;

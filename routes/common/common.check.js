const enumList = require('../../util/enum.const');
const errorList = require('../../util/error.const');

exports.checkSessionExist = async (req, res, next) => {
    const session = req.session;

    if (!session || !session.session_account) res.render('common/redirect', { message: '로그인이 필요한 페이지입니다', redirect: '/account/login' });
    else next();
};

exports.checkSessionExistApi = async (req, res, next) => {
    const session = req.session;

    if (!session || !session.session_account) {
        const errorInfo = errorList.INVALID_SESSION;
        const error = new Error(errorInfo['message']);

        error['type'] = enumList.ERROR_TYPE.API;
        error['info'] = errorInfo;

        throw error;
    } else next();
};

exports.checkSessionEmpty = async (req, res, next) => {
    const session = req.session;

    if (session && session.session_account) res.redirect('/wallet');
    else next();
};

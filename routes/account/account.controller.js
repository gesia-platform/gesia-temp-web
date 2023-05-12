const axios = require('axios');
const crypto = require('crypto');
const web3Module = require('web3');

const format = require('../../util/format');
const enumList = require('../../util/enum.const');
const errorList = require('../../util/error.const');

const WAFFLESTAY_API_URL = process.env.GESIA_TEMP_WAFFLESTAY_API_URL;
const WEB3_PROVIDER = process.env.GESIA_TEMP_WEB3_PROVIDER;
const DB_ENC_KEY = process.env.GESIA_TEMP_DB_ENC_KEY;

exports.getLogin = async (req, res, next) => res.render('account/login');
exports.getRegist = async (req, res, next) => res.render('account/regist');
exports.getPassword = async (req, res, next) => res.render('account/password');

exports.postLoginCheck = async (req, res, next) => {
    console.log(req.body);

    // * 1. Set parameter
    const { id: memberEmail, pw: memberPassword } = req.body;
    const loginType = 'EMAIL';
    const fcmToken = 'FCM_TOKEN';

    // * 2. Set pw hash
    const hashPassword = crypto.createHash('sha256').update(memberPassword).digest('hex');

    // * 3. Request to Wafflestay API(login check)
    const params1 = { email: memberEmail, password: hashPassword, login_type: loginType, fcm_token: fcmToken };

    console.log(`${WAFFLESTAY_API_URL}/v1/members/login`);
    const result1 = await axios.post(`${WAFFLESTAY_API_URL}/v1/members/login`, params1).catch(format.catchAxiosError);

    // * 4. Get info1
    const { member_id: memberID, access_token: accessToken, refresh_token: refreshToken } = result1.data.data;

    // * 5. Request to Wafflestay API(get user info)
    const headers2 = { headers: { Authorization: `Bearer ${accessToken}` } };
    const result2 = await axios.get(`${WAFFLESTAY_API_URL}/v1/members/${memberID}`, headers2).catch(format.catchAxiosError);

    // * 6. Get info2
    const { last_name: memberLastName, first_name: memberFirstName, phone: memberPhone } = result2.data.data;

    // * 7. Request to DB(get wallet info)
    const sql1 = `SELECT wallet_address, wallet_public_key, wallet_private_key FROM tbl_member_wallet WHERE member_id = '${memberID}'`;
    const [rows1] = await global.dbPool.query(sql1).catch(format.catchDBError);

    // * 8. Get info3
    const { wallet_address: walletAddress, wallet_public_key: walletPublicKey, wallet_private_key: walletPrivateKey } = rows1 && rows1[0] ? rows1[0] : {};

    // * 7. Set session info
    const sessionAccount = {
        member_id: memberID,
        access_token: accessToken,
        refresh_token: refreshToken,
        member_last_name: memberLastName,
        member_first_name: memberFirstName,
        member_phone: memberPhone,
        wallet_address: walletAddress,
    };

    // * 8. Set session
    req.session.session_account = sessionAccount;

    // * 9. Response
    res.send({ ...errorList['SUCCESS'], data: { redirect: '/wallet' } });
};

exports.postLogout = async (req, res, next) => {
    // * 1. Get session
    const session = req.session;

    // * 2. Set session null;
    session.session_account = null;

    // * 3. Response
    res.send({ ...errorList['SUCCESS'], data: { message: '로그아웃 되었습니다\n로그인 페이지로 이동합니다', redirect: '/account/login' } });
};

exports.postEmailCheck = async (req, res, next) => {
    console.log(req.body);

    // * 1. Set parameter
    const { email: memberEmail } = req.body;

    // * 2. Request to DB(email check)
    const sql1 = `SELECT COUNT(*) AS cnt FROM tbl_member WHERE member_email = '${memberEmail}'`;
    const [rows1] = await global.dbPool.query(sql1).catch(format.catchDBError);
    const emailCount = rows1[0].cnt;

    if (emailCount > 0) return res.send({ ...errorList.INVALID_EMAIL });

    // * 2. Request to Wafflestay API(email check)
    const params1 = { email: memberEmail };
    await axios.post(`${WAFFLESTAY_API_URL}/v1/auth/email/sign-up`, params1).catch(format.catchAxiosError);

    res.send({ ...errorList['SUCCESS'], data: { message: '해당 이메일로 인증코드를 발송했습니다\n아래 코드에 입력해주세요' } });
};

exports.postEmailConfirm = async (req, res, next) => {
    console.log(req.body);

    // * 1. Set parameter
    const { email: memberEmail, code: memberEmailCode } = req.body;

    // * 2. Request to Wafflestay API(email check)
    const params1 = { email: memberEmail, auth_code: memberEmailCode };
    await axios.post(`${WAFFLESTAY_API_URL}/v1/auth/email/verify`, params1).catch(format.catchAxiosError);

    // * 3. Set session
    const session = req.session;
    session.session_temp ? (session.session_temp.member_email = memberEmail) : (session.session_temp = { member_email: memberEmail });

    res.send({ ...errorList['SUCCESS'], data: { message: '이메일 인증이 완료되었습니다' } });
};

exports.postPhoneCheck = async (req, res, next) => {
    console.log(req.body);

    // * 1. Set parameter
    const { phone: memberPhone } = req.body;

    // * 2. Request to Wafflestay API(email check)
    const params1 = { sms: memberPhone };
    await axios.post(`https://test-api.wafflestay.kr/v1/auth/sms/request`, params1).catch(format.catchAxiosError);

    res.send({ ...errorList['SUCCESS'], data: { message: '해당 전화번호로 인증코드를 발송했습니다\n아래 코드에 입력해주세요' } });
};

exports.postPhoneConfirm = async (req, res, next) => {
    console.log(req.body);

    // * 1. Set parameter
    const { phone: memberPhone, code: memberPhoneCode } = req.body;

    // * 2. Request to Wafflestay API(phone check)
    const params1 = { sms: memberPhone, auth_code: memberPhoneCode };
    await axios.post(`https://test-api.wafflestay.kr/v1/auth/sms/verify`, params1).catch(format.catchAxiosError);

    // * 3. Set session
    const session = req.session;
    session.session_temp ? (session.session_temp.member_phone = memberPhone) : (session.session_temp = { member_phone: memberPhone });

    res.send({ ...errorList['SUCCESS'], data: { message: '전화번호 인증이 완료되었습니다' } });
};

exports.postRegist = async (req, res, next) => {
    console.log(req.body);

    // * 1. Set parameter
    const { last_name: memberLastName, first_name: memberFirstName, phone: memberPhone, email: memberEmail, password: memberPassword } = req.body;
    const loginType = 'EMAIL';
    const fcmToken = 'FCM_TOKEN';
    const emailMarketingYN = 'Y';

    // * 2. Check session temp email
    const session = req.session;

    //2022.11.18 khkim
    // * 2.1 Request to DB(email check)
    const sql1 = `SELECT COUNT(*) AS cnt FROM tbl_member WHERE member_email = '${memberEmail}'`;
    const [rows1] = await global.dbPool.query(sql1).catch(format.catchDBError);
    const emailCount = rows1[0].cnt;
    if (emailCount > 0) return res.send({ ...errorList['INVALID_EMAIL'], data: { message: '이미 사용중인 이메일입니다', code: 1002 } });

    //2022.11.18 khkim

    // * 3. Set session(Email)
    session.session_temp ? (session.session_temp.member_email = memberEmail) : (session.session_temp = { member_email: memberEmail });

    if (!session.session_temp || !session.session_temp.member_email || session.session_temp.member_email !== memberEmail) {
        session.session_temp.member_email = null;

        const errorInfo = errorList.INVALID_EMAIL_CONFIRM;

        const error = new Error(errorInfo['message']);
        error['type'] = enumList.ERROR_TYPE.API;
        error['info'] = errorInfo;

        throw error;
    }

    // * 3. Check session temp phone
    if (!session.session_temp || !session.session_temp.member_phone || session.session_temp.member_phone !== memberPhone) {
        session.session_temp.member_phone = null;

        const errorInfo = errorList.INVALID_PHONE_CONFIRM;

        const error = new Error(errorInfo['message']);
        error['type'] = enumList.ERROR_TYPE.API;
        error['info'] = errorInfo;

        throw error;
    }

    // * 4. Reset session temp
    session.session_temp = null;

    // * 5. Set pw hash
    const hashPassword = crypto.createHash('sha256').update(memberPassword).digest('hex');

    // TODO phone number 넣어야 함
    // * 6. Request to Wafflestay API(regist)
    const registParams = { email: memberEmail, password: hashPassword, last_name: memberLastName, first_name: memberFirstName, login_type: loginType, email_marketing_yn: emailMarketingYN };
    await axios.post(`${WAFFLESTAY_API_URL}/v1/members`, registParams).catch(format.catchAxiosError);

    // * 7. Request to Wafflestay API(login check)
    const loginParams = { email: memberEmail, password: hashPassword, login_type: loginType, fcm_token: fcmToken };
    const loginResult = await axios.post(`${WAFFLESTAY_API_URL}/v1/members/login`, loginParams).catch(format.catchAxiosError);

    // * 8. Get member info
    const { member_id: memberID, access_token: accessToken, refresh_token: refreshToken } = loginResult.data.data;

    // * 9. Request to Wafflestay API(phone number)
    const phoneParams = { phone: memberPhone };
    const phoneHeaders = { headers: { Authorization: `Bearer ${accessToken}` } };
    await axios.patch(`${WAFFLESTAY_API_URL}/v1/members/${memberID}`, phoneParams, phoneHeaders).catch(format.catchAxiosError);

    // * 10. Request to Web3 API(create address)
    const web3 = new web3Module(new web3Module.providers.HttpProvider(WEB3_PROVIDER));
    const web3Result = await web3.eth.accounts.create(web3.utils.randomHex(32));

    // * 11. Get wallet create info
    const { address: walletAddress, privateKey: walletPrivateKey } = web3Result;

    // * 12. Get wallet info
    const getWalletQuery = `SELECT COUNT(*) AS cnt FROM tbl_member_wallet WHERE member_id = '${memberID}'`;
    const [getWalletResult] = await global.dbPool.query(getWalletQuery).catch(format.catchDBError);

    // * 13. Save wallet info
    let updateWalletQuery = '';
    if (getWalletResult[0].cnt === 0) updateWalletQuery = `INSERT INTO tbl_member_wallet SET member_id = '${memberID}', wallet_address = '${walletAddress}', wallet_private_key = HEX(AES_ENCRYPT('${walletPrivateKey}', '${DB_ENC_KEY}'))`;
    else updateWalletQuery = `UPDATE tbl_member_wallet SET wallet_address = '${walletAddress}', wallet_private_key = '${walletPrivateKey}' WHERE member_id = '${memberID}'`;
    await global.dbPool.query(updateWalletQuery).catch(format.catchDBError);

    // * 14. Response
    res.send({ ...errorList['SUCCESS'], data: { message: '회원가입 완료되었습니다', code: 0, redirect: '/account/login' } });
};

exports.postPasswordFind = async (req, res, next) => {
    console.log(req.body);

    // * 1. Set parameter
    const { email: memberEmail } = req.body;

    // * 2. Check email
    if (memberEmail === '') return res.send({ ...errorList.EMPTY_EMAIL });

    // * 3. Request to Wafflestay API(email check)
    const params1 = { email: memberEmail };
    await axios.post(`${WAFFLESTAY_API_URL}/v1/auth/email/request`, params1).catch(format.catchAxiosError);

    // * 4. Response
    res.send({ ...errorList['SUCCESS'], data: { message: '해당 이메일로 인증코드를 발송했습니다\n아래 코드에 입력해주세요' } });
};

exports.postPasswordReset = async (req, res, next) => {
    console.log(req.body);

    // * 1. Set parameter
    const { email: memberEmail, password: memberPassword, phone: phone } = req.body;

    // * 2. Check session temp email
    const session = req.session;

    //2022.11.18 khkim
    // * 2.1 Request to DB(email check)
    const sql1 = `SELECT COUNT(*) AS cnt FROM tbl_member WHERE member_email = '${memberEmail}' and member_phone = '${phone}' `;
    const [rows1] = await global.dbPool.query(sql1).catch(format.catchDBError);
    const emailCount = rows1[0].cnt;
    if (emailCount < 1) return res.send({ ...errorList['INVALID_EMAIL'], data: { message: '해당 이메일을 찾을 수 없습니다', code: 1003 } });

    session.session_temp.member_email = memberEmail;
    /*
    if (!session.session_temp || !session.session_temp.member_email || session.session_temp.member_email !== memberEmail) {
        session.session_temp = null;

        const errorInfo = errorList.INVALID_EMAIL_CONFIRM;

        const error = new Error(errorInfo['message']);
        error['type'] = enumList.ERROR_TYPE.API;
        error['info'] = errorInfo;

        throw error;
    }
*/
    // * 3. Reset session temp
    session.session_temp = null;

    // * 4. Set pw hash
    const hashPassword = crypto.createHash('sha256').update(memberPassword).digest('hex');

    // * 5. Request to Wafflestay API(password reset)
    const params1 = { email: memberEmail, reset_password: hashPassword };
    await axios.post(`${WAFFLESTAY_API_URL}/v1/members/reset-password`, params1).catch(format.catchAxiosError);

    // * 6. Response
    res.send({ ...errorList['SUCCESS'], data: { message: '비밀번호 변경이 완료되었습니다\n다시 로그인해주세요', redirect: '/account/login' } });
};

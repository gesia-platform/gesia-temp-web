const axios = require('axios');
const web3Module = require('web3');
const request = require('request');

const format = require('../../util/format');
const errorList = require('../../util/error.const');

const WEB3_PROVIDER = process.env.GESIA_TEMP_WEB3_PROVIDER;
const CONTRACT_ADDRESS = process.env.GESIA_TEMP_CONTRACT_ADDRESS;
const DB_ENC_KEY = process.env.GESIA_TEMP_DB_ENC_KEY;
const MARKET_URL = process.env.GESIA_TEMP_MARKET_URL;
const MARKET_UNIT = process.env.GESIA_TEMP_MARKET_UNIT;

function doRequest(url) {
    return new Promise(function (resolve, reject) {
        request(url, function (error, res, body) {
            if (!error && res.statusCode === 200) {
                resolve(body);
            } else {
                reject(error);
            }
        });
    });
}

exports.getWallet = async (req, res, next) => res.render('wallet/wallet');

/***
 * WAFL 수량  테스트 GET 수량
 */
exports.getBalance = async (req, res, next) => {
    console.log('getBalance');
    // * 1. Get query
    const { address: walletAddress } = req.query;

    // * 2. Get ABI
    const contractABI = require(`../../config/abi/${process.env.GESIA_TEMP_ABI_FILE}`).abi;

    //var walletAddress1 = '0xa9c62671a0faaf20c3592edd05d6a632a15791a3';
    //var walletAddress1 = '0x68407ea8A78375F4F0A79aa3d22958Bfe56662DF';
    // var walletAddress1 = '0x93a0A24A3124316A9E5b67515257C8bA12886497'
    // * 3. Request to Web3(get wallet balance)
    const web3 = new web3Module(new web3Module.providers.HttpProvider(WEB3_PROVIDER));
    const contract = new web3.eth.Contract(contractABI, CONTRACT_ADDRESS);

    const balance = await contract.methods.balanceOf(walletAddress).call();

    console.log('CONTRACT_ADDRESS:' + CONTRACT_ADDRESS + '/walletAddress:' + walletAddress + '/balance:' + balance);
    const raw_balance = Number(web3.utils.fromWei(balance, 'ether'));
    const calBalance = Number(web3.utils.fromWei(balance, 'ether')).toLocaleString('ko-KR', { maximumFractionDigits: 18 });

    // * 4. Response
    res.send({ ...errorList['SUCCESS'], data: { wallet_balance: calBalance, raw_balance: raw_balance, CONTRACT_ADDRESS: CONTRACT_ADDRESS } });
};
/***
 * 이더리움 수량
 */
exports.getBalanceETH = async (req, res, next) => {
    console.log('getBalanceETH');
    // * 1. Get query
    const { address: walletAddress } = req.query;

    //var walletAddress1 = '0xa9c62671a0faaf20c3592edd05d6a632a15791a3';
    //var walletAddress1 = '0x68407ea8A78375F4F0A79aa3d22958Bfe56662DF';
    //var walletAddress1 = '0x61b741beC0DdD0CE513063bf9E6460615b9922dD'

    // * 2. Request to Web3(get wallet balance)
    const web3 = new web3Module(new web3Module.providers.HttpProvider(WEB3_PROVIDER));
    const balance = await web3.eth.getBalance(walletAddress);
    const calBalance = Number(web3.utils.fromWei(balance, 'ether')).toLocaleString('ko-KR', { maximumFractionDigits: 18 });

    console.log('ETH walletAddress:' + walletAddress + '/balance:' + balance);

    // * 3. Response
    res.send({ ...errorList['SUCCESS'], data: { wallet_balance: calBalance } });
};
/****
 * WAFL 시세정보
 */
exports.getMarketPrice = async (req, res, next) => {
    console.log('getBalanceETH');

    // * 1. Request to Explorer API(get transaction list)
    //const result = await axios.get(`${MARKET_URL}/v1/public/ticker?market=${MARKET_UNIT}`);
    // const result = await axios.get(`${MARKET_URL}/v1/public/ticker?market=WAFL_USDT`);
    // const marketPrice = Number(result.data.result.last).toLocaleString('ko-KR');

    // console.log('MARKET_URL:'+MARKET_URL+'/marketPrice:'+marketPrice);

    //  coins bit API 가 안되는 문제로 임시설정
    // var tmarketPrice1 = marketPrice * 1338;//1338:USDT시세

    const body = await doRequest('https://api.coinsbit.io/api/v1/public/ticker?market=WAFL_USDT');

    var tmarketPrice1 = Number(JSON.parse(body).result.last) * 1338;
    var tmarketPrice = Number(tmarketPrice1).toLocaleString('ko-KR');

    var earning_rate = Math.floor((tmarketPrice1 * 100) / 3000);
    console.log('tmarketPrice:' + tmarketPrice + '/earning_rate:' + earning_rate);

    // * 2. Response
    res.send({ ...errorList['SUCCESS'], data: { market_price: tmarketPrice, raw_price: tmarketPrice1, earning_rate: earning_rate } });
};

exports.postCreate = async (req, res, next) => {
    // * 1. Get session
    const session = req.session;
    const { session_account: sessionAccount } = session;
    const { member_id: memberID } = sessionAccount;

    // * 2. Request to Web3 API(create address)
    const web3 = new web3Module(new web3Module.providers.HttpProvider(WEB3_PROVIDER));
    const result3 = await web3.eth.accounts.create(web3.utils.randomHex(32));

    // * 3. Get info1
    const { address: walletAddress, privateKey: walletPrivateKey } = result3;

    // * 4. Get wallet info
    const sql1 = `SELECT COUNT(*) AS cnt FROM tbl_member_wallet WHERE member_id = '${memberID}'`;
    const [rows1] = await global.dbPool.query(sql1).catch(format.catchDBError);

    // * 5. Save wallet info
    let sql2 = '';
    if (rows1[0].cnt === 0) sql2 = `INSERT INTO tbl_member_wallet SET member_id = '${memberID}', wallet_address = '${walletAddress}', wallet_private_key = HEX(AES_ENCRYPT('${walletPrivateKey}', '${DB_ENC_KEY}'))`;
    else sql2 = `UPDATE tbl_member_wallet SET wallet_address = '${walletAddress}', wallet_private_key = '${walletPrivateKey}' WHERE member_id = '${memberID}'`;
    await global.dbPool.query(sql2).catch(format.catchDBError);

    // * 6. Set session
    sessionAccount.wallet_address = walletAddress;

    // * 7. Response
    res.send({ ...errorList['SUCCESS'], data: { message: '지갑생성 완료되었습니다' } });
};

const axios = require('axios');
const { DateTime } = require('luxon');
const web3Module = require('web3');

const format = require('../../util/format');
const errorList = require('../../util/error.const');

const WEB3_PROVIDER = process.env.GESIA_TEMP_WEB3_PROVIDER;
const CONTRACT_ADDRESS = process.env.GESIA_TEMP_CONTRACT_ADDRESS;
const EXPLORER_URL = process.env.GESIA_TEMP_EXPLORER_URL;
const EXPLORER_KEY = process.env.GESIA_TEMP_EXPLORER_KEY;
const UNLOCK_DATE_TYPE = process.env.GESIA_TEMP_UNLOCK_DATE_TYPE;
const UNLOCK_DATE_VALUE = process.env.GESIA_TEMP_UNLOCK_DATE_VALUE;

exports.getDeposit = async (req, res, next) => res.render('history/deposit');

exports.getDepositTransfer = async (req, res, next) => {
    // * 1. Get query
    const { address: walletAddress } = req.query;

    // * 2. Request to Explorer API(get transaction list)
    const result = await axios.get(`${EXPLORER_URL}?module=account&action=tokentx&address=${walletAddress}&startblock=0&endblock=999999999&sort=desc&apikey=${EXPLORER_KEY}`);

    // * 3. Filter transaction list
    const txList = result.data.result
        .filter((e) => e.contractAddress.toLowerCase() === CONTRACT_ADDRESS.toLowerCase())
        .map((e) => {
            const { timeStamp, from, to, value, hash } = e;

            const web3 = new web3Module(new web3Module.providers.HttpProvider(WEB3_PROVIDER));
            const newValue = Number(web3.utils.fromWei(value, 'ether')).toLocaleString('ko-KR', { maximumFractionDigits: 18 });

            const datetimeStr = DateTime.fromMillis(Number(timeStamp * 1000))
                .setZone('Asia/Seoul')
                .toFormat('yyyy-MM-dd HH:mm:ss');

            const unlockPlusObject = UNLOCK_DATE_TYPE === 'MONTH' ? { month: Number(UNLOCK_DATE_VALUE) } : UNLOCK_DATE_TYPE === 'DAY' ? { day: Number(UNLOCK_DATE_VALUE) } : { month: 3 };
            const unlockTimestamp = DateTime.fromMillis(Number(timeStamp * 1000))
                .plus(unlockPlusObject)
                .toMillis();

            return { datetime: datetimeStr, unlockTimestamp: unlockTimestamp, from: from, to: to, value: newValue, hash: hash };
        });

    // * 4. Response
    res.send({ ...errorList['SUCCESS'], data: { list: txList, list_count: txList.length, is_end: true } });
};

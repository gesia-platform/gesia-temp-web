const axios = require('axios');
const web3Module = require('web3');
const request = require('request');

const format = require('../../util/format');
const errorList = require('../../util/error.const');

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

exports.getProviderList = async (req, res, next) => res.render('provider/list', { submenu: 'cert_list' });
exports.getProviderDetail = async (req, res, next) => res.render('provider/detail', { submenu: 'cert_detail' });

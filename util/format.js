const errorList = require('./error.const');
const enumList = require('./enum.const');

exports.catchAxiosError = (e) => {
    const data = e.response.data;

    const errorInfo = errorList.EXTERNAL_API_FAIL;

    const error = new Error(errorInfo['message']);
    error['type'] = enumList.ERROR_TYPE.API;
    error['info'] = errorInfo;
    error['data'] = data;

    throw error;
};

exports.catchDBError = (e) => {
    const data = { code: e.errno, message: e.sqlMessage };

    const errorInfo = errorList.INTERNAL_SERVER_ERROR;

    const error = new Error(errorInfo['message']);
    error['type'] = enumList.ERROR_TYPE.API;
    error['info'] = errorInfo;
    error['data'] = data;

    throw error;
};

exports.SUCCESS = { code: 0, message: '성공' };
exports.FAIL = { code: 1, message: '실패' };
exports.INVALID_PARAM = { code: 2, message: '잘못된 파라미터 입니다' };
exports.NOT_FOUND_PARAM = { code: 3, message: '파라미터를 다시 확인해 주세요' };
exports.EXTERNAL_API_FAIL = { code: 4, message: '외부 API 통신 오류가 발생했습니다' };
exports.NO_CONTENT = { code: 5, message: '결과가 없습니다' };
exports.INTERNAL_SERVER_ERROR = { code: 6, message: '내부 서버 오류가 발생했습니다' };
exports.WRONG_APPROACH = { code: 7, message: '잘못된 접근입니다' };
exports.DENY_AUTH = { code: 8, message: '권한 접근 거부입니다' };
exports.NO_AUTH = { code: 9, message: '권한을 찾을 수 없습니다' };
exports.REFUSE_CONNECTION = { code: 10, message: '요청 리소스에 연결할 수 없습니다' };
exports.INVALID_GATEWAY = { code: 11, message: 'GATEWAY 구성 오류입니다' };

exports.INVALID_SESSION = { code: 1001, message: '로그인이 필요한 요청입니다' };
exports.INVALID_EMAIL = { code: 1002, message: '이미 사용중인 이메일입니다' };
exports.EMPTY_EMAIL = { code: 1003, message: '해당 이메일을 찾을 수 없습니다' };
exports.INVALID_EMAIL_CONFIRM = { code: 1004, message: '이메일 인증이 완료되지 않았습니다' };
exports.INVALID_PHONE_CONFIRM = { code: 1005, message: '전화번호 인증이 완료되지 않았습니다' };

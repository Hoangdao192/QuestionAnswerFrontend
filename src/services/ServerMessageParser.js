const errorCodeMap = []
errorCodeMap["LGERR1"] = "Email hoặc mật khẩu không chính xác"

class ServerMessageParser {
    parse(message) {
        return JSON.parse(message);
    }

    parseObject(responseErrorData) {
        return responseErrorData.errors.map((error, index) => {
            if (errorCodeMap[error.code] != undefined) {
                return errorCodeMap[error.code];
            }
            return error.message;
        });
    }
}

export default new ServerMessageParser()
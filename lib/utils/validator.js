module.exports = {
    isString,
    isGuid,
    isObjectAndNotNull
}

function isString(str) {
    return typeof str === 'string'
}

function isGuid(token) {
    const regExp = '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
    return token.match(regExp) !== null;
}

function isObjectAndNotNull(obj) {
    return typeof obj === 'object' && obj !== null
}
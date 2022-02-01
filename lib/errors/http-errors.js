module.exports = {
    processApplicationError
}

function HttpError(status, message = "") {
    return {status: status, message: message}
}

const httpErrors = {
    '400': HttpError(400),
    '404': HttpError(404),
    '401': HttpError(401),
    '500': HttpError(500),
    unexpected: HttpError(500, "Unexpected error. Please contact the administrator.")
}

const applicationToHttpErrors = {
    '1': httpErrors[400],
    '2': httpErrors[404],
    '3': httpErrors[404],
    '4': httpErrors[400],
    '5': httpErrors[400],
    '6': httpErrors[400],
    '10': httpErrors[400],
    '11': httpErrors[401],
    '20': httpErrors[400],
    '21': httpErrors[404],
    '22': httpErrors[400],
    '23': httpErrors[404],
    '50': httpErrors[400],
    '51': httpErrors[400],
    '60': httpErrors[401],
    '90': httpErrors[401],
    '100': httpErrors[500]
}

function processApplicationError(appError) {
    const appCode = appError.code
    let httpError = applicationToHttpErrors[appCode] || httpErrors.unexpected
    if (appCode) {
        httpError.message = appError.message
    }
    return httpError
}
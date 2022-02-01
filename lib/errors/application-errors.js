module.exports = {
    INVALID_GAME_NAME: {code: 1, message: 'Game name is missing or invalid'},
    GAME_NOT_FOUND: {code: 2, message: 'Game not found'},
    GAME_NOT_FOUND_BORGA: {code: 3, message: 'Game not found in Board Games Atlas database'},
    INVALID_QUERY_PARAMETERS: {code: 4, message: 'Invalid query parameters'},    
    INVALID_GAME_INPUT: {code: 5, message: 'Invalid or missing game id'},
    INVALID_GAME_ID: {code: 6, message: 'Game id is missing or invalid'},

    INVALID_USER_INPUT: {code: 10, message: 'Invalid or missing object required for user creation'},
    TOKEN_NOT_FOUND: {code: 11, message: 'Token not found'},

    INVALID_GROUP_INPUT: {code: 20, message: 'Invalid or missing object required for group creation/update'},
    GROUP_NOT_FOUND: {code: 21, message: 'Group not found'},
    INVALID_GROUP_ID: {code: 22, message: 'Invalid or missing group id, it must be an integer >= 0'},
    USER_GROUPS_NOT_FOUND: {code: 23, message: 'User does not have groups'},

    USERNAME_NOT_UNIQUE: {code:50, message: 'Username already exists'},
    CONFIRM_PASSWORD_MISMATCH: {code: 51, message: 'Passwords must be equal'},
    INVALID_CREDENTIALS: {code: 60, message: 'Invalid credentials'},

    ELASTIC_OPERATION_ERROR: {code: 80, message: 'It was not possible to conclude the operation. Please try again later'},
    INVALID_GUID_TOKEN: {code: 90, message: 'Access token is missing or invalid'},
    BOARD_GAME_ATLAS_SERVER_ERROR: {code: 100, message: 'Internal server error. Verify if client_id is inserted correctly'}
}
const error = require('./errors/application-errors')
const validator = require('./utils/validator')

module.exports = function (gamesData, dataMem) {
    if (!validator.isObjectAndNotNull(gamesData) || !validator.isObjectAndNotNull(dataMem)) {
        throw "Invalid or missing argument for gamesData or dataMem"
    }

    return {
        getPopularGames,
        searchGames,
        createUser,
        getUser,
        createGroup,
        updateGroup,
        getGroups,
        deleteGroup,
        addGameToGroup,
        getGroupDetails,
        deleteGroupGame,
        getGameDetails,
        validateCredentials
    }

    function getPopularGames(skip, limit) {
        const pagingParams = verifyPagingParameters(skip, limit)
        if (!pagingParams.inRange) {
            return Promise.reject(error.INVALID_QUERY_PARAMETERS)
        }
        return gamesData.getPopularGames(pagingParams.skip, pagingParams.limit)
    }

    function searchGames(name) {
        if (!name || name.length > 50) {
            return Promise.reject(error.INVALID_GAME_NAME)
        }
        return gamesData.searchGames(name)
    }

    function getUser(token) {
        if (!token || !validator.isGuid(token)) {
            return Promise.reject(error.INVALID_GUID_TOKEN)
        }
        return dataMem.getUserDetails(token)
    }

    function createUser(user) {
        if (user.username && user.password && user.confirmPassword && user.name && user.club) {
            //pedimos ao utilizador para inserir duas passwords, e as duas têm que coincidir
            if (user.password !== user.confirmPassword) {
                return Promise.reject(error.CONFIRM_PASSWORD_MISMATCH)
            }
            return dataMem.createUser(user)
        }
        return Promise.reject(error.INVALID_USER_INPUT)
    }

    function createGroup(token, group) {
        if (!token || !validator.isGuid(token)) {
            return Promise.reject(error.INVALID_GUID_TOKEN)
        }
        if (group.name && group.description) {
            return dataMem.createGroup(token, group.name, group.description)
        }
        return Promise.reject(error.INVALID_GROUP_INPUT)
    }

    function updateGroup(token, groupId, group) {
        if (!token || !validator.isGuid(token)) {
            return Promise.reject(error.INVALID_GUID_TOKEN)
        }
        if (isNaN(groupId) || groupId < 0) {
            return Promise.reject(error.INVALID_GROUP_ID)
        }
        if (group && (group.name || group.description)) {
            return dataMem.updateGroup(token, Number(groupId), group.name, group.description)
        }
        return Promise.reject(error.INVALID_GROUP_INPUT)
    }

    function getGroups(token) {
        if (!token || !validator.isGuid(token)) {
            return Promise.reject(error.INVALID_GUID_TOKEN)
        }
        return dataMem.getGroups(token)
    }

    function deleteGroup(token, groupId) {
        if (!token || !validator.isGuid(token)) {
            return Promise.reject(error.INVALID_GUID_TOKEN)
        }
        if (isNaN(groupId) || groupId < 0) {
            return Promise.reject(error.INVALID_GROUP_ID)
        }        
        return dataMem.deleteGroup(token, Number(groupId))
    }

    function getGroupDetails(token, groupId) {
        if (!token || !validator.isGuid(token)) {
            return Promise.reject(error.INVALID_GUID_TOKEN)
        }
        if (isNaN(groupId) || groupId < 0) {
            return Promise.reject(error.INVALID_GROUP_ID)
        }
        return dataMem.getGroupDetails(token, Number(groupId))
    }

    function addGameToGroup(token, groupId, gameId) {
        if (!token || !validator.isGuid(token)) {
            return Promise.reject(error.INVALID_GUID_TOKEN)
        }
        if (isNaN(groupId) || groupId < 0) {
            return Promise.reject(error.INVALID_GROUP_ID)
        }
        if (!gameId) {
            return Promise.reject(error.INVALID_GAME_INPUT)
        }
        groupId = Number(groupId)
        return dataMem.verifyTokenAndGroup(token, groupId)
            .then(() => dataMem.existsGame(gameId)
                .then(() => dataMem.addGameToGroup(token, groupId, {id: gameId}), () => gamesData.getGameById(gameId)
                    .then(game => dataMem.addGameToGroup(token, groupId, game), (reason) => Promise.reject(reason))))
    }

    function deleteGroupGame(token, groupId, gameId) {
        if (!token || !validator.isGuid(token)) {
            return Promise.reject(error.INVALID_GUID_TOKEN)
        }
        if (isNaN(groupId) || groupId < 0) {
            return Promise.reject(error.INVALID_GROUP_ID)
        }
        if (!gameId) {
            return Promise.reject(error.INVALID_GAME_ID)
        }
        return dataMem.deleteGroupGame(token, Number(groupId), gameId)
    }

    function getGameDetails(gameId) {
        if (!gameId) {
            return Promise.reject(error.INVALID_GAME_ID)
        }
        return dataMem.getGameDetails(gameId)
            .catch(() => gamesData.getGameById(gameId))
    }

    function validateCredentials(username, password) {
        return dataMem.validateCredentials(username, password)
    }
}

function verifyPagingParameters(skip, limit) {
    if (isNaN(skip)) {
        skip = 0
    }
    if (isNaN(limit)) {
        limit = 10
    }
    let inRange = true
    if (skip < 0 || skip > 50 || limit < 0 || limit > 50) {
        inRange = false
    }
    return {skip: skip, limit: limit, inRange: inRange}
}
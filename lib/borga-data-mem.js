const crypto = require('crypto')
const error = require('./errors/application-errors')
const validator = require('./utils/validator')

module.exports = function (db) {
    if (!validator.isObjectAndNotNull(db)) {
        throw 'Invalid or missing argument for db'
    }

    return {
        createUser,
        getUserDetails,
        createGroup,
        getGroups,
        updateGroup,
        deleteGroup,
        addGameToGroup,
        getGroupDetails,
        deleteGroupGame,
        getGameDetails,
        existsGame,
        verifyTokenAndGroup,
        validateCredentials
    }

    function createUser(user) {
        if (db.credentials[user.username]) {
            return Promise.reject(error.USERNAME_NOT_UNIQUE)
        }
        const guid = crypto.randomUUID();
        db.users[guid] = { username: user.username, name: user.name, club: user.club }
        db.credentials[user.username] = { password: user.password, token: guid }
        return Promise.resolve(buildUserDetails(guid))
    }

    function getUserDetails(token) {
        return existsToken(token).then(() => buildUserDetails(token), reason => Promise.reject(reason))
    }

    function createGroup(token, name, description) {
        return existsToken(token)
            .then(() => {
                if (db.groups[token] === undefined) {
                    db.groups[token] = new Map()
                }
                const groupsMap = db.groups[token]
                const lastId = Array.from(groupsMap.keys()).pop()
                const groupId =  lastId !== undefined ? lastId + 1 : 0

                const newGroup = {name: name, description: description, games: new Set()}
                groupsMap.set(groupId, newGroup)

                return buildGroupSummary([groupId, newGroup])
            }, reason => Promise.reject(reason))
    }

    function updateGroup(token, groupId, name, description) {
        return existsToken(token).then(() => {
            return existsGroup(token, groupId).then(group => {
                if (name) {
                    group.name = name
                }
                if (description) {
                    group.description = description
                }
                return buildGroupSummary([groupId, group])
            })
        }, reason => Promise.reject(reason))
    }

    function getGroups(token) {
        return existsToken(token).then(() => {
            return existsGroup(token, 0).then(() => Array.from(db.groups[token]).map(buildGroupSummary))
        }, reason => Promise.reject(reason))
    }

    function deleteGroup(token, groupId) {
        return existsToken(token).then(() => {
            return existsGroup(token, groupId).then(group => {
                db.groups[token].delete(groupId)
                return buildGroupSummary([groupId, group])
            })
        }, reason => Promise.reject(reason))
    }

    function getGroupDetails(token, groupId) {
        return existsToken(token).then(() => {
            return existsGroup(token, groupId).then(group => buildGroupDetails([groupId, group]))
        }, reason => Promise.reject(reason))
    }

    function addGameToGroup(token, groupId, game) {
        const group = db.groups[token].get(groupId)
        return existsGame(game.id).then(() => {
            if (!group.games.has(game.id)) {
                group.games.add(game.id)
            }
            return buildGameSummary(game.id)
        }, () => {
            db.games[game.id] = game
            group.games.add(game.id)
            return buildGameSummary(game.id)
        })
    }

    function deleteGroupGame(token, groupId, gameId) {
        return existsToken(token).then(() => {
            return existsGroup(token, groupId).then(group => {
                if (group.games.delete(gameId)) {
                    return buildGameSummary(gameId)
                }
                return Promise.reject(error.GAME_NOT_FOUND)
            })
        }, reason => Promise.reject(reason))
    }

    function getGameDetails(gameId) {
        return existsGame(gameId)
    }

    function existsToken(token) {
        if (db.users[token]) {
            return Promise.resolve()
        }
        return Promise.reject(error.TOKEN_NOT_FOUND)
    }

    function existsGroup(token, groupId) {
        let group = db.groups[token]
        if (group) {
            group = group.get(groupId)
            if (group) {
                return Promise.resolve(group)
            }
        }
        return Promise.reject(error.GROUP_NOT_FOUND)
    }

    function buildGroupSummary(groupArray) {
        const groupId = groupArray[0]
        const group = groupArray[1]
        return {id: groupId, name: group.name, description: group.description, nrGames: group.games.size}
    }

    function buildGroupDetails(groupArray) {
        const groupId = groupArray[0]
        const group = groupArray[1]
        return {
            id: groupId,
            name: group.name,
            description: group.description,
            games: Array.from(group.games).map(gameId => buildGameSummary(gameId))
        }
    }

    function existsGame(gameId) {
        const game = db.games[gameId]
        if (game) {
            return Promise.resolve(game)
        }
        return Promise.reject(error.GAME_NOT_FOUND)
    }

    function verifyTokenAndGroup(token, groupId) {
        return existsToken(token).then(() => existsGroup(token, groupId))
    }

    function buildGameSummary(gameId) {
        const game = db.games[gameId]
        return { id: gameId, name: game.name, image_url: game.image_url }
    }

    function buildUserDetails(token) {
        const user = db.users[token]
        return {username: user.username, name: user.name, club: user.club, token: token}
    }

    function validateCredentials(username, password) {
        const credentials = db.credentials[username]
        if (credentials && credentials.password === password) {
            return Promise.resolve(credentials.token)
        }
        return Promise.reject(error.INVALID_CREDENTIALS)
    }
}
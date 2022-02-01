const crypto = require('crypto')
const error = require('./errors/application-errors')
const fetch = require('node-fetch')

/*
    Credentials: credentials/_doc/diggynovo -> password, token
    Users: users/_doc/0f3edb9b-76eb-4fc3-a87b-a40980b9a922 -> username, name, club
    Games: games/_doc/RLlDWHh7hR -> id, name, description, url, image_url, mechanics, categories
    Groups: groups-0f3edb9b-76eb-4fc3-a87b-a40980b9a922/_doc/ -> name, description, games
*/

const ELASTIC_URL = 'http://localhost:9200/'

module.exports = {
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
    //não podem existir userNames iguais   //caso exista um user com aquele nome, lança um erro   //caso contrário
    return existsUsername(user.username).then(() => Promise.reject(error.USERNAME_NOT_UNIQUE), () => {
        const guid = crypto.randomUUID()
        return fetch(`${ELASTIC_URL}credentials/_doc/${user.username}?refresh=true`, {
            method: 'post',
            body: JSON.stringify({ password: user.password, token: guid }),
            headers: { 'Content-Type': 'application/json' }
        }).then(({status}) => {
            //status de created
            if (status !== 201) {
                return Promise.reject(error.ELASTIC_OPERATION_ERROR)
            }
            const userDetails = buildUserDetails(user, guid)
            return fetch(`${ELASTIC_URL}users/_doc/${guid}?refresh=true`, {
                method: 'post',
                body: JSON.stringify(userDetails),
                headers: { 'Content-Type': 'application/json' }
            }).then(({status}) => {
                if (status !== 201) {
                    return Promise.reject(error.ELASTIC_OPERATION_ERROR)
                }
                return userDetails
            })
        })
    })
}

function getUserDetails(token) {
    return existsToken(token)
        .then(() => fetch(`${ELASTIC_URL}users/_doc/${token}`)
            .then(res => {
                if (res.status === 200) {
                    return res.json()
                }
                return Promise.reject(error.TOKEN_NOT_FOUND)
            })
            .then(data => buildUserDetails(data._source, token))
        )
}

function createGroup(token, name, description) {
    return existsToken(token)
        .then(() => getNextGroupId(token)
            .then(groupId => {
                const newGroup = { name: name, description: description, games: [] }
                return fetch(`${ELASTIC_URL}groups-${token}/_doc/${groupId}?refresh=true`, {
                    method: 'post',
                    body: JSON.stringify(newGroup),
                    headers: { 'Content-Type': 'application/json' }
                }).then(({status}) => {
                    if (status === 201) {
                        return buildGroupSummary(groupId, newGroup)
                    }
                    return Promise.reject(error.ELASTIC_OPERATION_ERROR)
                })
        }), reason => Promise.reject(reason))
}

function getNextGroupId(token) {
    return existsToken(token)
        .then(() => fetch(`${ELASTIC_URL}groups-${token}/_search`)
            .then(res => {
                if (res.status === 200) {
                    return res.json()
                }
                return Promise.resolve(0)
            })
            .then(data => {
                const id = isNaN(data) ? data.hits.total.value : data
                return id
            })
        )
}

function getGroups(token) {
    return existsToken(token)
        .then(() => fetch(`${ELASTIC_URL}groups-${token}/_search`)
            .then(res => {
                if (res.status === 200) {
                    return res.json()
                }
                return Promise.reject(error.USER_GROUPS_NOT_FOUND)
            })
            .then(data => data.hits.hits.map(({_id, _source}) => buildGroupSummary(_id, _source)))
        )
}

function updateGroup(token, groupId, name, description) {
    return existsToken(token)
        .then(() => existsGroup(token, groupId)
            .then(() => {
                const group = {}
                if (name) {
                    group.name = name
                }
                if (description) {
                    group.description = description
                }
                return fetch(`${ELASTIC_URL}groups-${token}/_update/${groupId}?refresh=true`, {
                    method: 'post',
                    body: JSON.stringify({ 'doc': group }),
                    headers: { 'Content-Type': 'application/json' }
                }).then(({status}) => {
                    if (status === 200) {
                        return buildGroupSummary(groupId, group)
                    }
                    return Promise.reject(error.ELASTIC_OPERATION_ERROR)
                })
            })
        )
}

function deleteGroup(token, groupId) {
    return existsToken(token)
        .then(() => existsGroup(token, groupId)
            .then(() =>
                getGroupDetails(token, groupId).then(groupToDelete => {
                    return fetch(`${ELASTIC_URL}groups-${token}/_doc/${groupId}`, { method: 'delete' })
                    .then(res => {
                        if (res.status === 200) {
                            return groupToDelete
                        }
                        return Promise.reject(error.ELASTIC_OPERATION_ERROR)
                    })})
            )
        )
}

function addGameToGroup(token, groupId, game) {
    return existsGame(game.id).catch(() => fetch(`${ELASTIC_URL}games/_create/${game.id}`, {
            method: 'post',
            body: JSON.stringify(game),
            headers: { 'Content-Type': 'application/json' }
        })
    ).then(({status}) => {
        if (status !== 201) {
            return Promise.reject(error.ELASTIC_OPERATION_ERROR)
        }
        return fetch(`${ELASTIC_URL}groups-${token}/_source/${groupId}?_source_includes=games`)
            .then(res => res.json())
            .then(({games}) => {
                if (!games.includes(game.id)) {
                    games.push(game.id)
                    return fetch(`${ELASTIC_URL}groups-${token}/_update/${groupId}?refresh=true`, {
                        method: 'post',
                        body: JSON.stringify({ 'doc': { games: games } }),
                        headers: { 'Content-Type': 'application/json' }
                    }).then(({status}) => {
                        if (status === 200) {
                            return buildGameSummary(game)
                        }
                        return Promise.reject(error.ELASTIC_OPERATION_ERROR)
                    })
                }
                return buildGameSummary(game)
            })
    })
}

function getGroupDetails(token, groupId) {
    return existsToken(token)
        .then(() => existsGroup(token, groupId)
            .then(() => fetch(`${ELASTIC_URL}groups-${token}/_search`)
                .then(res => {
                    if (res.status === 200) {
                        return res.json()
                    }
                    return Promise.reject(error.ELASTIC_OPERATION_ERROR)
                })
                .then(({hits}) => buildGroupDetails(groupId, hits.hits.find(group => Number(group._id) === groupId)._source))
            )
        )
}

function deleteGroupGame(token, groupId, gameId) {
    return existsToken(token)
        .then(() => existsGroup(token, groupId)
            .then(() => fetch(`${ELASTIC_URL}groups-${token}/_source/${groupId}`)
                .then(res => {
                    if (res.status === 200) {
                        return res.json()
                    }
                    return Promise.reject(error.ELASTIC_OPERATION_ERROR)
                })
                .then(group => {
                    const newArray = group.games.filter(elem => elem !== gameId)
                    if (newArray.length === group.games.length) {
                        return Promise.reject(error.GAME_NOT_FOUND)
                    }
                    group.games = newArray
                    return fetch(`${ELASTIC_URL}groups-${token}/_update/${groupId}?refresh=true`, {
                        method: 'post',
                        body: JSON.stringify({ 'doc': { games: newArray } }),
                        headers: { 'Content-Type': 'application/json' }
                    }).then(res => {
                        if (res.status === 200) {
                            return buildGroupDetails(groupId, group)
                        }
                        return Promise.reject(error.ELASTIC_OPERATION_ERROR)
                    })
                })
            )
    , reason => Promise.reject(reason))
}

function getGameDetails(gameId) {
    return fetch(`${ELASTIC_URL}games/_source/${gameId}`)
        .then(res => {
            if (res.status === 200) {
                return res.json()
            } else if (res.status === 404) {
                return Promise.reject(error.GAME_NOT_FOUND)
            }
            return Promise.reject(error.ELASTIC_OPERATION_ERROR)
        })
}

function existsGame(gameId) {
    return fetch(`${ELASTIC_URL}games/_doc/${gameId}`, { method: 'head'})
        .then(res => { return res.status === 200 ? Promise.resolve() : Promise.reject(error.GAME_NOT_FOUND) })
}

function existsToken(token) {
    return fetch(`${ELASTIC_URL}users/_doc/${token}`, { method: 'head'})
        .then(res => { return res.status === 200 ? Promise.resolve() : Promise.reject(error.TOKEN_NOT_FOUND) })
}

function existsGroup(token, groupId) {
    return fetch(`${ELASTIC_URL}groups-${token}/_doc/${groupId}`, { method: 'head'})
        .then(res => { return res.status === 200 ? Promise.resolve() : Promise.reject(error.GROUP_NOT_FOUND) })
}

function existsUsername(username) {
    return fetch(`${ELASTIC_URL}credentials/_doc/${username}`, { method: 'head'})
        .then(res => { return res.status === 200 ? Promise.resolve() : Promise.reject(error.INVALID_CREDENTIALS) })
}

function verifyTokenAndGroup(token, groupId) {
    return existsToken(token).then(() => existsGroup(token, groupId))
}

function buildGroupSummary(groupId, group) {
    let gamesLength = 0
    if (group.games !== undefined) {
        gamesLength = group.games.length
    }
    return { id: groupId, name: group.name, description: group.description, nrGames: gamesLength }
}

function buildGroupDetails(groupId, group) {
    return Promise.all(group.games.map(gameId => {
        return fetch(`${ELASTIC_URL}games/_source/${gameId}?_source_includes=name,id,image_url`)
                .then(data => data.json())
    }
    )).then(games => {
        return {
            id: groupId,
            name: group.name,
            description: group.description,
            games: games
        }
    })
}

function buildGameSummary(game) {
    return { id: game.id, name: game.name, image_url: game.image_url }
}

function buildUserDetails(user, token) {
    return { token: token, username: user.username, name: user.name, club: user.club }
}

function validateCredentials(username, password) {
    return existsUsername(username).then(() => {
        return fetch(`${ELASTIC_URL}credentials/_source/${username}`)
            .then(res => {
                if (res.status === 200) {
                  return res.json()
                }
                return Promise.reject(error.ELASTIC_OPERATION_ERROR)
            }).then(data => {
                if (data.password === password) {
                    return data.token
                }
                return Promise.reject(error.INVALID_CREDENTIALS)
            })
    })
}

function checkStatus(status, statusCode) {
    if (status !== statusCode) {
        return error.ELASTIC_OPERATION_ERROR
    }
    return undefined
}
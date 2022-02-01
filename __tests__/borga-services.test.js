const testDb = require('../__testmocks/borga-database-tests')
const dataMem = require('../lib/borga-data-mem')(testDb)
const gamesData = require('../__testmocks/borga-games-data-mock')
const services = require('../lib/borga-services')(gamesData, dataMem)
const error = require('../lib/errors/application-errors')

const VALID_TOKEN1 = '0f3edb9b-76eb-4fc3-a87b-a40980b9a922'
const VALID_TOKEN2 = 'fc585a9a-be72-486c-be1a-438f41acbaae'
const VALID_TOKEN3 = 'c14816ad-efb1-4d45-a04a-05464e812cbb'
const VALID_TOKEN_NO_GROUP = 'ad903080-295c-4a84-a7c8-959dda27236d'
const NON_EXISTENT_TOKEN = '0f3edb9b-76eb-4fc3-a87b-a40980b9a929'

describe('Get popular games', () => {
    test('Returns 10 (limit default, skip is 0) popular games if no query was inserted', () => {
        return services.getPopularGames().then(games => expect(games).toHaveLength(10))
    })

    test('Returns the right popular games when paging is used', () => {
        const expectedGames = [
            {id: '5H5JS0KLzK', name: 'Wingspan'},
            {id: 'RLlDWHh7hR', name: 'Gloomhaven'},
            {id: 'fDn9rQjH9O', name: 'Terraforming Mars'}
        ]
        return services.getPopularGames(2, 3).then(games => {
                expect(games).toHaveLength(3)
                expect(games).toEqual(expectedGames)
            })
    })

    test('Returns the default number (10) of popular games when only skip is used', () => {
        return services.getPopularGames(1)
            .then(games => expect(games).toHaveLength(10))
    })

    test('Returns the right number of popular games when only limit is used (skip default is 0)', () => {
        return services.getPopularGames(undefined, 9)
            .then(games => expect(games).toHaveLength(9))
    })

    test('Returns 0 popular games when limit is 0', () => {
        return services.getPopularGames(2, 0)
            .then(games => expect(games).toHaveLength(0))
    })

    test('Returns a rejected promise with INVALID_QUERY_PARAMETERS when limit is < 0', () => {
        return services.getPopularGames(2, -1)
            .then(() => {throw Error('Assertion failed')}, reason => expect(reason).toEqual(error.INVALID_QUERY_PARAMETERS))
     })

    test('Returns a rejected promise with INVALID_QUERY_PARAMETERS when limit is > 50', () => {
        return services.getPopularGames(2, 51)
            .then(() => {throw Error('Assertion failed')}, reason => expect(reason).toEqual(error.INVALID_QUERY_PARAMETERS))
    })

    test('Returns a rejected promise with INVALID_QUERY_PARAMETERS when skip is < 0', () => {
        return services.getPopularGames(-1, 2)
            .then(() => {throw Error('Assertion failed')}, reason => expect(reason).toEqual(error.INVALID_QUERY_PARAMETERS))
    })

    test('Returns a rejected promise with INVALID_QUERY_PARAMETERS when skip is > 50', () => {
        return services.getPopularGames(52, 3)
            .then(() => {throw Error('Assertion failed')}, reason => expect(reason).toEqual(error.INVALID_QUERY_PARAMETERS))
    })
})

describe('Search games', () => {
    test('Returns the desired game', () => {
        const expectedGame = [{id: 'RLlDWHh7hR', name: 'Gloomhaven'}]
        return services.searchGames(expectedGame[0].name)
            .then(game => expect(game).toEqual(expectedGame))
    })

    test('Returns a rejected promise with GAME_NOT_FOUND_BORGA when game name is not found', () => {
        return services.searchGames('Sporting')
            .then(() => {throw Error('Assertion failed')}, reason => expect(reason).toEqual(error.GAME_NOT_FOUND_BORGA))
    })

    test('Returns a rejected promise with INVALID_GAME_NAME when game name is not inserted', () => {
        return services.searchGames(undefined)
            .then(() => {throw Error('Assertion failed')}, reason => expect(reason).toEqual(error.INVALID_GAME_NAME))
    })

    test('Returns a rejected promise with INVALID_GAME_NAME when game name has length 0', () => {
        return services.searchGames('')
            .then(() => {throw Error('Assertion failed')}, reason => expect(reason).toEqual(error.INVALID_GAME_NAME))
    })

    test('Returns a rejected promise with INVALID_GAME_NAME when game name has length > 50', () => {
        const gameName = 'O rato roeu a rolha do rei da Russia enquanto procurava as qualidades do Fernando Santos'
        return services.searchGames(gameName)
            .then(() => {throw Error('Assertion failed')}, reason => expect(reason).toEqual(error.INVALID_GAME_NAME))
    })
})

describe('Get the details of a game, with its id, name, description, url, image_url, mechanics names and category names', () => {
    test('Returns the game details', () => {
        return services.getGameDetails('RLlDWHh7hR')
            .then(game => expect(game).toEqual(testDb.games.RLlDWHh7hR))
    })

    test('Returns a rejected promise with GAME_NOT_FOUND when the game id does not exist in the desired group', () => {
        return services.getGameDetails('jirofle')
            .then(() => {throw Error('Assertion failed')}, reason => expect(reason).toEqual(error.GAME_NOT_FOUND_BORGA))
    })

    test('Returns a rejected promise with INVALID_GAME_ID when the game id does not exist', () => {
        return services.getGameDetails(undefined)
            .then(() => {throw Error('Assertion failed')}, reason => expect(reason).toEqual(error.INVALID_GAME_ID))
    })
})

describe('Create user', () => {
    test('Returns the token created to the new user', () => {
        const newUser = {username: 'diggyboy', name: 'Diggy', club: 'FC Vizela', password: 'slb123', confirmPassword: 'slb123'}
        return services.createUser(newUser)
            .then(user => {
                expect(testDb.credentials[newUser.username]).toEqual({password: newUser.password, token: user.token})
                expect(testDb.users[user.token]).toEqual({username: newUser.username, name: newUser.name, club: newUser.club})
            })
    })

    test('Returns a rejected promise with INVALID_USER_INPUT when name is not inserted', () => {
        const newUser = {club: 'FC Vizela'}
        return services.createUser(newUser)
            .then(() => {throw Error('Assertion failed')}, reason => expect(reason).toEqual(error.INVALID_USER_INPUT))
    })

    test('Returns a rejected promise with INVALID_USER_INPUT when club is not inserted', () => {
        const newUser = {name: 'Diggy'}
        return services.createUser(newUser)
            .then(() => {throw Error('Assertion failed')}, reason => expect(reason).toEqual(error.INVALID_USER_INPUT))
    })
})

describe('Create group', () => {
    test('Returns the new group created when the user has already a group', () => {
        const newGroup = {name: 'Cenas', description: 'Cenas bue fixolas'}
        return services.createGroup(VALID_TOKEN1, newGroup).then(group => {
                const expectedGroup = testDb.groups[VALID_TOKEN1].get(group.id)
                expect(group).toEqual(groupSummaryResponse([group.id, expectedGroup]))
            })
    })

    test('Returns the new group created when the user has no created groups yet', () => {
        const newGroup = {name: 'Cenas', description: 'Cenas bue fixolas'}
        return services.createGroup(VALID_TOKEN2, newGroup).then(group => {
                const expectedGroup = testDb.groups[VALID_TOKEN2].get(0)
                expect(group).toEqual(groupSummaryResponse([0, expectedGroup]))
            })
    })

    test('Returns a rejected promise with INVALID_GROUP_INPUT when name was not inserted', () => {
        const newGroup = {description: 'Cenas bue fixolas'}
        return services.createGroup(VALID_TOKEN2, newGroup)
            .then(() => {throw Error('Assertion failed')}, reason => expect(reason).toEqual(error.INVALID_GROUP_INPUT))
    })

    test('Returns a rejected promise with INVALID_GROUP_INPUT when description was not inserted', () => {
        const newGroup = {name: 'Cenas'}
        return services.createGroup(VALID_TOKEN2, newGroup)
            .then(() => {throw Error('Assertion failed')}, reason => expect(reason).toEqual(error.INVALID_GROUP_INPUT))
    })

    test('Returns a rejected promise with INVALID_GUID_TOKEN when the token is not a GUID', () => {
        const newGroup = {name: 'Cenas', description: 'Cenas bue fixolas'}
        return services.createGroup('9', newGroup)
            .then(() => {throw Error('Assertion failed')}, reason => expect(reason).toEqual(error.INVALID_GUID_TOKEN))
    })

    test('Returns a rejected promise with TOKEN_NOT_FOUND when the token is valid but not found', () => {
        const newGroup = {name: 'Cenas', description: 'Cenas bue fixolas'}
        return services.createGroup(NON_EXISTENT_TOKEN, newGroup)
            .then(() => {throw Error('Assertion failed')}, reason => expect(reason).toEqual(error.TOKEN_NOT_FOUND))
    })
})

describe('Update group', () => {
    test('Returns the updated group with its new name and description', () => {
        const expectedGroup = {name: 'Horror Games +18', description: 'Adult horror games'}
        return services.updateGroup(VALID_TOKEN1, '0', expectedGroup).then(group => {
            const expectedGroup = testDb.groups[VALID_TOKEN1].get(0)
            expect(group).toEqual(groupSummaryResponse([0, expectedGroup]))
        })
    })

    test('Returns the updated group with its new name', () => {
        const groupId = 0
        const nameUpdate = 'Horror Games Soft'
       return services.updateGroup(VALID_TOKEN1, groupId, {name: nameUpdate}).then(group => {
            const expectedGroup = testDb.groups[VALID_TOKEN1].get(groupId)
            expect(group).toEqual(groupSummaryResponse([groupId, expectedGroup]))
        })
    })

    test('Returns the updated group with its new description', () => {
        const groupId = 0
        const descriptionUpdate = 'Margarida favorites games'
        return services.updateGroup(VALID_TOKEN1, groupId, {description: descriptionUpdate}).then(group => {
            const expectedGroup = testDb.groups[VALID_TOKEN1].get(groupId)
            expect(group).toEqual(groupSummaryResponse([groupId, expectedGroup]))
        })
    })

    test('Returns a rejected promise with INVALID_GROUP_INPUT when neither name or description were inserted', () => {
        return services.updateGroup(VALID_TOKEN1, 0)
            .then(() => {throw Error('Assertion failed')}, reason => expect(reason).toEqual(error.INVALID_GROUP_INPUT))
    })

    test('Returns a rejected promise with INVALID_GROUP_ID when group id is not a number', () => {
        return services.updateGroup(VALID_TOKEN1, 'SLB', {name: 'Ignored', description: 'Do not ignore me!'})
            .then(() => {throw Error('Assertion failed')}, reason => expect(reason).toEqual(error.INVALID_GROUP_ID))
    })

    test('Returns a rejected promise with INVALID_GROUP_ID when group id is < 0', () => {
        return services.updateGroup(VALID_TOKEN1, -1, {name: 'Ignored', description: 'Do not ignore me!'})
            .then(() => {throw Error('Assertion failed')}, reason => expect(reason).toEqual(error.INVALID_GROUP_ID))
    })

    test('Returns a rejected promise with GROUP_NOT_FOUND when the user has groups but not with the inserted id', () => {
        return services.updateGroup(VALID_TOKEN_NO_GROUP, 9, {name: 'Ignored', description: 'Do not ignore me!'})
            .then(() => {throw Error('Assertion failed')}, reason => expect(reason).toEqual(error.GROUP_NOT_FOUND))
    })

    test('Returns a rejected promise with INVALID_GUID_TOKEN when the token is not a GUID', () => {
        return services.updateGroup('9', 0, {name: 'Ignored', description: 'Do not ignore me!'})
            .then(() => {throw Error('Assertion failed')}, reason => expect(reason).toEqual(error.INVALID_GUID_TOKEN))
    })

    test('Returns a rejected promise with TOKEN_NOT_FOUND when the token is valid but not found', () => {
        return services.updateGroup(NON_EXISTENT_TOKEN, 0, {name: 'Ignored', description: 'Do not ignore me!'})
            .then(() => {throw Error('Assertion failed')}, reason => expect(reason).toEqual(error.TOKEN_NOT_FOUND))
    })
})

describe('Get groups', () => {
    test('Returns the summary of the groups of a certain user', () => {
        return services.getGroups(VALID_TOKEN1).then(groups => {
            const expectedGroups = Array.from(testDb.groups[VALID_TOKEN1])
            expect(groups).toEqual(expectedGroups.map(groupSummaryResponse))
        })
    })

    test('Returns a rejected promise with GROUP_NOT_FOUND when the user does not have groups', () => {
        return services.getGroups(VALID_TOKEN_NO_GROUP)
            .then(() => {throw Error('Assertion failed')}, reason => expect(reason).toEqual(error.GROUP_NOT_FOUND))
    })

    test('Returns a rejected promise with INVALID_GUID_TOKEN when the token is not a GUID', () => {
        return services.getGroups('SCP')
            .then(() => {throw Error('Assertion failed')}, reason => expect(reason).toEqual(error.INVALID_GUID_TOKEN))
    })

    test('Returns a rejected promise with TOKEN_NOT_FOUND when the token is valid but not found', () => {
        return services.getGroups(NON_EXISTENT_TOKEN)
            .then(() => {throw Error('Assertion failed')}, reason => expect(reason).toEqual(error.TOKEN_NOT_FOUND))
    })
})

describe('Delete group', () => {
    test('Returns the group deleted when the user has groups', () => {
        const groupId = 1
        const groupToDelete = {id: groupId, name: 'Delete', description: 'Group to delete', nrGames: 0}
        return services.deleteGroup(VALID_TOKEN1, groupId).then(group => {
            expect(group).toEqual(groupToDelete)
            expect(testDb.groups[VALID_TOKEN1].get(groupId)).toBe(undefined)
        })
    })

    test('Returns a rejected promise with INVALID_GROUP_ID when the group id is not a number', () => {
        return services.deleteGroup(VALID_TOKEN_NO_GROUP, 'badId')
            .then(() => {throw Error('Assertion failed')}, reason => expect(reason).toEqual(error.INVALID_GROUP_ID))
    })

    test('Returns a rejected promise with INVALID_GROUP_ID when the group id is < 0', () => {
        return services.deleteGroup(VALID_TOKEN_NO_GROUP, -1)
            .then(() => {throw Error('Assertion failed')}, reason => expect(reason).toEqual(error.INVALID_GROUP_ID))
    })

    test('Returns a rejected promise with GROUP_NOT_FOUND when the user does not have a group with the inserted id', () => {
        return services.deleteGroup(VALID_TOKEN1, 9)
            .then(() => {throw Error('Assertion failed')}, reason => expect(reason).toEqual(error.GROUP_NOT_FOUND))
    })

    test('Returns a rejected promise with INVALID_GUID_TOKEN when the token is not a GUID', () => {
        return services.deleteGroup('invalidToken', 0)
            .then(() => {throw Error('Assertion failed')}, reason => expect(reason).toEqual(error.INVALID_GUID_TOKEN))
    })

    test('Returns a rejected promise with TOKEN_NOT_FOUND when the token is valid but not found', () => {
        return services.deleteGroup(NON_EXISTENT_TOKEN, 0)
            .then(() => {throw Error('Assertion failed')}, reason => expect(reason).toEqual(error.TOKEN_NOT_FOUND))
    })
})

describe('Get the details of a group, with its name, description and names of the included games', () => {
    test('Returns the details of the desired group', () => {
        const groupId = 0
        return services.getGroupDetails(VALID_TOKEN1, groupId).then(group => {
            expect(group).toEqual(groupDetailsResponse([groupId, testDb.groups[VALID_TOKEN1].get(groupId)]))
        })
    })

    test('Returns a rejected promise with INVALID_GROUP_ID when the group id is not a number', () => {
        return services.getGroupDetails(VALID_TOKEN_NO_GROUP, 'badId')
            .then(() => {throw Error('Assertion failed')}, reason => expect(reason).toEqual(error.INVALID_GROUP_ID))
    })

    test('Returns a rejected promise with INVALID_GROUP_ID when the group id is < 0', () => {
        return services.getGroupDetails(VALID_TOKEN_NO_GROUP, -1)
            .then(() => {throw Error('Assertion failed')}, reason => expect(reason).toEqual(error.INVALID_GROUP_ID))
    })

    test('Returns a rejected promise with USER_GROUPS_NOT_FOUND when the token is valid but does not have any group associated', () => {
        return services.getGroupDetails(VALID_TOKEN_NO_GROUP, 0)
            .then(() => {throw Error('Assertion failed')}, reason => expect(reason).toEqual(error.GROUP_NOT_FOUND))
    })

    test('Returns a rejected promise with GROUP_NOT_FOUND when the user does not have a group with the provided id', () => {
        return services.getGroupDetails(VALID_TOKEN1, 10)
            .then(() => {throw Error('Assertion failed')}, reason => expect(reason).toEqual(error.GROUP_NOT_FOUND))
    })

    test('Returns a rejected promise with INVALID_GUID_TOKEN when the token is not a GUID', () => {
        return services.getGroupDetails('invalidToken', 0)
            .then(() => {throw Error('Assertion failed')}, reason => expect(reason).toEqual(error.INVALID_GUID_TOKEN))
    })

    test('Returns a rejected promise with TOKEN_NOT_FOUND when the token is valid but not found', () => {
        return services.getGroupDetails(NON_EXISTENT_TOKEN, 0)
            .then(() => {throw Error('Assertion failed')}, reason => expect(reason).toEqual(error.TOKEN_NOT_FOUND))
    })
})

describe('Add game to group', () => {
    test('Returns the game added if it is unique in the desired group', () => {
        const groupId = 0
        const gameId = "TAAifFP590"
        return services.addGameToGroup(VALID_TOKEN1, groupId, gameId).then(game => {
            expect(game.name).toBe(testDb.games[gameId].name)
            expect(true).toBe(testDb.groups[VALID_TOKEN1].get(groupId).games.has(gameId))
        })
    })

    test('Returns the game desired when the game id already exists in the desired group, but it is not overwritten', () => {
        const groupId = 0
        const gameId = "RLlDWHh7hR"
        return services.addGameToGroup(VALID_TOKEN3, groupId, gameId).then(game => {
            expect(game.name).toBe(testDb.games[gameId].name)
            expect(true).toBe(testDb.groups[VALID_TOKEN3].get(groupId).games.has(gameId))
        })
    })

    test('Returns a rejected promise with GAME_NOT_FOUND_BORGA when the game id does not exist in BORDA db', () => {
        return services.addGameToGroup(VALID_TOKEN1, 0, "1")
            .then(() => {throw Error('Assertion failed')}, reason => expect(reason).toEqual(error.GAME_NOT_FOUND_BORGA))
    })

    test('Returns a rejected promise with TOKEN_NOT_FOUND when the token is valid but not found', () => {
        return services.addGameToGroup(NON_EXISTENT_TOKEN, 0, "TAAifFP590")
        .then(() => {throw Error('Assertion failed')}, reason => expect(reason).toEqual(error.TOKEN_NOT_FOUND))
    })

    test('Returns a rejected promise with INVALID_GUID_TOKEN when the token is not a GUID', () => {
        return services.addGameToGroup('invalidToken', 0, "TAAifFP590")
        .then(() => {throw Error('Assertion failed')}, reason => expect(reason).toEqual(error.INVALID_GUID_TOKEN))
    })

    test('Returns a rejected promise with GROUP_NOT_FOUND when the user does not have a group with the desired id', () => {
        return services.addGameToGroup(VALID_TOKEN1, 10, "TAAifFP590")
            .then(() => {throw Error('Assertion failed')}, reason => expect(reason).toEqual(error.GROUP_NOT_FOUND))
    })

    test('Returns a rejected promise with INVALID_GROUP_ID when the group id is not a number', () => {
        return services.addGameToGroup(VALID_TOKEN_NO_GROUP, 'badId', "TAAifFP590")
        .then(() => {throw Error('Assertion failed')}, reason => expect(reason).toEqual(error.INVALID_GROUP_ID))
    })

    test('Returns a rejected promise with INVALID_GROUP_ID when the group id is < 0', () => {
        return services.addGameToGroup(VALID_TOKEN_NO_GROUP, -1, "TAAifFP590")
            .then(() => {throw Error('Assertion failed')}, reason => expect(reason).toEqual(error.INVALID_GROUP_ID))
    })

    test('Returns a rejected promise with INVALID_GAME_INPUT when does not exist game id', () => {
        return services.addGameToGroup(VALID_TOKEN1, 0, undefined)
        .then(() => {throw Error('Assertion failed')}, reason => expect(reason).toEqual(error.INVALID_GAME_INPUT))
    })
})

describe('Deletes game from group', () => {
    test('Returns the game deleted', () => {
        const groupId = 0
        const gameId = "RLlDWHh7hR"
        const gameRemovedExpected = {id: gameId, name: 'Gloomhaven', image_url: 'https://s3-us-west-1.amazonaws.com/5cc.images/games/uploaded/1559254920151-51ulRXlJ7LL.jpg'}
        return services.deleteGroupGame(VALID_TOKEN3, groupId, gameId)
            .then(game => {
                expect(game).toEqual(gameRemovedExpected)
                expect(false).toBe(testDb.groups[VALID_TOKEN3].get(groupId).games.has(gameId))
            })
    })

    test('Returns a rejected promise with GAME_NOT_FOUND when the game id does not exist in the desired group', () => {
        return services.deleteGroupGame(VALID_TOKEN1, 0, "RLlDWHh7hR")
            .then(() => {throw Error('Assertion failed')}, reason => expect(reason).toEqual(error.GAME_NOT_FOUND))
    })

    test('Returns a rejected promise with INVALID_GAME_ID when the game id does not exist', () => {
        return services.deleteGroupGame(VALID_TOKEN1, 0, undefined)
            .then(() => {throw Error('Assertion failed')}, reason => expect(reason).toEqual(error.INVALID_GAME_ID))
    })

    test('Returns a rejected promise with TOKEN_NOT_FOUND when the token is valid but not found', () => {
        return services.deleteGroupGame(NON_EXISTENT_TOKEN, 0, "RLlDWHh7hR")
        .then(() => {throw Error('Assertion failed')}, reason => expect(reason).toEqual(error.TOKEN_NOT_FOUND))
    })

    test('Returns a rejected promise with INVALID_GUID_TOKEN  when the token is not a GUID', () => {
        return services.deleteGroupGame('invalidToken', 0, "RLlDWHh7hR")
        .then(() => {throw Error('Assertion failed')}, reason => expect(reason).toEqual(error.INVALID_GUID_TOKEN))
    })

    test('Returns a rejected promise with GROUP_NOT_FOUND when the user does not have a group with the desired id', () => {
        return services.deleteGroupGame(VALID_TOKEN1, 10, "RLlDWHh7hR")
            .then(() => {throw Error('Assertion failed')}, reason => expect(reason).toEqual(error.GROUP_NOT_FOUND))
    })

    test('Returns a rejected promise with INVALID_GROUP_ID when the group id is not a number', () => {
        return services.deleteGroupGame(VALID_TOKEN_NO_GROUP, 'badId', "RLlDWHh7hR")
        .then(() => {throw Error('Assertion failed')}, reason => expect(reason).toEqual(error.INVALID_GROUP_ID))
    })

    test('Returns a rejected promise with INVALID_GROUP_ID when the group id is < 0', () => {
        return services.deleteGroupGame(VALID_TOKEN_NO_GROUP, -9, "RLlDWHh7hR")
            .then(() => {throw Error('Assertion failed')}, reason => expect(reason).toEqual(error.INVALID_GROUP_ID))
    })
})

function groupSummaryResponse(groupArray) {
    const groupId = groupArray[0]
    const group = groupArray[1]
    return {id: groupId, name: group.name, description: group.description, nrGames: group.games.size}
}

function groupDetailsResponse(groupArray) {
    const groupId = groupArray[0]
    const group = groupArray[1]
    return {
        id: groupId,
        name: group.name,
        description: group.description,
        games: Array.from(group.games).map(elem => testDb.games[elem])
    }
}
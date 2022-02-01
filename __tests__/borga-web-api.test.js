const request = require('supertest')
const express = require('express')
const jestOpenApi = require('jest-openapi').default

// Load an OpenAPI file (YAML or JSON) into this plugin
jestOpenApi(process.cwd() +  '/docs/borga-api-spec.yaml')

// Setup express instance and routes
const app = express()
require('../lib/borga-routes')(app)

describe('Get popular games', () => {
    test('Returns the popular games', () => {
        return request(app)
            .get('/api/games/popular')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .then(res => expect(res).toSatisfyApiSpec())
    })
})

describe('Search games', () => {
    test('Returns the games with the provided name', () => {
        return request(app)
            .get('/api/games')
            .query({ name: 'Root' })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .then(res => expect(res).toSatisfyApiSpec())
    })

    test('When no game is found return 404 - Not Found', () => {
        return request(app)
            .get('/api/games')
            .query({ name: '123macaquinhodochines' })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(404)
            .then(res => expect(res).toSatisfyApiSpec())
    })

    test('When an invalid game name is inserted returns 400 - Bad Request', () => {
        return request(app)
            .get('/api/games')
            .query({ name: 'slbslbslbslbslbslbslbslbslbslbslbslbslbslbslbslbslb' })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400)
            .then(res => expect(res).toSatisfyApiSpec())
    })

    test('When the game name is missing returns 400 - Bad Request', () => {
        return request(app)
            .get('/api/games')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400)
            .then(res => expect(res).toSatisfyApiSpec())
    })
})

describe('Get game details', () => {
    test('When the game details are successfully obtained returns the code 200 - OK', () => {
        const gameId = 'RLlDWHh7hR'
        return request(app)
            .get(`/api/games/${gameId}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .then(res => {
                expect(res).toSatisfyApiSpec()
                expect(res.body.id).toBe(gameId)
            })
    })

    jest.setTimeout(30000)
    test('When the game is not found returns the code 404 - Not Found', () => {
        return request(app)
            .get(`/api/games/jirofle`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(404)
            .then(res => expect(res).toSatisfyApiSpec())
    })
})

describe('Create user', () => {
    test('When user is created with success returns code 201 - Created', () => {
        return request(app)
            .post('/api/user')
            .send({ username: 'verissimo', name: 'Nelson', club: 'SLBenfica', password: 'pass', confirmPassword: 'pass' })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(201)
            .then(res => expect(res).toSatisfyApiSpec())
    })

    test('When body has missing properties returns code 400 - Bad Request', () => {
        return request(app)
            .post('/api/user')
            .send({ name: 'Nelson' })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400)
            .then(res => expect(res).toSatisfyApiSpec())
    })
})

describe('Create group', () => {
    test('When the group is successfully created returns code 201 - Created', () => {
        const newGroup = { name: 'Grupeta', description: 'Chupeta' }
        return request(app)
            .post('/api/groups')
            .send(newGroup)
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer 0f3edb9b-76eb-4fc3-a87b-a40980b9a922')
            .expect('Content-Type', /json/)
            .expect(201)
            .then(res => {
                expect(res).toSatisfyApiSpec()
                expect(res.body.name).toBe(newGroup.name)
                expect(res.body.description).toBe(newGroup.description)
                expect(res.body.nrGames).toBe(0)
            })
    })

    test('When body has missing properties returns code 400 - Bad Request', () => {
        const newGroup = { name: 'Grupeta' }
        return request(app)
            .post('/api/groups')
            .send(newGroup)
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer 0f3edb9b-76eb-4fc3-a87b-a40980b9a922')
            .expect('Content-Type', /json/)
            .expect(400)
            .then(res => expect(res).toSatisfyApiSpec())
    })

    test('When authorization token is invalid returns code 401 - Unauthorized', () => {
        const newGroup = { name: 'Grupeta', description: 'Chupeta' }
        return request(app)
            .post('/api/groups')
            .send(newGroup)
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer 0f3edb9b-76eb-4fc3-a87b-a40980b9a922PORTUGAL')
            .expect('Content-Type', /json/)
            .expect(401)
            .then(res => expect(res).toSatisfyApiSpec())
    })
})

describe('Get groups', () => {
    test('When the groups are returned, the code is 200 - OK', () => {
        return request(app)
            .get('/api/groups')
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer 0f3edb9b-76eb-4fc3-a87b-a40980b9a922')
            .expect('Content-Type', /json/)
            .expect(200)
            .then(res => expect(res).toSatisfyApiSpec())
    })

    test('When authorization token is invalid returns code 401 - Unauthorized', () => {
        return request(app)
            .get('/api/groups')
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer 0f3edb9b-76eb-4fc3-a87b-a40980b9a922PORTUGAL')
            .expect('Content-Type', /json/)
            .expect(401)
            .then(res => expect(res).toSatisfyApiSpec())
    })

    test('When the user does not have groups, the error with the code 404 (Not Found) is returned', () => {
        return request(app)
            .get('/api/groups')
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer fc585a9a-be72-486c-be1a-438f41acbaae')
            .expect('Content-Type', /json/)
            .expect(404)
            .then(res => expect(res).toSatisfyApiSpec())
    })
})

describe('Update group', () => {
    test('When the group is successfully updated returns code 200 - OK', () => {
        const propToUpdate = { name: 'Best games ever' }
        return request(app)
            .put('/api/groups/0')
            .send(propToUpdate)
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer 0f3edb9b-76eb-4fc3-a87b-a40980b9a922')
            .expect('Content-Type', /json/)
            .expect(200)
            .then(res => {
                expect(res).toSatisfyApiSpec()
                expect(res.body.name).toBe(propToUpdate.name)
            })
    })

    test('When the group id is invalid returns code 400 - Bad Request', () => {
        const propToUpdate = { name: 'Best games ever' }
        return request(app)
            .put('/api/groups/bee')
            .send(propToUpdate)
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer 0f3edb9b-76eb-4fc3-a87b-a40980b9a922')
            .expect('Content-Type', /json/)
            .expect(400)
            .then(res => expect(res).toSatisfyApiSpec())
    })

    test('When the body is missing does not have a single valid property returns code 400 - Bad Request', () => {
        const propToUpdate = { jardim: 'Best games ever' }
        return request(app)
            .put('/api/groups/0')
            .send(propToUpdate)
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer 0f3edb9b-76eb-4fc3-a87b-a40980b9a922')
            .expect('Content-Type', /json/)
            .expect(400)
            .then(res => expect(res).toSatisfyApiSpec())
    })

    test('When authorization token is invalid returns code 401 - Unauthorized', () => {
        return request(app)
            .get('/api/groups/0')
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer 0f3edb9b-76eb-4fc3-a87b-a40980b9a922PORTUGAL')
            .expect('Content-Type', /json/)
            .expect(401)
            .then(res => expect(res).toSatisfyApiSpec())
    })

    test('When the group id is not found returns code 404 - Not Found', () => {
        const propToUpdate = { name: 'Best games ever' }
        return request(app)
            .put('/api/groups/9')
            .send(propToUpdate)
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer 0f3edb9b-76eb-4fc3-a87b-a40980b9a922')
            .expect('Content-Type', /json/)
            .expect(404)
            .then(res => expect(res).toSatisfyApiSpec())
    })
})

describe('Delete group', () => {
    test('When the group is successfully removed returns the code 200 - OK', () => {
        return request(app)
            .delete('/api/groups/1')
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer 0f3edb9b-76eb-4fc3-a87b-a40980b9a922')
            .expect('Content-Type', /json/)
            .expect(200)
            .then(res => expect(res).toSatisfyApiSpec())
    })

    test('When the group id is invalid returns code 400 - Bad Request', () => {
        return request(app)
            .delete('/api/groups/bee')
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer 0f3edb9b-76eb-4fc3-a87b-a40980b9a922')
            .expect('Content-Type', /json/)
            .expect(400)
            .then(res => expect(res).toSatisfyApiSpec())
    })

    test('When authorization token is invalid returns code 401 - Unauthorized', () => {
        return request(app)
            .delete('/api/groups/1')
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer 0f3edb9b-76eb-4fc3-a87b-a40980b9a922PORTUGAL')
            .expect('Content-Type', /json/)
            .expect(401)
            .then(res => expect(res).toSatisfyApiSpec())
    })

    test('When the group id is not found returns code 404 - Not Found', () => {
        return request(app)
            .delete('/api/groups/9')
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer 0f3edb9b-76eb-4fc3-a87b-a40980b9a922')
            .expect('Content-Type', /json/)
            .expect(404)
            .then(res => expect(res).toSatisfyApiSpec())
    })
})

describe('Get group details', () => {
    test('When the group details are successfully obtained returns the code 200 - OK', () => {
        return request(app)
            .get('/api/groups/0')
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer 0f3edb9b-76eb-4fc3-a87b-a40980b9a922')
            .expect('Content-Type', /json/)
            .expect(200)
            .then(res => expect(res).toSatisfyApiSpec())
    })

    test('When the group id is invalid returns code 400 - Bad Request', () => {
        return request(app)
            .get('/api/groups/bee')
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer 0f3edb9b-76eb-4fc3-a87b-a40980b9a922')
            .expect('Content-Type', /json/)
            .expect(400)
            .then(res => expect(res).toSatisfyApiSpec())
    })

    test('When authorization token is invalid returns code 401 - Unauthorized', () => {
        return request(app)
            .get('/api/groups/0')
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer 0f3edb9b-76eb-4fc3-a87b-a40980b9a922PORTUGAL')
            .expect('Content-Type', /json/)
            .expect(401)
            .then(res => expect(res).toSatisfyApiSpec())
    })

    test('When the group id is not found returns code 404 - Not Found', () => {
        return request(app)
            .get('/api/groups/9')
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer 0f3edb9b-76eb-4fc3-a87b-a40980b9a922')
            .expect('Content-Type', /json/)
            .expect(404)
            .then(res => expect(res).toSatisfyApiSpec())
    })
})

describe('Add game to group', () => {
    test('When the game is successfully added to the group returns the code 201 - Created', () => {
        const newGameId = { id: "RLlDWHh7hR" }
        return request(app)
            .post('/api/groups/0')
            .send(newGameId)
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer 0f3edb9b-76eb-4fc3-a87b-a40980b9a922')
            .expect('Content-Type', /json/)
            .expect(201)
            .then(res => expect(res).toSatisfyApiSpec())
    })

    test('When the group id is invalid returns code 400 - Bad Request', () => {
        const newGameId = { id: "RLlDWHh7hR" }
        return request(app)
            .post('/api/groups/bee')
            .send(newGameId)
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer 0f3edb9b-76eb-4fc3-a87b-a40980b9a922')
            .expect('Content-Type', /json/)
            .expect(400)
            .then(res => expect(res).toSatisfyApiSpec())
    })

    test('When the game id is missing returns code 400 - Bad Request', () => {
        return request(app)
            .post('/api/groups/0')
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer 0f3edb9b-76eb-4fc3-a87b-a40980b9a922')
            .expect('Content-Type', /json/)
            .expect(400)
            .then(res => expect(res).toSatisfyApiSpec())
    })

    test('When authorization token is invalid returns code 401 - Unauthorized', () => {
        const newGameId = { id: "RLlDWHh7hR" }
        return request(app)
            .post('/api/groups/0')
            .send(newGameId)
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer 0f3edb9b-76eb-4fc3-a87b-a40980b9a922PORTUGAL')
            .expect('Content-Type', /json/)
            .expect(401)
            .then(res => expect(res).toSatisfyApiSpec())
    })

    test('When the group id is not found returns code 404 - Not Found', () => {
        const newGameId = { id: "RLlDWHh7hR" }
        return request(app)
            .post('/api/groups/9')
            .send(newGameId)
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer 0f3edb9b-76eb-4fc3-a87b-a40980b9a922')
            .expect('Content-Type', /json/)
            .expect(404)
            .then(res => expect(res).toSatisfyApiSpec())
    })

    test('When the game id is not found returns code 404 - Not Found', () => {
        const newGameId = { id: "jiroflé" }
        return request(app)
            .post('/api/groups/0')
            .send(newGameId)
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer 0f3edb9b-76eb-4fc3-a87b-a40980b9a922')
            .expect('Content-Type', /json/)
            .expect(404)
            .then(res => expect(res).toSatisfyApiSpec())
    })
})

describe('Delete game from group', () => {
    test('When the game is successfully removed of the group returns the code 200 - Created', () => {
        return request(app)
            .delete('/api/groups/0/RLlDWHh7hR')
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer 0f3edb9b-76eb-4fc3-a87b-a40980b9a922')
            .expect('Content-Type', /json/)
            .expect(200)
            .then(res => expect(res).toSatisfyApiSpec())
    })

    test('When the group id is invalid returns code 400 - Bad Request', () => {
        return request(app)
            .delete('/api/groups/bee/RLlDWHh7hR')
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer 0f3edb9b-76eb-4fc3-a87b-a40980b9a922')
            .expect('Content-Type', /json/)
            .expect(400)
            .then(res => expect(res).toSatisfyApiSpec())
    })

    test('When authorization token is invalid returns code 401 - Unauthorized', () => {
        return request(app)
            .delete('/api/groups/0/RLlDWHh7hR')
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer 0f3edb9b-76eb-4fc3-a87b-a40980b9a922PORTUGAL')
            .expect('Content-Type', /json/)
            .expect(401)
            .then(res => expect(res).toSatisfyApiSpec())
    })

    test('When the game id is not found returns code 404 - Not Found', () => {
        return request(app)
            .delete('/api/groups/0/jirofle')
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer 0f3edb9b-76eb-4fc3-a87b-a40980b9a922')
            .expect('Content-Type', /json/)
            .expect(404)
            .then(res => expect(res).toSatisfyApiSpec())
    })
})

// TODO: Is there a way to change the environment variable to an invalid one inside this describe?
// describe('Returns code 500 (Internal Server Error) when client id was not correctly inserted', () => {
//     test('Get popular games returns code 500', () => {
//         return request(app)
//             .get('/api/games/popular')
//             .set('Accept', 'application/json')
//             .expect('Content-Type', /json/)
//             .expect(500)
//             .then(res => expect(res).toSatisfyApiSpec())
//     })
//
//     test('Search game return code 500', () => {
//         return request(app)
//             .get('/api/games')
//             .query({ name: 'Root' })
//             .set('Accept', 'application/json')
//             .expect('Content-Type', /json/)
//             .expect(500)
//             .then(res => expect(res).toSatisfyApiSpec())
//     })
//
//     test('Get game details return code 500', () => {
//         return request(app)
//             .get('/api/games/TAAifFP590')
//             .set('Accept', 'application/json')
//             .expect('Content-Type', /json/)
//             .expect(500)
//             .then(res => expect(res).toSatisfyApiSpec())
//     })
// })
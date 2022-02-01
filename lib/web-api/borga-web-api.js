const router = require('express').Router()
const validator = require('../utils/validator')
const httpError = require('../errors/http-errors')

module.exports = function (services) {
    if (!validator.isObjectAndNotNull(services)) {
        throw "Invalid or missing argument for services"
    }

    router.get('/games/popular', getPopularGames)
    router.get('/games', searchGames)
    router.get('/games/:gameId', getGameDetails)

    router.post('/user', createUser)

    router.post('/groups', createGroup)
    router.put('/groups/:groupId', updateGroup)
    router.get('/groups', getGroups)
    router.delete('/groups/:groupId', deleteGroup)
    router.get('/groups/:groupId', getGroupDetails)
    router.post('/groups/:groupId', addGameToGroup)
    router.delete('/groups/:groupId/:gameId', deleteGroupGame)

    return router

    function getPopularGames(req, res, next) {
        services.getPopularGames(req.query.skip, req.query.limit)
            .then(games => res.json(games))
            .catch(e => {
                processError(e, res)
                next()
            })
    }

    function searchGames(req, res, next) {
        services.searchGames(req.query.name)
            .then(game => res.json(game))
            .catch(e => {
                processError(e, res)
                next()
            })
    }

    function getGameDetails(req, res, next) {
        services.getGameDetails(req.params.gameId)
            .then(game => res.json(game))
            .catch(e => {
                processError(e, res)
                next()
            })
    }

    function createUser(req, res, next) {
        services.createUser(req.body)
            .then(token => res.status(201).json(token))
            .catch(e => {
                processError(e, res)
                next()
            })
    }

    function createGroup(req, res, next) {
        services.createGroup(getAuthorizationHeader(req), req.body)
            .then(group => res.status(201).json(group))
            .catch(e => {
                processError(e, res)
                next()
            })
    }

    function updateGroup(req, res, next) {
        services.updateGroup(getAuthorizationHeader(req), req.params.groupId, req.body)
            .then(group => res.json(group))
            .catch(e => {
                processError(e, res)
                next()
            })
    }

    function getGroups(req, res, next) {
        services.getGroups(getAuthorizationHeader(req))
            .then(groups => res.json(groups))
            .catch(e => {
                processError(e, res)
                next()
            })
    }

    function deleteGroup(req, res, next) {
        services.deleteGroup(getAuthorizationHeader(req), req.params.groupId)
            .then(group => res.json(group))
            .catch(e => {
                processError(e, res)
                next()
            })
    }

    function getGroupDetails(req, res, next) {
        services.getGroupDetails(getAuthorizationHeader(req), req.params.groupId)
            .then(game => res.json(game))
            .catch(e => {
                processError(e, res)
                next()
            })
    }

    function addGameToGroup(req, res, next) {
        services.addGameToGroup(getAuthorizationHeader(req), req.params.groupId, req.body.id)
            .then(game => res.status(201).json(game))
            .catch(e => {
                processError(e, res)
                next()
            })
    }

    function deleteGroupGame(req, res, next) {
        services.deleteGroupGame(getAuthorizationHeader(req), req.params.groupId, req.params.gameId) 
            .then(game => res.status(200).json(game))
            .catch(e => {
                processError(e, res)
                next()
            })
    }
}

function processError(appError, res) {
    const error = httpError.processApplicationError(appError)
    res.status(error.status).json(error.message)
}

function getAuthorizationHeader(req) {
    const auth = req.get('Authorization')
    return auth === undefined ? auth : auth.split(' ')[1]
}
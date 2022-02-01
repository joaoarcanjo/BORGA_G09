const router = require('express').Router()
const validator = require('../utils/validator')
const httpError = require('../errors/http-errors')

module.exports = function (services) {
    if (!validator.isObjectAndNotNull(services)) {
        throw "Invalid or missing argument for services"
    }

    router.get('/', home)
    router.get('/about', about)

    router.get('/games', getGames)
    router.get('/games/popular', getPopularGames)
    router.get('/games/:gameId', getGameDetails)

    router.get('/groups', getGroups)
    router.post('/groups', createGroup)
    router.get('/groups/new', newGroup)
    router.get('/groups/:groupId', getGroupDetails)
    router.post('/groups/:groupId', addGameToGroup)
    router.get('/groups/:groupId/update', updateGroup)
    router.get('/groups/addGame/:gameId', chooseGroupToAddGame)

    return router

    function home(req, res) {
        res.render('home', { isLogin: isAuthenticated(req.user) })
    }

    function about(req, res) {
        res.render('about', { isLogin: isAuthenticated(req.user) })
    }

    function getPopularGames(req, res) {
        const limit = req.query.limit
        const nextLimit = limit ? parseInt(limit) + (limit < 50 ? 10 : 0) : 10

        services.getPopularGames(req.query.skip, nextLimit)
            .then(games => {
                const allGames = games.map((game, idx) => { return { id: game.id, name: game.name, beginRow: idx%2 === 0,
                    endRow: idx%2 === 1 || idx === games.length-1}})
                res.render(
                    'games',
                    { isLogin: isAuthenticated(req.user), title: 'Popular games', games: allGames, limit: nextLimit, popular: true})
            })
            .catch(e => {
                res.render(
                    'games',
                    { isLogin: isAuthenticated(req.user), title: 'Popular games', noGames:true})
                processError(e, res)
            })
    }

    function getGames(req, res) {
        const gameName = req.query.name
        services.searchGames(gameName)
            .then(games => {
                const allGames = games.map((game, idx) => { return { id: game.id, name: game.name, beginRow: idx%2 === 0,
                    endRow: idx%2 === 1 || idx === games.length-1}})
                res.render(
                    'games',
                    { isLogin: isAuthenticated(req.user), title: `All '${gameName}' games` , games: allGames})
            })
            .catch(e => {
                res.render(
                    'games',
                    { isLogin: isAuthenticated(req.user), title: `All '${gameName}' games`, noGames:true})
                processError(e, res)
            })
    }

    function getGameDetails(req, res) {
        const gameId = req.params.gameId
        services.getGameDetails(gameId)
            .then(game => {
                const mechanics = game.mechanics.map((m, idx) => { return { name: m,
                    beginRow: idx%4 === 0,endRow: idx%4 === 3 || idx === game.mechanics.length-1 }})
                const categories = game.categories.map((c, idx) => { return { name: c,
                    beginRow: idx%4 === 0, endRow: idx%4 === 5 || idx === game.mechanics.length-1 }})
                const description = treatDescription(game.description)
                res.render('gameDetails', { id: gameId, gameName: game.name, gameDescription: description,gameUrl: game.url,
                    imageUrl: game.image_url, mechanics: mechanics, categories: categories, isLogin: isAuthenticated(req.user) })
            })
            .catch(e => {
                res.render('error', { isLogin: isAuthenticated(req.user), message: e.message })
                processError(e, res)
            })
    }

    function getGroups(req, res) {
        if (!isAuthenticated(req.user)) {
            return res.redirect('/login')
        }
        const token = req.user.token
        services.getGroups(token)
            .then(groups => services.getUser(token)
                    .then(user => res.render(
                        'groups',
                        { isLogin: true, token: token, groups: groups, userName: user.name, userClub: user.club, isLeft: true })
                    )
            )
            .catch(e => {
                services.getUser(token)
                    .then(user => {
                        res.render('groups', { isLogin: true, noGroups:true, userName: user.name, userClub: user.club, isLeft: true })
                        processError(e, res)
                    })
                    .catch(e => {
                        res.render('error', { isLogin: true, message: e.message })
                        processError(e, res)
                    })
            })
    }

    function createGroup(req, res) {
        if (!isAuthenticated(req.user)) {
            return res.redirect('/login')
        }        
        services.createGroup(req.user.token, req.body)
            .then(() => res.redirect('/groups'))
            .catch(e => {
                const errorMessage = `It was not possible to create the group, please try again later`
                res.render('error', { isLogin: true, message: errorMessage })
                processError(e, res)
            })
    }

    function getGroupDetails(req, res) {
        if (!isAuthenticated(req.user)) {
            return res.redirect('/login')
        }
        const token = req.user.token
        services.getGroupDetails(token, req.params.groupId)
            .then(group => {
                const groupGames = group.games.map((game, idx) => { return {id: game.id, name: game.name, image: game.image_url,
                    beginRow: idx%6 === 0, endRow: idx%6 === 5 || idx === group.games.length-1, groupId: group.id }})
                res.render('groupDetails', { isLogin: true, token: token, groupName: group.name, groupDescription: group.description,
                    games: groupGames, noGames: groupGames.length === 0 })
            })
            .catch(e => {
                res.render('error', { isLogin: true, message: e.message })
                processError(e, res)
            })
    }

    function addGameToGroup(req, res) {
        if (!isAuthenticated(req.user)) {
            return res.redirect('/login')
        }
        services.addGameToGroup(req.user.token, req.params.groupId, req.body.gameId)
            .then(() => res.redirect(`/groups/${req.params.groupId}`))
            .catch(e => {
                const errorMessage = `It was not possible to add the game, please try again later`
                res.render('error', { isLogin: true, message: errorMessage })
                processError(e, res)
            })
    }

    function newGroup (req, res) {
        res.render('newGroup', { isLogin: true })
    }

    function updateGroup (req, res) {
        if (!isAuthenticated(req.user)) {
            return res.redirect('/login')
        }
        res.render('updateGroup', { isLogin: true, token: req.user.token })
    }

    function chooseGroupToAddGame (req, res) {
        if (!isAuthenticated(req.user)) {
            return res.redirect('/login')
        }
        services.getGroups(req.user.token)
            .then(groups => {
                const allGroups = groups.map(g => { return { id: g.id, name: g.name, gameId: req.params.gameId }})
                res.render('addGameToGroup', { isLogin: true, groups: allGroups })
            })
            .catch(e => {
                const errorMessage = 'This user does not have groups yet, please create one first in your profile'
                res.render('error', { isLogin: true, message: errorMessage })
                processError(e, res)
            })
    }

    function processError(appError, res) {
        const error = httpError.processApplicationError(appError)
        res.status(error.status)
    }

    function treatDescription(description) {
        return description.replace(/<[^>]*>/g, '');
    }

    function isAuthenticated(user) {
        if (user && user.token) {
            return user.token
        }
        return undefined
    }
}
const fetch = require('node-fetch')
const error = require('./errors/application-errors')

const HOST_URL = 'https://api.boardgameatlas.com/api/search?'
const MECHANICS_URL = 'https://api.boardgameatlas.com/api/game/mechanics?'
const CATEGORIES_URL = 'https://api.boardgameatlas.com/api/game/categories?'
const CLIENT_ID = process.env.ATLAS_CLIENT_ID

function buildHttpRequest(url, queries) {
    return `${url + queries}&client_id=${CLIENT_ID}`
}

function getEssentialData(data) {
    return data.games.map(game => {
        return { id: game.id, name: game.name, image_url: game.image_url }
    })
}

function getMechanicsNames(gameMechanicsIds) {
    return fetch(buildHttpRequest(MECHANICS_URL))
        .then(res => verifyResponseSuccess(res))
        .then(data => gameMechanicsIds.map(elem => data.mechanics.find(mechanic => mechanic.id === elem.id).name))
}

function getCategoriesNames(gameCategoriesIds) {
    return fetch(buildHttpRequest(CATEGORIES_URL))
        .then(res => verifyResponseSuccess(res))
        .then(data => gameCategoriesIds.map(elem => data.categories.find(category => category.id === elem.id).name))
}

function getDetailedData(data) {
    return Promise.all(data.games.map(game => {
        return getMechanicsNames(game.mechanics)
            .then(mechanicsNames => getCategoriesNames(game.categories)
                .then(categoriesNames => {
                    return {
                        id: game.id,
                        name: game.name,
                        description: game.description,
                        url: game.url,
                        image_url: game.image_url,
                        mechanics: mechanicsNames,
                        categories: categoriesNames
                    }
                }))
    }))
}

function getPopularGames(skip, limit) {
    return fetch(buildHttpRequest(HOST_URL, `&order_by=rank&skip=${skip}&limit=${limit}`))
        .then(res => verifyResponseSuccess(res))
        .then(games => getEssentialData(games))
}

function searchGames(gameName) {
    return fetch(buildHttpRequest(HOST_URL, `&name=${gameName}&skip=0&limit=50`))
        .then(res => verifyResponseSuccess(res))
        .then(games => {
            const gamesFound = getEssentialData(games)
            if (gamesFound[0]) {
                return gamesFound
            }
            return Promise.reject(error.GAME_NOT_FOUND_BORGA)
        })
}

function getGameById(gameId) { 
    return fetch(buildHttpRequest(HOST_URL, `&ids=${gameId}`))
        .then(res => verifyResponseSuccess(res))
        .then(game => getDetailedData(game)
            .then(gameInfo => {
                if (gameInfo[0]) {
                    return gameInfo[0]
                }
                return Promise.reject(error.GAME_NOT_FOUND_BORGA)
            })
        )
}

function verifyResponseSuccess(res) {
    if (res.status === 200) {
        return res.json()
    } else if (res.status === 404) {
        return Promise.reject(error.GAME_NOT_FOUND_BORGA)
    }
    return Promise.reject(error.BOARD_GAME_ATLAS_SERVER_ERROR)
}

module.exports = {
    getPopularGames,
    searchGames,
    getGameById
}
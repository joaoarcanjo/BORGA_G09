const error = require('../lib/errors/application-errors');

const GAMES = [
    {id: 'TAAifFP590', name: 'Root'},
    {id: 'yqR4PtpO8X', name: 'Scythe'},
    {id: '5H5JS0KLzK', name: 'Wingspan'},
    {id: 'RLlDWHh7hR', name: 'Gloomhaven'},
    {id: 'fDn9rQjH9O', name: 'Terraforming Mars'},
    {id: 'i5Oqu5VZgP', name: 'Azul'},
    {id: '7NYbgH2Z2I', name: 'Viticulture: Essential Edition'},
    {id: '6FmFeux5xH', name: 'Pandemic'},
    {id: 'kPDxpJZ8PD', name: 'Spirit Island'},
    {id: 'j8LdPFmePE', name: '7 Wonders Duel'},
    {id: 'OF145SrX44', name: '7 Wonders'},
    {id: 'GP7Y2xOUzj', name: 'Codenames'}
]

function getPopularGames(skip, limit) {
    return Promise.resolve(GAMES.slice(skip, skip + limit))
}

function searchGames(gameName) {
    const game = []
    game.push(GAMES.find(elem => elem.name === gameName))
    if (game[0]) {
        return Promise.resolve(game)
    }
    return Promise.reject(error.GAME_NOT_FOUND_BORGA)
}

function getGameById(gameId) {
    const game = []
    game.push(GAMES.find(elem => elem.id === gameId))
    if (game[0]) {
        return Promise.resolve(game[0])
    }
    return Promise.reject(error.GAME_NOT_FOUND_BORGA)
}

module.exports = {
    getPopularGames,
    searchGames,
    getGameById
}
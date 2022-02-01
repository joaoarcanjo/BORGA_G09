const router = require('express').Router()
const passport = require('passport')
const expressSession = require("express-session");
const httpError = require("../errors/http-errors");

module.exports = function(app, services) {
    if (!services)
        throw "Invalid argument for services"

    // Passport initialization
    // Passport is an authentication middleware for node that authenticates requests
    app.use(expressSession({ secret: "Doninha fedorenta" }))
    // passport.initialize realiza a inicialização do modulo
    app.use(passport.initialize(undefined))
    // passport.session acts as a middlewate to alter the req object and change the 'user',
    // value that is currently the session id into the true deserialized user object
    app.use(passport.session(undefined))
    passport.serializeUser((user, done) => done(null, user))
    passport.deserializeUser((user, done) => done(null, user))
    // quando a path é apenas /signup, vai ser chamada a função createUserForm
    router.get('/signup', createUserForm)
    router.post('/signup', createUser)
    router.get('/login', loginForm)
    router.post('/login', login)
    router.post('/logout', logout)

    return router

    function createUserForm(req, res) {
        res.render('signup', { hasError: false })
    }

    //O body não vem em json, vem em urlencoded
    function createUser(req, res) {
        services.createUser(req.body)
            .then(user => req.login({ token: user.token, username: user.username }, () => res.redirect('/')))
            .catch(e => {
                processError(e, res)
                res.render('signup', { hasError: true, message: e.message })
            })
    }

    function loginForm(req, res) {
        res.render('login')
    }

    function login(req, res) {
        const username = req.body.username
        const password = req.body.password

        services.validateCredentials(username, password)
            .then(token => req.login({ token: token, username: username }, () => res.redirect('/')))
            .catch(e => {
                processError(e, res)
                res.render('login', { username: username, hasError: true, message: e.message })
            })
    }

    function logout(req, res) {
        req.logout()
        res.redirect('/')
    }

    function processError(appError, res) {
        const error = httpError.processApplicationError(appError)
        res.status(error.status)
    }
}
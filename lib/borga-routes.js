const express = require('express')
const swaggerUi = require('swagger-ui-express')
const YAML = require('yamljs')
const path = require('path')
const openapi = YAML.load(path.join(__dirname, '../docs/borga-api-spec.yaml'))

const gamesData = require('./borga-games-data')
const dataMem = require('./borga-data-mem')(require('./borga-database'))
const dataElastic = require('./borga-data-elastic')

const servicesElastic = require('./borga-services')(gamesData, dataElastic)
const servicesMem = require('./borga-services')(gamesData, dataMem)

const wepApiRouter = require('./web-api/borga-web-api')(servicesMem)
const wepSiteRouter = require('./web-site/borga-web-site')(servicesMem)

module.exports = function (app) {
    const hbs = require('hbs')
    //colocamos aqui porque precisavamos da app
    const usersRouter = require('./web-site/users-web-site')(app, servicesMem)

    app.use(express.json())
    app.use(express.urlencoded())

    // View engine setup
    app.set('views', path.join(__dirname, '../views'));
    app.set('view engine', 'hbs');
    hbs.registerPartials(path.join(__dirname, '../', '/views/partials'))

    app.use("/public", express.static(path.join(__dirname, '../', '/public')))
    app.use('/', wepSiteRouter)
    app.use('/', usersRouter)
    app.use('/api', wepApiRouter)
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapi))
}
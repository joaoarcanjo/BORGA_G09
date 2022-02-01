const express = require('express')
const app = express()
require('./lib/borga-routes')(app)

const PORT = process.env.PORT || 1904

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})
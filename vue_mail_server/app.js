const express = require('express')
const compression = require('compression')
const app = express()

app.use(express.static('./dist'))
app.use(compression())

app.listen(80, () => {
  console.log("http://127.0.0.1");
})
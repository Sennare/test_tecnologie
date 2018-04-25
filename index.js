path = require('path');

const hostname = '127.0.0.1';
const port = 3000;

const express = require('express')
const app = express()

app.use(express.static('public'));
app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'))

app.listen(port, hostname, () => console.log('Example app listening on port 3000!'))
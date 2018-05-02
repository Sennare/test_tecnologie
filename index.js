path = require('path');
let fs = require('fs');

// We must set base server configs, like ip and port
const hostname = '127.0.0.1';
const port = 3000;

// We will use express, for easier routing
const express = require('express');
const app = express()
// We will set a public folder for public resources called "public"
app.use(express.static('public'));

// Enable parser of json request
const bodyParser = require("body-parser");
app.use(bodyParser.json());

// When user call homepage we will return our editor
app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));

// When user call test page we will save his state to a file
app.post('/test', function(req, res) {
    // We will go to write file with received data
    fs.writeFile("./test", JSON.stringify(req.body), function(err) {
        if(err) {
            return console.log(err);
        }

        console.log("The file was saved!");

        // Now we will read file and send back data
        fs.readFile('./test', {encoding: 'utf-8'}, function(err, data) {
            if(err) {
                return console.log(err);
            }


            let text;
            if (data.toString() !== '') {
                text = JSON.parse(data.toString());
            }else {
                console.log("Nothing to read");
            }
            // Return data back
            res.status(200).send(data.toString());
        });
    });
});

// Start listening
app.listen(port, hostname, () => console.log('Listening on: ' + hostname + ':' + port + '... CTRL+C to terminate'));

path = require('path');

const hostname = '127.0.0.1';
const port = 3000;

const express = require('express');
const app = express()
app.use(express.static('public'));

const bodyParser = require("body-parser");
//app.use(bodyParser.json()); // support json encoded bodies
//app.use(bodyParser.urlencoded({ extended: false })); // support encoded bodies
// app.use(bodyParser.urlencoded({
//     extended: true
// }));
app.use(bodyParser.json());

app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));

app.post('/test', function(req, res) {
    let fs = require('fs');
    console.log("Reiceved: ------");
    //console.log(util.inspect(req.body, false, null))
    console.log(req.body);
    console.log(JSON.stringify(req.body));
    //console.log(req.body);
    fs.writeFile("./test", JSON.stringify(req.body), function(err) {
        if(err) {
            return console.log(err);
        }

        console.log("The file was saved!");

        fs.readFile('./test', {encoding: 'utf-8'}, function(err, data) {
            if(err) {
                return console.log(err);
            }


            console.log("Reading: ------");
            let text;
            if (data.toString() !== '') {
                text = JSON.parse(data.toString());
            }else
                console.log("Nothing to read");
            console.log(text);
            res.status(200).send(data.toString());
        });
    });
});

app.listen(port, hostname, () => console.log('Example app listening on port 3000!'))
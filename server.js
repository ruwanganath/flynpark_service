var express = require('express'),
    app = express();
const req = require('request');

var port = process.env.PORT || 8081;   

app.use(express.static(__dirname +'/public'));

app.get('/',function(request,response){
    response.send('Hello world-spsf_dataanalysis')
})

app.listen(port);
console.log('Server listening on : '+port);
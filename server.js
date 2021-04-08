var express = require('express'),
    app = express();

var port = process.env.PORT || 8081;   

app.use(express.static(__dirname +'/public'));

app.get('/',function(req,res){
    res.send('Hello world-spsf_dataanalysis')
})

app.listen(port);
console.log('Server listening on : '+port);
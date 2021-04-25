var express = require('express');
app = express();

const req = require('request');
const axios = require('axios');

var port = process.env.PORT || 8081;   
var spsfServiceUrl = 'https://spsfservice.us-south.cf.appdomain.cloud';
//var spsfServiceUrl = 'http://localhost:8080';

app.use(express.static(__dirname +'/public'));
//use express boady parser to get view data
app.use(express.urlencoded({ extended: true }));

var arrayData=[]; 
var arrayOnstreetData=[];
var arrayOffstreetData=[];
var arrayOnstreetInfoData=[];
var arrayObject;

//convert json to an array
convertJsonToArray = function (json){
    var arrayOutput = [];
    var keys = Object.keys(json);
    keys.forEach(function(key){
        arrayOutput.push(json[key]);
    });
    return arrayOutput;
}

//get available on and off street parking data from the open data platform
app.get('/generateParkingData',function (request,response){
    //lat,lon,occupancy
    reqObject = "https://data.melbourne.vic.gov.au/resource/vh2v-4nfs.json";
    reqObject2 = "https://data.melbourne.vic.gov.au/resource/ntht-5rk7.json";
    req(reqObject,(err,result,body)=> {
        
        if(err){
            return console.log(err);
        }
        data = JSON.parse(result.body)
        arrayOnstreetData = convertJsonToArray(data)    
        
        req(reqObject2,(err,result,body)=> {
            if(err){
                return console.log(err);
            }
            data2 = JSON.parse(result.body)
            arrayOnstreetInfoData = convertJsonToArray(data2)
         })
       
        arrayOnstreetData.forEach((element) => { 
            if(element.status==='Unoccupied'){
                
                arrayOnstreetInfoData.forEach((element2) => { 
                    if(element.bay_id === element2.bayid){
                        arrayObject = {
                            "type":'on',
                            "bay": element.bay_id,
                            "lat": element.lat,
                            "lon": element.lon,
                            "desc1":element2.description1,
                            "desc2":element2.description2
                        }   
                        arrayData.push(arrayObject);  
                    }
                })     
            }
        })
    });

    reqObject = "https://data.melbourne.vic.gov.au/resource/krh5-hhjn.json";
    req(reqObject,(err,result,body)=> {
        if(err){
            return console.log(err);
        }

        data = JSON.parse(result.body)
        arrayOffstreetData = convertJsonToArray(data)   

        arrayOffstreetData.forEach((element) => {              
            if(element.parking_type==='Commercial'){

                arrayObject = {
                    "type":'off',
                    "bay": element.base_property_id,
                    "lat": element.y_coordinate,
                    "lon": element.x_coordinate_2,
                    "desc1":element.parking_spaces,
                    "desc2":""
                }   
                arrayData.push(arrayObject); 
            }
        })         
    });

    response.json(arrayData)
 })

app.listen(port);
console.log('Server listening on : '+port);
var express = require('express');
app = express();

const req = require('request');
const axios = require('axios');

var port = process.env.PORT || 8081;   

//depending on the application run on locally or live we change the app host url here
//var spsfServiceUrl = 'https://spsfservice.mybluemix.net';
var spsfServiceUrl = 'http://localhost:8080';

//open data platform endpoint url for bay sensor data
var urlOnstreetBaySensorData = "https://data.melbourne.vic.gov.au/resource/vh2v-4nfs.json";
//open data platform endpoint url for bay info data
var urlOnstreetBayInfoData = "https://data.melbourne.vic.gov.au/resource/ntht-5rk7.json";
//open data platform endpoint url for off street parking data
var urlOffstreetParkingData = "https://data.melbourne.vic.gov.au/resource/krh5-hhjn.json";

app.use(express.static(__dirname +'/public'));
//use express boady parser to get view data
app.use(express.urlencoded({ extended: true }));

//function to convert json to an array
convertJsonToArray = function (json){
    var arrayOutput = [];
    var keys = Object.keys(json);
    keys.forEach(function(key){
        arrayOutput.push(json[key]);
    });
    return arrayOutput;
}

//function to get onstreet parking data and relavant parking bay info data
getOnstreetParkingData = async function(){
    
    let arrayOnstreetParkingData=[];
    let arrayOnstreetSensorData =[];
    let arrayOnstreetInfoData =[];

    try {
        //get sensor data from the end point
        const jsonSensorData = await axios.get(urlOnstreetBaySensorData);  
        arrayOnstreetSensorData = convertJsonToArray(jsonSensorData.data)
        
        try {
            //get parking info data from the end point
            const jsonInfoData = await axios.get(urlOnstreetBayInfoData);      
            arrayOnstreetInfoData = convertJsonToArray(jsonInfoData.data)

            arrayOnstreetSensorData.forEach((element) => { 

                if(element.status==='Unoccupied'){
                    
                    arrayOnstreetInfoData.forEach((element1) => { 

                        if(element.bay_id === element1.bayid){
                            arrayObject = {
                                "type":'on',
                                "bay": element.bay_id,
                                "lat": element.lat,
                                "lon": element.lon,
                                "desc1":element1.description1,
                                "desc2":element1.description2
                            }   
                            //constructing available onstreet parking data array
                            arrayOnstreetParkingData.push(arrayObject);  
                        }
                    })     
                }
            })    
    
        } catch (error) {
        console.error(error);
        }

    } catch (error) {
    console.error(error);
    }

    //return onstreet parking data array
    return arrayOnstreetParkingData;
}

//function to get offstreet parking data 
getOffstreetParkingData = async function(){
    
    let arrayOffstreetParkingData=[];
    let arrayTemp=[];

    try {
        //get offstreet parking data from the end point
        const jsonOffstreetData = await axios.get(urlOffstreetParkingData);       
        arrayTemp = convertJsonToArray(jsonOffstreetData,data)

        arrayTemp.forEach((elementOffstreetData) => {              
            if(elementOffstreetData.parking_type==='Commercial'){

                let arrayObject = {
                    "type":'off',
                    "bay": elementOffstreetData.base_property_id,
                    "lat": elementOffstreetData.y_coordinate,
                    "lon": elementOffstreetData.x_coordinate_2,
                    "desc1":elementOffstreetData.parking_spaces,
                    "desc2":""
                }   
                //constructing off street parking data array
                arrayOffstreetParkingData.push(arrayObject); 
            }
        })   

    } catch (error) {
    console.error(error);
    }

    //return offstreet parking data array
    return arrayOffstreetParkingData;
}


//function to generate all onstreet and off street parking data array and return all available parking data 
app.get('/generateParkingData',function (request,response){
   
    let arrayAllParkingData = [];
   
    return getOnstreetParkingData().then((res) => {

        res.forEach((element) => { 
            arrayAllParkingData.push(element)
        })

        return getOffstreetParkingData().then((res) => {
            res.forEach((element) => { 
                arrayAllParkingData.push(element)
            }) 
            response.json(arrayAllParkingData)
        })
    })  
 })

app.listen(port);
console.log('Server listening on : '+port);
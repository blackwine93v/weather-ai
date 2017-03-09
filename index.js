var express  = require('express');
var bodyparser = require('body-parser');
var app = express();
var router = express.Router();
var request = require('request');

const SRV_PORT = process.env.PORT || 5000;

app.listen(SRV_PORT, ()=>{
  console.log('Server is listening in port', SRV_PORT);
})

//Parser POST body
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

router.use((req, res, next)=>{
  console.log(req.method, req.url);
  next();
});


router.get('/', (req, res)=>{
  res.send('Weather using api.ai');
});

router.post('/v1/weathers', (req, res)=>{
  var country = req.body.country, city = req.body.city;
  console.log(req.body);
  if(!country && !city)
    return res.json({error: 'missing data'});

  
  var url = 'https://query.yahooapis.com/v1/public/yql?q=select * from weather.forecast where woeid in (select woeid from geo.places(1) where text="'
  +country+','+city+'")&format=json&env=store://datatables.org/alltableswithkeys';
  request(url, (er, response, body)=>{
    if(body)
      return res.json({data: body});
    else res.json({status: "get no result"});
  });
});

router.post('/v1/aiweathers', (req, res)=>{
  var rs = req.body.result;
  console.log("RS", rs);
  if(!rs || (rs && !rs.parameters.city || !rs.parameters.country))
    return res.json({error: 'missing data'});
  var country = rs.parameters.country, city = rs.parameters.city;
  
  console.log("Body",req.body);
console.log("Country",country);
console.log("City",city);
  
  var url = 'https://query.yahooapis.com/v1/public/yql?q=select * from weather.forecast where woeid in (select woeid from geo.places(1) where text="'
  +country+','+city+'")&format=json&env=store://datatables.org/alltableswithkeys';
  console.log("URL",url);
  request(url, (er, response, body)=>{
    console.log("Weather er", er);
    console.log("Weather response", response.body);
    console.log("Weather body", body);
    if(body){
//       body = {
// "speech": "Barack Hussein Obama II is the 44th and current President of the United States.",
// "displayText": "Barack Hussein Obama II is the 44th and current President of the United States, and the first African American to hold the office. Born in Honolulu, Hawaii, Obama is a graduate of Columbia University   and Harvard Law School, where ",
// "data": {},
// "contextOut": [],
// "source": "DuckDuckGo"
// }
      return res.json(body);
    }
    else res.json({status: "get no result"});
  });
});

app.use(router);
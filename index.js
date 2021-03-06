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
  console.log(req.body)
  if(!rs || (rs && !rs.parameters.city || !rs.parameters.country))
    return res.json({error: 'missing data'});
  var country = rs.parameters.country, city = rs.parameters.city;
  
  var url = 'https://query.yahooapis.com/v1/public/yql?q=select * from weather.forecast where woeid in (select woeid from geo.places(1) where text="'
  +country+','+city+'")&format=json&env=store://datatables.org/alltableswithkeys';

  request(url, (er, response, body)=>{
    console.log("Weather er", er);
    console.log("Weather response", typeof response.body);
    console.log("Weather response query", response.body.query);
    console.log("Weather response results", response.body.results);
    //console.log("Weather body", body);
    let data = response.body && JSON.parse(response.body);

    if(data && data.query && data.query.results){
      let item = data.query.results.channel.item;
      let atmosphere = data.query.results.channel.atmosphere;
      let location = data.query.results.channel.location;

      let status = ".::Tình trạng: "+item.condition.text;
      let temp = ".::Nhiệt độ trung bình: "+((item.condition.temp-32)/1.8).toFixed(1)+"°C (cao nhất "+((item.forecast[0].high-32)/1.8).toFixed(1)+"°C, thấp nhất "+((item.forecast[0].low-32)/1.8).toFixed(1)+"°C)";
      let humidity = ".::Độ ẩm: "+atmosphere.humidity+"%";

      var resBody = {
      "speech": "Thời tiết ở "+location.city+", "+location.country+" (time: "+item.condition.date+")\n"+status+"\n"+temp+"\n"+humidity,
      "data": {},
      "contextOut": [],
      "source": "Yahoo Weather"
      }
      console.log(resBody);
      return res.json(resBody);
    }
    else res.json({status: "get no result"});
  });
});

app.use(router);
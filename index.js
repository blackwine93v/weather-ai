var express  = require('express');
var bodyparser = require('body-parser');
var app = express();
var router = express.Router();
var request = require('request');

const SRV_PORT = 8000;

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

  console.log(req.body);
  var url = 'https://query.yahooapis.com/v1/public/yql?q=select * from weather.forecast where woeid in (select woeid from geo.places(1) where text="'
  +country+','+city+'")&format=json&env=store://datatables.org/alltableswithkeys';
  request(url, (er, response, body)=>{
    if(body)
      return res.json({data: body});
    else res.json({status: "get no result"});
  });
});

app.use(router);
var express = require('express');
var app = express();
var math = require('mathjs');
var request = require('request');
var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var upload = multer(); // for parsing multipart/form-data

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.set('port', (process.env.PORT || 5000));

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


var token = <YOUR PAGE ACCESS OKEN HERE>;

app.get('/webhook/', function (req, res) {
  if (req.query['hub.verify_token'] === <YOUR WEB TOKEN HERE>) {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong validation token');
});

app.post('/webhook/', upload.array(), function (req, res, next) {
  messaging_events = req.body.entry[0].messaging;
  for (i = 0; i < messaging_events.length; i++) {
    event = req.body.entry[0].messaging[i];
    sender = event.sender.id;
    if (event.message && event.message.text) {
      text = event.message.text;
      try {
          result_raw = math.eval(text);
          formatted = math.format(result_raw, 10);
      }
        catch (e) {
          console.log("Failure!!!!");
          formatted = "Sorry, I didn't understand";
       }
      sendTextMessage(sender, formatted);
    }
  }
  res.sendStatus(200);
});



function sendTextMessage(sender, text) {
  messageData = {
    text:text
  }
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
};

function print (value) {
  var precision = 14;
  console.log(math.format(value, precision));
}



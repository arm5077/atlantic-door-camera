require('dotenv').config({path: '/home/pi/Documents/camera-project/.env'});
var RaspiCam = require('raspicam'),
  aws = require('aws-sdk'),
  fs = require('fs'),
  ngrok = require('ngrok'),
  app = require('express')();


// Load AWS config
aws.config.update({ region: 'us-east-1' });
s3 = new aws.S3({ apiVersion: '2006-03-01' });

var camera = new RaspiCam({
  mode: 'photo', 
  output: 'door.jpg',
  timeout: 1
});


// Set up the endpoint the slash command will ping  
app.post('/', function(req, res){
  
  camera.start();
  camera.on('read', function(err, filename){
    camera.stop();
    photo = fs.readFileSync('./door.jpg');
    s3.upload({Bucket: 'potus-twitter', Key: 'door-camera.jpg', Body: photo, ACL: 'public-read', 'ContentType': 'image/jpeg'}, function(err, data){
      if(err) throw err;
      console.log('updated');
      
      res.json({
        'attachments': [
          {
            'pretext': `Here's the door, as of ${new Date()}`,
            'image_url': 'https://s3.amazonaws.com/potus-twitter/door-camera.jpg'
          }
        ]
      })  
    });
  });
  
})

app.listen(3000, function(){
  console.log("Image server up and running!")

  // Get ngrok set up
  ngrok.connect({
    addr: 3000,
    subdomain: 'atlanticfrontdoor',
    authtoken: process.env.NGROK_KEY
  }, function(err, url){
    if(err) throw err;
    console.log(`${url} up and running!`)
  })  

})


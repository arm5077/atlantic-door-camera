const derp = require('dotenv').config({path: '/home/pi/Documents/camera-project/.env'});
console.log(derp);
var RaspiCam = require('raspicam'),
  aws = require('aws-sdk'),
  fs = require('fs');

// Load AWS config
aws.config.update({ region: 'us-east-1' });
s3 = new aws.S3({ apiVersion: '2006-03-01' });

var camera = new RaspiCam({
  mode: 'photo', 
  output: 'derp.jpg',
  timeout: 1
});

camera.start();
camera.on('read', function(err, filename){
  camera.stop();
  photo = fs.readFileSync('./derp.jpg');
  s3.upload({Bucket: 'potus-twitter', Key: 'coffee-camera.jpg', Body: photo, ACL: 'public-read', 'ContentType': 'image/jpeg'}, function(err, data){
    if(err) throw err;
    console.log('updated');
  });
});

var mqtt = require('mqtt');
var lastX = 0;
var lastY = 0;
var flag = true;

var client;
/*
 Get device/account settings from the iotkit-agent configuration file
 (data/device.json) and fill in the variables below
 */
var device_id = "************";
var device_token = "*************"
var account_id = "*************";
var comp_id = "***************";
var knownMACAdresses = ["00:00:00:00:00:00","00:00:00:00:00:00","00:00:00:00:00:00"];

certs = [ "/usr/lib/node_modules/iotkit-agent/certs/AddTrust_External_Root.pem" ];
broker_host = "broker.us.enableiot.com";
broker_port = 8883;

// Get current timestamp
var now = new Date().getTime();

// Device authentication
var mypass = {
        "username": device_id,
        "password": device_token,
        "keepalive": 60,
        "ca": certs,
        "rejectUnauthorized": false
}

// Define MQTT message to submit data observation(s)
var data_value = 34.5;
var msg = {
    "accountId": account_id,
    "did": device_id,
    "on": now,
    "count": 1,
    "data": [{
        "on": now,
        "value": data_value,
        "cid": comp_id
    }]
}
console.log('Establishing connection', mypass.ca)
client = mqtt.createSecureClient(broker_port, broker_host, mypass);
console.log('Publishing message')
topic = 'server/metric/'+account_id+'/'+device_id;
// Submit data
client.publish(topic, JSON.stringify(msg), mypass);
console.log('Published');
console.log('Closing connection');

var client2  = mqtt.connect('mqtt://test.mosquitto.org');

// ==================================== UDP




"use strict";
var endpoint = "127.0.0.1"
var port     = 41235

var m = require('mraa'); //require mraa

var myLed = new m.Gpio(13); //LED hooked up to digital pin 13 (or built in pin on Galileo Gen1 & Gen2)
myLed.dir(m.DIR_OUT); //set the gpio direction to output

var sensorName = "LED";

// listen for UDP message from local agent
var dgram = require("dgram");
var server = dgram.createSocket("udp4");

server.on("error", function (err) {
  console.log("server error:\n" + err.stack);
  server.close();
});

server.on("message", function (msg, rinfo) {
  console.log("server got: " + msg + " from " +
    rinfo.address + ":" + rinfo.port);
  // Ignore essages unless they are local
  if(rinfo.address != "127.0.0.1") {
    console.log("Ignoring remote UDP message");
    return;
  }
  var js = JSON.parse(msg);
  var component = js['component'];
  var command = js['command'];
  var argvArray = js['argv'];
  console.log("component: " + component);
  console.log("command: " + command);
  for(var i = 0; i < argvArray.length; i++) {
    var name = argvArray[i]['name']
    var value = argvArray[i]['value']
    console.log("name: " + name);
    console.log("value: " + value);
    if (name == sensorName) {
        myLed.write(parseInt(value));
    }
  }

});

server.on("listening", function () {
  var address = server.address();
  console.log("server listening " +
      address.address + ":" + address.port);
});

server.bind(port);






// ==================================== Bleno
var bleno = require('bleno');
var BlenoPrimaryService = bleno.PrimaryService;

console.log('bleno - echo');

bleno.on('stateChange', function(state) {
  console.log('on -> stateChange: ' + state);
  lamps_state = {
      "lamp1":0,
      "lamp2":0
  };

  function ls_to_int(lamps){
    return lamps["lamp1"] + lamps["lamp2"]*2
  };
  bleno.startAdvertisingIBeacon('fffffffffffffffffffffffffffffff0', 70, ls_to_int(lamps_state), -59, function(err){console.log(err);});

  if (state === 'poweredOn') {
        server.on("message", function (msg, rinfo) {
        console.log("server got: " + msg + " from " +
        rinfo.address + ":" + rinfo.port);
      // Ignore essages unless they are local
      if(rinfo.address != "127.0.0.1") {
        console.log("Ignoring remote UDP message");
        return;
      }
      var js = JSON.parse(msg);
      var component = js['component'];
      var command = js['command'];
      var argvArray = js['argv'];
      console.log("component: " + component);
      console.log("command: " + command);
      for(var i = 0; i < argvArray.length; i++) {
        var name = argvArray[i]['name']
        var value = argvArray[i]['value']
        console.log("name: " + name);
        console.log("value: " + value);
        if (name == sensorName) {
            lamps_state[component] = parseInt(value);
            bleno.stopAdvertising();
            bleno.startAdvertisingIBeacon('fffffffffffffffffffffffffffffff0', 70,ls_to_int(lamps_state) , -59, function(err){console.log(err);});
            console.log('start adv');
            myLed.write(parseInt(value));
        }
      }

        });

  } else {
    bleno.stopAdvertising();
  }
});

//var mraa = require('mraa'); //require mraa for pin operating
var noble = require('noble'); //for  bluetooth operations

console.log("Hello IoT hackatone");

noble.on('stateChange', function(state) {
    if (state === 'poweredOn') {
        console.log("scanning for bt");
        noble.startScanning([],true);
    } else {
        noble.stopScanning();
    }
});

//trilateration.addBeacon(0, trilateration.vector(0, 0));
//trilateration.addBeacon(1, trilateration.vector(2, 1));
//trilateration.addBeacon(2, trilateration.vector(4, 2));

function calculateTrilateration(){
    console.log("TRILATERATION START");
    var da = ourHost[0].d
    var db = ourHost[1].d
    var dc = ourHost[2].d
    console.log(da);
    console.log(db);
    console.log(dc);
    var xa = ourHost[0].x
    var xb = ourHost[1].x
    var xc = ourHost[2].x
    var ya = ourHost[0].y
    var yb = ourHost[1].y
    var yc = ourHost[2].y
    var va = ((db*db - dc*dc) - (xb*xb - xc*xc) - (yb*yb - yc*yc))/2;
    var vb = ((db*db - da*da) - (xb*xb - xa*xa) - (yb*yb - ya*ya))/2;
    var temp1 = vb*(xc-xb) - va*(xa-xb);
    var temp2 = (ya-yb)*(xc-xb) - (yc-yb)*(xa-xb);
    var posy = temp1 / temp2;
    var posx = (va - posy*(yc-yb))/(xc-xb);


    console.log("X: " + posx + "; Y: " + posy);
    console.log("TRILATERATION END");
    var answerx = posx;
    var answery = posy;
    console.log("X: " + answerx + "; Y: " + answery  );
    console.log("X: " + posx + "; Y: " + posy );
    client2.publish('hackiot/hackaton/beacon/position', JSON.stringify({"x":answerx,"y":answery}) );
}

setInterval(calculateTrilateration,2000);

//continiously discovering devices

var ourHost = [{x:30,y:30,d:0},{x:30,y:330,d:0},{x:690,y:330,d:0}];



function arrayContains(needle, arrhaystack)
{
    return (arrhaystack.indexOf(needle) > -1);
}

noble.on('discover', function(peripheral) {
    var manufacturerData;
    var major;
    var minor;
    var rssi;
    var hostRssi;

    var company_id;
    var device_id;

    if (peripheral.advertisement) {
    //parse it if it's a client
        if(peripheral.advertisement.manufacturerData === undefined){
            }else{
                manufacturerData = peripheral.advertisement.manufacturerData;
                company_id =  manufacturerData.slice(0,2).readUInt16BE(0,true);
                //console.log(" company id");
                //console.log( company_id );
                device_id = manufacturerData.slice(2,3).readUInt8(0,true);
                //console.log(" device id");
                //console.log( device_id ) ;
                if (company_id == 43776  && device_id == 254){
                    var txPower = -59;
                    //we got host device
                    hostRssi = manufacturerData.slice(8,9).readUInt8(0,true) - 255;
                    //console.log (knownMACAdresses.indexOf(peripheral.address));
                    console.log ("rssi from host = " + hostRssi);
                    //trilateration.setDistance(knownMACAdresses.indexOf(peripheral.address), (0.89976)*Math.pow(hostRssi,7.7095) + 0.111  );
                    ourHost[knownMACAdresses.indexOf(peripheral.address)].d = hostRssi;
                }else{
                    major = manufacturerData.slice(20,22).readUInt16BE(0,true);
                    minor = manufacturerData.slice(22,24).readUInt16BE(0,true);
                    if((major == 4) && (minor == 1)){
                        console.log("HOORAY  THATS OURS BEACON remember itd rssi for triangulation");
                        rssi = manufacturerData.slice(24,25).readUInt8(0,true);
                        console.log( manufacturerData.slice(24,25).readUInt8(0,true) );
                        //console.log( rssi - 255 );
                        //console.log( peripheral.rssi );
                    }
                }
            }
        }
});

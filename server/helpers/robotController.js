/**
 * Created by danielabrao on 5/25/17.
 */
(function () {
    "use strict";

    var fs = require("fs");
    var Sound = require('node-aplay');
    var AudioContext = require("web-audio-api").AudioContext;
    var pcmdata = [] ;
    var samplerate ;
    var iswaving = false;
    var isplaying = false;
    var mincycle = 500;
    var maxcycle = 2300;
    var context = new AudioContext;
	var pigpio = require('pigpio');
	var ws281x = require('rpi-ws281x-native');
	var NUM_LEDS = 1;
	var color = new Uint32Array(NUM_LEDS);
	ws281x.init(NUM_LEDS);
	pigpio.initialize();



    var methods = {
        "dance": function (soundfile) {
            methods.decodeSoundFile(soundfile);
        },
        "decodeSoundFile": function (soundfile) {
            console.log("decoding mp3 file ", soundfile, " ..... ");
            fs.readFile(soundfile, function(err, buf) {
                if (err) {
                    throw err;
                }
                context.decodeAudioData(buf, function(audioBuffer) {
                    pcmdata = (audioBuffer.getChannelData(0)) ;
                    samplerate = audioBuffer.sampleRate;
                    methods.findPeaks(pcmdata, samplerate);
                    methods.playsound(soundfile);
                }, function(err) {
                    throw err;
                });
            });
        },
        "playsound": function (soundfile) {
            isplaying = true ;
            var music = new Sound(soundfile);
            music.play();
            music.on('complete', function () {
                console.log('Done with music playback!');
                isplaying = false;
            });
        },
        "findPeaks": function (pcmdata, samplerate, threshold) {
            var interval = 0.05 * 1000 ; var index = 0 ;
            var step = Math.round( samplerate * (interval/1000) );
            var max = 0;
            var prevmax = 0;
            var prevdiffthreshold = 0.3;

            //loop through song in time with sample rate
            var samplesound = setInterval(function() {
                if (index >= pcmdata.length) {
                    clearInterval(samplesound);
                    console.log("finished sampling sound");
                    return;
                }
                for (var i = index; i < index + step; i += 1){
                    max = pcmdata[i] > max ? pcmdata[i].toFixed(1) : max;
                }
                // Spot a significant increase? Wave Arm
                if(max - prevmax >= prevdiffthreshold) {
                    methods.waveArm("dance");
                }
                prevmax = max;
                max = 0;
                index += step;
            }, interval, pcmdata);
        },
        "waveArm": function (action, timesAmount, intervalAmount) {
            iswaving = true ;
            var Gpio = pigpio.Gpio;
            var motor = new Gpio(7, {
                "mode": Gpio.OUTPUT
            });
            var times =  timesAmount || 8;
            var interval = intervalAmount || 700;

            if (action === "wave") {
                var pulse = setInterval(function() {
                    motor.servoWrite(maxcycle);
                    setTimeout(function(){
                        if (motor) {
                            motor.servoWrite(mincycle);
                        }
                    }, interval / 3);

                    if (times-- === 0) {
                        clearInterval(pulse);
                        if (!isplaying) {
                            setTimeout(function(){
                                iswaving = false ;
                            }, 500);
                        }
                        return false;
                    }
                }, interval);
            } else {
                motor.servoWrite(maxcycle);
                setTimeout(function(){
                    motor.servoWrite(mincycle);
                }, 400);
            }
        },
		"setLED": function (colorval){
			color[0] = colorval ;
			ws281x.render(color);
		},
		"setLEDRandom": function (colorval){
			var colors = [0x00ff00,0xff0000,0x0000ff,0xffff00,0x00ffff];

			function request() {
				var colorN =  Math.floor(Math.random() * (colors.length - 0 + 1)) + 0;
				color[0] = colors[colorN] ;
				ws281x.render(color);
			}
			setInterval(request, 100);
			// ----  reset LED before exit
			process.on('SIGINT', function () {
				ws281x.reset();
				process.nextTick(function () { process.exit(0); });
			});
		}
    };
    module.exports = methods;
}());

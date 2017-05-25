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
    
    var methods = {
        "dance": function (soundfile) {
            methods.decodeSoundFile(soundfile);
        },
        "decodeSoundFile": function (soundfile) {
            console.log("decoding mp3 file ", soundfile, " ..... ");
            fs.readFile(soundfile, function(err, buf) {
                if (err) throw err;
                context.decodeAudioData(buf, function(audioBuffer) {
                    console.log("AQUIIIIII");
                    console.log(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate, audioBuffer.duration);
                    pcmdata = (audioBuffer.getChannelData(0)) ;
                    samplerate = audioBuffer.sampleRate;
                    methods.findPeaks(pcmdata, samplerate);
                    methods.playsound(soundfile);
                }, function(err) { throw err })
            });
        },
        "playsound": function (soundfile) {
            isplaying = true ;
            console.log("HEREEEE" );
            console.log(soundfile);
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
            var max = 0 ;   var prevmax = 0 ;  var prevdiffthreshold = 0.3 ;

            //loop through song in time with sample rate
            var samplesound = setInterval(function() {
                if (index >= pcmdata.length) {
                    clearInterval(samplesound);
                    console.log("finished sampling sound")
                    return;
                }
                for(var i = index; i < index + step ; i++){
                    max = pcmdata[i] > max ? pcmdata[i].toFixed(1)  : max ;
                }
                // Spot a significant increase? Wave Arm
                // if(max-prevmax >= prevdiffthreshold){
                //     methods.waveArm("dance");
                // }
                prevmax = max ; max = 0 ; index += step ;
            }, interval,pcmdata);
        },
        "waveArm": function (action) {
            iswaving = true ;
            var Gpio = pigpio.Gpio;
            var motor = new Gpio(7, {mode: Gpio.OUTPUT});
            //pigpio.terminate();
            var times =  8 ;
            var interval = 700 ;

            if (action === "wave") {
                var pulse = setInterval(function() {
                    motor.servoWrite(maxcycle);
                    setTimeout(function(){
                        if (motor != null) {
                            motor.servoWrite(mincycle);
                        }
                    }, interval/3);

                    if (times-- === 0) {
                        clearInterval(pulse);
                        if (!isplaying) {
                            setTimeout(function(){
                                micInstance.resume();
                                iswaving = false ;
                            }, 500);
                        }
                        return;
                    }
                }, interval);
            }else {
                motor.servoWrite(maxcycle);
                setTimeout(function(){
                    motor.servoWrite(mincycle);
                }, 400);
            }
        }
    };
    module.exports = methods;

}());

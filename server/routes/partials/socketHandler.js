/**
 * Created by danielabrao on 5/25/17.
 */
(function () {
    "use strict";

    module.exports = function (io, gpio, robotController) {
        io.on('connection', function (socket) {
            console.log("connected");

            socket.on("move", function (obj) {
                console.log(obj);
            });

            socket.on("dance", function () {
                robotController.dance("./server/temp/audio/club.wav");
            });

            socket.on("start", function () {
                robotController.waveArm("wave", 2, 300);
            });

            socket.once('disconnect', function () {
                console.log([io.engine.clientsCount, 'Clients connected after this exit'].join(' '));
            });
        });
    }

}());

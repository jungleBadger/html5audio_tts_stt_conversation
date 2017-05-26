/**
 * Created by danielabrao on 5/25/17.
 */
(function () {
    "use strict";

    module.exports = function (io, gpio, robotController) {
		// ---- LED Colors
		var red = 0x00ff00;
		var green = 0xff0000;
		var blue = 0x0000ff;
		var yellow = 0xffff00;
		var purple = 0x00ffff;

        io.on('connection', function (socket) {
            console.log("connected");

            socket.on("move", function (obj) {
                console.log(obj);
            });

            socket.on("dance", function (music) {
				robotController.setLEDRandom();
                robotController.dance("./server/temp/audio/" + (music || "club") + ".wav");
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

/**
 * Created by danielabrao on 1/31/17.
 */
(function () {
    "use strict";

    var watsonRoutes = require("./partials/watsonHandler");
    var socketRoutes = require("./partials/socketHandler");

    module.exports = function (app, upload, text_to_speech, speech_to_text, conversation, FileHandler, fs, io, gpio, robotController) {
        watsonRoutes(app, upload, text_to_speech, speech_to_text, conversation, FileHandler, fs);
        socketRoutes(io, gpio, robotController);
        app.get("/", function (req, res) {
            return res.status(200).render("demo.html", {
                user: req.user || ""
            });
        });
    };

}());
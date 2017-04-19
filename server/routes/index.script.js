/**
 * Created by danielabrao on 1/31/17.
 */
(function () {
    "use strict";

    var watsonRoutes = require("./partials/watsonHandler");

    module.exports = function (app, upload, text_to_speech, speech_to_text, conversation, FileHandler, fs) {
        watsonRoutes(app, upload, text_to_speech, speech_to_text, conversation, FileHandler, fs);

        app.get("/", function (req, res) {
            return res.status(200).render("demo.html", {
                user: req.user || ""
            });
        });
    };

}());
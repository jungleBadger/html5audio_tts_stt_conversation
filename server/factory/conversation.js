/**
 * Created by danielabrao on 3/21/17.
 */
(function () {
    "use strict";

    var watsonConversation = require("watson-developer-cloud/conversation/v1"),
        conversationInstance = new watsonConversation(require("../configs/wcsConfig"));

    module.exports = function (conversationCredentials) {
        return {
            "sendMessage": function (options) {
                console.log(options);
                return new Promise(function (resolve, reject) {
                    if (!options) {
                        return reject("Can not proceed without options object");
                    }
                    options.workspace_id = options.workspace_id || conversationCredentials.workspace_id;
                    conversationInstance.message(options, function (err, response) {
                        if (err) {
                            console.log(err);
                            return reject(err);
                        } else {
                            return resolve(response);
                        }
                    });
                });
            }
        };
    };

}());
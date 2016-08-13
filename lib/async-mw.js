//'use strict';

module.exports = function(handler) {
    return function (req, res, next) {
        Promise.resolve().then(() => {
            return handler(req, res);
        }).then(data => {
            if(data === null) {
                return;
            }
            if(data !== undefined) {
                res.json(data);
                return;
            }
            next();
        }, err => {
            next(err || new Error());
        });
    }
};
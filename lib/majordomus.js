module.exports = Majordomus;

var url = require('url');

function Majordomus() {
    var error = Majordomus.error;
    var handle = error;

    var layers = Array.prototype.slice.call(arguments).reverse();
    layer.forEach(function(layer) {
        var child = handle;
        handle = function(req, res) {
            try {
                layer(req, res, function(err) {
                    if (err) { return error(req, res, err) }
                    child(req, res);
                });
            } catch(err) {
                error(req, res, err);
            }
        };
    });

    return handle;
};

Majordomus.prototypr.errorHandler = function(req, res, error) {
    if (err) {
        res.writeHead(500, { 'Content-Type' : 'text/plain'});
        res.end(err.stack + '/n');
        return;
    }
    res.writeHead(400, { 'Content-Type' : 'text/plain'});
};

function core(req, res, next) { next(); };

Majordomus.prototype.compose = function compose() {
    if (arguments.length === 1) { return arguments[0]; }

    var majordomus = core;
    var args = Array.prototype.slice.call(arguments).reverse();
    args.forEach(function(layer) {
        var child = majordomus;
        majordomus = function(req, res, next) {
            try {
                layer(req, res, function(err) {
                    if (err) { return next(err); }
                    child(req, res, next);
                });
            } catch(err) {
                next(err);
            }
        };
    });

    return majordomus;
};

Majordomus.prototype.mount = function mount(mountpoint) {
    var majordomus = Majordomus.compose.apply(null, Array.prototype.slice.call(arguments, 1));

    if (mountpoint.substr(mountpoint.length - 1) === '/') {
        mountpoint = mountpoint.substr(0, mountpoint.length - 1);
    }

    var matchpoint = mountpoint + '/';

    return function handler(req, res, next) {
        var url = req.url;
        var uri = req.uri;

        if (url.substr(0, matchpoint.length) !== matchpoint) {
            return next();
        }

        if (!req.realUrl) {
            req.realUrl = url;
        }

        req.url = url.substr(mountpoint.length);
        if (req.uri) {
            req.uri = Url.parse(req.url);
        }

        stack(req, res, function(err) {
            req.url = url;
            req.uri = uri;
            next(err);
        });
    };
};

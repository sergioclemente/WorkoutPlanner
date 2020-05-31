"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const zlib = require("zlib");
const path = require("path");
const fs = require("fs");
const url = require("url");
const Core = require("./core");
const Model = require("./builder");
const ModelServer = require("./model_server");
const User = require("./user");
const Config = require("./config");
function logRequest(req, tag, data) {
    console.log(`[request-${tag}] Request Data: ${JSON.stringify(data)}`);
}
function handleExistentFile(req, res, request_id, fs, filename) {
    let accept_encoding = (req.headers['accept-encoding']);
    if (!accept_encoding) {
        accept_encoding = '';
    }
    let stat = fs.statSync(filename);
    if (stat.isDirectory()) {
        filename += '/index.html';
    }
    let mtime = stat.mtime;
    if (req.headers["if-modified-since"] != null) {
        let req_mod_date = new Date(req.headers["if-modified-since"]);
        console.log(`request_id: ${request_id} path: ${filename} Cache still valid? ${req_mod_date != null && mtime != null && req_mod_date.toUTCString() == mtime.toUTCString()}. Request_date:${req_mod_date.toUTCString()} - File_date:${mtime.toUTCString()}`);
    }
    const raw = fs.createReadStream(filename);
    if (/\bdeflate\b/.test(accept_encoding)) {
        res.writeHead(200, {
            'Content-Encoding': 'deflate',
            'Last-Modified': mtime.toUTCString()
        });
        raw.pipe(zlib.createDeflate()).pipe(res);
    }
    else if (/\bgzip\b/.test(accept_encoding)) {
        res.writeHead(200, {
            'Content-Encoding': 'gzip',
            'Last-Modified': mtime.toUTCString()
        });
        raw.pipe(zlib.createGzip()).pipe(res);
    }
    else {
        res.writeHead(200, {});
        raw.pipe(res);
    }
}
function handleSendEmail(req, res, uri, params) {
    if (params.w && params.ftp && params.tpace && params.st && params.ou && params.email) {
        let ftp = parseInt((params.ftp));
        let swim_ftp = parseInt((params.swim_ftp));
        let tpace = (params.tpace);
        let css = (params.css);
        let email = (params.email);
        let st = parseInt((params.st));
        let ou = parseInt((params.ou));
        let t = (params.t);
        let w = (params.w);
        let userProfile = new User.UserProfile(ftp, tpace, swim_ftp, css, email);
        let builder = new Model.WorkoutBuilder(userProfile, st, ou).withDefinition(t, w);
        let ms = new ModelServer.MailSender(Config.Values.smtp.login, Config.Values.smtp.password);
        let attachments = [];
        if (builder.getSportType() == Core.SportType.Bike) {
            let attachment_mrc = {
                name: builder.getMRCFileName(),
                data: builder.getMRCFile(),
                extension: "mrc",
            };
            let attachment_zwo = {
                name: builder.getZWOFileName(),
                data: builder.getZWOFile(),
                extension: "zwo",
            };
            let attachment_ppsmrx = {
                name: builder.getPPSMRXFileName(),
                data: builder.getPPSMRXFile(),
                extension: "ppsmrx",
            };
            attachments.push(attachment_zwo);
            attachments.push(attachment_mrc);
            attachments.push(attachment_ppsmrx);
        }
        ms.send(userProfile.email, builder.getMRCFileName(), builder.getPrettyPrint("<br />"), attachments, function (status, message) {
            if (status) {
                res.writeHead(200, {});
            }
            else {
                res.writeHead(500, {});
                ModelServer.Logger.error(message);
            }
            res.end();
        });
        return true;
    }
    else {
        return false;
    }
}
function handleGetWorkouts(req, res, uri, params) {
    var db = ModelServer.WorkoutDBFactory.createWorkoutDB();
    db.getAll(function (err, workouts) {
        if (err) {
            res.writeHead(500);
            res.end();
        }
        else {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.write(JSON.stringify(workouts));
            res.end();
        }
    });
    return true;
}
function show404(req, res) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.write("404 Not Found\n");
    res.end();
}
function handleSaveWorkout(req, res, uri, params) {
    let ftp = parseInt((params.ftp));
    let swim_ftp = parseInt((params.swim_ftp));
    let tpace = (params.tpace);
    let css = (params.css);
    let email = (params.email);
    let st = parseInt((params.st));
    let ou = parseInt((params.ou));
    let t = (params.t);
    let w = (params.w);
    let userProfile = new User.UserProfile(ftp, tpace, swim_ftp, css, email);
    let builder = new Model.WorkoutBuilder(userProfile, st, ou).withDefinition(t, w);
    let db = ModelServer.WorkoutDBFactory.createWorkoutDB();
    let workout = new ModelServer.Workout();
    workout.title = t;
    workout.value = builder.getNormalizedWorkoutDefinition();
    workout.tags = "";
    workout.duration_sec = builder.getInterval().getTotalDuration().getSeconds();
    workout.tss = builder.getTSS2();
    workout.sport_type = st;
    db.add(workout, function (err) {
        if (err != null && err.length > 0) {
            res.writeHead(500);
        }
        res.end();
    });
    return true;
}
ModelServer.Logger.init();
http.createServer(function (req, res) {
    try {
        let request_id = Math.round(Math.random() * 1000000000);
        let parsed_url = url.parse(req.url, true);
        let uri = parsed_url.pathname;
        logRequest(req, 'start', {
            request_id: request_id,
            url: uri,
            method: req.method,
            user_agent: req.headers['user-agent'],
            remote_ip: req.connection.remoteAddress
        });
        let base_path = process.cwd();
        let filename = path.normalize(path.join(base_path, uri));
        if (filename.indexOf(base_path) < 0) {
            res.writeHead(403, { "Content-Type": "text/plain" });
            res.write("No donut for you" + "\n");
            res.end();
        }
        else {
            let handler_map = {
                "/send_mail": handleSendEmail,
                "/save_workout": handleSaveWorkout,
                "/workouts": handleGetWorkouts
            };
            fs.exists(filename, function (exists) {
                try {
                    if (exists) {
                        handleExistentFile(req, res, request_id, fs, filename);
                    }
                    else {
                        if (uri in handler_map) {
                            let params = parsed_url.query;
                            if (!handler_map[uri](req, res, uri, params)) {
                                show404(req, res);
                            }
                        }
                        else {
                            show404(req, res);
                        }
                    }
                }
                catch (err1) {
                    res.writeHead(500, { "Content-Type": "text/plain" });
                    res.write("Oops... Server error\n");
                    res.end();
                    ModelServer.Logger.error(err1.message);
                }
                logRequest(req, 'end', {
                    request_id: request_id,
                    status_code: res.statusCode
                });
            });
        }
    }
    catch (err2) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.write("Oops... Server error\n");
        res.end();
        ModelServer.Logger.error(err2.message);
    }
}).listen(Config.Values.port, '0.0.0.0');
console.log('Server running at http://0.0.0.0:' + Config.Values.port);

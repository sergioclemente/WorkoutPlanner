import * as http from 'http'
import * as zlib from 'zlib'
import * as path from 'path'
import * as fs from 'fs'
import * as url from 'url'

import * as Core from './core';
import * as Model from './model';
import * as ModelServer from './model_server';
import * as Config from './config';

function logRequest(req: any, tag: string, data: any) {
    console.log(`[request-${tag}] Request Data: ${JSON.stringify(data)}`);
}

function handleExistentFile(req, res, request_id: number, fs, filename: string) {
    let accept_encoding: string = req.headers['accept-encoding'];
    if (!accept_encoding) {
        accept_encoding = '';
    }
    let stat = fs.statSync(filename);
    if (stat.isDirectory()) {
        filename += '/index.html';
    }
    // Handle 304 (Not modified files).
    // TODO: Need to fix this bug.
    let req_mod_date = req.headers["if-modified-since"];
    let mtime = stat.mtime;
    if (req_mod_date != null) {
        req_mod_date = new Date(req_mod_date);
        console.log(`request_id: ${request_id} path: ${filename} Cache still valid? ${req_mod_date != null && mtime != null && req_mod_date.toUTCString() == mtime.toUTCString()}. Request_date:${req_mod_date.toUTCString()} - File_date:${mtime.toUTCString()}`)
        // if (req_mod_date.toUTCString() == mtime.toUTCString()) {
        //     console.log("Serving " + filename + " from cache. FileTS=" + mtime.toUTCString() + " HeaderTS=" + req_mod_date.toUTCString())
        //     res.writeHead(304, {
        //         "Last-Modified": mtime.toUTCString()
        //     });
        //     res.end();
        //     return;
        // }
    }
    const raw = fs.createReadStream(filename);
    // Note: This is not a conformant accept-encoding parser.
    // See http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.3
    if (/\bdeflate\b/.test(accept_encoding)) {
        res.writeHead(200, {
            'Content-Encoding': 'deflate',
            'Last-Modified': mtime.toUTCString()
        });
        raw.pipe(zlib.createDeflate()).pipe(res);
    } else if (/\bgzip\b/.test(accept_encoding)) {
        res.writeHead(200, {
            'Content-Encoding': 'gzip',
            'Last-Modified': mtime.toUTCString()
        });
        raw.pipe(zlib.createGzip()).pipe(res);
    } else {
        res.writeHead(200, {});
        raw.pipe(res);
    }
}

function handleSendEmail(req, res, uri: string, params) {
    if (params.w && params.ftp && params.tpace && params.st && params.ou && params.email) {
        let userProfile = new Core.UserProfile(params.ftp, params.tpace, params.swim_ftp, params.css, params.email);
        let builder = new Model.WorkoutBuilder(userProfile, parseInt(params.st), parseInt(params.ou)).withDefinition(params.t, params.w);

        // sending email
        let ms = new ModelServer.MailSender(Config.Values.smtp.login, Config.Values.smtp.password);

        let attachments = [];

        // Just send the attachment if its a bike workout
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

        ms.send(userProfile.getEmail(), builder.getMRCFileName(), builder.getPrettyPrint("<br />"), attachments,
            function (status, message) {
                if (status) {
                    res.writeHead(200, {});
                } else {
                    res.writeHead(500, {});
                    console.log("Error while sending email.");
                    console.log(message);
                }
                res.end();
            });
        return true;
    } else {
        return false;
    }
}

function handleGetWorkouts(req, res, uri, params) {
    var db = new ModelServer.WorkoutDB(Config.Values.mysql);
    db.getAll(function (err, workouts) {
        if (err) {
            res.write("Error: " + err);
        } else {
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

function handleSaveWorkout(req, res, uri: string, params) {
    let userProfile = new Core.UserProfile(params.ftp, params.tpace, params.swim_ftp, params.css, params.email);
    let builder = new Model.WorkoutBuilder(userProfile, parseInt(params.st), parseInt(params.ou)).withDefinition(params.t, params.w);
    let db = new ModelServer.WorkoutDB(Config.Values.mysql);
    let w = new ModelServer.Workout();
    w.title = params.t;
    w.value = builder.getNormalizedWorkoutDefinition();
    w.tags = "";
    w.duration_sec = builder.getInterval().getTotalDuration().getSeconds();
    w.tss = builder.getTSS2();
    w.sport_type = params.st;

    db.add(w);
    res.end();

    return true;
}

http.createServer(function (req, res) {
    try {
        // TODO: Propagate this request id.
        let request_id = Math.round(Math.random()*1_000_000_000)
        let parsed_url = url.parse(req.url, true);
        let uri: string = parsed_url.pathname;

        logRequest(req, 'start',
            {
                request_id: request_id,
                url: uri,
                method: req.method,
                user_agent: req.headers['user-agent'],
                remote_ip: req.connection.remoteAddress
            }
        );

        let base_path: string = process.cwd();
        let filename: string = path.normalize(path.join(base_path, uri));

        if (filename.indexOf(base_path) < 0) {
            res.writeHead(403, { "Content-Type": "text/plain" });
            res.write("No donut for you" + "\n");
            res.end();
        } else {
            let handler_map = {
                "/send_mail": handleSendEmail,
                "/save_workout": handleSaveWorkout,
                "/workouts": handleGetWorkouts
            };
    
            fs.exists(filename, function (exists: boolean) {
                try {
                    if (exists) {
                        handleExistentFile(req, res, request_id, fs, filename);
                    } else {
                        if (uri in handler_map) {
                            let params = parsed_url.query;
                            if (!handler_map[uri](req, res, uri, params)) {
                                show404(req, res);
                            }
                        } else {
                            show404(req, res);
                        }
                    }
                } catch (err1) {
                    res.writeHead(500, { "Content-Type": "text/plain" });
                    res.write("Oops... Server error\n");
                    res.end();
                    console.log(err1.message);
                    console.log(err1.stack);
                }
                logRequest(req, 'end', 
                    {
                        request_id: request_id,
                        status_code: res.statusCode
                    }
                );
            });
        }
    } catch (err2) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.write("Oops... Server error\n");
        res.end();
        console.log(err2.message);
        console.log(err2.stack);
    }
}).listen(Config.Values.port, '0.0.0.0');
console.log('Server running at http://0.0.0.0:' + Config.Values.port);

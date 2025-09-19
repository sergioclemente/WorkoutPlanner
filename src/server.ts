import * as http from 'http'
import * as zlib from 'zlib'
import * as path from 'path'
import * as fs from 'fs'
import * as url from 'url'

import * as Core from './core';
import * as ModelServer from './model_server';
import * as Builder from './builder';
import * as User from './user';
import * as Config from './config';
import { ParsedUrlQuery } from 'querystring'

function logRequest(req: http.IncomingMessage, tag: string, data: any) {
    console.log(`[request-${tag}] Request Data: ${JSON.stringify(data)}`);
}

function handleExistentFile(req: http.IncomingMessage, res: http.ServerResponse, request_id: number, fs, filename: string) {
    let accept_encoding = <string>(req.headers['accept-encoding']);
    if (!accept_encoding) {
        accept_encoding = '';
    }
    let stat = fs.statSync(filename);
    if (stat.isDirectory()) {
        filename += '/index.html';
    }
    // Handle 304 (Not modified files).
    // TODO: Need to fix this bug.
    let mtime = stat.mtime;
    if (req.headers["if-modified-since"] != null) {
        let req_mod_date = new Date(req.headers["if-modified-since"]);
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

function handleSendEmail(req: http.IncomingMessage, res: http.ServerResponse, uri: string, params: ParsedUrlQuery) {
    if (params.w && params.ftp && params.tpace && params.st && params.ou && params.email) {
        let ftp = parseInt(<string>(params.ftp))
        let swim_ftp = parseInt(<string>(params.swim_ftp))
        let tpace = <string>(params.tpace)
        let css = <string>(params.css)
        let email = <string>(params.email)
        let st = parseInt(<string>(params.st))
        let ou = parseInt(<string>(params.ou))
        let t = <string>(params.t)
        let w = <string>(params.w)

        let userProfile = new User.UserProfile(ftp, tpace, swim_ftp, css, email);
        let builder = new Builder.WorkoutBuilder(userProfile, st, ou).withDefinition(t, w);

        // Sending email
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

        ms.send(userProfile.email, builder.getMRCFileName(), builder.getPrettyPrint("<br />"), attachments,
            function (status, message) {
                if (status) {
                    res.writeHead(200, {});
                } else {
                    res.writeHead(500, {});
                    ModelServer.Logger.error(message);
                }
                res.end();
            });
        return true;
    } else {
        return false;
    }
}

function handleGetWorkouts(req: http.IncomingMessage, res: http.ServerResponse, uri: string, params: ParsedUrlQuery) {
    var db = ModelServer.WorkoutDBFactory.createWorkoutDB();
    db.getAll(function (err, workouts) {
        if (err) {
            res.writeHead(500);
            res.end();
        } else {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.write(JSON.stringify(workouts));
            res.end();
        }
    });
    return true;
}

function show404(req: http.IncomingMessage, res: http.ServerResponse) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.write("404 Not Found\n");
    res.end();
}

function handleSaveWorkout(req: http.IncomingMessage, res: http.ServerResponse, uri: string, params: ParsedUrlQuery) {
    let ftp = parseInt(<string>(params.ftp))
    let swim_ftp = parseInt(<string>(params.swim_ftp))
    let tpace = <string>(params.tpace)
    let css = <string>(params.css)
    let email = <string>(params.email)
    let st = parseInt(<string>(params.st))
    let ou = parseInt(<string>(params.ou))
    let t = <string>(params.t)
    let w = <string>(params.w)

    let userProfile = new User.UserProfile(ftp, tpace, swim_ftp, css, email);
	let builder = new Builder.WorkoutBuilder(userProfile, st, ou).withDefinition(t, w);
	let db = ModelServer.WorkoutDBFactory.createWorkoutDB();
	let workout = new ModelServer.Workout();
	workout.title = t;
	workout.value = builder.getNormalizedWorkoutDefinition();
	workout.tags = "";
	workout.duration_sec = builder.getInterval().getTotalDuration().getSeconds();
	workout.tss = builder.getTSS();
	workout.sport_type = st;

	if (db == null) {
		res.writeHead(500);
		res.end();
		return true;
	}

	const workoutIdParam = params.wid;
	let workoutId: number = null;
	if (typeof workoutIdParam === 'string') {
		workoutId = parseInt(workoutIdParam);
	} else if (Array.isArray(workoutIdParam) && workoutIdParam.length > 0) {
		workoutId = parseInt(workoutIdParam[0]);
	}
	const isUpdate = workoutId != null && !isNaN(workoutId);

	const finalize = function (err: string) {
		if (err != null && err.length > 0) {
			res.writeHead(500);
		}
		res.end();
	};

	if (isUpdate) {
		workout.id = workoutId;
		db.update(workout, finalize);
	} else {
		db.add(workout, finalize);
	}


	return true;
}

ModelServer.Logger.init();

http.createServer(function (req: http.IncomingMessage, res: http.ServerResponse) {
    try {
        // TODO: Propagate this request id.
        let request_id = Math.round(Math.random()*1_000_000_000)
        let parsed_url = url.parse(req.url, true);
        let uri = parsed_url.pathname;

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
                    ModelServer.Logger.error(err1.message);
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
        ModelServer.Logger.error(err2.message);
    }
}).listen(Config.Values.port, '0.0.0.0');
console.log('Server running at http://0.0.0.0:' + Config.Values.port);

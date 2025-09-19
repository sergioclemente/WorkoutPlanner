"use strict";
const fs = require("fs");
const pg = require("pg");
const Config = require("./config");
const Sentry = require("@sentry/node");
const sqlite3 = require("sqlite3");
var ModelServer;
(function (ModelServer) {
    class ScopedFilename {
        constructor(name, content) {
            this.name = name;
            fs.writeFileSync(this.name, content);
        }
        dispose() {
            fs.unlinkSync(this.name);
        }
    }
    ;
    class Logger {
        static init() {
            if (Config.Values.sentry == null || Config.Values.sentry.length == 0) {
                console.log("Initializing sentry locally");
                const sentryTestkit = require("sentry-testkit");
                const { sentryTransport } = sentryTestkit();
                Sentry.init({
                    dsn: 'https://foo@obar/123',
                    transport: sentryTransport
                });
            }
            else {
                console.log(`Initializing sentry with config ${Config.Values.sentry}`);
                Sentry.init({ dsn: Config.Values.sentry });
            }
        }
        static error(msg) {
            Sentry.captureException(new Error(msg));
        }
    }
    ModelServer.Logger = Logger;
    class MailSender {
        constructor(user, password) {
            this.user = user;
            this.password = password;
        }
        send(to, subject, body, attachments, callback) {
            if (!(this.user.length > 0 && this.password.length > 0)) {
                callback(false, "Credentials are not set");
                return;
            }
            var send = require('gmail-send')({});
            let files = [];
            let scoped_files = [];
            let rand = Math.floor(Math.random() * 1000);
            for (var i = 0; i < attachments.length; i++) {
                let attachment = attachments[i];
                var filename = attachment.name;
                if (fs.existsSync(filename)) {
                    filename = rand + "." + attachment.extension;
                }
                scoped_files[i] = new ScopedFilename(filename, attachment.data);
                files.push(filename);
            }
            var data = {
                user: this.user,
                pass: this.password,
                to: to,
                subject: subject,
                html: body,
                files: files,
            };
            send(data, function (err) {
                for (let i = 0; i < scoped_files.length; i++) {
                    scoped_files[i].dispose();
                }
                if (err) {
                    callback(false, err);
                }
                else {
                    callback(true, "");
                }
            });
        }
    }
    ModelServer.MailSender = MailSender;
    class Workout {
    }
    ModelServer.Workout = Workout;
    class WorkoutDBFactory {
        static createWorkoutDB() {
            const dbType = (Config.Values.dbtype || '').toLowerCase();
            if (dbType === "sqlite" || dbType === "sqlite3") {
                console.log(`Sqlite3 path ${Config.Values.mysql}`);
                return new WorkoutDBSqlite3(Config.Values.mysql);
            }
            else if (dbType === "pgsql" || dbType === "postgres" || dbType === "postgresql") {
                console.log(`Pgsql connstr ${Config.Values.pgsql.connectionString}`);
                return new WorkoutDBPosgresql(Config.Values.pgsql.connectionString);
            }
            else {
                return null;
            }
        }
    }
    ModelServer.WorkoutDBFactory = WorkoutDBFactory;
    class WorkoutDBSqlite3 {
        constructor(connection_string) {
            this.connection_string = null;
            this.connection_string = connection_string;
        }
        add(workout, callback) {
            const db = new sqlite3.Database(this.connection_string, sqlite3.OPEN_READWRITE, (openErr) => {
                if (openErr) {
                    Logger.error(openErr.message);
                    callback("Error while connecting to sqlite database");
                    return;
                }
                const sql = "INSERT INTO workouts (title, value, tags, duration_sec, tss, sport_type) VALUES ($title, $value, $tags, $duration_sec, $tss, $sport_type)";
                const params = {
                    $title: workout.title,
                    $value: workout.value,
                    $tags: workout.tags,
                    $duration_sec: workout.duration_sec,
                    $tss: Math.round(workout.tss),
                    $sport_type: workout.sport_type
                };
                db.run(sql, params, (err) => {
                    if (err) {
                        Logger.error(err.message);
                        callback("Error while adding workout");
                    }
                    else {
                        callback("");
                    }
                    db.close((closeErr) => {
                        if (closeErr) {
                            Logger.error(closeErr.message);
                        }
                    });
                });
            });
        }
        update(workout, callback) {
            if (workout.id == null || isNaN(workout.id)) {
                callback("Invalid workout id");
                return;
            }
            const db = new sqlite3.Database(this.connection_string, sqlite3.OPEN_READWRITE, (openErr) => {
                if (openErr) {
                    Logger.error(openErr.message);
                    callback("Error while connecting to sqlite database");
                    return;
                }
                const sql = "UPDATE workouts SET title = $title, value = $value, tags = $tags, duration_sec = $duration_sec, tss = $tss, sport_type = $sport_type WHERE id = $id";
                const params = {
                    $id: workout.id,
                    $title: workout.title,
                    $value: workout.value,
                    $tags: workout.tags,
                    $duration_sec: workout.duration_sec,
                    $tss: Math.round(workout.tss),
                    $sport_type: workout.sport_type
                };
                db.run(sql, params, (err) => {
                    if (err) {
                        Logger.error(err.message);
                        callback("Error while updating workout");
                    }
                    else {
                        callback("");
                    }
                    db.close((closeErr) => {
                        if (closeErr) {
                            Logger.error(closeErr.message);
                        }
                    });
                });
            });
        }
        getAll(callback) {
            const db = new sqlite3.Database(this.connection_string, sqlite3.OPEN_READONLY, (openErr) => {
                if (openErr) {
                    Logger.error(openErr.message);
                    callback("Error while connecting to sqlite database", null);
                    return;
                }
                const sql = "SELECT id, title, value, tags, duration_sec, tss, sport_type FROM workouts order by id DESC";
                db.all(sql, (err, rows) => {
                    if (err) {
                        Logger.error(err.message);
                        callback("Error while reading row from db", null);
                    }
                    else {
                        const result = [];
                        for (const row of rows ?? []) {
                            const workout = new Workout();
                            workout.id = row.id;
                            workout.title = row.title;
                            workout.value = row.value;
                            workout.tags = row.tags;
                            workout.duration_sec = row.duration_sec;
                            workout.tss = row.tss;
                            workout.sport_type = row.sport_type;
                            result.push(workout);
                        }
                        callback("", result);
                    }
                    db.close((closeErr) => {
                        if (closeErr) {
                            Logger.error(closeErr.message);
                        }
                    });
                });
            });
        }
    }
    ModelServer.WorkoutDBSqlite3 = WorkoutDBSqlite3;
    class WorkoutDBPosgresql {
        constructor(connection_string) {
            this.connection_string = null;
            this.connection_string = connection_string;
        }
        add(workout, callback) {
            let pg_options = {
                connectionString: this.connection_string,
                ssl: {
                    rejectUnauthorized: false
                }
            };
            console.log("Pg options: " + pg_options);
            const client = new pg.Client(pg_options);
            client.connect();
            client.query("INSERT INTO workouts (title, value, tags, duration_sec, tss, sport_type) VALUES ($1, $2, $3, $4, $5, $6)", [workout.title, workout.value, workout.tags, workout.duration_sec, Math.round(workout.tss), workout.sport_type], (err, res) => {
                client.end();
                if (err) {
                    Logger.error(err.message);
                    callback(err.message);
                }
                else {
                    callback("");
                }
            });
        }
        update(workout, callback) {
            if (workout.id == null || isNaN(workout.id)) {
                callback("Invalid workout id");
                return;
            }
            const client = new pg.Client({ connectionString: this.connection_string });
            client.connect();
            client.query("UPDATE workouts SET title = $1, value = $2, tags = $3, duration_sec = $4, tss = $5, sport_type = $6 WHERE id = $7", [workout.title, workout.value, workout.tags, workout.duration_sec, Math.round(workout.tss), workout.sport_type, workout.id], (err, res) => {
                client.end();
                if (err) {
                    Logger.error(err.message);
                    callback(err.message);
                }
                else {
                    callback("");
                }
            });
        }
        getAll(callback) {
            const client = new pg.Client({ connectionString: this.connection_string });
            client.connect();
            const query = {
                name: 'get-name',
                text: 'SELECT id, title, value, tags, duration_sec, tss, sport_type FROM workouts order by id DESC;',
                rowMode: 'array',
            };
            let workouts = [];
            client
                .query(query)
                .then(res => {
                for (let i = 0; i < res.rowCount; i++) {
                    let row = res.rows[i];
                    let workout = new Workout();
                    workout.id = parseInt(row[0]);
                    workout.title = row[1];
                    workout.value = row[2];
                    workout.tags = row[3];
                    workout.duration_sec = parseInt(row[4]);
                    workout.tss = parseInt(row[5]);
                    workout.sport_type = parseInt(row[6]);
                    workouts.push(workout);
                }
                callback("", workouts);
                client.end();
            })
                .catch(e => {
                Logger.error(e.message);
                callback(e.message, workouts);
                client.end();
            });
        }
    }
    ModelServer.WorkoutDBPosgresql = WorkoutDBPosgresql;
})(ModelServer || (ModelServer = {}));
module.exports = ModelServer;

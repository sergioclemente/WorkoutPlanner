"use strict";
const sqlite3 = require("sqlite3");
const fs = require("fs");
const pg = require("pg");
const Config = require("./config");
const Sentry = require("@sentry/node");
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
            if (Config.Values.dbtype == "sqlite3") {
                console.log(`Sqlite3 path ${Config.Values.mysql}`);
                return new WorkoutDBSqlite3(Config.Values.mysql);
            }
            else if (Config.Values.dbtype == "pgsql") {
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
            var db = new sqlite3.Database(this.connection_string, sqlite3.OPEN_READWRITE);
            try {
                var stmt = db.prepare("INSERT INTO workouts (title, value, tags, duration_sec, tss, sport_type) VALUES (?, ?, ?, ?, ?, ?)");
                stmt.run(workout.title, workout.value, workout.tags, workout.duration_sec, workout.tss, workout.sport_type);
                stmt.finalize();
                callback("");
            }
            catch (error) {
                Logger.error(JSON.stringify(error));
                callback("Error while adding workout");
            }
            finally {
                db.close();
            }
        }
        getAll(callback) {
            var db = new sqlite3.Database(this.connection_string, sqlite3.OPEN_READONLY);
            var sql = "SELECT id, title, value, tags, duration_sec, tss, sport_type FROM workouts order by id DESC";
            db.all(sql, function (err, rows) {
                if (err) {
                    Logger.error(err);
                    callback("Error while reading row from db", null);
                }
                else {
                    let result = [];
                    for (let i = 0; i < rows.length; i++) {
                        var workout = new Workout();
                        workout.id = rows[i].id;
                        workout.title = rows[i].title;
                        workout.value = rows[i].value;
                        workout.tags = rows[i].tags;
                        workout.duration_sec = rows[i].duration_sec;
                        workout.tss = rows[i].tss;
                        workout.sport_type = rows[i].sport_type;
                        result.push(workout);
                    }
                    callback("", result);
                }
                db.close();
            }.bind(this));
        }
    }
    ModelServer.WorkoutDBSqlite3 = WorkoutDBSqlite3;
    class WorkoutDBPosgresql {
        constructor(connection_string) {
            this.connection_string = null;
            this.connection_string = connection_string;
        }
        add(workout, callback) {
            const client = new pg.Client({ connectionString: this.connection_string });
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
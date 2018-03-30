"use strict";
var sqlite3 = require('sqlite3').verbose();
var fs = require('fs');
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
    class WorkoutDB {
        constructor(connection_string) {
            this.connection_string = null;
            this.connection_string = connection_string;
        }
        add(workout) {
            var db = new sqlite3.Database(this.connection_string, sqlite3.OPEN_READWRITE);
            try {
                var stmt = db.prepare("INSERT INTO workouts (title, value, tags, duration_sec, tss, sport_type) VALUES (?, ?, ?, ?, ?, ?)");
                stmt.run(workout.title, workout.value, workout.tags, workout.duration_sec, workout.tss, workout.sport_type);
                stmt.finalize();
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
                    console.log(err);
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
    ModelServer.WorkoutDB = WorkoutDB;
})(ModelServer || (ModelServer = {}));
module.exports = ModelServer;

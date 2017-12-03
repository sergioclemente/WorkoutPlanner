"use strict";
var mysql = require('mysql');
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
            var send = require('gmail-send')({});
            let files = [];
            let scoped_files = [];
            let rand = Math.floor(Math.random() * 1000);
            for (var i = 0; i < attachments.length; i++) {
                let attachment = attachments[i];
                var filename = rand + "." + attachment.extension;
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
    function stringFormat(format, ...args) {
        return format.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match;
        });
    }
    class WorkoutDB {
        constructor(connection_string) {
            this.connection_string = null;
            this.connection_string = connection_string;
        }
        add(workout) {
            var sql = "INSERT INTO workouts (title, value, tags, duration_sec, tss, sport_type) VALUES ({0}, {1}, {2}, {3}, {4}, {5})";
            var connection = mysql.createConnection(this.connection_string);
            try {
                sql = stringFormat(sql, connection.escape(workout.title), connection.escape(workout.value), connection.escape(workout.tags), connection.escape(workout.duration_sec), connection.escape(workout.tss), connection.escape(workout.sport_type));
                connection.query(sql);
            }
            finally {
                connection.end({ timeout: 60000 });
            }
        }
        _createWorkout(row) {
            var workout = new Workout();
            workout.id = row.id;
            workout.title = row.title;
            workout.value = row.value;
            workout.tags = row.tags;
            workout.duration_sec = row.duration_sec;
            workout.tss = row.tss;
            workout.sport_type = row.sport_type;
            return workout;
        }
        get(id, callback) {
            var sql = "SELECT id, title, value, tags, duration_sec, tss, sport_type FROM workouts where id={0}";
            var connection = mysql.createConnection(this.connection_string);
            try {
                sql = stringFormat(connection.escape(id));
                connection.query(sql, function (err, rows) {
                    if (!err) {
                        if (rows.length == 0) {
                            callback("", null);
                        }
                        else {
                            callback("", this._createWorkout(rows[0]));
                        }
                    }
                    else {
                        console.log(err);
                        callback("Error while reading from db", null);
                    }
                }.bind(this));
            }
            finally {
                connection.end({ timeout: 60000 });
            }
        }
        getAll(callback) {
            var sql = "SELECT id, title, value, tags, duration_sec, tss, sport_type FROM workouts order by id DESC";
            var connection = mysql.createConnection(this.connection_string);
            try {
                connection.query(sql, function (err, rows) {
                    var workouts = [];
                    if (!err) {
                        if (rows.length == 0) {
                            callback("", workouts);
                        }
                        else {
                            for (var i = 0; i < rows.length; i++) {
                                workouts.push(this._createWorkout(rows[i]));
                            }
                            callback("", workouts);
                        }
                    }
                    else {
                        console.log(err);
                        callback("Error while reading from db", null);
                    }
                }.bind(this));
            }
            finally {
                connection.end({ timeout: 60000 });
            }
        }
    }
    ModelServer.WorkoutDB = WorkoutDB;
})(ModelServer || (ModelServer = {}));
module.exports = ModelServer;

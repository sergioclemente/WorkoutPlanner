"use strict";
var mysql = require('mysql');
var ModelServer;
(function (ModelServer) {
    class MailSender {
        constructor(host, port, use_ssl, user, password) {
            this.host = host;
            this.port = port;
            this.use_ssl = use_ssl;
            this.user = user;
            this.password = password;
        }
        send(to, subject, body, attachments, callback) {
            var smtpConfig = {
                host: this.host,
                port: this.port,
                secure: this.use_ssl,
                auth: {
                    user: this.user,
                    pass: this.password
                }
            };
            var mailAttachments = [];
            for (var i = 0; i < attachments.length; i++) {
                var attachment = attachments[i];
                mailAttachments[i] = { 'filename': attachment.name, 'content': attachment.data };
            }
            var mailOptions = {
                from: this.user,
                to: to,
                subject: subject,
                text: body,
                html: body,
                attachments: mailAttachments
            };
            var nodemailer = require('nodemailer');
            var transporter = nodemailer.createTransport(smtpConfig);
            transporter.sendMail(mailOptions, function (error, info) {
                console.log(JSON.stringify(error));
                console.log(JSON.stringify(info));
                if (error) {
                    callback(false, error);
                }
                else {
                    callback(true, "");
                }
            });
        }
    }
    ModelServer.MailSender = MailSender;
    class Workout {
        static load(id) {
            var ret = new Workout();
            return ret;
        }
    }
    ModelServer.Workout = Workout;
    function stringFormat(format, ...args) {
        return format.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match;
        });
    }
    class UrlShortening {
        constructor(connection_string) {
            this.connection_string = null;
            this.connection_string = connection_string;
        }
        _get_connection() {
            return mysql.createConnection(this.connection_string);
        }
        _insert(connection, callback, err, row) {
            try {
                if (!err) {
                    callback("", row.insertId, "");
                }
                else {
                    console.log(err);
                    callback("Error while querying the db", 0, "");
                }
            }
            finally {
                connection.end({ timeout: 60000 });
            }
        }
        _query(connection, callback, err, rows, fields) {
            try {
                if (!err) {
                    if (rows.length == 0) {
                        callback("", 0, null);
                    }
                    else {
                        callback("", rows[0].id, rows[0].params);
                    }
                }
                else {
                    console.log(err);
                    callback("Error while reading from db", 0, null);
                }
            }
            finally {
                connection.end({ timeout: 60000 });
            }
        }
        add(params, callback) {
            var sql = "INSERT INTO url (params) VALUES ({0})";
            var connection = this._get_connection();
            sql = stringFormat(sql, connection.escape(params));
            connection.query(sql, this._insert.bind(this, connection, callback));
        }
        get(id, callback) {
            var sql = "SELECT * FROM url WHERE id={0}";
            var connection = this._get_connection();
            sql = stringFormat(sql, connection.escape(id));
            connection.query(sql, this._query.bind(this, connection, callback));
        }
    }
    ModelServer.UrlShortening = UrlShortening;
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
                connection.query(sql, function (err, rows, fields) {
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
            var sql = "SELECT id, title, value, tags, duration_sec, tss, sport_type FROM workouts order by id";
            var connection = mysql.createConnection(this.connection_string);
            try {
                connection.query(sql, function (err, rows, fields) {
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

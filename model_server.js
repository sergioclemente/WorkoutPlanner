var mysql = require('mysql');
var ModelServer;
(function (ModelServer) {
    var MailSender = (function () {
        function MailSender(host, port, use_ssl, user, password) {
            this.host = host;
            this.port = port;
            this.use_ssl = use_ssl;
            this.user = user;
            this.password = password;
        }
        MailSender.prototype.send = function (to, subject, body, attachments, callback) {
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
        };
        return MailSender;
    })();
    ModelServer.MailSender = MailSender;
    var Workout = (function () {
        function Workout() {
        }
        Workout.load = function (id) {
            var ret = new Workout();
            return ret;
        };
        return Workout;
    })();
    ModelServer.Workout = Workout;
    function stringFormat(format) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return format.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match;
        });
    }
    var WorkoutDB = (function () {
        function WorkoutDB(connection_string) {
            this.connection = null;
            this.connection = mysql.createConnection(connection_string);
        }
        WorkoutDB.prototype.add = function (workout) {
            var sql = "INSERT INTO workouts (title, value, tags, duration_sec, tss, sport_type) VALUES ({0}, {1}, {2}, {3}, {4}, {5})";
            sql = stringFormat(sql, this.connection.escape(workout.title), this.connection.escape(workout.value), this.connection.escape(workout.tags), this.connection.escape(workout.duration_sec), this.connection.escape(workout.tss), this.connection.escape(workout.sport_type));
            console.log(stringFormat("executing {0}", sql));
            this.connection.query(sql);
        };
        WorkoutDB.prototype._createWorkout = function (row) {
            var workout = new Workout();
            workout.id = row.id;
            workout.title = row.title;
            workout.value = row.value;
            workout.tags = row.tags;
            workout.duration_sec = row.duration_sec;
            workout.tss = row.tss;
            workout.sport_type = row.sport_type;
            return workout;
        };
        WorkoutDB.prototype.get = function (id, callback) {
            var sql = "SELECT id, title, value, tags, duration_sec, tss, sport_type FROM workouts where id={0}";
            sql = stringFormat(this.connection.escape(id));
            this.connection.query(sql, function (err, rows, fields) {
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
        };
        WorkoutDB.prototype.getAll = function (callback) {
            var sql = "SELECT id, title, value, tags, duration_sec, tss, sport_type FROM workouts order by id";
            this.connection.query(sql, function (err, rows, fields) {
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
        };
        WorkoutDB.prototype.connect = function () {
            this.connection.connect();
            console.log("connected to the db");
        };
        WorkoutDB.prototype.close = function () {
            this.connection.end({ timeout: 60000 });
            console.log("disconnected from the db");
        };
        return WorkoutDB;
    })();
    ModelServer.WorkoutDB = WorkoutDB;
})(ModelServer || (ModelServer = {}));
module.exports = ModelServer;

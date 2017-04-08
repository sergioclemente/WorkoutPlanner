/// <reference path="type_definitions/nodemailer.d.ts" />
/// <reference path="type_definitions/mysql.d.ts" />

var mysql = require('mysql');

module ModelServer {

	export class MailSender {
		host: string;
		port: number;
		use_ssl: boolean;
		user: string;
		password: string;

		constructor(host: string,
			port: number,
			use_ssl: boolean,
			user: string,
			password: string) {
			this.host = host;
			this.port = port;
			this.use_ssl = use_ssl;
			this.user = user;
			this.password = password;
		}

		send(to: string, subject: string, body: string, attachments: any, callback: any): void {
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
				from: this.user, // sender address
				to: to, // list of receivers
				subject: subject, // Subject line
				text: body, // plaintext body
				html: body, // html body
				attachments: mailAttachments
			};

			// send mail with defined transport object
			var nodemailer = require('nodemailer');
			var transporter = nodemailer.createTransport(smtpConfig);
			transporter.sendMail(mailOptions, function (error, info) {
				console.log(JSON.stringify(error));
				console.log(JSON.stringify(info));
				if (error) {
					callback(false, error);
				} else {
					callback(true, "");
				}
			});
		}
	}

	export class Workout {
		public id: number;
		public title: string;
		public value: string;
		public tags: string;
		public duration_sec: number;
		public tss: number;
		public sport_type: number;

		static load(id: number): Workout {
			var ret = new Workout();
			return ret;
		}
	}

	function stringFormat(format: string, ...args: any[]) {
		return format.replace(/{(\d+)}/g, function (match, number) {
			return typeof args[number] != 'undefined'
				? args[number]
				: match
				;
		});
	}

	export class WorkoutDB {
		private connection_string = null;

		constructor(connection_string: string) {
			this.connection_string = connection_string;
		}

		add(workout: Workout): void {
			var sql = "INSERT INTO workouts (title, value, tags, duration_sec, tss, sport_type) VALUES ({0}, {1}, {2}, {3}, {4}, {5})"

			var connection = mysql.createConnection(this.connection_string);

			try {
				sql = stringFormat(sql,
					connection.escape(workout.title),
					connection.escape(workout.value),
					connection.escape(workout.tags),
					connection.escape(workout.duration_sec),
					connection.escape(workout.tss),
					connection.escape(workout.sport_type));

				connection.query(sql);
			} finally {
				connection.end({ timeout: 60000 });
			}
		}

		private _createWorkout(row: any): Workout {
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

		get(id: number, callback: (err: string, w: Workout) => void): void {
			var sql = "SELECT id, title, value, tags, duration_sec, tss, sport_type FROM workouts where id={0}";

			var connection = mysql.createConnection(this.connection_string);

			try {
				sql = stringFormat(
					connection.escape(id)
				);
				connection.query(sql, function (err, rows, fields) {
					if (!err) {
						if (rows.length == 0) {
							callback("", null);
						} else {
							callback("", this._createWorkout(rows[0]));
						}
					} else {
						console.log(err);
						callback("Error while reading from db", null);
					}
				}.bind(this));
			} finally {
				connection.end({ timeout: 60000 });
			}
		}

		getAll(callback: (err: string, w: Workout[]) => void): void {
			var sql = "SELECT id, title, value, tags, duration_sec, tss, sport_type FROM workouts order by id";

			var connection = mysql.createConnection(this.connection_string);

			try {
				connection.query(sql, function (err, rows, fields) {
					var workouts = [];
					if (!err) {
						if (rows.length == 0) {
							callback("", workouts);
						} else {
							for (var i = 0; i < rows.length; i++) {
								workouts.push(this._createWorkout(rows[i]));
							}
							callback("", workouts);
						}
					} else {
						console.log(err);
						callback("Error while reading from db", null);
					}
				}.bind(this));
			} finally {
				connection.end({ timeout: 60000 });
			}
		}
	}

}

export = ModelServer;
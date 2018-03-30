/// <reference path="./node_modules/@types/sqlite3/index.d.ts"/>

var sqlite3 = require('sqlite3').verbose();
var fs = require('fs');

module ModelServer {
	class ScopedFilename {
		name: string;

		constructor(name: string, content: string) {
			this.name = name;
			fs.writeFileSync(this.name, content);
		}

		dispose(): void {
			fs.unlinkSync(this.name);
		}
	};

	export class MailSender {
		user: string;
		password: string;

		constructor(user: string,
			password: string) {
			this.user = user;
			this.password = password;
		}

		send(to: string, subject: string, body: string, attachments: any, callback: any): void {
			if (!(this.user.length > 0 && this.password.length > 0)) {
				callback(false, "Credentials are not set");
				return;
			}
			var send = require('gmail-send')({});

			// The gmail-send api is a bit silly in the sense that it requires an
			// actual file to be present. Because of this, we will create a temporary
			// file and destroy once the send email callback is called.
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

			// Overriding default parameters.
			var data = {
				user: this.user,
				pass: this.password,
				to: to,
				subject: subject,
				html: body,
				files: files,
			};
			// Call the actual API that will send the data.
			send(data, function (err) {
				for (let i = 0; i < scoped_files.length; i++) {
					scoped_files[i].dispose();
				}
				if (err) {
					callback(false, err);
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
	}

	export class WorkoutDB {
		private connection_string = null;

		constructor(connection_string: string) {
			this.connection_string = connection_string;
		}

		add(workout: Workout): void {
			var db = new sqlite3.Database(this.connection_string, sqlite3.OPEN_READWRITE);
			try {
				// Use prepared statements since it takes care of escaping the parameters.
				var stmt = db.prepare("INSERT INTO workouts (title, value, tags, duration_sec, tss, sport_type) VALUES (?, ?, ?, ?, ?, ?)");
				stmt.run(workout.title, workout.value, workout.tags, workout.duration_sec, workout.tss, workout.sport_type);
				stmt.finalize();
			} finally {
				db.close();
			}
		}

		getAll(callback: (err: string, w: Workout[]) => void): void {
			var db = new sqlite3.Database(this.connection_string, sqlite3.OPEN_READONLY);
			var sql = "SELECT id, title, value, tags, duration_sec, tss, sport_type FROM workouts order by id DESC";

			db.all(sql, function (err, rows) {
				if (err) {
					console.log(err);
					callback("Error while reading row from db", null);
				} else {
					let result = [];
					for (let i = 0 ; i < rows.length; i++) {
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

}

export = ModelServer;
/// <reference path="type_definitions/nodemailer.d.ts" />

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

	send(to: string, subject: string, body: string, attachments: any) : void {
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
		transporter.sendMail(mailOptions, function(error, info) {
			if (error) {
				return console.log(error);
			}
			console.log('Message sent: ' + info.response);
		});
	}
}

}

export = ModelServer;
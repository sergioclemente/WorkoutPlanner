var config = {};

config.port = (process.env.PORT || 7000);
config.smtp = {};
config.smtp.server_host = process.env.MAILGUN_SMTP_SERVER;
config.smtp.server_port = process.env.MAILGUN_SMTP_PORT;
config.smtp.use_ssl = false;
config.smtp.login = process.env.MAILGUN_SMTP_LOGIN;
config.smtp.password = process.env.MAILGUN_SMTP_PASSWORD;
config.mysql = (process.env.CLEARDB_DATABASE_URL || "mysql://@localhost/test");

module.exports = config;


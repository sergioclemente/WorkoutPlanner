var config = {};

config.port = (process.env.PORT || 7000);
config.smtp = {};
config.smtp.login = process.env.GMAIL_EMAIL;
config.smtp.password = process.env.GMAIL_PASSWORD;
config.mysql = (process.env.CLEARDB_DATABASE_URL || "mysql://@localhost/test");

module.exports = config;


var config = {};

config.port = (process.env.PORT || 5000);
config.smtp = {};
config.smtp.server_host = 'smtp.gmail.com';
config.smtp.server_port = 465;
config.smtp.use_ssl = true;
config.smtp.login = process.env.EMAIL_ACCOUNT;
config.smtp.password = process.env.EMAIL_PASSWORD;
config.mysql = (process.env.CLEARDB_DATABASE_URL || "mysql://@localhost/test");

module.exports = config;


"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Values = void 0;
class Values {
}
exports.Values = Values;
Values.port = (parseInt(process.env.PORT) || 8000);
Values.smtp = {
    login: process.env.GMAIL_EMAIL || "",
    password: process.env.GMAIL_PASSWORD || ""
};
Values.mysql = (process.env.SQLITE_PATH || "app.db");
Values.dbtype = (process.env.DB_TYPE || "sqlite");
Values.pgsql = {
    connectionString: (process.env.DATABASE_URL || 'postgresql:///sergioclementefilho')
};
Values.sentry = (process.env.SENTRY_DSN || "");

export class Values {
  static port = (parseInt(process.env.PORT) || 8000);
  static smtp = {
    login: process.env.GMAIL_EMAIL || "",
    password: process.env.GMAIL_PASSWORD || ""
  };
  static mysql = (process.env.SQLITE_PATH || "app.db");
  static dbtype = (process.env.DB_TYPE || "sqlite");
  static pgsql = {
    connectionString: (process.env.DATABASE_URL || 'postgresql:///sergioclementefilho')
  };
  static sentry = (process.env.SENTRY_DSN || "");
}


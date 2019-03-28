module.exports = {
  port: (process.env.PORT || 7000),
  smtp: {
    login: process.env.GMAIL_EMAIL || "",
    password: process.env.GMAIL_PASSWORD || ""
  },
  mysql: (process.env.SQLITE_PATH || "app.db")
};


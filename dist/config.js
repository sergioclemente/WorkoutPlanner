"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Values = void 0;
let Values = (() => {
    class Values {
    }
    Values.port = (parseInt(process.env.PORT) || 7000);
    Values.smtp = {
        login: process.env.GMAIL_EMAIL || "",
        password: process.env.GMAIL_PASSWORD || ""
    };
    Values.mysql = (process.env.SQLITE_PATH || "app.db");
    return Values;
})();
exports.Values = Values;

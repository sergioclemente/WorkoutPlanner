/// <reference path="./node_modules/@types/node/index.d.ts"/>
"use strict";
var UI;
(function (UI) {
    class PersistedItem {
        constructor(id) {
            this.id = id;
        }
        save(value) {
            if (window.localStorage) {
                window.localStorage.setItem(this.id, value);
            }
        }
        load() {
            if (window.localStorage) {
                var result = window.localStorage.getItem(this.id);
                return result ? result.trim() : "";
            }
            else {
                return null;
            }
        }
    }
    UI.PersistedItem = PersistedItem;
    class QueryParams {
        constructor() {
            if (!this.validate()) {
                if (!this.loadFromURL()) {
                    this.loadFromStorage();
                }
            }
            // HACK HACK: enable this just for me
            this.experimental = this.experimental || this.email == 'sergioclemente@gmail.com';
            this.efficiency_factor = "1";
        }
        static createCopy(params) {
            var ret = new QueryParams();
            ret.workout_title = params.workout_title;
            ret.workout_text = params.workout_text;
            ret.ftp_watts = params.ftp_watts;
            ret.t_pace = params.t_pace;
            ret.swim_css = params.swim_css;
            ret.efficiency_factor = params.efficiency_factor;
            ret.sport_type = params.sport_type;
            ret.output_unit = params.output_unit;
            ret.email = params.email;
            ret.experimental = params.experimental;
            return ret;
        }
        loadFromURL() {
            var params = getQueryParams();
            this.workout_title = params.t;
            this.workout_text = params.w;
            this.ftp_watts = params.ftp;
            this.t_pace = params.tpace;
            this.swim_css = params.css;
            this.efficiency_factor = params.ef;
            this.sport_type = params.st;
            this.output_unit = params.ou;
            this.email = params.email;
            this.experimental = typeof (params.e) != 'undefined' && params.e == "1";
            return this.validate();
        }
        loadFromStorage() {
            if (this.workout_title == null || this.workout_title == "") {
                this.workout_title = new PersistedItem("title").load();
            }
            if (this.workout_text == null || this.workout_text == "") {
                this.workout_text = new PersistedItem("workout").load();
            }
            if (this.ftp_watts == null || this.ftp_watts == "") {
                this.ftp_watts = new PersistedItem("ftp_watts").load();
            }
            if (this.t_pace == null || this.t_pace == "") {
                this.t_pace = new PersistedItem("t_pace").load();
            }
            if (this.swim_css == null || this.swim_css == "") {
                this.swim_css = new PersistedItem("swim_css").load();
            }
            if (this.efficiency_factor == null && this.efficiency_factor == "") {
                this.efficiency_factor = new PersistedItem("ef").load() || "1";
            }
            if (this.sport_type == null || this.sport_type == "") {
                this.sport_type = new PersistedItem("sport_type").load();
            }
            if (this.output_unit == null || this.output_unit == "") {
                this.output_unit = new PersistedItem("output_unit").load();
            }
            if (this.email == null || this.email == "") {
                this.email = new PersistedItem("email").load();
            }
            // do not load experimental
            return this.validate();
        }
        saveToStorage() {
            new PersistedItem("title").save(this.workout_title);
            new PersistedItem("workout").save(this.workout_text);
            new PersistedItem("ftp_watts").save(this.ftp_watts);
            new PersistedItem("t_pace").save(this.t_pace);
            new PersistedItem("swim_css").save(this.swim_css);
            new PersistedItem("ef").save(this.efficiency_factor);
            new PersistedItem("sport_type").save(this.sport_type);
            new PersistedItem("output_unit").save(this.output_unit);
            new PersistedItem("email").save(this.email);
            // do not save experimental
        }
        validate() {
            return typeof (this.workout_title) != 'undefined' && this.workout_title != "" &&
                typeof (this.workout_text) != 'undefined' && this.workout_text != "" &&
                typeof (this.ftp_watts) != 'undefined' && this.ftp_watts != "" &&
                typeof (this.t_pace) != 'undefined' && this.t_pace != "" &&
                typeof (this.swim_css) != 'undefined' && this.swim_css != "" &&
                typeof (this.efficiency_factor) != 'undefined' && this.efficiency_factor != "" &&
                typeof (this.sport_type) != 'undefined' && this.sport_type != "" &&
                typeof (this.output_unit) != 'undefined' && this.output_unit != "" &&
                typeof (this.email) != 'undefined' && this.email != "";
        }
        getURL() {
            return "?t=" + encodeURIComponent(this.workout_title) +
                "&w=" + encodeURIComponent(this.workout_text) +
                "&st=" + encodeURIComponent(this.sport_type) +
                "&ftp=" + encodeURIComponent(this.ftp_watts) +
                "&tpace=" + encodeURIComponent(this.t_pace) +
                "&css=" + encodeURIComponent(this.swim_css) +
                "&ef=" + encodeURIComponent(this.efficiency_factor) +
                "&ou=" + encodeURIComponent(this.output_unit) +
                "&email=" + encodeURIComponent(this.email) +
                "&e=" + encodeURIComponent(this.experimental ? "1" : "0");
        }
    }
    UI.QueryParams = QueryParams;
    function getQueryParams() {
        var qs = document.location.search;
        qs = qs.split("+").join(" ");
        var params = {}, tokens, re = /[?&]?([^=]+)=([^&]*)/g;
        while (tokens = re.exec(qs)) {
            params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
        }
        return params;
    }
    class FieldValidator {
        static validateEmail(email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        }
        static validateNumber(num) {
            if (num == null || num.trim().length == 0) {
                return false;
            }
            else {
                var num_val = parseFloat(num);
                return !isNaN(num_val);
            }
        }
    }
    UI.FieldValidator = FieldValidator;
    class ClipboardHelper {
        static copyText(text) {
            var textArea = document.createElement("textarea");
            // Place in top-left corner of screen regardless of scroll position.
            textArea.style.position = 'fixed';
            textArea.style.top = "0";
            textArea.style.left = "0";
            textArea.style.width = '2em';
            textArea.style.height = '2em';
            textArea.style.padding = "0";
            textArea.style.border = 'none';
            textArea.style.outline = 'none';
            textArea.style.boxShadow = 'none';
            textArea.style.background = 'transparent';
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                var successful = document.execCommand('copy');
                var msg = successful ? 'successful' : 'unsuccessful';
                console.log('Copying text command was ' + msg);
            }
            catch (err) {
                console.log('Oops, unable to copy');
            }
            document.body.removeChild(textArea);
        }
    }
    UI.ClipboardHelper = ClipboardHelper;
})(UI || (UI = {}));
module.exports = UI;

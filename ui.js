/// <reference path="type_definitions/node.d.ts" />
var UI;
(function (UI) {
    var PersistedItem = (function () {
        function PersistedItem(id) {
            this.id = id;
        }
        PersistedItem.prototype.save = function (value) {
            if (window.localStorage) {
                window.localStorage.setItem(this.id, value);
            }
        };
        PersistedItem.prototype.load = function () {
            if (window.localStorage) {
                var result = window.localStorage.getItem(this.id);
                return result ? result.trim() : "";
            }
            else {
                return null;
            }
        };
        return PersistedItem;
    })();
    UI.PersistedItem = PersistedItem;
    var QueryParams = (function () {
        function QueryParams(workout_text, ftp_watts, t_pace, workout_type, output_unit, email) {
            if (workout_text === void 0) { workout_text = ""; }
            if (ftp_watts === void 0) { ftp_watts = ""; }
            if (t_pace === void 0) { t_pace = ""; }
            if (workout_type === void 0) { workout_type = ""; }
            if (output_unit === void 0) { output_unit = ""; }
            if (email === void 0) { email = ""; }
            this.workout_text = workout_text;
            this.ftp_watts = ftp_watts;
            this.t_pace = t_pace;
            this.workout_type = workout_type;
            this.output_unit = output_unit;
            this.email = email;
            if (!this.validate()) {
                if (!this.loadFromURL()) {
                    this.loadFromStorage();
                }
            }
        }
        QueryParams.prototype.loadFromURL = function () {
            var params = getQueryParams();
            this.workout_text = params.w;
            this.ftp_watts = params.ftp;
            this.t_pace = params.tpace;
            this.workout_type = params.st;
            this.output_unit = params.ou;
            this.email = params.email;
            return this.validate();
        };
        QueryParams.prototype.loadFromStorage = function () {
            this.workout_text = new PersistedItem("workout").load();
            this.ftp_watts = new PersistedItem("ftp_watts").load();
            this.t_pace = new PersistedItem("t_pace").load();
            this.workout_type = new PersistedItem("workout_type").load();
            this.output_unit = new PersistedItem("output_unit").load();
            this.email = new PersistedItem("email").load();
            return this.validate();
        };
        QueryParams.prototype.saveToStorage = function () {
            new PersistedItem("workout").save(this.workout_text);
            new PersistedItem("ftp_watts").save(this.ftp_watts);
            new PersistedItem("t_pace").save(this.t_pace);
            new PersistedItem("workout_type").save(this.workout_type);
            new PersistedItem("output_unit").save(this.output_unit);
            new PersistedItem("email").save(this.email);
        };
        QueryParams.prototype.validate = function () {
            return typeof (this.workout_text) != 'undefined' && this.workout_text != "" &&
                typeof (this.ftp_watts) != 'undefined' && this.ftp_watts != "" &&
                typeof (this.t_pace) != 'undefined' && this.t_pace != "" &&
                typeof (this.workout_type) != 'undefined' && this.workout_type != "" &&
                typeof (this.output_unit) != 'undefined' && this.output_unit != "" &&
                typeof (this.email) != 'undefined' && this.email != "";
        };
        QueryParams.prototype.getURL = function () {
            return "?w=" + encodeURIComponent(this.workout_text) +
                "&st=" + encodeURIComponent(this.workout_type) +
                "&ftp=" + encodeURIComponent(this.ftp_watts) +
                "&tpace=" + encodeURIComponent(this.t_pace) +
                "&ou=" + encodeURIComponent(this.output_unit) +
                "&email=" + encodeURIComponent(this.email);
        };
        return QueryParams;
    })();
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
})(UI || (UI = {}));
module.exports = UI;

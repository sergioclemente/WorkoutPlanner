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
        function QueryParams() {
            if (!this.validate()) {
                if (!this.loadFromURL()) {
                    this.loadFromStorage();
                }
            }
        }
        QueryParams.createCopy = function (params) {
            var ret = new QueryParams();
            ret.workout_title = params.workout_title;
            ret.workout_text = params.workout_text;
            ret.ftp_watts = params.ftp_watts;
            ret.t_pace = params.t_pace;
            ret.swim_css = params.swim_css;
            ret.sport_type = params.sport_type;
            ret.output_unit = params.output_unit;
            ret.email = params.email;
            return ret;
        };
        QueryParams.prototype.loadFromURL = function () {
            var params = getQueryParams();
            this.workout_title = params.t;
            this.workout_text = params.w;
            this.ftp_watts = params.ftp;
            this.t_pace = params.tpace;
            this.swim_css = params.css;
            this.sport_type = params.st;
            this.output_unit = params.ou;
            this.email = params.email;
            return this.validate();
        };
        QueryParams.prototype.loadFromStorage = function () {
            this.workout_title = new PersistedItem("title").load();
            this.workout_text = new PersistedItem("workout").load();
            this.ftp_watts = new PersistedItem("ftp_watts").load();
            this.t_pace = new PersistedItem("t_pace").load();
            this.swim_css = new PersistedItem("swim_css").load();
            this.sport_type = new PersistedItem("sport_type").load();
            this.output_unit = new PersistedItem("output_unit").load();
            this.email = new PersistedItem("email").load();
            return this.validate();
        };
        QueryParams.prototype.saveToStorage = function () {
            new PersistedItem("title").save(this.workout_title);
            new PersistedItem("workout").save(this.workout_text);
            new PersistedItem("ftp_watts").save(this.ftp_watts);
            new PersistedItem("t_pace").save(this.t_pace);
            new PersistedItem("swim_css").save(this.swim_css);
            new PersistedItem("sport_type").save(this.sport_type);
            new PersistedItem("output_unit").save(this.output_unit);
            new PersistedItem("email").save(this.email);
        };
        QueryParams.prototype.validate = function () {
            return typeof (this.workout_title) != 'undefined' && this.workout_title != "" &&
                typeof (this.workout_text) != 'undefined' && this.workout_text != "" &&
                typeof (this.ftp_watts) != 'undefined' && this.ftp_watts != "" &&
                typeof (this.t_pace) != 'undefined' && this.t_pace != "" &&
                typeof (this.swim_css) != 'undefined' && this.swim_css != "" &&
                typeof (this.sport_type) != 'undefined' && this.sport_type != "" &&
                typeof (this.output_unit) != 'undefined' && this.output_unit != "" &&
                typeof (this.email) != 'undefined' && this.email != "";
        };
        QueryParams.prototype.getURL = function () {
            return "?t=" + encodeURIComponent(this.workout_title) +
                "&w=" + encodeURIComponent(this.workout_text) +
                "&st=" + encodeURIComponent(this.sport_type) +
                "&ftp=" + encodeURIComponent(this.ftp_watts) +
                "&tpace=" + encodeURIComponent(this.t_pace) +
                "&css=" + encodeURIComponent(this.swim_css) +
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
    var FieldValidator = (function () {
        function FieldValidator() {
        }
        FieldValidator.validateEmail = function (email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        };
        FieldValidator.validateNumber = function (num) {
            if (num == null || num.trim().length == 0) {
                return false;
            }
            else {
                var num_val = parseFloat(num);
                return !isNaN(num_val);
            }
        };
        return FieldValidator;
    })();
    UI.FieldValidator = FieldValidator;
    var ClipboardHelper = (function () {
        function ClipboardHelper() {
        }
        ClipboardHelper.copyText = function (text) {
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
        };
        return ClipboardHelper;
    })();
    UI.ClipboardHelper = ClipboardHelper;
})(UI || (UI = {}));
module.exports = UI;

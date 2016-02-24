/// <reference path="../type_definitions/react.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require('react');
var Model = require('../model');
var number_input_1 = require('./number_input');
var email_input_1 = require('./email_input');
var text_input_1 = require('./text_input');
var UserSettings;
(function (UserSettings) {
    var UserPropertyElement = (function (_super) {
        __extends(UserPropertyElement, _super);
        function UserPropertyElement(params) {
            _super.call(this, params);
            this.ftp = parseInt(params.ftp_watts);
            this.email = params.email;
            this.t_pace = params.t_pace;
        }
        UserPropertyElement.prototype.onFtpChange = function (ftp) {
            var ftpInput = this.refs['ftp'];
            if (ftp < 100 || ftp > 500) {
                ftpInput.setError("Set a value between 100 and 500");
            }
            else {
                ftpInput.setError("");
            }
            this.ftp = ftp;
        };
        UserPropertyElement.prototype.onTPaceChange = function (t_pace) {
            var tPaceInput = this.refs['t_pace'];
            var t_pace_mph = Model.SpeedParser.getSpeedInMph(t_pace);
            if (t_pace != null && t_pace_mph > 0) {
                tPaceInput.setError("");
            }
            else {
                tPaceInput.setError("Enter a value speed for your running t-pace. Allowed units are: min/mi, km/h, mi/h, min/km");
            }
            this.t_pace = t_pace;
        };
        UserPropertyElement.prototype.onEmailChange = function (email) {
            this.email = email;
        };
        UserPropertyElement.prototype.getFTP = function () {
            return this.ftp;
        };
        UserPropertyElement.prototype.getTPace = function () {
            return this.t_pace;
        };
        UserPropertyElement.prototype.getEmail = function () {
            return this.email;
        };
        UserPropertyElement.prototype.render = function () {
            return (React.createElement("div", null, React.createElement("h1", null, " User Settings "), "Bike FTP: ", React.createElement(number_input_1.default, {"ref": "ftp", "width": "20", "placeholder": "245", "value": this.ftp, "onChange": this.onFtpChange.bind(this)}), React.createElement("br", null), "Run T-Pace: ", React.createElement(text_input_1.default, {"ref": "t_pace", "width": "20", "placeholder": "7:30 min/mi", "value": this.t_pace, "onChange": this.onTPaceChange.bind(this)}), " ", React.createElement("br", null), "Email: ", React.createElement(email_input_1.default, {"ref": "email", "width": "20", "placeholder": "foo@gmail.com", "value": this.email, "onChange": this.onEmailChange.bind(this)}), " ", React.createElement("br", null), React.createElement("br", null)));
        };
        return UserPropertyElement;
    })(React.Component);
    UserSettings.UserPropertyElement = UserPropertyElement;
})(UserSettings || (UserSettings = {}));
module.exports = UserSettings;

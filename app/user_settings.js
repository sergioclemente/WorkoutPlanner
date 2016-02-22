/// <reference path="../type_definitions/react.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require('react');
var UserSettings;
(function (UserSettings) {
    var UserPropertyElement = (function (_super) {
        __extends(UserPropertyElement, _super);
        function UserPropertyElement(params) {
            _super.call(this, params);
            this.state = {
                email: params.email,
                ftp: params.ftp_watts,
                t_pace: params.t_pace,
            };
        }
        UserPropertyElement.prototype.onFtpChange = function (e) {
            this.setState({ ftp: e.target.value });
        };
        UserPropertyElement.prototype.onTPaceChange = function (e) {
            this.setState({ t_pace: e.target.value });
        };
        UserPropertyElement.prototype.onEmailChange = function (e) {
            this.setState({ email: e.target.value });
        };
        UserPropertyElement.prototype.getFTP = function () {
            return this.state.ftp;
        };
        UserPropertyElement.prototype.getTPace = function () {
            return this.state.t_pace;
        };
        UserPropertyElement.prototype.getEmail = function () {
            return this.state.email;
        };
        UserPropertyElement.prototype.render = function () {
            return (React.createElement("div", null, React.createElement("h1", null, " User Settings "), "Bike FTP: ", React.createElement("input", {"id": "txtFtp", "width": "20", "placeholder": "245", "value": this.state.ftp, "onChange": this.onFtpChange.bind(this)}), React.createElement("br", null), "Run T-Pace: ", React.createElement("input", {"id": "txtTPace", "width": "20", "placeholder": "7:30 min/mi", "value": this.state.t_pace, "onChange": this.onTPaceChange.bind(this)}), " ", React.createElement("br", null), "Email: ", React.createElement("input", {"id": "txtEmail", "width": "20", "placeholder": "foo@gmail.com", "value": this.state.email, "onChange": this.onEmailChange.bind(this)}), " ", React.createElement("br", null), React.createElement("br", null)));
        };
        return UserPropertyElement;
    })(React.Component);
    UserSettings.UserPropertyElement = UserPropertyElement;
})(UserSettings || (UserSettings = {}));
module.exports = UserSettings;

/// <reference path="../type_definitions/react.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require('react');
var error_label_1 = require('./error_label');
function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}
var EmailInput = (function (_super) {
    __extends(EmailInput, _super);
    function EmailInput(props) {
        _super.call(this, props);
        this.state = {
            value: props.value,
        };
    }
    EmailInput.prototype.componentWillReceiveProps = function (nextProps) {
        this.setState({ value: '' + nextProps.value });
    };
    EmailInput.prototype.render = function () {
        var _this = this;
        var props = this.props, value = this.state.value || props.value;
        return (React.createElement("span", null, React.createElement("input", React.__spread({}, props, {"type": 'string', "value": this.state.value, "onChange": function (e) { return _this._change(e); }, "onBlur": function (e) { return _this._blur(e); }})), React.createElement(error_label_1.default, {"ref": 'errorLabel', "message": ''})));
    };
    EmailInput.prototype._change = function (e) {
        var val = e.target.value, current = this.props.value, number = parseFloat(val);
        this.setState({ value: val });
    };
    EmailInput.prototype._blur = function (e) {
        var email = e.target.value;
        if (email == null || email.trim() === '' || !validateEmail(email)) {
            this.setError("Enter a valid email");
        }
        else {
            this.setError("");
            this.props.onChange(email);
        }
    };
    EmailInput.prototype.setError = function (msg) {
        var errorLabel = this.refs['errorLabel'];
        errorLabel.setError(msg);
    };
    return EmailInput;
})(React.Component);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = EmailInput;

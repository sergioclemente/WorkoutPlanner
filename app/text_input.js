/// <reference path="../type_definitions/react.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require('react');
var error_label_1 = require('./error_label');
var TextInput = (function (_super) {
    __extends(TextInput, _super);
    function TextInput(props) {
        _super.call(this, props);
        this.state = {
            value: props.value,
        };
    }
    TextInput.prototype.componentWillReceiveProps = function (nextProps) {
        this.setState({ value: '' + nextProps.value });
    };
    TextInput.prototype.render = function () {
        var _this = this;
        return (React.createElement("span", null, React.createElement("input", React.__spread({}, this.props, {"value": this.state.value, "onChange": function (e) { return _this._change(e); }, "onBlur": function (e) { return _this._blur(e); }})), React.createElement(error_label_1.default, {"ref": 'errorLabel', "message": ''})));
    };
    TextInput.prototype._change = function (e) {
        this.setState({ value: e.target.value });
    };
    TextInput.prototype._blur = function (e) {
        this.props.onChange(e.target.value);
    };
    TextInput.prototype.setError = function (msg) {
        var errorLabel = this.refs['errorLabel'];
        errorLabel.setError(msg);
    };
    return TextInput;
})(React.Component);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TextInput;

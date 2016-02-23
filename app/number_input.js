/// <reference path="../type_definitions/react.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require('react');
var UI = require('../ui');
var error_label_1 = require('./error_label');
// inspired from react-formal/src/inputs/Number.jsx
var NumberInput = (function (_super) {
    __extends(NumberInput, _super);
    function NumberInput(props) {
        _super.call(this, props);
        this.state = {
            value: props.value,
        };
    }
    NumberInput.prototype.componentWillReceiveProps = function (nextProps) {
        this.setState({ value: '' + nextProps.value });
    };
    NumberInput.prototype.render = function () {
        var _this = this;
        return (React.createElement("span", null, React.createElement("input", React.__spread({}, this.props, {"type": 'number', "value": this.state.value, "onChange": function (e) { return _this._change(e); }, "onBlur": function (e) { return _this._blur(e); }})), React.createElement(error_label_1.default, {"ref": 'errorLabel', "message": ''})));
    };
    NumberInput.prototype._change = function (e) {
        this.setState({ value: e.target.value });
    };
    NumberInput.prototype._blur = function (e) {
        if (UI.FieldValidator.validateNumber(e.target.value)) {
            this.props.onChange(null);
        }
        else {
            this.props.onChange(e.target.value);
        }
    };
    NumberInput.prototype.setError = function (msg) {
        var errorLabel = this.refs['errorLabel'];
        errorLabel.setError(msg);
    };
    return NumberInput;
})(React.Component);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = NumberInput;

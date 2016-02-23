/// <reference path="../type_definitions/react.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require('react');
var error_label_1 = require('./error_label');
// inspired from react-formal/src/inputs/Number.jsx
var isValid = function (num) { return typeof num === 'number' && !isNaN(num); };
var isAtDelimiter = function (num, str) {
    var next = str.length <= 1 ? false : parseFloat(str.substr(0, str.length - 1));
    return typeof next === 'number' && !isNaN(next) && next === num;
};
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
        var props = this.props, value = this.state.value || props.value;
        return (React.createElement("span", null, React.createElement("input", React.__spread({}, props, {"type": 'number', "value": this.state.value, "onChange": function (e) { return _this._change(e); }, "onBlur": function (e) { return _this._blur(e); }})), React.createElement(error_label_1.default, {"ref": 'errorLabel', "message": ''})));
    };
    NumberInput.prototype._change = function (e) {
        var val = e.target.value, current = this.props.value, number = parseFloat(val);
        this.setState({ value: val });
    };
    NumberInput.prototype._blur = function (e) {
        var val = e.target.value, current = this.props.value, number = parseFloat(val);
        if (val == null || val.trim() === '' || !isValid(number)) {
            this.props.onChange(null);
        }
        else {
            this.props.onChange(number);
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

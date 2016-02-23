/// <reference path="../type_definitions/react.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require('react');
var ErrorLabel = (function (_super) {
    __extends(ErrorLabel, _super);
    function ErrorLabel(props) {
        _super.call(this, props);
        this.state = {
            message: props.message || "",
        };
    }
    ErrorLabel.prototype.componentWillReceiveProps = function (nextProps) {
        this.setState({ value: '' + nextProps.value });
    };
    ErrorLabel.prototype.render = function () {
        var props = this.props, value = this.state.value || props.value;
        return (React.createElement("span", React.__spread({}, props, {"style": { marginLeft: "10px", color: "#a94442" }}), this.state.message));
    };
    ErrorLabel.prototype.setError = function (msg) {
        this.setState({ message: msg });
    };
    return ErrorLabel;
})(React.Component);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ErrorLabel;

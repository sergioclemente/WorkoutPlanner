"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const error_label_1 = require("./error_label");
class TextInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: props.value,
        };
    }
    render() {
        return (React.createElement("span", null,
            React.createElement("input", { ref: "input", ...this.props, value: this.state.value, onChange: e => this._change(e), onBlur: e => this._blur(e) }),
            React.createElement(error_label_1.default, { ref: 'errorLabel', message: '' })));
    }
    _change(e) {
        this.setState({ value: e.target.value });
    }
    _blur(e) {
        this.props.onChange(e.target.value);
    }
    setError(msg) {
        var errorLabel = this.refs['errorLabel'];
        errorLabel.setError(msg);
    }
    getValue() {
        return this.state.value;
    }
}
exports.default = TextInput;

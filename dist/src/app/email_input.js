"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const UI = require("../ui");
const error_label_1 = require("./error_label");
class EmailInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: props.value,
        };
    }
    render() {
        const { value } = this.state;
        const { defaultValue, width } = this.props;
        return (React.createElement("span", null,
            React.createElement("input", { width: width, placeholder: defaultValue, type: 'string', value: value, onChange: e => this._change(e), onBlur: e => this._blur(e) }),
            React.createElement(error_label_1.default, { ref: 'errorLabel', message: '' })));
    }
    _change(e) {
        this.setState({ value: e.target.value });
    }
    _blur(e) {
        if (!UI.FieldValidator.validateEmail(e.target.value)) {
            this._setError("Enter a valid email");
        }
        else {
            this._setError("");
            const { onChange } = this.props;
            onChange(e.target.value);
        }
    }
    _setError(msg) {
        var errorLabel = this.refs['errorLabel'];
        errorLabel.setError(msg);
    }
}
exports.default = EmailInput;

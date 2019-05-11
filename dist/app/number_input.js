"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const UI = require("../ui");
const error_label_1 = require("./error_label");
class NumberInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: props.value,
        };
    }
    render() {
        return (React.createElement("span", null,
            React.createElement("input", Object.assign({}, this.props, { type: 'number', value: this.state.value, onChange: e => this._change(e), onBlur: e => this._blur(e) })),
            React.createElement(error_label_1.default, { ref: 'errorLabel', message: '' })));
    }
    _change(e) {
        this.setState({ value: e.target.value });
    }
    _blur(e) {
        if (!UI.FieldValidator.validateNumber(e.target.value)) {
            this.props.onChange(null);
        }
        else {
            this.props.onChange(e.target.value);
        }
    }
    setError(msg) {
        var errorLabel = this.refs['errorLabel'];
        errorLabel.setError(msg);
    }
}
exports.default = NumberInput;

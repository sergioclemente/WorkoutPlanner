"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
class SelectOption extends React.Component {
    render() {
        return (React.createElement("option", { ref: "opt", ...this.props }, this.props.children));
    }
    setEnabled(value) {
        var option = this.refs["opt"];
        option.hidden = !value;
    }
}
exports.default = SelectOption;

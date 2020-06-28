"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
class ErrorLabel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            message: props.message || "",
        };
    }
    render() {
        return (React.createElement("span", { style: { marginLeft: "10px", color: "#a94442" } }, this.state.message));
    }
    setError(msg) {
        this.setState({ message: msg });
    }
}
exports.default = ErrorLabel;

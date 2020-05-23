"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
class Select extends React.Component {
    render() {
        return (React.createElement("select", Object.assign({ ref: "sel" }, this.props, { onChange: e => this._change(e) }), this.props.children));
    }
    _change(e) {
        if (this.props.onChange) {
            this.props.onChange(this.getSelectedValue());
        }
    }
    getSelectedValue() {
        var selectOption = this.refs['sel'];
        return selectOption.value;
    }
    setSelectedValue(val) {
        var selectOption = this.refs['sel'];
        selectOption.value = val;
    }
}
exports.default = Select;

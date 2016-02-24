/// <reference path="../type_definitions/react.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require('react');
var Select = (function (_super) {
    __extends(Select, _super);
    function Select() {
        _super.apply(this, arguments);
    }
    Select.prototype.render = function () {
        var _this = this;
        return (React.createElement("select", React.__spread({"ref": "sel"}, this.props, {"onChange": function (e) { return _this._change(e); }}), this.props.children));
    };
    Select.prototype._change = function (e) {
        if (this.props.onChange) {
            this.props.onChange(this.getSelectedValue());
        }
    };
    Select.prototype.getSelectedValue = function () {
        var selectOption = this.refs['sel'];
        return selectOption.value;
    };
    Select.prototype.setSelectedValue = function (val) {
        var selectOption = this.refs['sel'];
        selectOption.value = val;
    };
    return Select;
})(React.Component);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Select;

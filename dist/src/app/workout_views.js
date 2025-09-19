"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const fixed_data_table_2_1 = require("fixed-data-table-2");
const select_1 = require("./select");
const select_option_1 = require("./select_option");
const UI = require("../ui");
const Core = require("../core");
class TitleCell extends React.Component {
    render() {
        var title = this.props.data[this.props.rowIndex][this.props.field];
        var link = this.props.data[this.props.rowIndex][this.props.link];
        return (React.createElement(fixed_data_table_2_1.Cell, { ...this.props },
            React.createElement("a", { href: link }, title)));
    }
}
class SportTypeCell extends React.Component {
    render() {
        let sportType = this.props.data[this.props.rowIndex][this.props.field];
        let sportTypeString = UI.SportTypeHelper.convertToString(sportType);
        return (React.createElement(fixed_data_table_2_1.Cell, { ...this.props }, sportTypeString));
    }
}
class TagsCell extends React.Component {
    render() {
        var tags = this.props.data[this.props.rowIndex][this.props.field];
        var tags_string = "";
        var prefix = "";
        tags.forEach((v) => {
            tags_string += prefix + v;
            prefix = ", ";
        });
        return (React.createElement(fixed_data_table_2_1.Cell, { ...this.props }, tags_string));
    }
}
class DurationCell extends React.Component {
    render() {
        let duration_sec = this.props.data[this.props.rowIndex][this.props.field];
        let duration = new Core.Duration(Core.TimeUnit.Seconds, duration_sec, duration_sec, 0);
        let time_component = duration.getTimeComponents();
        let format_str = "";
        if (time_component.hours > 0) {
            format_str = Core.MyMath.round10(time_component.hours + time_component.minutes / 60.0, -1) + "hr";
        }
        else {
            format_str = time_component.minutes + "min";
        }
        return (React.createElement(fixed_data_table_2_1.Cell, { ...this.props }, format_str));
    }
}
class WorkoutViews extends React.Component {
    constructor(params) {
        super(params);
        this._rows = [];
        this._global_tags = new Set();
        this.state = {
            filteredRows: this._rows,
        };
        this._params = new UI.QueryParamsList();
    }
    componentDidMount() {
        this._fetchWorkouts();
    }
    _fetchWorkouts() {
        var url = "workouts";
        var req = new XMLHttpRequest();
        req.addEventListener("load", this._onWorkoutsLoaded.bind(this, req));
        req.open("GET", url);
        req.send();
    }
    _onWorkoutsLoaded(req) {
        if (req.status == 200) {
            var rows = JSON.parse(req.responseText);
            for (let i = 0; i < rows.length; i++) {
                let params = new UI.QueryParamsWorkoutView();
                params.workout_text.value = rows[i].value;
                params.workout_title.value = rows[i].title;
                params.sport_type.value = rows[i].sport_type.toString();
                params.workout_id.value = rows[i].id != null ? rows[i].id.toString() : "";
                params.page.value = "wv";
                let tags_array = rows[i].tags.split(",").map(x => x.trim());
                for (let j = 0; j < tags_array.length; j++) {
                    if (tags_array[j].length > 0) {
                        this._global_tags.add(tags_array[j]);
                    }
                }
                rows[i].tags = new Set(tags_array);
                rows[i].link = params.getURL();
            }
            this._rows = rows;
            this._filterData();
            this.forceUpdate();
        }
        else {
            alert("Error while fetching workouts");
        }
    }
    _onSportTypeChange(sportTypeStr) {
        this._filterData();
    }
    _onTextFilterChange(e) {
        this._filterData();
    }
    _filterData() {
        let sportTypeComp = this.refs["sportType"];
        let filterTextComp = this.refs["text"];
        var sportTypeEnum = parseInt(sportTypeComp.getSelectedValue());
        var filterText = filterTextComp.value;
        var filteredRows = [];
        var shouldIncludeInResult;
        if (filterText.length == 0) {
            shouldIncludeInResult = () => { return true; };
        }
        else if (this._global_tags.has(filterText)) {
            shouldIncludeInResult = (row) => {
                return row.tags.has(filterText.toLowerCase());
            };
        }
        else {
            shouldIncludeInResult = (row) => {
                return row.title.toLowerCase().indexOf(filterText.toLowerCase()) >= 0;
            };
        }
        for (let i = 0; i < this._rows.length; i++) {
            var row = this._rows[i];
            if ((sportTypeEnum == Core.SportType.Unknown || row.sport_type == sportTypeEnum)
                && shouldIncludeInResult(row)) {
                filteredRows.push(row);
            }
        }
        this._params.sport_type.value = sportTypeEnum.toString();
        this._params.title.value = filterText;
        this._params.pushToHistory();
        this.setState({ filteredRows: filteredRows });
    }
    render() {
        var { filteredRows } = this.state;
        return (React.createElement("div", null,
            "Workouts",
            React.createElement(select_1.default, { ref: "sportType", defaultValue: this.props.sport_type, onChange: e => this._onSportTypeChange(e) },
                React.createElement(select_option_1.default, { value: Core.SportType.Unknown }, "All"),
                React.createElement(select_option_1.default, { value: Core.SportType.Swim }, "Swim"),
                React.createElement(select_option_1.default, { value: Core.SportType.Bike }, "Bike"),
                React.createElement(select_option_1.default, { value: Core.SportType.Run }, "Run"),
                React.createElement(select_option_1.default, { value: Core.SportType.Other }, "Other")),
            " ",
            React.createElement("br", null),
            "Filter: ",
            React.createElement("input", { ref: "text", value: this._params.title.value, onChange: e => this._onTextFilterChange(e) }),
            React.createElement(fixed_data_table_2_1.Table, { ref: "tbl", rowsCount: filteredRows.length, rowHeight: 50, headerHeight: 50, width: 900, height: 800 },
                React.createElement(fixed_data_table_2_1.Column, { header: React.createElement(fixed_data_table_2_1.Cell, null, "Type"), cell: React.createElement(SportTypeCell, { data: filteredRows, field: "sport_type" }, " "), width: 60 }),
                React.createElement(fixed_data_table_2_1.Column, { header: React.createElement(fixed_data_table_2_1.Cell, null, "Title"), cell: React.createElement(TitleCell, { data: filteredRows, field: "title", link: "link" }, " "), width: 300 }),
                React.createElement(fixed_data_table_2_1.Column, { header: React.createElement(fixed_data_table_2_1.Cell, null, "Duration"), cell: React.createElement(DurationCell, { data: filteredRows, field: "duration_sec" }, " "), width: 80 }),
                React.createElement(fixed_data_table_2_1.Column, { header: React.createElement(fixed_data_table_2_1.Cell, null, "Tags"), cell: React.createElement(TagsCell, { data: filteredRows, field: "tags" }, " "), width: 200 }))));
    }
}
exports.default = WorkoutViews;

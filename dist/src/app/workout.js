"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const UI = require("../ui");
const Core = require("../core");
const user_settings_1 = require("./user_settings");
const workout_input_1 = require("./workout_input");
const workout_view_1 = require("./workout_view");
const visitor_1 = require("../visitor");
class Workout extends React.Component {
    constructor(props) {
        super(props);
        this.params = UI.QueryParamsWorkoutView.createCopy(props);
    }
    getDominantUnit(params) {
        try {
            let workout_builder = params.createWorkoutBuilder();
            return workout_builder != null ? visitor_1.DominantUnitVisitor.computeIntensity(workout_builder.getInterval()) : null;
        }
        catch (Error) {
            return Core.IntensityUnit.Unknown;
        }
    }
    _onWorkoutInputChanged(sportType, outputUnit, workout_title, workout_text) {
        this.params.sport_type.value = sportType.toString();
        this.params.output_unit.value = outputUnit.toString();
        this.params.workout_text.value = workout_text;
        this.params.workout_title.value = workout_title;
        let dominant_unit = this.getDominantUnit(this.params);
        if (dominant_unit != null &&
            dominant_unit != Core.IntensityUnit.Unknown &&
            dominant_unit != Core.IntensityUnit.IF) {
            let input = this.refs['input'];
            input.setOutputUnit(dominant_unit);
        }
        this.refresh();
    }
    _onUserSettingsChanged(ftp, t_pace, swim_css, swim_ftp, email, efficiency_factor) {
        if (!isNaN(ftp)) {
            this.params.ftp_watts.value = ftp.toString();
        }
        this.params.t_pace.value = t_pace;
        this.params.swim_css.value = swim_css;
        this.params.swim_ftp.value = swim_ftp;
        this.params.email.value = email;
        this.params.efficiency_factor.value = efficiency_factor;
        this.refresh();
    }
    componentDidMount() {
        this.refreshUrls();
    }
    refresh() {
        var view = this.refs['view'];
        view.refresh(this.params);
        this.refreshUrls();
        this.params.saveToStorage();
    }
    refreshUrls() {
        let params = UI.QueryParamsWorkoutView.createCopy(this.params);
        window.history.pushState('Object', 'Title', this.params.getURL());
        params.page.value = "player";
        this._setHref("player_link", params.getURL());
        params.page.value = "list";
        this._setHref("list_link", params.getURL());
    }
    _setHref(element_ref, url) {
        var anchor = this.refs[element_ref];
        anchor.href = url;
    }
    _setVisibility(element_ref, visible) {
        var anchor = this.refs[element_ref];
        anchor.hidden = !visible;
    }
    _onEmailWorkout() {
        var req = new XMLHttpRequest();
        req.addEventListener("load", this._onEmailSent.bind(this, req));
        req.open("GET", "send_mail" + this.params.getURL());
        req.send();
    }
    _onEmailSent(req) {
        if (req.status == 200) {
            alert("Email sent");
        }
        else {
            alert("Error while sending email");
            console.log(req.responseText);
        }
    }
    _onSaveWorkout() {
        var req = new XMLHttpRequest();
        req.addEventListener("load", this._onWorkoutSaved.bind(this, req));
        req.open("GET", "save_workout" + this.params.getURL());
        req.send();
    }
    _onWorkoutSaved(req) {
        if (req.status == 200) {
            alert("Workout saved");
        }
        else {
            alert("Error while saving workouts");
            console.log(req.responseText);
        }
    }
    _onClickLink() {
        let builder = this.params.createWorkoutBuilder();
        {
            let fileName = builder.getMRCFileName();
            let content = builder.getMRCFile();
            this._downloadFile(fileName, content);
        }
        {
            let fileName = builder.getZWOFileName();
            let content = builder.getZWOFile();
            this._downloadFile(fileName, content);
        }
        {
            let fileName = builder.getPPSMRXFileName();
            let content = builder.getPPSMRXFile();
            this._downloadFile(fileName, content);
        }
    }
    _shouldRound() {
        return this.refs["round"].checked;
    }
    _onCheckedChanged() {
        this.params.should_round.value = "" + this._shouldRound();
        this.refresh();
    }
    _downloadFile(fileName, content) {
        let uriContent = "data:application/octet-stream," + encodeURIComponent(content);
        var link = document.createElement('a');
        link.download = fileName;
        link.href = uriContent;
        link.click();
    }
    _onPrettyPrint() {
        let input = this.refs['input'];
        let builder = this.params.createWorkoutBuilder();
        input.setWorkoutText(builder.getNormalizedWorkoutDefinition());
    }
    render() {
        return (React.createElement("div", null,
            React.createElement(user_settings_1.default, { ...this.props, ref: 'settings', onChange: (f, t, c, sf, e, ef) => this._onUserSettingsChanged(f, t, c, sf, e, ef) }),
            React.createElement(workout_input_1.default, { ...this.props, ref: 'input', onChange: (s, o, t, w) => this._onWorkoutInputChanged(s, o, t, w) }),
            React.createElement("table", null,
                React.createElement("tbody", null,
                    React.createElement("tr", null,
                        React.createElement("td", null,
                            React.createElement("a", { href: "#", onClick: (e) => this._onClickLink() }, "Download Files")),
                        React.createElement("td", null,
                            React.createElement("a", { ref: "player_link" }, "Player")),
                        React.createElement("td", null,
                            React.createElement("a", { href: "#", onClick: (e) => this._onPrettyPrint() }, "Pretty print")),
                        React.createElement("td", null,
                            React.createElement("a", { ref: "email_send_workout", href: "#", onClick: (e) => this._onEmailWorkout() }, "Email Workout")),
                        React.createElement("td", null,
                            React.createElement("a", { ref: "save_workout", href: "#", onClick: (e) => this._onSaveWorkout() }, "Save Workout")),
                        React.createElement("td", null,
                            React.createElement("a", { ref: "list_link" }, "List Workouts"))))),
            React.createElement("input", { type: "checkbox", ref: "round", onChange: this._onCheckedChanged.bind(this) }),
            "Round intensities ",
            React.createElement("br", null),
            React.createElement(workout_view_1.default, { ...this.props, ref: 'view' })));
    }
}
exports.default = Workout;

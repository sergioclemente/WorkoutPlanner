import * as Core from './core';
import * as Model from './model';
import * as Visitor from './visitor';

function loadPersistedValue(id: string): string {
	if (window.localStorage) {
		var result = window.localStorage.getItem(id);
		return result ? result.trim() : "";
	} else {
		return null;
	}
}

function setPersistedValue(id: string, value: string) {
	if (window.localStorage) {
		window.localStorage.setItem(id, value);
	}
}

export class QueryParamsList {
	private sport_type_: string;
	private title_: string;

	constructor() {
		this.loadFromURL();
	}

	loadFromURL(): boolean {
		var params = getQueryParams();
		this.sport_type_ = params.st;
		this.title_ = params.title || "";
		return this.validate();
	}

	validate(): boolean {
		return typeof (this.sport_type_) != 'undefined' && this.sport_type_ != "";
	}

	getURL(): string {
		return "?page=list&st=" + encodeURIComponent(this.sport_type_) + "&title=" + encodeURIComponent(this.title_);
	}

	getSportType(): string {
		return this.sport_type_;
	}

	setSportType(st: string): void {
		this.sport_type_ = st;
	}

	setTitle(title: string): void {
		this.title_ = title;
	}

	getTitle(): string {
		return this.title_;
	}

	pushToHistory(): void {
		window.history.pushState('Object', 'Title', this.getURL());
	}
}

class ParamArg {
	public property_name: string;
	public url_name: string;
	public value: string;
	public required: boolean;

	constructor(property_name: string, url_name: string, required: boolean) {
		this.property_name = property_name;
		this.url_name = url_name;
		this.required = required;
	}

	hasValue() : boolean {
		return typeof (this.value) != 'undefined' && (this.value != "" && this.value.trim().length > 0);
	}

	validate() : boolean {
		return !this.required || this.hasValue();
	}

	getValue() : string {
		if (this.hasValue()) {
			return this.value;
		} else {
			return null;
		}
	}

	encodeUrl() : string {
		return `${this.url_name}=${encodeURIComponent(this.value)}`;
	}
}

export class QueryParams {

	private ftp_watts_ = new ParamArg("ftp_watts", "ftp", /*required=*/true);
	private t_pace_ = new ParamArg("t_pace", "tpace", /*required=*/true);
	private swim_ftp_ = new ParamArg("swim_ftp", "swim_ftp", /*required=*/true);
	private swim_css_ = new ParamArg("swim_css", "css", /*required=*/true);
	private email_ = new ParamArg("email", "email", /*required=*/true);
	private efficiency_factor_ = new ParamArg("efficiency_factor", "ef", /*required=*/true);
	private workout_title_ = new ParamArg("workout_title", "t", /*required=*/false);
	private workout_text_ = new ParamArg("workout_text", "w", /*required=*/false);
	private sport_type_ = new ParamArg("sport_type", "st", /*required=*/true);
	private output_unit_ = new ParamArg("output_unit", "ou", /*required=*/true);
	private page_ = new ParamArg("page", "page", /*required=*/true);
	private should_round_ = new ParamArg("should_round", "should_round", /*required=*/false);

	public params: ParamArg[] = [
		this.ftp_watts_,
		this.t_pace_,
		this.swim_ftp_,
		this.swim_css_,
		this.email_,
		this.efficiency_factor_,
		this.workout_title_,
		this.workout_text_,
		this.sport_type_,
		this.output_unit_,
		this.page_,
		this.should_round_,
	];

	get ftp_watts() : ParamArg {
		return this.ftp_watts_;
	}

	get t_pace() : ParamArg {
		return this.t_pace_;
	}

	get swim_ftp() : ParamArg {
		return this.swim_ftp_;
	}

	get swim_css() : ParamArg {
		return this.swim_css_;
	}

	get email() : ParamArg {
		return this.email_;
	}

	get efficiency_factor() : ParamArg {
		return this.efficiency_factor_;
	}

	get workout_title() : ParamArg {
		return this.workout_title_;
	}
	get workout_text() : ParamArg {
		return this.workout_text_;
	}

	get sport_type() : ParamArg {
		return this.sport_type_;
	}

	get output_unit() : ParamArg {
		return this.output_unit_;
	}

	get page() : ParamArg {
		return this.page_;
	}

	get should_round() : ParamArg {
		return this.should_round_;
	}

	private setUrlParamValue(url_name: string, value: string) {
		for (let i = 0; i < this.params.length; i++) {
			let qp : ParamArg = this.params[i];
			if (qp.url_name == url_name) {
				qp.value = value;
			}
		}
	}

	constructor() {
		if (!this.validate()) {
			this.loadFromStorage();
			this.loadFromURL();
		}
	}

	static createCopy(other: QueryParams): QueryParams {
		var ret = new QueryParams();
		for (let i = 0; i < other.params.length; i++) {
			ret.params[i].value = other.params[i].value;
		}
		return ret;
	}

	loadFromStorage() : void {
		for (let i = 0; i < this.params.length; i++) {
			let qp : ParamArg = this.params[i];
			let value = loadPersistedValue(qp.property_name);
			if (value != null && value.trim().length != 0) {
				qp.value = value;
			}
		}
	}

	saveToStorage(): void {
		for (let i = 0; i < this.params.length; i++) {
			let qp : ParamArg = this.params[i];
			if (qp.hasValue()) {
				setPersistedValue(qp.property_name, qp.value);
			}
		}
	}

	loadFromURL(): void {
		var query_params = getQueryParams();
		for (let key in query_params) {
			let value = query_params[key];
			if (value != 'undefined' && typeof(value) != 'undefined') {
				this.setUrlParamValue(key, value);
			}
		}
	}

	validate(): boolean {
		for (let i = 0; i < this.params.length; i++) {
			let qp : ParamArg = this.params[i];
			if (!qp.validate()) {
				return false;
			}
		}
		return true;
	}

	getURL(): string {
		// Let's get the encoded url for each param.
		let params_string = this.params.map(function (value: ParamArg) : string {
			return value.hasValue() ? value.encodeUrl() : null;
		})
		// Exclude nulls.
		params_string = params_string.filter(v => v != null)

		return "?" + params_string.join("&");
	}

	createUserProfile(): Core.UserProfile {
		if (this.validate()) {
			let result = new Core.UserProfile(parseInt(this.ftp_watts.value), this.t_pace.value, parseInt(this.swim_ftp.value), this.swim_css.value, this.email.value);
			result.setEfficiencyFactor(parseFloat(this.efficiency_factor.value));
			return result;
		} else {
			return null;
		}
	}

	createWorkoutBuilder(): Model.WorkoutBuilder {
		if (this.validate()) {
			let result = new Model.WorkoutBuilder(this.createUserProfile(),
				parseInt(this.sport_type.value), parseInt(this.output_unit.value));
			result.withDefinition(this.workout_title.value, this.workout_text.value);
			return result;
		} else {
			return null;
		}
	}

	getDominantUnit(): Core.IntensityUnit {
		try {
			let workout_builder = this.createWorkoutBuilder();
			return workout_builder != null ? Visitor.DominantUnitVisitor.computeIntensity(workout_builder.getInterval()) : null;
		} catch (Error) {
			return Core.IntensityUnit.Unknown;
		}
	}
}

function getQueryParams(): any {
	var qs = document.location.search;
	qs = qs.split("+").join(" ");

	var params = {},
		tokens,
		re = /[?&]?([^=]+)=([^&]*)/g;

	while (tokens = re.exec(qs)) {
		params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
	}

	return params;
}

export class FieldValidator {
	static validateEmail(email: string): boolean {
		var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(email);
	}

	static validateNumber(num: string): boolean {
		if (num == null || num.trim().length == 0) {
			return false;
		} else {
			var num_val = parseFloat(num);
			return !isNaN(num_val);
		}
	}
}

export class ClipboardHelper {
	static copyText(text: string): void {
		var textArea: HTMLTextAreaElement = document.createElement("textarea");

		// Place in top-left corner of screen regardless of scroll position.
		textArea.style.position = 'fixed';
		textArea.style.top = "0";
		textArea.style.left = "0";
		textArea.style.width = '2em';
		textArea.style.height = '2em';
		textArea.style.padding = "0";
		textArea.style.border = 'none';
		textArea.style.outline = 'none';
		textArea.style.boxShadow = 'none';
		textArea.style.background = 'transparent';
		textArea.value = text;

		document.body.appendChild(textArea);

		textArea.select();

		try {
			var successful = document.execCommand('copy');
			var msg = successful ? 'successful' : 'unsuccessful';
			console.log('Copying text command was ' + msg);
		} catch (err) {
			console.log('Oops, unable to copy');
		}

		document.body.removeChild(textArea);
	}
}

export class SportTypeHelper {
	// TODO: Can I use toString and or add this to the enum itself?
	static convertToString(sportType: Core.SportType) {
		if (sportType == Core.SportType.Bike) {
			return "Bike";
		} else if (sportType == Core.SportType.Run) {
			return "Run";
		} else if (sportType == Core.SportType.Swim) {
			return "Swim";
		} else if (sportType == Core.SportType.Other) {
			return "Other";
		} else {
			console.assert(false);
			return "";
		}
	}
}
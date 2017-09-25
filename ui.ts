/// <reference path="./node_modules/@types/node/index.d.ts"/>
/// <reference path="./node_modules/@types/mysql/index.d.ts"/>

import * as Model from './model';

var zlib = require('zlib');

module UI {

	export class PersistedItem {
		id: string;
		constructor(id: string) {
			this.id = id;
		}
		save(value: string): void {
			if (window.localStorage) {
				window.localStorage.setItem(this.id, value);
			}
		}

		load(): string {
			if (window.localStorage) {
				var result = window.localStorage.getItem(this.id);
				return result ? result.trim() : "";
			} else {
				return null;
			}
		}
	}

	export class QueryParamsList {
		private sport_type_: string;

		constructor() {
			this.loadFromURL();
		}

		loadFromURL(): boolean {
			var params = getQueryParams();
			this.sport_type_ = params.st;
			return this.validate();
		}

		validate(): boolean {
			return typeof (this.sport_type_) != 'undefined' && this.sport_type_ != "";
		}

		getURL(): string {
			return "?st=" + encodeURIComponent(this.sport_type_);
		}

		getSportType(): string {
			return this.sport_type_;
		}

		setSportType(st: string): void {
			this.sport_type_ = st;
			window.history.pushState('Object', 'Title', this.getURL());
		}
	}

	export class QueryParams {
		public ftp_watts: string;
		public t_pace: string;
		public swim_css: string;
		public email: string;
		public efficiency_factor: string;

		public workout_title: string;
		public workout_text: string;
		public sport_type: string;
		public output_unit: string;
		public page: string;
		public should_round : string;

		constructor() {
			if (!this.validate()) {
				this.loadFromStorage();
				this.loadFromURL();
			}
		}

		static createCopy(params: QueryParams): QueryParams {
			var ret = new QueryParams();
			ret.workout_title = params.workout_title;
			ret.workout_text = params.workout_text;
			ret.ftp_watts = params.ftp_watts;
			ret.t_pace = params.t_pace;
			ret.swim_css = params.swim_css;
			ret.efficiency_factor = params.efficiency_factor;
			ret.sport_type = params.sport_type;
			ret.output_unit = params.output_unit;
			ret.email = params.email;
			ret.page = params.page;
			ret.should_round = params.should_round;
			return ret;
		}

		loadFromURL(): void {
			var params = getQueryParams();
			if (params.t != null && params.t.trim() != 0) {
				this.workout_title = params.t;
			}

			if (params.w != null && params.w.trim() != 0) {
				this.workout_text = params.w;
			}

			if (params.ftp != null && params.ftp.trim() != 0) {
				this.ftp_watts = params.ftp;
			}

			if (params.tpace != null && params.tpace.trim() != 0) {
				this.t_pace = params.tpace;
			}

			if (params.css != null && params.css.trim() != 0) {
				this.swim_css = params.css;
			}

			if (params.ef != null && params.ef.trim() != 0) {
				this.efficiency_factor = params.ef;
			}

			if (params.st != null && params.st.trim() != 0) {
				this.sport_type = params.st;
			}

			if (params.ou != null && params.ou.trim() != 0) {
				this.output_unit = params.ou;
			}
			if (params.email != null && params.email.trim() != 0) {
				this.email = params.email;
			}

			// Load the workout when its encoded
			if (params.wh != null) {
				if (params.wh.startsWith("web+wp://")) {
					var workout_hash = params.wh.substr(9, params.wh.length);
					var buffer = zlib.inflateSync(new Buffer(workout_hash, 'base64')).toString('utf8');
					console.assert(buffer != null);
					this.workout_text = buffer;
				}
			}

			if (params.page != null && params.page.trim() != 0) {
				this.page = params.page;
			}

			if (params.should_round != null && params.should_round.trim() != 0) {
				this.should_round = params.should_round;
			}
		}

		loadFromStorage(): void {
			{
				let value = new PersistedItem("title").load();
				if (value != null && value.trim().length != 0) {
					this.workout_title = value;
				}
			}

			{
				let value = new PersistedItem("workout").load();
				if (value != null && value.trim().length != 0) {
					this.workout_text = value;
				}
			}

			{
				let value = new PersistedItem("ftp_watts").load();
				if (value != null && value.trim().length != 0) {
					this.ftp_watts = value;
				}
			}

			{
				let value = new PersistedItem("t_pace").load();
				if (value != null && value.trim().length != 0) {
					this.t_pace = value;
				}
			}

			{
				let value = new PersistedItem("swim_css").load();
				if (value != null && value.trim().length != 0) {
					this.swim_css = value;
				}
			}

			{
				let value = new PersistedItem("ef").load();
				if (value != null && value.trim().length != 0) {
					this.efficiency_factor = value;
				}
			}

			{
				let value = new PersistedItem("sport_type").load();
				if (value != null && value.trim().length != 0) {
					this.sport_type = value;
				}
			}

			{
				let value = new PersistedItem("output_unit").load();
				if (value != null && value.trim().length != 0) {
					this.output_unit = value;
				}
			}

			{
				let value = new PersistedItem("email").load();
				if (value != null && value.trim().length != 0) {
					this.email = value;
				}
			}

			{
				let value = new PersistedItem("efficiency_factor").load();
				if (value != null && value.trim().length != 0) {
					this.efficiency_factor = value;
				}
			}

			{
				let value = new PersistedItem("page").load();
				if (value != null && value.trim().length != 0) {
					this.page = value;
				}
			}

			{
				let value = new PersistedItem("should_round").load();
				if (value != null && value.trim().length != 0) {
					this.should_round = value;
				}
			}			
		}

		saveToStorage(): void {
			if (this.hasWorkoutTitle()) {
				new PersistedItem("title").save(this.workout_title);
			}

			if (this.hasWorkoutText()) {
				new PersistedItem("workout").save(this.workout_text);
			}

			if (this.hasFtpWatts()) {
				new PersistedItem("ftp_watts").save(this.ftp_watts);
			}

			if (this.hasTPace()) {
				new PersistedItem("t_pace").save(this.t_pace);
			}

			if (this.hasSwimCSS()) {
				new PersistedItem("swim_css").save(this.swim_css);
			}

 			if (this.hasEfficiencyFactor()) {
				new PersistedItem("ef").save(this.efficiency_factor);
			}

			if (this.hasSportType()) {
				new PersistedItem("sport_type").save(this.sport_type);
			}


			if (this.hasOutputUnit()) {
				new PersistedItem("output_unit").save(this.output_unit);
			}

			if (this.hasEmail()) {
				new PersistedItem("email").save(this.email);
			}

			if (this.hasEfficiencyFactor()) {
				new PersistedItem("efficiency_factor").save(this.efficiency_factor);
			}
				
			if (this.hasPage()) {
				new PersistedItem("page").save(this.page);
			}

			if (this.hasShouldRound()) {
				new PersistedItem("should_round").save(this.should_round);
			}			
		}

		hasWorkoutTitle() : boolean {
			return typeof (this.workout_title) != 'undefined' && this.workout_title != "";
		}

		hasWorkoutText() : boolean {
			return typeof (this.workout_text) != 'undefined' && this.workout_text != "";
		}

		hasFtpWatts() : boolean {
			return typeof (this.ftp_watts) != 'undefined' && this.ftp_watts != "";
		}

		hasTPace() : boolean {
			return typeof (this.t_pace) != 'undefined' && this.t_pace != "";
		}

		hasSwimCSS() : boolean {
			return typeof (this.swim_css) != 'undefined' && this.swim_css != "";
		}

		hasEfficiencyFactor() : boolean {
			return typeof (this.efficiency_factor) != 'undefined' && this.efficiency_factor != "";
		}

		hasSportType() : boolean {
			return typeof (this.sport_type) != 'undefined' && this.sport_type != "";
		}

		hasOutputUnit() : boolean {
			return typeof (this.output_unit) != 'undefined' && this.output_unit != "";
		}

		hasEmail() : boolean {
			return typeof (this.email) != 'undefined' && this.email != "";
		}

		hasPage() : boolean {
			return typeof (this.page) != 'undefined' && this.page != "";
		}

		hasShouldRound() : boolean {
			return typeof (this.should_round) != 'undefined' && this.should_round != "";
		}		

		validate(): boolean {
			return this.hasWorkoutTitle() &&
				this.hasWorkoutText() &&
				this.hasFtpWatts() &&
				this.hasTPace() &&
				this.hasSwimCSS() &&
				this.hasEfficiencyFactor() &&
				this.hasSportType() &&
				this.hasOutputUnit() &&
				this.hasEmail();
				// intentially missed the page and should_round. the default will be the main page
		}

		getURL(): string {
			let res = "?";

			if (this.hasWorkoutTitle()) {
				res += "t=" + encodeURIComponent(this.workout_title);
			}

			if (this.hasWorkoutText()) {
				res += "&w=" + encodeURIComponent(this.workout_text);
			}

			if (this.hasSportType()) {
				res += "&st=" + encodeURIComponent(this.sport_type);
			}

			if (this.hasFtpWatts()) {
				res += "&ftp=" + encodeURIComponent(this.ftp_watts);
			}

			if (this.hasTPace()) {
				res += "&tpace=" + encodeURIComponent(this.t_pace);
			}

			if (this.hasSwimCSS()) {
				res += "&css=" + encodeURIComponent(this.swim_css);
			}

			if (this.hasEfficiencyFactor()) {
				res += "&ef=" + encodeURIComponent(this.efficiency_factor);
			}

			if (this.hasOutputUnit()) {
				res += "&ou=" + encodeURIComponent(this.output_unit);
			}

			if (this.hasEmail()) {
				res += "&email=" + encodeURIComponent(this.email);
			}

			if (this.hasPage()) {
				res += "&page=" + encodeURIComponent(this.page);
			}

			if (this.hasShouldRound()) {
				res += "&sr=" + encodeURIComponent(this.should_round);
			}

			return res;
		}

		createUserProfile(): Model.UserProfile {
			if (this.validate()) {
				let result = new Model.UserProfile(parseInt(this.ftp_watts), this.t_pace, this.swim_css, this.email);
				result.setEfficiencyFactor(parseFloat(this.efficiency_factor));
				return result;
			} else {
				return null;
			}
		}

		createWorkoutBuilder(): Model.WorkoutBuilder {
			if (this.validate()) {
				let result = new Model.WorkoutBuilder(this.createUserProfile(),
					parseInt(this.sport_type), parseInt(this.output_unit));
				result.withDefinition(this.workout_title, this.workout_text);
				return result;
			} else {
				return null;
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

}

export = UI;
/// <reference path="type_definitions/node.d.ts" />
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

export class QueryParams {
	public ftp_watts: string;
	public t_pace: string;
	public swim_css: string;
	public email: string;

	public workout_text: string;
	public sport_type: string;
	public output_unit: string;
	

	constructor(workout_text: string = "",
		ftp_watts: string = "",
		t_pace: string = "",
		swim_css: string = "",
		sport_type: string = "",
		output_unit: string = "",
		email: string = "") {

		this.workout_text = workout_text;
		this.ftp_watts = ftp_watts;
		this.t_pace = t_pace;
		this.swim_css = swim_css;
		this.sport_type = sport_type;
		this.output_unit = output_unit;
		this.email = email;

		if (!this.validate()) {
			if (!this.loadFromURL()) {
				this.loadFromStorage();
			}
		}
	}

	static createCopy(params: QueryParams) : QueryParams {
		var ret = new QueryParams();
		ret.workout_text = params.workout_text;
		ret.ftp_watts = params.ftp_watts;
		ret.t_pace = params.t_pace;
		ret.swim_css = params.swim_css;
		ret.sport_type = params.sport_type;
		ret.output_unit = params.output_unit;
		ret.email = params.email;
		return ret;
	}

	loadFromURL(): boolean {
		var params = getQueryParams();
		this.workout_text = params.w;
		this.ftp_watts = params.ftp;
		this.t_pace = params.tpace;
		this.swim_css = params.swim_css;
		this.sport_type = params.st;
		this.output_unit = params.ou;
		this.email = params.email;
		return this.validate();
	}

	loadFromStorage(): boolean {
		this.workout_text = new PersistedItem("workout").load();
		this.ftp_watts = new PersistedItem("ftp_watts").load();
		this.t_pace = new PersistedItem("t_pace").load();
		this.swim_css = new PersistedItem("swim_css").load();
		this.sport_type = new PersistedItem("sport_type").load();
		this.output_unit = new PersistedItem("output_unit").load();
		this.email = new PersistedItem("email").load();
		return this.validate();
	}

	saveToStorage(): void {
		new PersistedItem("workout").save(this.workout_text);
		new PersistedItem("ftp_watts").save(this.ftp_watts);
		new PersistedItem("t_pace").save(this.t_pace);
		new PersistedItem("swim_css").save(this.swim_css);
		new PersistedItem("sport_type").save(this.sport_type);
		new PersistedItem("output_unit").save(this.output_unit);
		new PersistedItem("email").save(this.email);
	}

	validate(): boolean {
		return typeof(this.workout_text) != 'undefined' && this.workout_text != "" &&
			typeof(this.ftp_watts) != 'undefined' && this.ftp_watts != "" &&
			typeof(this.t_pace) != 'undefined' && this.t_pace != "" &&
			typeof(this.swim_css) != 'undefined' && this.swim_css != "" &&
			typeof(this.sport_type) != 'undefined' && this.sport_type != "" &&
			typeof(this.output_unit) != 'undefined' && this.output_unit != "" &&
			typeof(this.email) != 'undefined' && this.email != "";
	}

	getURL(): string {
		return "?w=" + encodeURIComponent(this.workout_text) +
			"&st=" + encodeURIComponent(this.sport_type) +
			"&ftp=" + encodeURIComponent(this.ftp_watts) +
			"&tpace=" + encodeURIComponent(this.t_pace) +
			"&css=" + encodeURIComponent(this.swim_css) +
			"&ou=" + encodeURIComponent(this.output_unit) +
			"&email=" + encodeURIComponent(this.email);
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
	static validateEmail(email: string) : boolean {
    	var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    	return re.test(email);
	}

	static validateNumber(num: string) : boolean {
		if (num == null || num.trim().length == 0) {
			return false;
		} else {
			var num_val = parseFloat(num);
			return !isNaN(num_val);
		}
	}
}

export class ClipboardHelper {
	static copyText(text: string) : void {
		var textArea : HTMLTextAreaElement = document.createElement("textarea");

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
import * as React from 'react';
import * as UI from '../ui';
import * as Core from '../core';
import UserSettings from './user_settings';
import WorkoutInput from './workout_input';
import WorkoutView from './workout_view';
import { DominantUnitVisitor } from '../visitor';

export default class Workout extends React.Component<any, any> {
	params: UI.QueryParamsWorkoutView;
	private input = React.createRef<WorkoutInput>();
	private view = React.createRef<WorkoutView>();
	private playerLink = React.createRef<HTMLAnchorElement>();
	private listLink = React.createRef<HTMLAnchorElement>();
	private emailSendWorkout = React.createRef<HTMLAnchorElement>();
	private saveWorkout = React.createRef<HTMLAnchorElement>();
	private round = React.createRef<HTMLInputElement>();
	private settings = React.createRef<UserSettings>();

	constructor(props: any) {
		super(props);
		this.params = UI.QueryParamsWorkoutView.createCopy(props);
	}

	getDominantUnit(params: UI.QueryParamsWorkoutView) {
		try {
			let workout_builder = params.createWorkoutBuilder();
			return workout_builder != null ? DominantUnitVisitor.computeIntensity(workout_builder.getInterval()) : null;
		} catch (Error) {
			return Core.IntensityUnit.Unknown;
		}
	}

	_onWorkoutInputChanged(sportType: Core.SportType, outputUnit: Core.IntensityUnit, workout_title: string, workout_text: string) {
		this.params.sport_type.value = sportType.toString();
		this.params.output_unit.value = outputUnit.toString();
		this.params.workout_text.value = workout_text;
		this.params.workout_title.value = workout_title;

		let dominant_unit : Core.IntensityUnit = this.getDominantUnit(this.params);
		// Don't override the unit if its IF since its too generic.
		if (dominant_unit != null &&
			dominant_unit != Core.IntensityUnit.Unknown &&
			dominant_unit != Core.IntensityUnit.IF) {
			this.input.current?.setOutputUnit(dominant_unit);
		}

		this.refresh();
	}

	_onUserSettingsChanged(ftp: number, t_pace: string, swim_css: string, swim_ftp: string, email: string, efficiency_factor: string) {
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
		// Put here which is guaranteed for the DOM tree to be created
		this.refreshUrls();
	}

	refresh() {
		this.view.current?.refresh(this.params);

		this.refreshUrls();

		this.params.saveToStorage();
	}

	refreshUrls() {
		let params = UI.QueryParamsWorkoutView.createCopy(this.params);
		window.history.pushState('Object', 'Title', this.params.getURL());

		params.page.value = "player";
		this._setHref(this.playerLink, params.getURL());

		params.page.value = "list";
		this._setHref(this.listLink, params.getURL());
	}

	_setHref(element_ref: React.RefObject<HTMLAnchorElement>, url: string) {
		if (element_ref.current) {
			element_ref.current.href = url;
		}
	}

	_setVisibility(element_ref: React.RefObject<HTMLAnchorElement>, visible: boolean) {
		if (element_ref.current) {
			element_ref.current.hidden = !visible;
		}
	}

	_onEmailWorkout() {
		var req = new XMLHttpRequest();
		req.addEventListener("load", this._onEmailSent.bind(this, req));
		req.open("GET", "send_mail" + this.params.getURL());
		req.send();
	}

	_onEmailSent(req: XMLHttpRequest) {
		if (req.status == 200) {
			alert("Email sent");
		} else {
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

	_onWorkoutSaved(req: XMLHttpRequest) {
		if (req.status == 200) {
			alert("Workout saved");
		} else {
			alert("Error while saving workouts");
			console.log(req.responseText);
		}
	}

	_onClickLink() {
		let builder = this.params.createWorkoutBuilder();

		// Download both files (mrc and zwo)
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

	_shouldRound() : boolean {
		return this.round.current?.checked || false;
	}

	_onCheckedChanged() : void {
		this.params.should_round.value = "" + this._shouldRound();
		this.refresh();
	}

	_downloadFile(fileName: string, content: string) {
		let uriContent = "data:application/octet-stream," + encodeURIComponent(content);

		var link = document.createElement('a');
		link.download = fileName;
		link.href = uriContent;
		link.click();
	}

	_onPrettyPrint() {
		let builder = this.params.createWorkoutBuilder();
		this.input.current?.setWorkoutText(builder.getNormalizedWorkoutDefinition());
	}

	render() {
		return (<div>
			<UserSettings {...this.props} ref={this.settings} onChange={(f, t, c, sf, e, ef) => this._onUserSettingsChanged(f, t, c, sf, e, ef)}></UserSettings>
			<WorkoutInput {...this.props} ref={this.input} onChange={(s, o, t, w) => this._onWorkoutInputChanged(s, o, t, w)}></WorkoutInput>
			<table>
				<tbody>
					<tr>
						<td><a href="#" onClick={(e) => this._onClickLink()}>Download Files</a></td>
						<td><a ref={this.playerLink}>Player</a></td>
						<td><a href="#" onClick={(e) => this._onPrettyPrint()}>Pretty print</a></td>
						<td><a ref={this.emailSendWorkout} href="#" onClick={(e) => this._onEmailWorkout()}>Email Workout</a></td>
						<td><a ref={this.saveWorkout} href="#" onClick={(e) => this._onSaveWorkout()}>Save Workout</a></td>
						<td><a ref={this.listLink}>List Workouts</a></td>
					</tr>
				</tbody>
			</table>
			<input type="checkbox" ref={this.round} onChange={this._onCheckedChanged.bind(this)} />Round intensities <br />
			<WorkoutView {...this.props} ref={this.view}></WorkoutView>
		</div>);
	}
}

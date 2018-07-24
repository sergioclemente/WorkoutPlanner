import * as React from 'react';
import * as UI from '../ui';
import * as Model from '../model';
import UserSettings from './user_settings';
import WorkoutInput from './workout_input';
import WorkoutView from './workout_view';

export default class Workout extends React.Component<any, any> {
	params: UI.QueryParams;

	constructor(props: any) {
		super(props);
		this.params = UI.QueryParams.createCopy(props);
	}

	_onWorkoutInputChanged(sportType: Model.SportType, outputUnit: Model.IntensityUnit, workout_title: string, workout_text: string) {
		this.params.sport_type = sportType.toString();
		this.params.output_unit = outputUnit.toString();
		this.params.workout_text = workout_text;
		this.params.workout_title = workout_title;

		let dominant_unit : Model.IntensityUnit = this.params.getDominantUnit();
		// Don't override the unit if its IF since its too generic.
		if (dominant_unit != Model.IntensityUnit.Unknown &&
			dominant_unit != Model.IntensityUnit.IF) {
			let input: WorkoutInput = this.refs['input'] as WorkoutInput;
			input.setOutputUnit(dominant_unit);
		}
		

		this.refresh();
	}

	_onUserSettingsChanged(ftp: number, t_pace: string, swim_css: string, email: string, efficiency_factor: string) {
		if (!isNaN(ftp)) {
			this.params.ftp_watts = ftp.toString();	
		}
		this.params.t_pace = t_pace;
		this.params.swim_css = swim_css;
		this.params.email = email;
		this.params.efficiency_factor = efficiency_factor;
		this.refresh();
	}

	componentDidMount() {
		// Put here which is guaranteed for the DOM tree to be created
		this.refreshUrls();
	}

	refresh() {
		var view: WorkoutView = this.refs['view'] as WorkoutView;
		view.refresh(this.params);

		this.refreshUrls();

		this.params.saveToStorage();
	}

	refreshUrls() {
		let params = UI.QueryParams.createCopy(this.params);
		params.page = "player";
		
		this._setHref("player_link", params.getURL());

		window.history.pushState('Object', 'Title', this.params.getURL());
	}

	_setHref(element_ref: string, url: string) {
		var anchor = this.refs[element_ref] as HTMLAnchorElement;
		anchor.href = url;
	}

	_setVisibility(element_ref: string, visible: boolean) {
		var anchor = this.refs[element_ref] as HTMLAnchorElement;
		anchor.hidden = !visible;
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
		return (this.refs["round"] as HTMLInputElement).checked;
	}

	_onCheckedChanged() : void {
		this.params.should_round = "" + this._shouldRound();
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
		let input: WorkoutInput = this.refs['input'] as WorkoutInput;

		let builder = this.params.createWorkoutBuilder();
		input.setWorkoutText(builder.getNormalizedWorkoutDefinition());
	}

	render() {
		return (<div>
			<UserSettings {...this.props} ref='settings' onChange={(f, t, c, e, ef) => this._onUserSettingsChanged(f, t, c, e, ef)}></UserSettings>
			<WorkoutInput {...this.props} ref='input' onChange={(s, o, t, w) => this._onWorkoutInputChanged(s, o, t, w)}></WorkoutInput>
			<table>
				<tbody>
					<tr>
						<td><a href="#" onClick={(e) => this._onClickLink()}>Download Files</a></td>
						<td><a ref="player_link">Player</a></td>
						<td><a href="#" onClick={(e) => this._onPrettyPrint()}>Pretty print</a></td>
						<td><a ref="email_send_workout" href="#" onClick={(e) => this._onEmailWorkout()}>Email Workout</a></td>
						<td><a ref="save_workout" href="#" onClick={(e) => this._onSaveWorkout()}>Save Workout</a></td>
						<td><a href="?page=list">List Workouts</a></td>
					</tr>
				</tbody>
			</table>
			<input type="checkbox" ref="round" onChange={this._onCheckedChanged.bind(this)} />Round intensities <br />			
			<WorkoutView {...this.props} ref='view'></WorkoutView>
		</div>);
	}
}

import {SportType, Duration, UserProfile, ObjectFactory, DistanceUnit, StepBuildInterval, Intensity, BaseInterval, Interval, RepeatInterval, ArrayInterval, SimpleInterval, DurationUnit, DurationUnitHelper, IntensityUnitHelper, IntensityUnit, RampBuildInterval, CommentInterval, stringFormat, MyMath, TimeUnit, PreconditionsCheck, FormatterHelper} from './core';

module Model {
	export class VisitorHelper {
		static visitAndFinalize(visitor: Visitor, interval: Interval): any {
			this.visit(visitor, interval);
			visitor.finalize();
		}
		static visit(visitor: Visitor, interval: Interval): any {
			if (interval instanceof SimpleInterval) {
				return visitor.visitSimpleInterval(<SimpleInterval>interval);
			} else if (interval instanceof StepBuildInterval) {
				return visitor.visitStepBuildInterval(<StepBuildInterval>interval);
			} else if (interval instanceof RampBuildInterval) {
				return visitor.visitRampBuildInterval(<RampBuildInterval>interval);
			} else if (interval instanceof RepeatInterval) {
				return visitor.visitRepeatInterval(<RepeatInterval>interval);
			} else if (interval instanceof ArrayInterval) {
				return visitor.visitArrayInterval(<ArrayInterval>interval);
			} else if (interval instanceof CommentInterval) {
				return visitor.visitCommentInterval(<CommentInterval>interval);
			} else {
				console.assert(false, "invalid type!");
				return null;
			}
		}
	}

	export interface Visitor {
		visitCommentInterval(interval: CommentInterval): void;
		visitSimpleInterval(interval: SimpleInterval): void;
		visitStepBuildInterval(interval: StepBuildInterval): void;
		visitRampBuildInterval(interval: RampBuildInterval): void;
		visitRepeatInterval(interval: RepeatInterval): void;
		visitArrayInterval(interval: ArrayInterval): void;
		finalize(): void;
	}

	export class TreePrinterVisitor implements Visitor {
		private output: string = "";
		private indentation: number = 0;

		visitCommentInterval(interval: CommentInterval): void {
			this.indent();
			this.output += stringFormat("Comment({0})\n", interval.getTitle())
		}

		visitSimpleInterval(interval: SimpleInterval): void {
			this.indent();
			if (interval.getRestDuration().getValue() > 0) {
				this.output += stringFormat("SimpleInterval({0}, {1}, {2}, {3})\n", interval.getWorkDuration().toString(), TreePrinterVisitor.getIntensityPretty(interval.getIntensity()), interval.getTitle(), interval.getRestDuration().toString());
			} else {
				this.output += stringFormat("SimpleInterval({0}, {1}, {2})\n", interval.getWorkDuration().toString(), TreePrinterVisitor.getIntensityPretty(interval.getIntensity()), interval.getTitle());
			}
		}
		visitStepBuildInterval(interval: StepBuildInterval): void {
			this.indent();
			this.output += "StepBuildInterval(\n"
			this.indentation++;
			for (var i = 0; i < interval.getIntervals().length; i++) {
				VisitorHelper.visit(this, interval.getIntervals()[i]);
			}
			this.indentation--;
			this.indent();
			this.output += ")\n";
		}
		visitRampBuildInterval(interval: RampBuildInterval): void {
			this.indent();
			this.output += stringFormat("BuildInterval({0}, {1}, {2}, {3})\n", interval.getWorkDuration().toString(), TreePrinterVisitor.getIntensityPretty(interval.getStartIntensity()), TreePrinterVisitor.getIntensityPretty(interval.getEndIntensity()), interval.getTitle());
		}

		visitRepeatInterval(interval: RepeatInterval) {
			this.indent();
			this.output += stringFormat("RepeatInterval(count={0}, {1}\n", interval.getRepeatCount(), interval.getTitle());
			this.indentation++;
			for (var i = 0; i < interval.getIntervals().length; i++) {
				VisitorHelper.visit(this, interval.getIntervals()[i]);
			}
			this.indentation--;
			this.indent();
			this.output += ")\n";
		}
		visitArrayInterval(interval: ArrayInterval) {
			this.indent();
			this.indentation++;
			this.output += "ArrayInterval(\n";
			for (var i = 0; i < interval.getIntervals().length; i++) {
				VisitorHelper.visit(this, interval.getIntervals()[i]);
			}
			this.indentation--;
			this.indent();
			this.output += ")\n";
		}
		finalize(): void {
		}

		indent(): void {
			for (let i = 0; i < this.indentation; i++) {
				this.output += "\t";
			}
		}

		getOutput(): string {
			return this.output;
		}

		static getIntensityPretty(intensity: Intensity) {
			if (intensity.isEasy()) {
				return "";
			} else {
				return intensity.toString();
			}
		}

		static Print(interval: Interval): string {
			let tree_printer = new TreePrinterVisitor();
			VisitorHelper.visitAndFinalize(tree_printer, interval);
			return tree_printer.getOutput();
		}
    }

	export abstract class BaseVisitor implements Visitor {

		visitCommentInterval(/*interval: CommentInterval*/): void {
			// nothing to do
		}

		abstract visitSimpleInterval(interval: SimpleInterval): void;
		visitStepBuildInterval(interval: StepBuildInterval): void {
			// Generic implementation
			for (var i = 0; i < interval.getRepeatCount(); i++) {
				// step interval
				VisitorHelper.visit(this, interval.getStepInterval(i));

				// rest interval
				VisitorHelper.visit(this, interval.getRestInterval());
			}
		}
		abstract visitRampBuildInterval(interval: RampBuildInterval): void;

		visitRepeatInterval(interval: RepeatInterval) {
			for (var i = 0; i < interval.getRepeatCount(); i++) {
				this.visitArrayInterval(interval);
			}
		}
		visitArrayInterval(interval: ArrayInterval) {
			for (var i = 0; i < interval.getIntervals().length; i++) {
				VisitorHelper.visit(this, interval.getIntervals()[i]);
			}
		}
		finalize(): void {
		}
    }

    // Moving average class.
	// 
	// The constructor receives the window size which is used to compute the average.
	// The behavior should be similar to a sliding window as old values are discarded
	// once the number of elements is equal to the window_size.
	//
	// Simply call insert(value) with the values
	// and whenever needed the moving average then
	// call get_moving_average()
	export class MovingAverage {
		private values = [];
		private window_size = 0;
		private end = 0;

		constructor(window_size: number) {
			PreconditionsCheck.assertTrue(window_size > 0);
			this.window_size = window_size;
		}

		insert(v: number): void {
			if (this.values.length < this.window_size) {
				this.values.push(v);
			} else {
				this.values[this.end] = v;
				this.end = (this.end + 1) % this.values.length;
			}
		}

		get_moving_average(): number {
			if (this.values.length == 0) {
				return null;
			}

			let sum = 0;
			for (let i = 0; i < this.values.length; i++) {
				sum += this.values[i];
			}

			return sum / this.values.length;
		}

		is_full(): boolean {
			return this.values.length == this.window_size;
		}
    }
    
	// Because IF are usually > 0 and < 1, using IF directly creates
	// incorrect results for the AVG IF, so we use a artificial FTP here
	// in order to compute the NP Power, since the only exposed member
	// from this class is the IF.
	export let FTP: number = 256;

	// Calculate the IF similar to how the NP is calculated.
	// 
	// Calculate a 30-second rolling average of the power data
	// * Raise these values to the fourth power
	// * Average the resulting values
	// * Take the fourth root of the result
	export class NPVisitor extends BaseVisitor {
		private sum: number = 0;
		private count: number = 0;
		private ma: MovingAverage = new MovingAverage(/*window_size=*/30);
		private np: number = 0;

		visitSimpleInterval(interval: SimpleInterval): void {
			var duration = interval.getWorkDuration().getSeconds();
			var watts_pow_4 = Math.pow(interval.getIntensity().getValue() * FTP, 4);

			for (let t = 0; t < duration; t++) {
				this._insert_and_flush(watts_pow_4);
			}
		}
		visitRampBuildInterval(interval: RampBuildInterval): void {
			var start_watts = interval.getStartIntensity().getValue() * FTP;
			var end_watts = interval.getEndIntensity().getValue() * FTP;
			var duration = interval.getWorkDuration().getSeconds();

			// Right way to estimate the intensity is by doing incremental of 1 sec
			for (var t = 0; t < duration; t++) {
				var current_watts = start_watts + (end_watts - start_watts) * (t / duration);
				var current_watts_pow_4 = 1 * Math.pow(current_watts, 4);
				this._insert_and_flush(current_watts_pow_4);
			}
		}

		_insert_and_flush(value: number): void {
			this.ma.insert(value);
			if (this.ma.is_full()) {
				this.sum += this.ma.get_moving_average();
				this.count += 1;
			}
		}

		finalize(): void {
			// If the moving average was never "flushed"
			// we then flush so that we have some values
			// to compute.
			if (!this.ma.is_full()) {
				this.sum += this.ma.get_moving_average();
				this.count += 1;
			}
			this.np = MyMath.round10(Math.sqrt(Math.sqrt(this.sum / this.count)), -1);
		}

		getIF(): number {
			return MyMath.round10(this.np / FTP, -1);
		}
    }
	export class DominantUnitVisitor extends BaseVisitor {
		private intensity_unit: IntensityUnit = null;
		private duration_unit: DurationUnit = null;

		visitSimpleInterval(interval: SimpleInterval): void {
			this.updateIntensity(interval.getIntensity());
			this.updateDuration(interval.getWorkDuration());
		}

		visitRampBuildInterval(interval: RampBuildInterval): void {
			this.updateIntensity(interval.getStartIntensity());
			this.updateIntensity(interval.getEndIntensity());
			this.updateDuration(interval.getWorkDuration());
		}

		private updateIntensity(intensity: Intensity) {
			if (this.intensity_unit == null) {
				this.intensity_unit = intensity.getOriginalUnit();
			} else {
				if (this.intensity_unit != intensity.getOriginalUnit()) {
					this.intensity_unit = IntensityUnit.Unknown;
				}
			}
		}

		private updateDuration(duration: Duration) {
			if (this.duration_unit == null) {
				this.duration_unit = duration.getUnit();
			} else {
				if (this.duration_unit != duration.getUnit()) {
					this.duration_unit = DistanceUnit.Unknown;
				}
			}
		}

		static computeIntensity(interval: Interval): IntensityUnit {
			let dominant = new DominantUnitVisitor();
			VisitorHelper.visit(dominant, interval);
			return dominant.intensity_unit == null ? IntensityUnit.Unknown : dominant.intensity_unit;
		}

		static computeDuration(interval: Interval): DurationUnit {
			let dominant = new DominantUnitVisitor();
			VisitorHelper.visit(dominant, interval);
			return dominant.duration_unit == null ? DistanceUnit.Unknown : dominant.duration_unit;
		}
	}

	// TSS = [(s x NP x IF) / (FTP x 3600)] x 100
	// IF = NP / FTP
	// TSS = [(s x NP x NP/FTP) / (FTP x 3600)] x 100
	// TSS = [s x (NP / FTP) ^ 2] / 36
	export class TSSVisitor extends BaseVisitor {
		private tss: number = 0;

		visitSimpleInterval(interval: SimpleInterval): void {
			var duration = interval.getWorkDuration().getSeconds();
			var intensity = interval.getIntensity().getValue();
			var val = duration * Math.pow(intensity, 2);
			this.tss += val;
		}
		visitRampBuildInterval(interval: RampBuildInterval): void {
			var startIntensity = interval.getStartIntensity().getValue();
			var endIntensity = interval.getEndIntensity().getValue();
			var duration = interval.getWorkDuration().getSeconds();

			// Right way to estimate the intensity is by doing incremental of 1 sec
			for (var t = 0; t < duration; t++) {
				var intensity = startIntensity + (endIntensity - startIntensity) * (t / duration);
				var val = 1 * Math.pow(intensity, 2);
				this.tss += val;
			}
		}

		getTSS(): number {
			return MyMath.round10(this.tss / 36, -1);
		}
    }

	export class ZonesMap {
		public static getZoneMap(sportType: SportType) {
			if (sportType == SportType.Bike || sportType == SportType.Other) {
				return {
					1: { name: "z1", low: 0.00, high: 0.55 },
					2: { name: "z2", low: 0.55, high: 0.75 },
					3: { name: "z3", low: 0.75, high: 0.90 },
					4: { name: "z4", low: 0.90, high: 1.05 },
					5: { name: "z5", low: 1.05, high: 1.2 },
					6: { name: "z6", low: 1.20, high: 10 },
				};
			} else if (sportType == SportType.Run) {
				return {
					1: { name: "z1", low: 0.00, high: 0.76 },
					2: { name: "z2", low: 0.76, high: 0.87 },
					3: { name: "z3", low: 0.87, high: 0.94 },
					4: { name: "z4", low: 0.94, high: 1.01 },
					5: { name: "z5", low: 1.01, high: 1.10 },
					6: { name: "z6", low: 1.10, high: 10 },
				};
			} else if (sportType == SportType.Swim) {
				return {
					1: { name: "z1", low: 0.00, high: 0.84 },
					2: { name: "z2", low: 0.84, high: 0.89 },
					3: { name: "z3", low: 0.89, high: 0.95 },
					4: { name: "z4", low: 0.95, high: 1.01 },
					5: { name: "z5", low: 1.01, high: 1.05 },
					6: { name: "z6", low: 1.05, high: 10 },
				};
			} else {
				return {};
			}
		}
	}

	export class ZonesVisitor extends BaseVisitor {
		private zones = {};
		private sportType: SportType;

		constructor(sportType: SportType) {
			super();
			this.zones = {};
			this.sportType = sportType;

			// Create the zones manually. Something like the following
			// 1 : {name:"Z1", range:"(0,55%]", value:0},
			// 2 : {name:"Z2", range:"(55%;75%]", value:0},
			// 3 : {name:"Z3", range:"(75%;90%]", value:0},
			// 4 : {name:"Z4", range:"(90%;105%]", value:0},
			// 5 : {name:"Z5", range:"(105%;120%]", value:0},
			// 6 : {name:"Z6+", range:"(120%;+oo)", value:0},
			var zone_map = ZonesMap.getZoneMap(this.sportType);
			for (var zone = 1; zone <= 6; zone++) {
				var zone_obj = zone_map[zone];
				this.zones[zone] = {
					name: zone_obj.name,
					range: "[" + Math.floor(zone_obj.low * 100) + "%;" + Math.floor(zone_obj.high * 100) + "%)",
					value: 0,
				};
			}
		}

		public static getZone(sportType: SportType, intensity: number): number {
			var zone_map = ZonesMap.getZoneMap(sportType);
			for (var zone = 1; zone <= 5; zone++) {
				var zone_obj = zone_map[zone];
				if (intensity >= zone_obj.low && intensity < zone_obj.high) {
					return zone;
				}
			}
			return 6;
		}

		incrementZoneTime(intensity: number, numberOfSeconds: number) {
			var zone: number = ZonesVisitor.getZone(this.sportType, intensity);
			this.zones[zone].value += numberOfSeconds;
		}

		visitSimpleInterval(interval: SimpleInterval): void {
			this.incrementZoneTime(interval.getIntensity().getValue(), interval.getWorkDuration().getSeconds());
		}
		visitRampBuildInterval(interval: RampBuildInterval): void {
			var startIntensity = interval.getStartIntensity().getValue();
			var endIntensity = interval.getEndIntensity().getValue();
			var duration = interval.getWorkDuration().getSeconds();

			// Go on 1 second increments 
			var intensity = startIntensity;
			var intensityIncrement = (endIntensity - startIntensity) / duration;
			for (var t = 0; t < duration; t++) {
				this.incrementZoneTime(intensity, 1);
				intensity += intensityIncrement;
			}
		}

		getTimeInZones() {
			var result = [];
			for (var key in this.zones) {
				var zone = this.zones[key];
				if (zone.value > 0) {
					result.push({
						name: zone.name,
						range: zone.range,
						duration: new Duration(TimeUnit.Seconds, zone.value, 0, 0)
					});
				}
			}
			return result;
		}
    }
    
	export class Point {
		x: Duration;
		y: Intensity;
		label: string;
		tag: string;

		constructor(x: Duration, y: Intensity, label: string, tag: string) {
			this.x = x;
			this.y = y;
			this.label = label;
			this.tag = tag;
		}
	}

	export class DataPointVisitor extends BaseVisitor {
		private x: Duration = null;
		data: Point[] = [];

		initX(duration: Duration) {
			if (this.x == null) {
				this.x = new Duration(duration.getUnit(), 0, 0, 0);
			}
		}

		incrementX(duration: Duration) {
			this.x = Duration.combine(this.x, duration);
		}

		getIntervalTag(interval: Interval): string {
			if (interval.getIntensity().getOriginalUnit() == IntensityUnit.FreeRide) {
				return "free-ride";
			} else {
				return "if";
			}
		}

		visitSimpleInterval(interval: SimpleInterval) {
			var title = WorkoutTextVisitor.getIntervalTitle(interval);
			// Work interval
			this.initX(interval.getWorkDuration());
			this.data.push(new Point(this.x, interval.getIntensity(), title, this.getIntervalTag(interval)));
			this.incrementX(interval.getWorkDuration());
			this.data.push(new Point(this.x, interval.getIntensity(), title, this.getIntervalTag(interval)));
			if (interval.getRestDuration().getValue() > 0) {
				// Rest interval
				this.initX(interval.getRestDuration());
				this.data.push(new Point(this.x, Intensity.ZeroIntensity, title, this.getIntervalTag(interval)));
				this.incrementX(interval.getRestDuration());
				this.data.push(new Point(this.x, Intensity.ZeroIntensity, title, this.getIntervalTag(interval)));
			}
		}
		visitRampBuildInterval(interval: RampBuildInterval) {
			var title = WorkoutTextVisitor.getIntervalTitle(interval);
			this.initX(interval.getWorkDuration());
			this.data.push(new Point(this.x, interval.getStartIntensity(), title, this.getIntervalTag(interval)));
			this.incrementX(interval.getWorkDuration());
			this.data.push(new Point(this.x, interval.getEndIntensity(), title, this.getIntervalTag(interval)));
		}
	}

	export class ZwiftDataVisitor extends BaseVisitor {
		private content: string = "";

		constructor(name: string) {
			super();
			this.content = `<workout_file>
\t<author>Workout Planner Author</author>
\t<name>${name}</name>
\t<description>Auto generated by https://github.com/sergioclemente/WorkoutPlanner</description>
\t<tags>
\t\t<tag name="INTERVALS"/>
\t</tags>
\t<workout>\n`;
		}
		finalize() {
			this.content += `\t</workout>
</workout_file>`;
		}
		getIntervalTitle(interval: Interval) {
			var title = interval.getTitle();
			if (title.length == 0) {
				title = WorkoutTextVisitor.getIntervalTitle(interval);
			}
			return title;
		}
		escapeString(input: string) {
			return input.replace("\"", "\\\"");
		}
		visitSimpleInterval(interval: SimpleInterval) {
			var duration = interval.getWorkDuration().getSeconds();
			var title = this.escapeString(this.getIntervalTitle(interval));
			if (interval.getIntensity().getOriginalUnit() == IntensityUnit.FreeRide) {
				this.content += `\t\t<FreeRide Duration="${duration}" Pace="0">\n`;//TODO Configure PACE
				this.content += `\t\t\t<textevent timeoffset="0" message="${title}"/>\n`;
				this.content += `\t\t</FreeRide>\n`;
			} else {
				var intensity = interval.getIntensity().getValue();
				this.content += `\t\t<SteadyState Duration="${duration}" Power="${intensity}" Pace="0">\n`; //TODO Configure PACE
				this.content += `\t\t\t<textevent timeoffset="0" message="${title}"/>\n`;
				this.content += `\t\t</SteadyState>\n`;
			}
			// TODO: Add rest duration here
		}
		visitRampBuildInterval(interval: RampBuildInterval) {
			var duration = interval.getWorkDuration().getSeconds();
			var intensityStart = interval.getStartIntensity().getValue();
			var intensityEnd = interval.getEndIntensity().getValue();
			if (intensityStart < intensityEnd) {
				this.content += `\t\t<Warmup Duration="${duration}" PowerLow="${intensityStart}" PowerHigh="${intensityEnd}"/>\n`;
			} else {
				this.content += `\t\t<Cooldown Duration="${duration}" PowerLow="${intensityStart}" PowerHigh="${intensityEnd}"/>\n`;
			}
		}
		getContent(): string {
			return this.content;
		}
	}

	export class MRCCourseDataVisitor extends BaseVisitor {
		private courseData: string = "";
		private time: number = 0;
		private idx: number = 0;
		private fileName: string = "";
		private perfPRODescription: string = "";
		private content = "";
		private repeatIntervals: RepeatInterval[] = [];
		private repeatIteration: number[] = [];

		constructor(fileName: string) {
			super();
			this.fileName = fileName;
		}

		processCourseData(intensity: Intensity, durationInSeconds: number) {
			this.time += durationInSeconds;
			// Course Data has to be in minutes
			this.courseData += (this.time / 60) + "\t" + Math.round(intensity.getValue() * 100) + "\n";
		}

		processTitle(interval: Interval) {
			var title = interval.getTitle();
			if (title.length == 0) {
				title = WorkoutTextVisitor.getIntervalTitle(interval);
			}
			var suffix = "";
			if (this.repeatIntervals.length > 0) {
				console.assert(this.repeatIteration.length > 0);
				var iteration = 1 + this.repeatIteration[this.repeatIteration.length - 1];
				var total = this.repeatIntervals[this.repeatIntervals.length - 1].getRepeatCount();
				suffix = " | " + iteration + " of " + total;
			}
			this.perfPRODescription += "Desc" + this.idx++ + "=" + title + suffix + "\n";
		}

		visitSimpleInterval(interval: SimpleInterval) {
			this.processCourseData(interval.getIntensity(), 0);
			this.processCourseData(interval.getIntensity(), interval.getWorkDuration().getSeconds());
			this.processTitle(interval);
			// TODO: Add rest interval here
		}
		visitRampBuildInterval(interval: RampBuildInterval) {
			this.processCourseData(interval.getStartIntensity(), 0);
			this.processCourseData(interval.getEndIntensity(), interval.getWorkDuration().getSeconds());
			this.processTitle(interval);
		}

		visitRepeatInterval(interval: RepeatInterval) {
			this.repeatIntervals.push(interval);
			for (var i = 0; i < interval.getRepeatCount(); i++) {
				this.repeatIteration.push(i);
				this.visitArrayInterval(interval);
				this.repeatIteration.pop();
			}
			this.repeatIntervals.pop();
		}

		finalize() {
			this.content = "";
			this.content += "[COURSE HEADER]\n";
			this.content += "VERSION=2\n";
			this.content += "UNITS=ENGLISH\n";
			this.content += stringFormat("FILE NAME={0}\n", this.fileName);
			this.content += "MINUTES\tPERCENT\n";
			this.content += "[END COURSE HEADER]\n";

			this.content += "[COURSE DATA]\n";
			this.content += this.courseData;
			this.content += "[END COURSE DATA]\n";
			this.content += "[PERFPRO DESCRIPTIONS]\n";
			this.content += this.perfPRODescription;
			this.content += "[END PERFPRO DESCRIPTIONS]\n";
		}

		getContent(): string {
			return this.content;
		}
	}

	export class PPSMRXCourseDataVisitor extends BaseVisitor {
		private title: string = "";
		private content = "";
		private groupId = 1;
		private currentRepeatIteration = []
		private repeatCountMax = [];

		constructor(title: string) {
			super();
			this.title = title;
		}

		getTitlePretty(interval: BaseInterval): string {
			var title = interval.getTitle();
			if (title.length == 0) {
				title = WorkoutTextVisitor.getIntervalTitle(interval);
			}
			if (this.isGroupActive()) {
				title += " (" + (this.currentRepeatIteration[this.currentRepeatIteration.length - 1] + 1) + "/" + this.repeatCountMax[this.repeatCountMax.length - 1] + ")";
			}
			return title;
		}

		getGroupId(): number {
			if (this.isGroupActive()) {
				return this.groupId;
			} else {
				return 0;
			}
		}

		getMode(interval: Interval): string {
			if (interval.getIntensity().getOriginalUnit() == IntensityUnit.FreeRide) {
				return "T";
			} else {
				return "M";
			}
		}

		getIntensity(interval: Interval): number {
			if (interval.getIntensity().getOriginalUnit() == IntensityUnit.FreeRide) {
				return 0;
			} else {
				return Math.round(interval.getIntensity().getValue() * 100);
			}
		}

		// ["description","seconds","start","finish","mode","intervals","group","autolap","targetcad"]
		visitSimpleInterval(interval: SimpleInterval) {
			this.content += stringFormat(`\t\t["{0}",{1},{2},{2},"{3}",1,{4},0,90],\n`,
				this.getTitlePretty(interval),
				interval.getWorkDuration().getSeconds(),
				this.getIntensity(interval),
				this.getMode(interval),
				this.getGroupId()
			);
			// TODO: Add rest interval here
		}
		visitRampBuildInterval(interval: RampBuildInterval) {
			this.content += stringFormat(`\t\t["{0}",{1},{2},{3},"M",1,{3},0,90],\n`,
				this.getTitlePretty(interval),
				interval.getWorkDuration().getSeconds(),
				Math.round(interval.getStartIntensity().getValue() * 100),
				Math.round(interval.getEndIntensity().getValue() * 100),
				this.getGroupId()
			);
		}

		visitRepeatInterval(interval: RepeatInterval) {
			this.repeatCountMax.push(interval.getRepeatCount());
			for (var i = 0; i < interval.getRepeatCount(); i++) {
				this.currentRepeatIteration.push(i);
				this.visitArrayInterval(interval);
				this.currentRepeatIteration.pop();
			}
			this.repeatCountMax.pop();
			this.groupId++;
		}

		isGroupActive(): boolean {
			return this.repeatCountMax.length > 0;
		}

		finalize() {
			if (this.content.length > 0) {
				// Remove trailing ",\n"
				this.content = this.content.substr(0, this.content.length - 2);
				// Add just the "\n"
				this.content += "\n";
			}
			this.content = stringFormat(
				`{
	"type":"json",
	"createdby":"PerfPRO Studio v5.80.25",
	"version":5.00,
	"name":"{0}",
	"workoutType":"",
	"comments":"",
	"isLocked":0,
	"videoFile":"",
	"showCountDown":0,
	"showStep":0,
	"movieMode":0,
	"startMinute":0,
	"set_fields":["description","seconds","start","finish","mode","intervals","group","autolap","targetcad"],
	"sets":[
`, this.title) + this.content +
				`	]
}`;
		}

		getContent(): string {
			return this.content;
		}
    }
    
	export class WorkoutTextVisitor implements Visitor {
		result: string = "";
		userProfile: UserProfile = null;
		sportType: SportType = SportType.Unknown;
		outputUnit: IntensityUnit = IntensityUnit.Unknown;
		disableEasyTitle: boolean = false;
		roundValues: boolean = false;

		constructor(userProfile: UserProfile,
			sportType: SportType,
			outputUnit: IntensityUnit,
			roundValues: boolean) {
			PreconditionsCheck.assertIsNumber(sportType, "sportType");
			PreconditionsCheck.assertIsNumber(outputUnit, "outputUnit");

			this.userProfile = userProfile;
			this.sportType = sportType;
			this.outputUnit = outputUnit;
			this.roundValues = roundValues;
		}

		static getIntervalTitle(interval: Interval,
			userProfile: UserProfile = null,
			sportType: SportType = SportType.Unknown,
			outputUnit: IntensityUnit = IntensityUnit.Unknown,
			roundValues: boolean = true): string {
			var f = new WorkoutTextVisitor(userProfile, sportType, outputUnit, roundValues);
			VisitorHelper.visitAndFinalize(f, interval);

			return f.result;
		}

		visitCommentInterval(interval: CommentInterval): void {
			this.result += this.getIntervalTitle(interval);
		}

		visitRestInterval(interval: Interval): void {
			if (interval.getIntensity().isEasy()) {
				let title = this.getIntervalTitle(interval);
				if (title == null || title.trim().length == 0) {
					title = "easy";
				}
				this.result += interval.getWorkDuration().toStringShort(this.sportType == SportType.Swim) + " " + title;
			} else {
				this.result += interval.getWorkDuration().toStringShort(this.sportType == SportType.Swim) + " @ " + this.getIntensityPretty(interval.getIntensity());
			}
		}

		// ArrayInterval
		visitArrayInterval(interval: ArrayInterval): void {
			this.visitArrayIntervalInternal(interval, false);
		}

		visitArrayIntervalInternal(interval: ArrayInterval, always_add_parenthesis: boolean): void {
			var length = interval.getIntervals().length;
			var firstInterval = interval.getIntervals()[0];
			var lastInterval = interval.getIntervals()[length - 1];

			var isRestIncluded = lastInterval.getIntensity().getValue() <
				firstInterval.getIntensity().getValue() &&
				!(lastInterval instanceof CommentInterval); // its not a comment				

			if (length == 2) {
				if (isRestIncluded) {
					var oldFlag = this.disableEasyTitle;
					this.disableEasyTitle = true;
					VisitorHelper.visit(this, firstInterval);
					this.disableEasyTitle = oldFlag;
					this.result += " - ";
					this.visitRestInterval(lastInterval);
				} else {
					if (always_add_parenthesis) {
						this.result += "(";
					}
					VisitorHelper.visit(this, firstInterval);
					this.result += " - ";
					VisitorHelper.visit(this, lastInterval);
					if (always_add_parenthesis) {
						this.result += ")";
					}
				}
			} else {
				if (isRestIncluded) {
					this.result += "(";
					for (var i = 0; i < length - 1; i++) {
						var subInterval = interval.getIntervals()[i];

						VisitorHelper.visit(this, subInterval);
						this.result += ", ";
					}
					// remove extra ", "
					this.result = this.result.slice(0, this.result.length - 2);
					this.result += ") - w/ ";
					this.visitRestInterval(lastInterval);
				} else {
					if (length >= 2) {
						this.result += "(";
					}
					for (var i = 0; i < length; i++) {
						var subInterval = interval.getIntervals()[i];

						VisitorHelper.visit(this, subInterval);
						this.result += ", ";
					}

					// remove extra ", "
					this.result = this.result.slice(0, this.result.length - 2);
					if (length >= 2) {
						this.result += ")";
					}
				}
			}
		}

		// RepeatInterval
		visitRepeatInterval(interval: RepeatInterval): void {
			this.result += interval.getRepeatCount() + " x ";
			this.visitArrayIntervalInternal(interval, true);
		}

		// RampBuildInterval
		visitRampBuildInterval(interval: RampBuildInterval): void {
			if (interval.getStartIntensity().isEasy()) {
				this.result += interval.getWorkDuration().toStringShort(this.sportType == SportType.Swim) + " warm up to " + this.getIntensityPretty(interval.getEndIntensity());
			} else {
				if (interval.getStartIntensity().getValue() < interval.getEndIntensity().getValue()) {
					this.result += interval.getWorkDuration().toStringShort(this.sportType == SportType.Swim) + " build from " + this.getIntensityPretty(interval.getStartIntensity()) + " to " + this.getIntensityPretty(interval.getEndIntensity());
				} else {
					this.result += interval.getWorkDuration().toStringShort(this.sportType == SportType.Swim) + " warm down from " + this.getIntensityPretty(interval.getStartIntensity()) + " to " + this.getIntensityPretty(interval.getEndIntensity());
				}
			}
		}

		visitStepBuildInterval(interval: StepBuildInterval): void {
			this.result += interval.getRepeatCount() + " x ";

			// There are two types of step build interval
			// 1) Same duration - different intensities
			// 2) Different duration - same intensities
			// case 1
			if (interval.areAllIntensitiesSame()) {
				this.result += this.getIntensityPretty(interval.getStepInterval(0).getIntensity());
				this.result += " - w/ ";
				this.visitRestInterval(interval.getRestInterval());

				this.result += " (";
				for (var i = 0; i < interval.getRepeatCount(); i++) {
					this.result += interval.getStepInterval(i).getWorkDuration().toStringShort(this.sportType == SportType.Swim);
					this.result += ", ";
				}

				// remove extra ", "
				this.result = this.result.slice(0, this.result.length - 2);
				this.result += ")";
			} else {
				this.result += interval.getStepInterval(0).getWorkDuration().toStringShort(this.sportType == SportType.Swim);

				this.result += " - w/ ";
				this.visitRestInterval(interval.getRestInterval());

				this.result += " (";
				for (var i = 0; i < interval.getRepeatCount(); i++) {
					this.result += this.getIntensityPretty(interval.getStepInterval(i).getIntensity());
					this.result += ", ";
				}
				// remove extra ", "
				this.result = this.result.slice(0, this.result.length - 2);
				this.result += ")";
			}
		}

		// SimpleInterval
		visitSimpleInterval(interval: SimpleInterval): void {
			this.result += interval.getWorkDuration().toStringShort(this.sportType == SportType.Swim);
			let title = this.getIntervalTitle(interval);
			if (title != null && title.length > 0) {
				this.result += " " + title;
			}

			// If its a Free ride we are done!
			if (interval.getIntensity().getOriginalUnit() == IntensityUnit.FreeRide) {
				return;
			}

			// 3 cases to cover:
			// - warmup (usually IF around 50-60) - no title - easy peasy
			// - drills with single leg (IF < 60) - title present - check for title
			// - recovery interval, first interval in a repeat rest is something like 60.
			if (interval.getIntensity().getValue() == 0) {
				this.result += " rest";
			} else if (interval.getIntensity().isEasy() && !this.disableEasyTitle) {
				// If no title was provided, let's give one
				let title = interval.getTitle();
				if (title == null || title.trim().length == 0) {
					this.result += " easy";
				}
				if (interval.getRestDuration().getSeconds() > 0) {
					this.result += " w/ " + interval.getRestDuration().toStringShort(this.sportType == SportType.Swim) + " rest";
					return;
				}
			} else {
				// Handle swim differently (For all units except watts)
				// We want to add the total touch time on the swim. For example, if you CSS
				// is 1:30 /100yards and you are doing 200 yards, we want to add
				// that you are touching the wall on 3 min.
				if (this.sportType == SportType.Swim && this.outputUnit != IntensityUnit.Watts) {
					var total_duration = interval.getTotalDuration();
					if (total_duration.getSeconds() != interval.getWorkDuration().getSeconds()) {
						this.result += " on " + interval.getWorkDuration().toTimeStringShort() + " off " + total_duration.toTimeStringShort();
					} else {
						this.result += " on " + interval.getWorkDuration().toTimeStringShort();
					}
					// If the distance is 100yards don't show the pace.
					if (!((interval.getWorkDuration().getUnit() == DistanceUnit.Yards ||
						interval.getWorkDuration().getUnit() == DistanceUnit.Meters) &&
						interval.getWorkDuration().getValue() == 100) &&
						this.outputUnit != IntensityUnit.IF) {
						this.result += " (" + this.getIntensityPretty(interval.getIntensity()) + ")";
					}
				} else {
					this.result += " @ " + this.getIntensityPretty(interval.getIntensity());

					if (interval.getRestDuration().getSeconds() > 0) {
						this.result += " w/ " + interval.getRestDuration().toStringShort(false) + " rest";
						return;
					}
				}
			}
		}

		// |intensity| : The intensity of the interval. For example 90%, 100%
		getIntensityPretty(intensity: Intensity): string {
			if (this.outputUnit == IntensityUnit.HeartRate) {
				var bpm = 0;
				if (this.sportType == SportType.Bike) {
					bpm = this.userProfile.getBikeFTP() / this.userProfile.getEfficiencyFactor();
				} else if (this.sportType == SportType.Run) {
					// 1760 yards
					// http://home.trainingpeaks.com/blog/article/the-efficiency-factor-in-running
					bpm = (1760 * this.userProfile.getRunnintTPaceMph()) / (60 * this.userProfile.getEfficiencyFactor());
				}
				return Math.round(intensity.getValue() * bpm) + "bpm";
			}
			if (this.outputUnit == IntensityUnit.FreeRide) {
				return "Free Ride";
			}

			if (this.outputUnit == IntensityUnit.Unknown ||
				this.sportType == SportType.Unknown ||
				this.outputUnit == IntensityUnit.IF) {
				return intensity.toString();
			}
			if (this.outputUnit == IntensityUnit.Watts) {
				let ftp = 0;
				if (this.sportType == SportType.Bike) {
					ftp = this.userProfile.getBikeFTP();
				} else if (this.sportType == SportType.Swim) {
					ftp = this.userProfile.getSwimFTP();
				} else {
					console.assert(false, stringFormat("Invalid sportType {0}", this.sportType));
				}
				let value = Math.round(ftp * intensity.getValue());
				if (this.roundValues) {
					return FormatterHelper.roundNumberUp(value, 5) + "w";
				} else {
					return value + "w";
				}
			}
			if (this.sportType == SportType.Bike) {
				return intensity.toString();
			} else if (this.sportType == SportType.Run) {
				var minMi = this.userProfile.getPaceMinMi(intensity);
				var outputValue = IntensityUnitHelper.convertTo(minMi, IntensityUnit.MinMi, this.outputUnit);
				if (this.outputUnit == IntensityUnit.Kmh || this.outputUnit == IntensityUnit.Mph) {
					return MyMath.round10(outputValue, -1) + IntensityUnitHelper.toString(this.outputUnit);
				} else {
					if (this.outputUnit == IntensityUnit.MinMi || this.outputUnit == IntensityUnit.MinKm) {
						let roundIncrement = 5;
						if (!this.roundValues) {
							roundIncrement = 0;
						}
						return FormatterHelper.formatNumber(outputValue, 60, ":", IntensityUnitHelper.toString(this.outputUnit), roundIncrement);
					} else {
						let pace_per_400m = this.userProfile.getRunningPace(intensity, this.outputUnit);
						return FormatterHelper.formatNumber(pace_per_400m, 60, ":", "") + IntensityUnitHelper.toString(this.outputUnit);
					}
				}
			} else if (this.sportType == SportType.Swim) {
				if (this.outputUnit == IntensityUnit.Mph) {
					return MyMath.round10(this.userProfile.getSwimPaceMph(intensity), -1) + IntensityUnitHelper.toString(this.outputUnit);
				} else if (this.outputUnit == IntensityUnit.Per100Yards || this.outputUnit == IntensityUnit.Per100Meters || this.outputUnit == IntensityUnit.Per25Yards) {
					var swim_pace_per_100 = this.userProfile.getSwimPace(this.outputUnit, intensity);
					return FormatterHelper.formatNumber(swim_pace_per_100, 60, ":", "") + IntensityUnitHelper.toString(this.outputUnit);
				} else if (this.outputUnit == IntensityUnit.OffsetSeconds) {
					// TODO: Not handling if the intensity needs conversion. 
					console.assert(intensity.getOriginalUnit() == IntensityUnit.OffsetSeconds);
					if (intensity.getOriginalValue() > 0) {
						return "+" + intensity.getOriginalValue();
					} else {
						return "" + intensity.getOriginalValue();
					}
				} else {
					console.assert(false, stringFormat("Invalid output unit {0}", this.outputUnit));
					return "";
				}
			} else {
				console.assert(this.sportType == SportType.Other);
				return "";
			}
		}

		getIntervalTitle(interval: Interval) {
			let title = interval.getTitle();
			if (title == null || title.length == 0) {
				return null;
			}
			return title;
		}

		finalize(): void {
		}
	}
	export class UnparserVisitor implements Visitor {
		output: string;
		level: number;

		constructor() {
			this.output = "";
			this.level = 0;
		}

		getDurationPretty(d: Duration): string {
			if (DurationUnitHelper.isDistance(d.getUnit())) {
				return d.toString();
			}
			return d.toTimeStringLong();
		}

		getIntensityPretty(i: Intensity): string {
			if (i.getOriginalUnit() == IntensityUnit.OffsetSeconds) {
				return "+" + i.getOriginalValue() + "s";
			} else if (i.getOriginalUnit() == IntensityUnit.FreeRide) {
				return "*";
			} else {
				return MyMath.round10(i.getValue() * 100, -1).toString();
			}
		}

		getTitlePretty(i: Interval): string {
			if (i.getTitle().length != 0) {
				return ", " + i.getTitle();
			} else {
				return "";
			}
		}

		visitCommentInterval(interval: CommentInterval): void {
			this.output += stringFormat("\"{0}\"", interval.getTitle());
			this.addSeparator();
		}
		visitSimpleInterval(interval: SimpleInterval): void {
			let params = [];
			let duration_pretty = this.getDurationPretty(interval.getWorkDuration());
			console.assert(duration_pretty.length > 0, "" + interval.getWorkDuration());
			params.push(duration_pretty);

			if (!interval.getIntensity().isEasy()) {
				let intensity_pretty = this.getIntensityPretty(interval.getIntensity());
				params.push(intensity_pretty);
				console.assert(intensity_pretty.length > 0, "" + interval.getIntensity());
			}

			if (interval.getTitle().length != 0) {
				params.push(interval.getTitle());
			}

			if (interval.getRestDuration().getValue() != 0) {
				let duration_rest_pretty = this.getDurationPretty(interval.getRestDuration());
				console.assert(duration_rest_pretty.length > 0, "" + interval.getRestDuration())
				params.push(duration_rest_pretty);
			}

			this.output += stringFormat("({0})", params.join(", "));
			this.addSeparator();
		}
		visitStepBuildInterval(interval: StepBuildInterval): void {
			// TODO: Refactor this to use params as well
			this.level++;
			this.output += interval.getRepeatCount().toString();
			this.output += "[";
			if (interval.areAllIntensitiesSame()) {
				this.output += "(";
				// Get any step as all the durations are the same.
				this.output += this.getIntensityPretty(interval.getStepInterval(0).getIntensity());
				for (let i = 0; i < interval.getRepeatCount(); i++) {
					this.output += ", ";
					this.output += this.getDurationPretty(interval.getStepInterval(i).getTotalDuration());
				}
				this.output += ")";
				this.addSeparator();
				VisitorHelper.visit(this, interval.getRestInterval());
			} else {
				console.assert(interval.areAllDurationsSame())
				let params = []
				params.push(this.getDurationPretty(interval.getStepInterval(0).getTotalDuration()));
				// Get any step as all the durations are the same.				
				for (let i = 0; i < interval.getRepeatCount(); i++) {
					params.push(this.getIntensityPretty(interval.getStepInterval(i).getIntensity()));
				}
				this.output += stringFormat("({0})", params.join(", "));
				this.addSeparator();
				VisitorHelper.visit(this, interval.getRestInterval());
			}
			this.trimSeparator();
			this.output += "]";
			this.level--;
			this.addSeparator();
		}
		visitRampBuildInterval(interval: RampBuildInterval): void {
			this.level++;
			let params = []
			params.push(this.getDurationPretty(interval.getWorkDuration()));
			params.push(this.getIntensityPretty(interval.getStartIntensity()));
			params.push(this.getIntensityPretty(interval.getEndIntensity()));
			if (interval.getTitle().length != 0) {
				params.push(interval.getTitle());
			}
			this.output += stringFormat("({0})", params.join(", "));
			this.level--;
			this.addSeparator();
		}
		visitRepeatInterval(interval: RepeatInterval): void {
			this.level++;
			this.output += interval.getRepeatCount().toString();
			this.output += "[";
			for (let i = 0; i < interval.getIntervals().length; i++) {
				VisitorHelper.visit(this, interval.getIntervals()[i]);
			}
			this.trimSeparator();
			this.output += "]";
			this.level--;
			this.addSeparator();
		}
		visitArrayInterval(interval: ArrayInterval): void {
			this.level++;
			if (this.level > 1) {
				this.output += "[";
			}
			for (var i = 0; i < interval.getIntervals().length; i++) {
				VisitorHelper.visit(this, interval.getIntervals()[i]);
			}
			this.trimSeparator();
			if (this.level > 1) {
				this.output += "]";
			}
			this.level--;
			this.addSeparator();
		}
		finalize(): void {
			this.trimNewLine();
			this.trimSeparator();
			this.trimNewLine();
			// The surroundings [ ] are redundant. lets remove them.
			if (this.output[0] == "[" && this.output[this.output.length - 1] == "]") {
				this.output = this.output.slice(1, this.output.length - 1);
			}
		}

		addSeparator(): void {
			if (this.level == 1) {
				this.output += "\n";
				return;
			}
			this.output += ", ";
		}

		trimSeparator(): void {
			while (this.output.endsWith(", ")) {
				this.output = this.output.slice(0, this.output.length - 2);
			}
			while (this.output.endsWith(",")) {
				this.output = this.output.slice(0, this.output.length - 1);
			}
		}
		trimNewLine(): void {
			while (this.output.endsWith("\n")) {
				this.output = this.output.slice(0, this.output.length - 1);
			}
		}
    }

	// Class that is created with the absolute begin and end times.
	// |interval_| will be either SimpleInterval or RampBuildInterval.
	export class AbsoluteTimeInterval {
		private begin_: number;
		private end_: number;
		private interval_: BaseInterval;
		private title_: string;

		constructor(begin: number, end: number, interval: BaseInterval, title: string) {
			this.begin_ = begin;
			this.end_ = end;
			this.interval_ = interval;
			this.title_ = title;
		}

		getBeginSeconds(): number {
			return this.begin_;
		}

		getEndSeconds(): number {
			return this.end_;
		}

		getDurationSeconds(): number {
			return this.end_ - this.begin_;
		}

		getInterval(): BaseInterval {
			return this.interval_;
		}

		getTitle(): string {
			return this.title_;
		}
	}
    
	export class AbsoluteTimeIntervalVisitor extends BaseVisitor {
		private time_: number = 0;
		private data_: AbsoluteTimeInterval[] = [];
		private repeat_stack_ = [];
		private iteration_stack_ = [];
		private of_: ObjectFactory;

		constructor(of: ObjectFactory) {
			super();
			this.of_ = of;
		}

		private getTitle(interval: Interval): string {
			let title = interval.getTitle();
			// HACK: To avoid plumbing output unit all over the place, just doing something simple for now
			if (this.of_.getSportType() == SportType.Swim) {
				title += " " + (interval.getIntensity().getValue() * this.of_.getUserProfile().getSwimFTP()) + "w"
			} else if (this.of_.getSportType() == SportType.Bike) {
				title += " " + (interval.getIntensity().getValue() * this.of_.getUserProfile().getBikeFTP()) + "w"
			} else if (this.of_.getSportType() == SportType.Run) {
				title += " " + (interval.getIntensity().getValue() * this.of_.getUserProfile().getRunnintTPaceMph()) + "mph";
			} else {
				title += interval.getIntensity().toString();
			}
			if (this.repeat_stack_.length > 0) {
				console.assert(this.repeat_stack_.length == this.iteration_stack_.length);
				title += " " + this.iteration_stack_[this.iteration_stack_.length - 1] + "/" + this.repeat_stack_[this.repeat_stack_.length - 1];
			}
			return title;
		}

		visitSimpleInterval(interval: SimpleInterval) {
			var duration_seconds = interval.getWorkDuration().getSeconds();
			this.data_.push(new AbsoluteTimeInterval(this.time_, this.time_ + duration_seconds, interval, this.getTitle(interval)));
			this.time_ += duration_seconds;
			if (interval.getRestDuration().getSeconds() > 0) {
				let rest_seconds = interval.getRestDuration().getSeconds();
				this.data_.push(new AbsoluteTimeInterval(this.time_, this.time_ + rest_seconds, interval, "rest"));
				this.time_ += rest_seconds;
			}
		}
		visitRampBuildInterval(interval: RampBuildInterval) {
			var duration_seconds = interval.getWorkDuration().getSeconds();
			this.data_.push(new AbsoluteTimeInterval(this.time_, this.time_ + duration_seconds, interval, this.getTitle(interval)));
			this.time_ += duration_seconds;
		}

		getIntervalArray(): AbsoluteTimeInterval[] {
			return this.data_;
		}

		// Visit the repeat intervals in order to keep track of the current iteration to
		// provide a better title.
		visitRepeatInterval(interval: RepeatInterval) {
			this.repeat_stack_.push(interval.getRepeatCount());
			for (let i = 0; i < interval.getRepeatCount(); i++) {
				this.iteration_stack_.push(i + 1);
				for (let j = 0; j < interval.getIntervals().length; j++) {
					VisitorHelper.visit(this, interval.getIntervals()[j]);
				}
				this.iteration_stack_.pop();
			}
			this.repeat_stack_.pop();
		}
	}
}
export = Model

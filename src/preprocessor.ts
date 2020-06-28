import { stringFormat, SportType } from "./core";

enum ArgType {
	Number,
	String
};

export class TextPreprocessorContext {
	is_indoor_: boolean;
	sport_type_: SportType; 

	constructor(sport_type: SportType, is_indoor: boolean) {
		this.sport_type_ = sport_type;
		this.is_indoor_ = is_indoor;
	}

	get sport_type() { return this.sport_type_;}
	get is_indoor() { return this.is_indoor_; }
}

// Class that processes the input like #wu and replaces with macros.
export class TextPreprocessor {
	context_: TextPreprocessorContext;

	constructor(context: TextPreprocessorContext) {
		this.context_ = context;
	}

	// Generated a number in [min, max)
	private _rand(min: number, max: number): number {
		return Math.floor(Math.random() * (max - min) + min);
	}

	private _randElement(array: any): string {
		if (array.length > 0) {
			return array[this._rand(0, array.length)] + "\n";
		} else {
			return "";
		}
	}

	private _warmup(): string {
		let warmup_text = "";
		let warmup_groups = [];
		if (this.context_.sport_type == SportType.Bike) {
			// Are we going to do the british warmup?
			if (this._rand(0, 5) == 0) { // 20% of chance
				// Yes.
				warmup_text = `(5min, *, 90rpm - Smooth pedaling)
(2min, *, 95rpm - Smooth pedaling)
(2min, *, 100rpm - Smooth pedaling)
(2min, *, 105rpm - Smooth pedaling)
(1:30min, *, 110rpm - Smooth pedaling)
(30sec, *, 120-130rpm - Maintain form)
(2min, *, 90rpm - Relax and recover)
(6sec, *, Max rev out)
(1min, *, 90rpm - Smooth pedaling)
(6sec, *, Max rev out)
(1min, *, 90rpm - Smooth pedaling)
(6sec, *, Max rev out)
(2:42min, *, 90 rpm - Relax and recover)
`;
			} else {
				// No.
				warmup_groups = [
					// 9 min (warmup)
					[
						"(3min, 55), (3min, 65), (3min, 75)",
						"(9min, 55, 70)",
						"(4min, 55), (3min, 65), (2min, 75)",
					],
					// 4 min (drill)
					[
						"2[(45s, 45, Single leg - left), (15s, 45, both), (45s, 45, Single leg - right), (15s, 45, both)]",
						"8[(15s, 55, Spin ups), (15s, 55)]",
						"[(30s, 55, cadence 80), (30s, 55), (30s, 55, Cadence 90), (30s, 55), (30s, 55, Cadence 100), (30s, 55), (30s, 55, Cadence 110), (30s, 55)]"
					],
					// 4 min (build)
					[
						"4[(15s, *, Sprints), (45s, 55)]",
						"4[(10sec, *, Max sprints), (50sec, 55, easy riding)]",
						"4[(5s, *, MAX), (55s, 55)]",
						"4[(45s, 75, 100), (15s, 55)]",
						"3[(30sec, *, FAST), (1min, 55, easy)]",
						"4[(30s, 85, 90, 95, 100), (30s, 55)]",
						"4[(15s, 100, FTP), (45s, 55)]",
					],
					// static (3min)
					["(3min, 55)"]
				];
				for (let i = 0; i < warmup_groups.length; i++) {
					warmup_text += this._randElement(warmup_groups[i]);
				}
			}
		} else if (this.context_.sport_type == SportType.Run) {
			warmup_groups = [
				[
					"3[(10s, 0, arm swings)]",
					"3[(10s, 0, high knees)]",
					"3[(10s, 0, ham kicks)]",
					"3[(10s, 0, a-skips)]",
					"3[(10s, 0, crossover side to sides)]",
				],
				[
					"3[(10s, 0, 10 lunges - 5 each side)]",
					"3[(10s, 0, 10 reverse lunges - 5 each side)]",
					"3[(10s, 0, 10 lunges with rotation - 5 each side)]",
					"3[(10s, 0, sumo squat)]",
				]
			];
			for (let i = 0; i < warmup_groups.length; i++) {
				warmup_text += this._randElement(warmup_groups[i]);
			}
		} else if (this.context_.sport_type == SportType.Swim) {

			if (this.context_.is_indoor_) {
				warmup_groups = [
					// Alternate arm ~5min
					[
						"2[(2min, alternate arm pull, 30s)]",
						"(5min, alternate arm pull)",
					],
					// Double arm ~4-5min
					[
						"(10s, Change to DD3), 6[(30s, double arm, 15s)]",
						"(10s, Change to DD5), 8[(15s, double arm pull, 15s)]"
					],
					// Transition
					[
						"(10s, Change to DD4), 4[(20s, 80% of 1 min power), (40s, easy)]"
					],
				]
			} else {
				warmup_groups = [
					// Free
					[
						"(300y, +10, free)",
						"(400y, +10, free)",
						"(500y, +10, free)"
					],
					// Kick
					[
						"(200y, kick, +10)",
						"(300yards, as 50 kick w/ board - 50 free)",
						"3[(100y, Butterfly on the back)]",
						"(200y, Butterfly Kick with fins on your back)",
						"6[(50, Streamline kick on left/side)]"
					],
					// Drill
					[
						"8[(50yards, Drill on first 25, free, build on second 50)]",
						"4[(50yards, Swim GOLF - Descend each one), \"10s rest\"]",
						"3[(100y, single arm freestyle right side, free, single arm freestyle left side, free)]",
						"4[(75y, unco left; swim; unco right)]",
						"4[(50yards, scull and free by 25)]",
						"(200y, +10, pull)"
					],
					// Pre-main set
					[
						// TODO: Allow probabilities or weight
						"4[(25yards, sprint)]",
						""
					],
					// Build
					[
						"8[(50y, +0, build 1-4)]",
						"6[(50yards, 100, build)]",
						"4[(50yards, Swim descend 1-4), \"10s rest\"]",
						"4[(100yards, add 25yards of hard swimming on every 100)]",
						"4[(100y, descend 1-4)]"
					]
				];
			}
			for (let i = 0; i < warmup_groups.length; i++) {
				warmup_text += this._randElement(warmup_groups[i]);
			}
		}
		// Remove extra new line.
		console.assert(warmup_text.length > 0);
		return warmup_text.substring(0, warmup_text.length - 1);
	}

	private _single_leg(number_repeats: number, single_leg_duration_secs: number): string {
		console.assert(single_leg_duration_secs >= 0);
		console.assert(single_leg_duration_secs <= 90);
		return number_repeats + "[(" + single_leg_duration_secs + "s,45,Left Leg), (15s,45,Both), (" + single_leg_duration_secs + "s,45,Right Leg), (15s,45,Both)]"
	}

	private _open_intervals(number_repeats: number, work_duration_sec: number): string {
		console.assert(work_duration_sec >= 0);
		console.assert(work_duration_sec <= 60);
		let title = work_duration_sec <= 10 ? "Max efforts" : "Build";
		let rest_duration_sec = work_duration_sec <= 30 ? 60 - work_duration_sec : work_duration_sec;
		return number_repeats + "[(" + work_duration_sec + "s,*," + title + "), (" + rest_duration_sec + "s,55,Relaxed)]"
	}

	private _change_dd(dd_door: number) {
		return stringFormat("(10s, Change to DD{0})", dd_door)
	}

	private _alternate_arm_pull(duration: string) {
		return stringFormat("({0}, Alternate arm pull)", duration)
	}

	private _double_arm_pull(duration: string) {
		return stringFormat("({0}, Double arm pull)", duration)
	}

	private _back_pull(duration: string) {
		return stringFormat("({0}, Back pull)", duration)
	}

	processOne(input: string): string {
		let funcs = [
			{ regex: /#wu/, callback: this._warmup, params: [], description: "Warm up" },
			{ regex: /#sl\((\d*),(\d*)\)/, callback: this._single_leg, params: [ArgType.Number, ArgType.Number], description: "Single Leg Drills." },
			{ regex: /#o\((\d*),(\d*)\)/, callback: this._open_intervals, params: [ArgType.Number, ArgType.Number], description: "Open Power Intervals." },
			// Vasa swim shortcut
			{ regex: /#dd(\d+)/, callback: this._change_dd, params: [ArgType.Number], description: "Change DD configuration." },
			{ regex: /#alt(\d+\w+)/, callback: this._alternate_arm_pull, params: [ArgType.String], description: "Alternate arm pull." },
			{ regex: /#dbl(\d+\w+)/, callback: this._double_arm_pull, params: [ArgType.String], description: "Double arm pull." },
			{ regex: /#back(\d+\w+)/, callback: this._back_pull, params: [ArgType.String], description: "Back pull." },
		];

		for (let i = 0; i < funcs.length; i++) {
			let regex = funcs[i].regex;
			// Try seeing if this function matches the input.
			if (regex.test(input)) {
				var instance_params = input.match(regex);
				// Parse all parameters from the regex.
				var func_params = [];
				if (instance_params.length - 1 != funcs[i].params.length) {
					console.assert("Function call " + input + " is not matching definition.");
				}
				for (let j = 1; j < instance_params.length; j++) {
					let instance_param = instance_params[j];
					if (funcs[i].params[j - 1] == ArgType.Number) {
						func_params.push(parseInt(instance_param));
					} else {
						func_params.push(instance_param);
					}
				}
				return funcs[i].callback.apply(this, func_params);
			} else {
				//console.log("regex " + regex + " failed to match " + input);
			}
		}
		return input;
	}

	process(input: string): string {
		// First filter the main two regexes that will cover
		// macros with paramters like: #sl(4,45) and parameterless 
		// like #wu. 
		let main_regexes = [/(#\w+\(\d*(?:,\d*)*\)())/, /(#\w+)/];
		for (let i = 0; i < main_regexes.length; i++) {
			input = input.replace(new RegExp(main_regexes[i], "g"), this.processOne.bind(this));
		}
		return input;
	}
}
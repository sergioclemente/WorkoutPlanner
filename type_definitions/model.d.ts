declare module Model {
    enum SportType {
        Unknown = -1,
        Swim = 0,
        Bike = 1,
        Run = 2,
        Other = 3,
    }
    class SportTypeHelper {
        static convertToString(sportType: SportType): "" | "Bike" | "Run" | "Swim" | "Other";
    }
    enum DistanceUnit {
        Unknown = 0,
        Miles = 1,
        Kilometers = 2,
        Meters = 3,
        Yards = 4,
    }
    enum TimeUnit {
        Unknown = 11,
        Seconds = 12,
        Minutes = 13,
        Hours = 14,
    }
    type DurationUnit = TimeUnit | DistanceUnit;
    enum IntensityUnit {
        Unknown = -1,
        IF = 0,
        Watts = 1,
        MinMi = 2,
        Mph = 3,
        Kmh = 4,
        MinKm = 5,
        Per25Yards = 12,
        Per100Yards = 6,
        Per100Meters = 7,
        Per400Meters = 8,
        OffsetSeconds = 9,
        HeartRate = 10,
        FreeRide = 11,
    }
    class MyMath {
        /**
         * Decimal adjustment of a number.
         *
         * @param   {String}    type    The type of adjustment.
         * @param   {Number}    value   The number.
         * @param   {Integer}   exp     The exponent (the 10 logarithm of the adjustment base).
         * @returns {Number}            The adjusted value.
         */
        static decimalAdjust(type: string, value: number, exp: number): number;
        static round10(value: number, exp: number): number;
        static floor10(value: number, exp: number): number;
        static ceil10(value: number, exp: number): number;
    }
    class DistanceUnitHelper {
        static convertTo(value: number, unitFrom: DistanceUnit, unitTo: DistanceUnit): number;
    }
    class TimeUnitHelper {
        static convertTo(value: number, unitFrom: TimeUnit, unitTo: TimeUnit): number;
    }
    class DurationUnitHelper {
        static isTime(durationUnit: DurationUnit): boolean;
        static isDistance(durationUnit: DurationUnit): boolean;
        static isDurationUnit(unit: string): boolean;
        static getDistanceMiles(unit: DurationUnit, value: number): number;
        static getDurationSeconds(unit: DurationUnit, value: number): number;
        static areDurationUnitsSame(durationUnits: DurationUnit[]): boolean;
        static toString(unit: DurationUnit): string;
        static toDurationUnit(unit: string): DurationUnit;
    }
    class FormatterHelper {
        static roundNumberUp(value: number, round_val?: number): number;
        static roundNumberDown(value: number, round_val?: number): number;
        static formatNumber(value: number, decimalMultiplier: number, separator: string, unit: string, round_val?: number): string;
        static enforceDigits(value: number, digits: number): string;
        static formatTime(milliseconds: number): string;
    }
    class Duration {
        private value;
        private unit;
        private estimatedDurationInSeconds;
        private estimatedDistanceInMiles;
        static ZeroDuration: Duration;
        constructor(unit: DurationUnit, value: number, estimatedDurationInSeconds: number, estimatedDistanceInMiles: number);
        getUnit(): DurationUnit;
        getValue(): number;
        getSeconds(): number;
        getDistanceInMiles(): number;
        getValueInUnit(unitTo: DistanceUnit): number;
        toStringDistance(unitTo: DistanceUnit): string;
        getTimeComponents(): any;
        toTimeStringLong(): string;
        toTimeStringShort(): string;
        toStringShort(omitUnit: boolean): string;
        toString(): string;
        static combine(dur1: Duration, dur2: Duration): Duration;
        static combineArray(durations: Duration[]): Duration;
    }
    class IntensityUnitHelper {
        static convertTo(value: number, unitFrom: IntensityUnit, unitTo: IntensityUnit): number;
        static toString(unit: IntensityUnit): string;
        static toIntensityUnit(unit: string): IntensityUnit;
        static isIntensityUnit(unit: string): boolean;
    }
    class Intensity {
        private ifValue;
        private originalValue;
        private originalUnit;
        static ZeroIntensity: Intensity;
        constructor(ifValue?: number, value?: number, unit?: IntensityUnit);
        /**
         * A value between 0 and 1 that represents the intensity of the interval
         */
        getValue(): number;
        toString(): string;
        getOriginalUnit(): IntensityUnit;
        getOriginalValue(): number;
        static combine(intensities: Intensity[], weights: number[]): Intensity;
    }
    interface Interval {
        getTitle(): string;
        getIntensity(): Intensity;
        getWorkDuration(): Duration;
        getRestDuration(): Duration;
        getTotalDuration(): Duration;
    }
    abstract class BaseInterval implements Interval {
        private title;
        constructor(title: string);
        getTitle(): string;
        abstract getIntensity(): Intensity;
        abstract getWorkDuration(): Duration;
        getRestDuration(): Duration;
        getTotalDuration(): Duration;
    }
    class CommentInterval extends BaseInterval {
        constructor(title: string);
        getIntensity(): Intensity;
        getWorkDuration(): Duration;
    }
    class SimpleInterval extends BaseInterval {
        private intensity;
        private duration;
        private restDuration;
        constructor(title: string, intensity: Intensity, duration: Duration, restDuration: Duration);
        getIntensity(): Intensity;
        getWorkDuration(): Duration;
        getRestDuration(): Duration;
    }
    class RampBuildInterval extends BaseInterval {
        private startIntensity;
        private endIntensity;
        private duration;
        constructor(title: string, startIntensity: Intensity, endIntensity: Intensity, duration: Duration);
        getIntensity(): Intensity;
        getWorkDuration(): Duration;
        getStartIntensity(): Intensity;
        getEndIntensity(): Intensity;
        static computeAverageIntensity(intensity1: Intensity, intensity2: Intensity): Intensity;
    }
    class Point {
        x: Duration;
        y: Intensity;
        label: string;
        tag: string;
        constructor(x: Duration, y: Intensity, label: string, tag: string);
    }
    class ArrayInterval implements Interval {
        protected title: string;
        protected intervals: Interval[];
        constructor(title: string, intervals: Interval[]);
        getIntensity(): Intensity;
        getWorkDuration(): Duration;
        getRestDuration(): Duration;
        getTotalDuration(): Duration;
        getTitle(): string;
        getIntervals(): Interval[];
        getTSS(): number;
        getTSS2(): number;
        getTimeSeries(): any;
        getTimeInZones(sportType: SportType): any[];
    }
    class RepeatInterval extends ArrayInterval {
        private repeatCount;
        constructor(title: string, mainInterval: Interval, restInterval: Interval, repeatCount: number);
        getWorkDuration(): Duration;
        getRepeatCount(): number;
    }
    class StepBuildInterval extends ArrayInterval {
        constructor(title: string, intervals: Interval[]);
        getIntensity(): Intensity;
        getRepeatCount(): number;
        getStepInterval(idx: number): Interval;
        getRestInterval(): Interval;
        areAllIntensitiesSame(): boolean;
        areAllDurationsSame(): boolean;
        getWorkDuration(): Duration;
    }
    interface Parser {
        evaluate(input: string, pos: number): number;
    }
    class NumberParser implements Parser {
        private value;
        evaluate(input: string, i: number): number;
        getValue(): number;
    }
    class TokenParser implements Parser {
        private value;
        private delimiters;
        constructor(delimiters: string[]);
        evaluate(input: string, i: number): number;
        getValue(): string;
    }
    class NumberAndUnitParser implements Parser {
        private value;
        private unit;
        evaluate(input: string, i: number): number;
        getValue(): number;
        getUnit(): string;
    }
    class IntervalParser {
        static getCharVal(ch: string): number;
        static isDigit(ch: string): boolean;
        static isLetter(ch: string): boolean;
        static parseDouble(input: string, i: number): {
            i: number;
            value: number;
        };
        static isWhitespace(ch: string): boolean;
        static throwParserError(column: number, msg: string): void;
        static parse(factory: ObjectFactory, input: string): ArrayInterval;
        static normalize(factory: ObjectFactory, input: string): string;
    }
    class VisitorHelper {
        static visitAndFinalize(visitor: Visitor, interval: Interval): any;
        static visit(visitor: Visitor, interval: Interval): any;
    }
    interface Visitor {
        visitCommentInterval(interval: CommentInterval): void;
        visitSimpleInterval(interval: SimpleInterval): void;
        visitStepBuildInterval(interval: StepBuildInterval): void;
        visitRampBuildInterval(interval: RampBuildInterval): void;
        visitRepeatInterval(interval: RepeatInterval): void;
        visitArrayInterval(interval: ArrayInterval): void;
        finalize(): void;
    }
    class TreePrinterVisitor implements Visitor {
        private output;
        private indentation;
        visitCommentInterval(interval: CommentInterval): void;
        visitSimpleInterval(interval: SimpleInterval): void;
        visitStepBuildInterval(interval: StepBuildInterval): void;
        visitRampBuildInterval(interval: RampBuildInterval): void;
        visitRepeatInterval(interval: RepeatInterval): void;
        visitArrayInterval(interval: ArrayInterval): void;
        finalize(): void;
        indent(): void;
        getOutput(): string;
        static Print(interval: Interval): string;
    }
    abstract class BaseVisitor implements Visitor {
        visitCommentInterval(): void;
        abstract visitSimpleInterval(interval: SimpleInterval): void;
        visitStepBuildInterval(interval: StepBuildInterval): void;
        abstract visitRampBuildInterval(interval: RampBuildInterval): void;
        visitRepeatInterval(interval: RepeatInterval): void;
        visitArrayInterval(interval: ArrayInterval): void;
        finalize(): void;
    }
    class MovingAverage {
        private values;
        private window_size;
        private end;
        constructor(window_size: number);
        insert(v: number): void;
        get_moving_average(): number;
        is_full(): boolean;
    }
    class NPVisitor extends BaseVisitor {
        private sum;
        private count;
        private ma;
        private np;
        visitSimpleInterval(interval: SimpleInterval): void;
        visitRampBuildInterval(interval: RampBuildInterval): void;
        _insert_and_flush(value: number): void;
        finalize(): void;
        getIF(): number;
    }
    class TSSCalculator {
        static compute(interval: Interval): number;
    }
    class DominantUnitVisitor extends BaseVisitor {
        private intensity_unit;
        private duration_unit;
        visitSimpleInterval(interval: SimpleInterval): void;
        visitRampBuildInterval(interval: RampBuildInterval): void;
        private updateIntensity(intensity);
        private updateDuration(duration);
        static computeIntensity(interval: Interval): IntensityUnit;
        static computeDuration(interval: Interval): DurationUnit;
    }
    class TSSVisitor extends BaseVisitor {
        private tss;
        visitSimpleInterval(interval: SimpleInterval): void;
        visitRampBuildInterval(interval: RampBuildInterval): void;
        getTSS(): number;
    }
    class DateHelper {
        static getDayOfWeek(): string;
    }
    class ZonesMap {
        static getZoneMap(sportType: SportType): {
            1: {
                name: string;
                low: number;
                high: number;
            };
            2: {
                name: string;
                low: number;
                high: number;
            };
            3: {
                name: string;
                low: number;
                high: number;
            };
            4: {
                name: string;
                low: number;
                high: number;
            };
            5: {
                name: string;
                low: number;
                high: number;
            };
            6: {
                name: string;
                low: number;
                high: number;
            };
        } | {};
    }
    class ZonesVisitor extends BaseVisitor {
        private zones;
        private sportType;
        constructor(sportType: SportType);
        static getZone(sportType: SportType, intensity: number): number;
        incrementZoneTime(intensity: number, numberOfSeconds: number): void;
        visitSimpleInterval(interval: SimpleInterval): void;
        visitRampBuildInterval(interval: RampBuildInterval): void;
        getTimeInZones(): any[];
    }
    class ZwiftDataVisitor extends BaseVisitor {
        private content;
        constructor(name: string);
        finalize(): void;
        getIntervalTitle(interval: Interval): string;
        escapeString(input: string): string;
        visitSimpleInterval(interval: SimpleInterval): void;
        visitRampBuildInterval(interval: RampBuildInterval): void;
        getContent(): string;
    }
    class MRCCourseDataVisitor extends BaseVisitor {
        private courseData;
        private time;
        private idx;
        private fileName;
        private perfPRODescription;
        private content;
        private repeatIntervals;
        private repeatIteration;
        constructor(fileName: string);
        processCourseData(intensity: Intensity, durationInSeconds: number): void;
        processTitle(interval: Interval): void;
        visitSimpleInterval(interval: SimpleInterval): void;
        visitRampBuildInterval(interval: RampBuildInterval): void;
        visitRepeatInterval(interval: RepeatInterval): void;
        finalize(): void;
        getContent(): string;
    }
    class PPSMRXCourseDataVisitor extends BaseVisitor {
        private title;
        private content;
        private groupId;
        private currentRepeatIteration;
        private repeatCountMax;
        constructor(title: string);
        getTitlePretty(interval: BaseInterval): string;
        getGroupId(): number;
        getMode(interval: Interval): string;
        getIntensity(interval: Interval): number;
        visitSimpleInterval(interval: SimpleInterval): void;
        visitRampBuildInterval(interval: RampBuildInterval): void;
        visitRepeatInterval(interval: RepeatInterval): void;
        isGroupActive(): boolean;
        finalize(): void;
        getContent(): string;
    }
    class WorkoutTextVisitor implements Visitor {
        result: string;
        userProfile: UserProfile;
        sportType: SportType;
        outputUnit: IntensityUnit;
        disableEasyTitle: boolean;
        roundValues: boolean;
        constructor(userProfile: UserProfile, sportType: SportType, outputUnit: IntensityUnit, roundValues: boolean);
        static getIntervalTitle(interval: Interval, userProfile?: UserProfile, sportType?: SportType, outputUnit?: IntensityUnit, roundValues?: boolean): string;
        visitCommentInterval(interval: CommentInterval): void;
        visitRestInterval(interval: Interval): void;
        visitArrayInterval(interval: ArrayInterval): void;
        visitArrayIntervalInternal(interval: ArrayInterval, always_add_parenthesis: boolean): void;
        visitRepeatInterval(interval: RepeatInterval): void;
        visitRampBuildInterval(interval: RampBuildInterval): void;
        visitStepBuildInterval(interval: StepBuildInterval): void;
        visitSimpleInterval(interval: SimpleInterval): void;
        getIntensityPretty(intensity: Intensity): string;
        getIntervalTitle(interval: Interval): string;
        finalize(): void;
    }
    class SpeedParser {
        static getSpeedInMph(speed: string): number;
        static _extractNumber(numberString: string, decimalMultiplier: number, strSeparator: string, strSuffix: string): number;
    }
    class UserProfile {
        private bikeFTP;
        private runningTPaceMinMi;
        private swimmingCSSMinPer100Yards;
        private email;
        private effiencyFactor;
        constructor(bikeFTPWatts: number, renameTPace: string, swimCSS: string, email: string);
        setEfficiencyFactor(efficiencyFactor: number): void;
        getEfficiencyFactor(): number;
        getBikeFTP(): number;
        getRunningTPaceMinMi(): number;
        getRunnintTPaceMph(): number;
        getEmail(): string;
        getPaceMph(intensity: Intensity): number;
        getRunningPace(intensity: Intensity, outputUnit: IntensityUnit): number;
        getPaceMinMi(intensity: Intensity): number;
        getSwimCSSMph(): number;
        getSwimPaceMph(intensity: Intensity): number;
        getSwimPace(intensity_unit_result: IntensityUnit, intensity: Intensity): number;
    }
    class ObjectFactory {
        private userProfile;
        private sportType;
        constructor(userProfile: UserProfile, sportType: SportType);
        private getBikeSpeedMphForIntensity(intensity);
        getSportType(): SportType;
        getUserProfile(): UserProfile;
        createIntensity(value: number, unit: IntensityUnit): Intensity;
        createDuration(intensity: Intensity, unit: DurationUnit, value: number): Duration;
        getEasyThreshold(): number;
    }
    class WorkoutBuilder {
        private userProfile;
        private sportType;
        private outputUnit;
        private intervals;
        private workoutDefinition;
        private workoutTitle;
        constructor(userProfile: UserProfile, sportType: SportType, outputUnit: IntensityUnit);
        getInterval(): ArrayInterval;
        getSportType(): SportType;
        getWorkoutTitle(): string;
        getNormalizedWorkoutDefinition(): string;
        withDefinition(workoutTitle: string, workoutDefinition: string): WorkoutBuilder;
        getIntensityFriendly(intensity: Intensity, roundValues: boolean): string;
        getTSS(): number;
        getTSS2(): number;
        getTimePretty(): string;
        getIF(): number;
        getAveragePower(): number;
        getIntervalPretty(interval: Interval, roundValues: boolean): string;
        getEstimatedDistancePretty(): string;
        getAveragePace(): string;
        getStepsList(new_line: string): string;
        getDistanceInMiles(): number;
        getPrettyPrint(new_line?: string): string;
        getMRCFile(): string;
        getZWOFile(): string;
        getPPSMRXFile(): string;
        getZWOFileName(): string;
        getMRCFileName(): string;
        getPPSMRXFileName(): string;
    }
    class StopWatch {
        startTimeMillis: number;
        stoppedTimeMillis: number;
        constructor();
        start(): void;
        stop(): void;
        reset(): void;
        getIsStarted(): boolean;
        getElapsedTimeMillis(): number;
        moveStartTime(durationMillis: number): void;
    }
    class AbsoluteTimeInterval {
        private begin_;
        private end_;
        private interval_;
        constructor(begin: number, end: number, interval: BaseInterval);
        getBeginSeconds(): number;
        getEndSeconds(): number;
        getDurationSeconds(): number;
        getInterval(): BaseInterval;
    }
    class AbsoluteTimeIntervalVisitor extends BaseVisitor {
        private time_;
        private data_;
        visitSimpleInterval(interval: SimpleInterval): void;
        visitRampBuildInterval(interval: RampBuildInterval): void;
        getIntervalArray(): AbsoluteTimeInterval[];
        visitRepeatInterval(interval: RepeatInterval): void;
    }
    class PlayerHelper {
        private data_;
        private durationTotalSeconds_;
        constructor(interval: Interval);
        get(ts: number): AbsoluteTimeInterval;
        getNext(ts: number): AbsoluteTimeInterval;
        getDurationTotalSeconds(): number;
    }
    class TextPreprocessor {
        sport_type: SportType;
        constructor(sport_type: SportType);
        private _randBool();
        private _rand(min, max);
        private _randElement(array);
        private _warmup();
        private _single_leg(number_repeats, single_leg_duration_secs);
        private _open_intervals(number_repeats, work_duration_sec);
        private _cadence_intervals();
        processOne(input: string): string;
        process(input: string): string;
    }
}
export = Model;

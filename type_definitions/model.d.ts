declare module Model {
    class MyMath {
        /**
         * Decimal adjustment of a number.
         *
         * @param   {String}    type    The type of adjustment.
         * @param   {Number}    value   The number.
         * @param   {Integer}   exp     The exponent (the 10 logarithm of the adjustment base).
         * @returns {Number}            The adjusted value.
         */
        static decimalAdjust(type: any, value: any, exp: any): any;
        static round10(value: number, exp: number): number;
        static floor10(value: number, exp: number): number;
        static ceil10(value: number, exp: number): number;
    }
    enum SportType {
        Unknown = -1,
        Swim = 0,
        Bike = 1,
        Run = 2,
    }
    enum DistanceUnit {
        Unknown = 0,
        Miles = 1,
        Kilometers = 2,
        Meters = 3,
        Yards = 4,
    }
    class DistanceUnitHelper {
        static convertTo(value: number, unitFrom: DistanceUnit, unitTo: DistanceUnit): number;
    }
    enum TimeUnit {
        Unknown = 0,
        Seconds = 1,
        Minutes = 2,
        Hours = 3,
    }
    class TimeUnitHelper {
        static convertTo(value: number, unitFrom: TimeUnit, unitTo: TimeUnit): number;
    }
    class DurationUnitHelper {
        static isTime(durationUnit: DurationUnit): boolean;
        static isDistance(durationUnit: DurationUnit): boolean;
        static getDistanceMiles(unit: DurationUnit, value: number): number;
        static getDurationSeconds(unit: DurationUnit, value: number): number;
    }
    class Duration {
        private value;
        private unit;
        private estimatedDurationInSeconds;
        private estimatedDistanceInMiles;
        constructor(unit: DurationUnit, value: number, estimatedDurationInSeconds: number, estimatedDistanceInMiles: number);
        getUnit(): DurationUnit;
        getValue(): number;
        getSeconds(): number;
        getDistanceInMiles(): number;
        toStringDistance(): string;
        toStringTime(): string;
        toString(): string;
        static combine(dur1: Duration, dur2: Duration): Duration;
    }
    enum DurationUnit {
        Unknown = -1,
        Seconds = 0,
        Minutes = 1,
        Hours = 2,
        Meters = 3,
        Miles = 4,
        Kilometers = 5,
    }
    enum IntensityUnit {
        Unknown = -1,
        IF = 0,
        Watts = 1,
        MinMi = 2,
        Mph = 3,
        Kmh = 4,
        MinKm = 5,
    }
    class IntensityUnitHelper {
        static convertTo(value: number, unitFrom: IntensityUnit, unitTo: IntensityUnit): number;
    }
    class Intensity {
        private ifValue;
        private originalValue;
        private originalUnit;
        constructor(ifValue?: number, value?: number, unit?: IntensityUnit);
        getValue(): number;
        toString(): string;
        getOriginalUnit(): number;
        getOriginalValue(): number;
        static combine(intensities: Intensity[], weights: number[]): Intensity;
    }
    interface Interval {
        getTitle(): string;
        getIntensity(): Intensity;
        getDuration(): Duration;
    }
    class BaseInterval implements Interval {
        private title;
        constructor(title: string);
        getTitle(): string;
        getIntensity(): Intensity;
        getDuration(): Duration;
    }
    class SimpleInterval extends BaseInterval {
        private intensity;
        private duration;
        constructor(title: string, intensity: Intensity, duration: Duration);
        getIntensity(): Intensity;
        getDuration(): Duration;
    }
    class RampBuildInterval extends BaseInterval {
        private startIntensity;
        private endIntensity;
        private duration;
        constructor(title: string, startIntensity: Intensity, endIntensity: Intensity, duration: Duration);
        getIntensity(): Intensity;
        getDuration(): Duration;
        getStartIntensity(): Intensity;
        getEndIntensity(): Intensity;
        static computeAverageIntensity(intensity1: Intensity, intensity2: Intensity): Intensity;
    }
    class Point {
        x: Duration;
        y: Intensity;
        label: string;
        constructor(x: Duration, y: Intensity, label: string);
    }
    class ArrayInterval implements Interval {
        protected title: string;
        protected intervals: Interval[];
        constructor(title: string, intervals: Interval[]);
        getIntensity(): Intensity;
        getDuration(): Duration;
        getTitle(): string;
        getIntervals(): Interval[];
        getTSS(): number;
        getTSSFromIF(): number;
        getIntensities(): Intensity[];
        getTimeSeries(): any;
        getTimeInZones(sportType: SportType): any[];
    }
    class RepeatInterval extends ArrayInterval {
        private repeatCount;
        constructor(title: string, mainInterval: Interval, restInterval: Interval, repeatCount: number);
        getDuration(): Duration;
        getRepeatCount(): number;
    }
    class StepBuildInterval extends ArrayInterval {
        constructor(title: string, intervals: Interval[]);
        getIntensity(): Intensity;
        getRepeatCount(): number;
        getStepInterval(idx: number): Interval;
        getRestInterval(): Interval;
        areAllIntensitiesSame(): boolean;
        getDuration(): Duration;
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
        static shouldParse(input: string): boolean;
        static parse(factory: ObjectFactory, input: string): ArrayInterval;
    }
    class VisitorHelper {
        static visit(visitor: Visitor, interval: Interval): any;
    }
    interface Visitor {
        visitSimpleInterval(interval: SimpleInterval): void;
        visitStepBuildInterval(interval: StepBuildInterval): void;
        visitRampBuildInterval(interval: RampBuildInterval): void;
        visitRepeatInterval(interval: RepeatInterval): void;
        visitArrayInterval(interval: ArrayInterval): void;
    }
    class BaseVisitor implements Visitor {
        visitSimpleInterval(interval: SimpleInterval): void;
        visitStepBuildInterval(interval: StepBuildInterval): void;
        visitRampBuildInterval(interval: RampBuildInterval): void;
        visitRepeatInterval(interval: RepeatInterval): void;
        visitArrayInterval(interval: ArrayInterval): void;
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
        };
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
    class IntensitiesVisitor extends BaseVisitor {
        private intensities;
        visitSimpleInterval(interval: SimpleInterval): void;
        visitRampBuildInterval(interval: RampBuildInterval): void;
        getIntensities(): Intensity[];
    }
    class DataPointVisitor extends BaseVisitor {
        private x;
        data: Point[];
        initX(duration: Duration): void;
        incrementX(duration: Duration): void;
        visitSimpleInterval(interval: SimpleInterval): void;
        visitRampBuildInterval(interval: RampBuildInterval): void;
    }
    class ZwiftDataVisitor extends BaseVisitor {
        private content;
        constructor(name: string);
        finalize(): void;
        getIntervalTitle(interval: Interval): string;
        visitSimpleInterval(interval: SimpleInterval): void;
        visitRampBuildInterval(interval: RampBuildInterval): void;
        getContent(): string;
    }
    class MRCCourseDataVisitor extends BaseVisitor {
        private courseData;
        private time;
        private idx;
        private perfPRODescription;
        processCourseData(intensity: Intensity, durationInSeconds: number): void;
        processTitle(interval: Interval): void;
        getCourseData(): string;
        getPerfPRODescription(): string;
        visitSimpleInterval(interval: SimpleInterval): void;
        visitRampBuildInterval(interval: RampBuildInterval): void;
    }
    class FileNameHelper {
        private intervals;
        constructor(intervals: ArrayInterval);
        getFileName(): string;
    }
    class WorkoutTextVisitor implements Visitor {
        result: string;
        userProfile: UserProfile;
        sportType: SportType;
        outputUnit: IntensityUnit;
        constructor(userProfile?: UserProfile, sportType?: SportType, outputUnit?: IntensityUnit);
        static formatNumber(value: number, decimalMultiplier: number, separator: string, unit: string): string;
        private static enforceDigits(value, digits);
        static getIntervalTitle(interval: Interval, userProfile?: UserProfile, sportType?: SportType, outputUnit?: IntensityUnit): string;
        visitRestInterval(interval: Interval): void;
        visitArrayInterval(interval: ArrayInterval): void;
        visitRepeatInterval(interval: RepeatInterval): void;
        visitRampBuildInterval(interval: RampBuildInterval): any;
        visitStepBuildInterval(interval: StepBuildInterval): void;
        visitSimpleInterval(interval: SimpleInterval): any;
        getIntensityPretty(intensity: Intensity): string;
    }
    enum RunningPaceUnit {
        Unknown = 0,
        MinMi = 1,
        Mph = 2,
        MinKm = 3,
        KmHr = 4,
    }
    class RunningPaceHelper {
        static convertToMph(value: number, unit: RunningPaceUnit): number;
    }
    class SpeedParser {
        static getSpeedInMph(speed: string): number;
        static _extractNumber(numberString: any, decimalMultiplier: any, strSeparator: any, strSuffix: any): number;
    }
    class UserProfile {
        private bikeFTP;
        private runningTPaceMinMi;
        private email;
        constructor(bikeFTP: number, runningTPace: string, email?: string);
        getBikeFTP(): number;
        getRunningTPaceMinMi(): number;
        getEmail(): string;
        getPaceMinMi(intensity: Intensity): number;
    }
    class ObjectFactory {
        private userProfile;
        private sportType;
        constructor(userProfile: UserProfile, sportType: SportType);
        getBikeSpeedMphForIntensity(intensity: Intensity): number;
        getRunPaceMphForIntensity(intensity: Intensity): number;
        createIntensity(value: number, unit: IntensityUnit): Intensity;
        createDuration(intensity: Intensity, unit: DurationUnit, value: number): Duration;
    }
    class StopWatch {
        startTime: number;
        stoppedTime: number;
        constructor();
        start(): void;
        stop(): void;
        getIsStarted(): boolean;
        getElapsedTime(): number;
        reset(): void;
    }
    class ArrayIterator {
        array: any[];
        index: number;
        constructor(array: any);
        reset(): void;
        getCurrent(): any;
        getCurrentIndex(): number;
        tryGettingNext(): any;
        getIsValid(): boolean;
        moveNext(): boolean;
    }
    class WorkoutBuilder {
        private userProfile;
        private sportType;
        private outputUnit;
        private intervals;
        private workoutDefinition;
        constructor(userProfile: UserProfile, sportType: SportType, outputUnit: IntensityUnit);
        getInterval(): ArrayInterval;
        getSportType(): SportType;
        withDefinition(workoutDefinition: string): WorkoutBuilder;
        getIntensityFriendly(intensity: Intensity): string;
        getTSS(): number;
        getTSSFromIF(): number;
        getTimePretty(): string;
        getIF(): number;
        getAveragePower(): number;
        getIntervalPretty(interval: Interval): string;
        getEstimatedDistancePretty(): string;
        getAveragePace(): string;
        getPrettyPrint(new_line?: string): string;
        getMRCFile(): string;
        getZWOFile(): string;
        getZWOFileName(): string;
        getMRCFileName(): string;
    }
}
export = Model;

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);

//import { ohlc_t } from './datafeeds/datafeeder';

//import { kLineDataList } from './kline';

//export type time_unit_t = 'T' | 'S' | '' | 'm' | 'D' | 'W' | 'M';
//export type time_unit_t = 't' | 's' | '' | 'm' | 'h' | 'd' | 'w' | 'M' | 'Q' | 'y';
export type time_unit_t = 't' | 's' | 'm' | 'h' | 'd' | 'w' | 'M' | 'Q' | 'y';

//export interface timeframe_t {
//	readonly unit: time_unit_t;
//	readonly count: number;
//	//readonly duration: number;
//	readonly term: number;
//}

//const unit2ms = {
//	T: 1,
//	S: 1000,
//	m: 1000 * 60,
//	D: 1000 * 60 * 60 * 24,
//	W: 1000 * 60 * 60 * 24 * 7,
//	M: 1000 * 60 * 60 * 24 * 30,
//};

const unit2ms: {[key in time_unit_t]: number} = {
	t: 1,
	s: 1000,
	m: 1000 * 60,
	//"": 1000 * 60,
	h: 1000 * 60 * 60,
	d: 1000 * 60 * 60 * 24,
	w: 1000 * 60 * 60 * 24 * 7,
	M: 1000 * 60 * 60 * 24 * 30,
	Q: 1000 * 60 * 60 * 24 * 91,
	y: 1000 * 60 * 60 * 24 * 365 
};

// deep compare
function isEqual(lhs: any, rhs: any): boolean
{
	if (lhs === rhs) return true;

	if ( typeof lhs !== 'object' || lhs === null
	  || typeof rhs !== 'object' || rhs === null
	)
	{
		return false;
	}

	const lkeys = Object.keys(lhs);
	const rkeys = new Set(Object.keys(rhs));

	for (const lkey of lkeys) {
		if (!rkeys.has(lkey)) return false;
		if (!isEqual(lhs[lkey], rhs[lkey])) return false;
	}

	return true;
}

export class timeframe_t {
	//readonly unit: time_unit_t;
	//readonly count: number;
	//readonly duration: number;
	//readonly term: number;

	constructor(
		readonly unit: time_unit_t,
		readonly count: number,
		readonly term: number
	)
	{
	}

	static parse(s: string): timeframe_t
	{
		s = s.trim();
		if (!s) {
			throw new Error('Invalid resolusion code');
		}

		let unit = 'm';
		//if ('TSDWM'.includes(s.slice(-1))) {
		if ('tsmhdwMQy'.includes(s.slice(-1))) {
			unit = s.slice(-1);
			s = s.slice(0, -1) || '1';
		}

		//return {
		//	unit,
		//	count: Number(s)
		//}
		const count = Number(s);
		if (isNaN(count)) {
			throw new Error(`Invalid timeframe string: ${s}`);
		}
		return new timeframe_t(
			unit as time_unit_t,
			count,
			unit2ms[unit as time_unit_t] * count
		);
	}

	toString(): string
	{
		//console.log(`timeframe_t.toString`);
		//console.log(this);
		//const count = this.count !== 1 && `${this.count}` || '';
		//const unit = this.unit !== 'm' && this.unit || '';
		//console.log(count, unit);
		//return `${count}${unit}`;
		return `${this.count}${this.unit}`;
	}

	isEqual(rhs: timeframe_t): boolean
	{
		return isEqual(this, rhs);
	}
}

export class server_timeframes_t {
	protected tf: timeframe_t[];

	constructor(res: string[])
	{
		this.tf = res
			.map(r => timeframe_t.parse(r))
			.sort((a, b) => b.term - a.term);
	}

	server_timeframe(res: timeframe_t): timeframe_t
	{
		// FIXME: month, quater, year
		const rv = this.tf.find(tf => {
			return tf.term <= res.term && res.term % tf.term === 0;
		});

		if (!rv) {
			throw new Error(`res: ${res.toString()} is not supported by data source server`);
		}

		return rv;
	}
}

//// https://day.js.org/docs/en/manipulate/start-of
//const tv2dayjs_unit = {
//	// XXX: Tick
//	S: 's',
//	m: 'm',
//	D: 'd',
//	// hour
//	W: 'w',
//	M: 'M',
//	// quarter
//	'3M': 'Q',
//	// year
//	'12M': 'y'
//};
//
////export interface timeframe_t {
////	readonly unit: time_unit_t;
////	readonly count: number;
////	//readonly duration: number;
////	readonly term: number;
////}
//
//function to_dayjs_unit(tf: timeframe_t)
//{
//	return tv2dayjs[tf.toString()];
//}
//
//function _get_range(ts: dayjs, unit: string)
//{
//	return [
//		ts.startOf(unit).valueOf(),
//		ts.endOf(unit).valueOf()
//	];
//}
//
//function get_range(ts: number, tf: timeframe_t, tz: string)
//{
//	let unit = to_dayjs_unit(tf);
//	const d = dayjs(ts).tz(tz);
//
//	return _get_range(d, unit);
//}

// deep compare
//function isEqual(lhs: any, rhs: any): boolean
//{
//	if (lhs === rhs) return true;
//
//	if ( typeof lhs !== 'object' || lhs === null
//	  || typeof rhs !== 'object' || rhs === null
//	)
//	{
//		return false;
//	}
//
//	const lkeys = Object.keys(lhs);
//	const rkeys = new Set(Object.keys(rhs));
//
//	for (const lkey of lkeys) {
//		if (!rkeys.has(lkey)) return false;
//		if (!isEqual(lhs[lkey], rhs[lkey])) return false;
//	}
//
//	return true;
//}

// 1m -> 24m
//class quantizer_t {
//	//last_bar?: ohlc_t;
//	//constructor(last_bar: ohlc_t, dest_tf: time_frame_t, src_tf: time_frame_t)
//	constructor(protected dest: time_frame_t, protected src: time_frame_t, protected tz: string)
//	{
//		//this.last_bar = last_bar;
//		//to_dayjs_unit(dest_tf);
//	}
//
//	// TODO: support session
//	quantize(ohlcs: ohlc_t[]): ohlc_t[];
//	{
//		if (!ohlcs.length || isEqual(this.dest, this.src)) {
//			return ohlcs;
//		}
//
//		if (this.src.unit === 'm') {
//			if (this.dest.unit === 'm') {
//			}
//			else if (this.dest.unit === 'D') {
//			}
//			else if (this.dest.unit === 'W') {
//			}
//			else if (this.dest.unit === 'M') {
//			}
//		}
//		else if (this.src.unit === 'D') {
//			if (this.dest.unit === 'D') {
//			}
//			else if (this.dest.unit === 'W') {
//			}
//			else if (this.dest.unit === 'M') {
//			}
//		}
//		const first = ohlcs[0];
//		//const last = ohlcs[ohlcs.length-1];
//
//		// need to change time
//		
//		const rv: ohlc_t[] = [first];
//
//		//let cur_time = first.time;
//		for (let i=0; i<ohlcs.length; ++i) {
//			const cur = rv[rv.length-1];
//		}
//	}
//}

class quantizer_t {
	protected beg!: number;
	protected end!: number;

	constructor(
		protected tf: timeframe_t,
		first_ts: number,
		protected tz ='Etc/UTC'
	)
	{
		this.init(first_ts);
		console.log(this);
	}

	quantize(ts: number): number
	{
		if (this.end < ts) {
			this.new_term(ts);
		}
		return this.beg;
	}

	get cur_ts() { return this.beg; }

	protected init(first_ts: number)
	{
		if (['t', 's'].includes(this.tf.unit as string)) {
			throw new Error(`Unsupported time unit: ${this.tf.unit}`);
		}

		this.new_term(first_ts);
	}

	protected new_term(ts: number)
	{
		const unit = this.tf.unit as dayjs.OpUnitType;
		// TODO: session
		const d = dayjs(ts).tz(this.tz).startOf(unit);
		//console.log(d);
		this.beg = d.valueOf();

		//this.end = d.endOf(this.tf.unit).valueOf();
		this.end = d.add(this.tf.count-1, unit as dayjs.ManipulateType)
			.endOf(unit)
			.valueOf();
	}
}

class quantizer_min_sec_t extends quantizer_t {
	//protected unit_ms: number;
	protected stride!: number;

	constructor(
		protected tf: timeframe_t,
		first_ts: number,
		protected tz ='Etc/UTC'
	)
	{
		//if (!'ms'.includes(tf.unit)) {
		//	throw new Error(`Unsupported unit: ${tf.unit}`);
		//}
		
		super(tf, first_ts, tz);
	}

	protected init(first_ts: number)
	{
		if (!'ms'.includes(this.tf.unit)) {
			throw new Error(`Unsupported unit: ${this.tf.unit}`);
		}
		

		const unit_ms = (this.tf.unit === 'm'? 60000 : 1000) * this.tf.count;
		//this.stride = this.tf.count * this.unit_ms - 1;
		this.stride = unit_ms - 1;

		console.log(`unit_ms: ${unit_ms}, stride: ${this.stride}`);

		//super.init(first_ts);
		this.beg = Math.floor(first_ts/unit_ms) * unit_ms;
		this.end = this.beg + this.stride;

		console.log(this);
	}

	/*
	protected new_term(ts: number)
	{
		// TODO: session
		this.beg = Math.floor(ts/this.unit_ms) * this.unit_ms;
		this.end = this.beg + this.stride;
	}
	*/

	protected new_term(ts: number)
	{
		// TODO: session

		// align from the first bar
		const n_slot = Math.floor((ts-this.beg)/(this.stride+1));
		this.beg += (this.stride+1) * n_slot;
		this.end = this.beg + this.stride;
		console.log(`new_term: ${n_slot}, ${this.beg}, ${this.end}`);
	}
}

export function get_quantizer(
	tf: timeframe_t,
	first_ts: number,
	tz='Etc/UTC'
): quantizer_t
{
	if (tf.unit === 't') {
		throw new Error('Tick is not yet supported');
	}
	else switch (tf.unit) {
	case 's': case 'm':
		console.log('min_sec quanizer');
		return new quantizer_min_sec_t(tf, first_ts, tz);
	default:
		return new quantizer_t(tf, first_ts, tz);
	}
}


if (typeof process !== 'undefined' && import.meta.url === new URL(`file://${process.argv[1]}`).href) {

	//const fmt = new Intl.DateTimeFormat('en-US', {
	//	timzeZone: 'Asia/Seoul',
	//
	//	year: 'numeric',
	//	month: '2-digit',
	//	day: '2-digit',
	//	hour: '2-digit',
	//	minute: '2-digit',
	//	second: '2-digit',
	//	timeZoneName: 'short'
	//});

const resolutions = [
	'1', '3', '5', '10', '30',
	'60', '360', '720',
	'd'
];

const stf = new server_timeframes_t(resolutions);

//const chartDataList = kLineDataList.map((bar: string[]) => {
//	return {
//		timestamp: new Date(bar[0]).getTime(),
//		open: +bar[1],
//		high: +bar[2],
//		low: +bar[3],
//		close: +bar[4],
//		volume: Math.ceil(+bar[5])
//	};
//});

console.log(stf.server_timeframe(timeframe_t.parse('30S')));
console.log(stf.server_timeframe(timeframe_t.parse('4')));
console.log(stf.server_timeframe(timeframe_t.parse('6')));
console.log(stf.server_timeframe(timeframe_t.parse('3D')));
console.log(stf.server_timeframe(timeframe_t.parse('2W')));
console.log(stf.server_timeframe(timeframe_t.parse('M')));

}

export interface exchange_t {
	code: string;
	name?: string;
	desc?: string;
	timezone: string;
	resolutions: string[];
}

export interface data_source_info_t {
	exchanges: exchange_t[];
}

export interface sym_info_t {
	ticker: string;
	name?: string;
	desc?: string;
	exchange?: string;
	type?: string;

	session?: string;
	timezone?: string;
}

export interface period_args_t {
	// [from, to)
	from: number;
	count_back?: number;
	to: number;
	first: boolean;
}

// tlinechart format
//return {
//	timestamp: new Date(bar[0]).getTime(),
//	open: +bar[1],
//	high: +bar[2],
//	low: +bar[3],
//	close: +bar[4],
//	volume: Math.ceil(+bar[5])
//};

//export interface ohlc_t {
//	time: number;
//	open: number;
//	high: number;
//	low: number;
//	close: number;
//	vol: number;
//}

export interface ohlc_t {
	timestamp: number;
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
}

export interface rv_hist_t {
	ohlc: ohlc_t[];
	next_time: number;
}

export interface symbol_service_t {
	search: (args: {
		// partial user input such as 'BTC/K'
		input: string;
		// krx, nasdaq, newyork, binance, bithumb
		exchage?: string;
		// stock, index, forex, futures,
		// crypto, expression, spread, cfd, ...
		type?: string;
	}) => Promise<sym_info_t[]>;

	resolve: (ticker: string) => Promise<sym_info_t|undefined>;
}

export type tick_t = {
	timestamp: number;
	price: number;
	volume: number;
};

export type new_bar_notifier_t = (tick: tick_t) => void;

export interface feeder_t {
	get_history: (period: period_args_t) => Promise<rv_hist_t>;
	subscribe: (notify: new_bar_notifier_t) => void;
	unsubscribe: (notify: new_bar_notifier_t) => void;
}

export interface data_source_t {
	// TODO: return type
	//on_init: () => Promise<any>;
	init: () => Promise<data_source_info_t>;
	readonly symbols: symbol_service_t;
	create_feeder: (
		sym: sym_info_t,
		resolution: string
	) => feeder_t;
}

//export interface datafeeder_t {
//	// TODO: return type
//	on_ready: () => Promise<any>;
//
//	search_symbols: (args: {
//		// partial user input such as 'BTC/K'
//		input: string;
//		// krx, nasdaq, newyork, binance, bithumb
//		exchage?: string;
//		// stock, index, forex, futures,
//		// crypto, expression, spread, cfd, ...
//		type?: string;
//	}) => Promise<sym_info_t[]>;
//
//	resolve_symbol: (ticker: string) => Promise<sym_info_t>;
//
//	// TODO: resolution
//	//	get_history: (args: {
//	//		sym: sym_info_t;
//	//		resoltion: string;
//	//		period: period_args_t;
//	//	}) => Promise<rv_hist_t>;
//	//
//	//	subscribe: (args: {
//	//	}) => Promise<string>;
//	//
//	//	unsubscribe: (id: string) => Promise<boolean>;
//	
//}

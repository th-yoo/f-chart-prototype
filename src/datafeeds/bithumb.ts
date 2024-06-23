import type {
	data_source_t,
	data_source_info_t,
	sym_info_t,
	feeder_t,
	exchange_t,
	symbol_service_t,
	period_args_t,
	new_bar_notifier_t,
	//ohlc_t,
	//rv_hist_t,
} from './datafeeder';

import wsproxy_t from './websocket';
import fetch_symbols from './fetch_symbols';
import fetch_bars from './fetch_bars';
import symbols_t from './symbols';

const resolutions = [
	'1', '3', '5', '10', '30',
	'h', '6h', '12h',
	'd'
];

export class bithumb_t implements data_source_t, symbol_service_t, feeder_t {
	protected ws?: wsproxy_t;
	protected _symbols = new symbols_t();
	
	constructor()
	{
	}

	async init(): Promise<data_source_info_t>
	{
		this.ws = new wsproxy_t('wss://pubwss.bithumb.com/pub/ws');
		const [_, tickers] = await Promise.all([
			this.ws.connect(),
			fetch_symbols()
		]);

		for (const ticker of tickers) {
			this._symbols.add_ticker(ticker);
		}

		//// available resolution
		//// {1, 3, 5, 10, 30}m, {1, 6, 12, 24}h

		const exchanges: exchange_t[] = [{
			code: 'bithumb',
			name: 'Bithumb',
			desc: 'Korean crypto-currency exchnage',
			timezone: 'Asia/Seoul',
			resolutions,
		}];

		return {
			exchanges,
		};
	}

	get symbols()
	{
		return this as symbol_service_t;
	}

	create_feeder(sym: sym_info_t, resolution: string): feeder_t
	{
		//return this;
		return {
			async get_history(_period: period_args_t) {
				console.log(`XXXX: ${resolution}`);
				return {
					ohlc: await fetch_bars(sym.ticker, resolution),
					next_time: 0,
				};
			},
			subscribe: (_notify: new_bar_notifier_t) => {
				this.ws!.on(sym.ticker, _notify);
			},
			unsubscribe(_notify: new_bar_notifier_t) {
			}
		};
	}

	async search(args: {
		input: string;
		exchange?: string;
		type?: string;
	}): Promise<sym_info_t[]>
	{
		return this._symbols.search(args.input);
	}

	async resolve(ticker: string): Promise<sym_info_t|undefined>
	{
		return this._symbols.resolve(ticker);
	}

	// DELME
	async get_history(_period: period_args_t)
	{
		//return {
		//	ohlc: [],
		//	next_time: 0
		//};
		return {
			ohlc: await fetch_bars('ETH_KRW', 'd'),
			next_time: 0
		};
	}

	subscribe(_notify: new_bar_notifier_t)
	{
		if (!this.ws) return;
	}

	unsubscribe(_notify: new_bar_notifier_t)
	{
		if (!this.ws) return;
	}
}

//console.log(import.meta.url);
//console.log(new URL(import.meta.url));
//console.log(import.meta);

if (typeof process !== 'undefined' && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
(async () => {
	const df = new bithumb_t();

	const di = await df.init();
	console.log(di);

	const syms = await df.symbols.search({input: 'ETH'});
	console.log(syms);

	const sym = await df.symbols.resolve('ETH_KRW');
	console.log(sym);

	const feeder = df.create_feeder({ticker:'ETH_KRW'}, 'd');
	const bars = await feeder.get_history({
		from: Date.now(),
		to: Date.now(),
		first: true
	});
	console.log(bars);

})().then(() => process.exit(0))
	.catch(e => {
		console.error(e);
		process.exit(1);
	});
}

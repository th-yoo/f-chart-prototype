// XXX: I don't know how to exclude cjs dep
//import WebSocket from 'ws';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

import {
	tick_t,
	new_bar_notifier_t,
} from './datafeeder';

// available resolution
// {1, 3, 5, 10, 30}m, {1, 6, 12, 24}h

//const ws = new WebSocket('wss://pubwss.bithumb.com/pub/ws');
//
//ws.addEventListener('open', event => {
//	ws.send(JSON.stringify({
//		type: "transaction",
//		symbols: ['ETH_KRW']
//	}));
//});
//
//ws.addEventListener('error', e => {
//	console.error(e)
//});
//
//ws.addEventListener('message', msg => {
//	console.log(msg);
//	const data = JSON.parse(msg.data);
//	if (data.type !== 'transaction') {
//		console.log(data);
//	}
//	else {
//		console.log(data.content.list);
//	}
//});

// https://apidocs.bithumb.com/reference/%EB%B9%97%EC%8D%B8-%EA%B1%B0%EB%9E%98%EC%86%8C-%EC%A0%95%EB%B3%B4-%EC%88%98%EC%8B%A0

//type callback_t = (data: {[key:string]: number}) => void;
type callback_t = new_bar_notifier_t;

export default class wsproxy_t {
	protected ws?: WebSocket;
	protected callbacks = new Map<string, Set<callback_t>>();

	constructor(protected url: string)
	{
	}

	async connect()
	{
		if (this.ws) {
			throw new Error('already connected');
		}

		return new Promise<wsproxy_t>((resolve, reject) => {
			const ws = new WebSocket(this.url);

			ws.onopen = () => {
				ws.onerror = err => this.onerror(err);
				ws.onmessage = msg => this.onmessage(msg);
				ws.onclose = ev => this.onclose(ev);

				this.ws = ws;
				resolve(this);
			};

			ws.onerror = err => {
				reject(err);
			};
		});
	}

	on(ticker: string, cb: callback_t)
	{
		const tickers = new Set<string>(this.callbacks.keys());

		const callbacks = this.callbacks.get(ticker) || new Set<callback_t>();
		callbacks.add(cb);
		this.callbacks.set(ticker, callbacks);

		if (tickers.has(ticker)) {
			return;
		}

		this.request([...tickers, ticker]);
	}

	off(ticker: string, cb: callback_t)
	{
		if (!this.callbacks.has(ticker)) {
			return;
		}

		const callbacks = this.callbacks.get(ticker)!;
		callbacks.delete(cb);
		if (!callbacks.size) {
			this.callbacks.delete(ticker);
		}

		const tickers = new Set<string>(this.callbacks.keys());
		if (tickers.has(ticker)) {
			return;
		}

		this.request([...tickers]);
	}

	protected request(tickers: string[])
	{
		if (!this.ws) {
			throw new Error('not connected');
		}

		this.ws.send(JSON.stringify({
			type: 'transaction',
			symbols: tickers
		}));
	}

	protected onmessage(msg: MessageEvent)
	{
		const data = JSON.parse(msg.data);

		if (data.type !== 'transaction') {
			return;
		}

		for (const tick of data.content.list) {
			// "2024-06-10 18:34:52.207602",
			if (!this.callbacks.has(tick.symbol)) {
				continue;
			}

			const callbacks = this.callbacks.get(tick.symbol)!;
			for (const cb of callbacks) {
				cb({
					timestamp: dayjs.tz(
						tick.contDtm,  
						'Asia/Seoul'
					).valueOf(),
					price: Number(tick.contPrice),
					volume: Number(tick.contQty),
				});
			}
		}
	}

	//protected onerror(err: ErrorEvent)
	protected onerror(err: Event)
	{
		console.error(err);
	}

	protected onclose(ev: CloseEvent)
	{
		// https://developer.mozilla.org/en-US/docs/Web/API/ErrorEvent
		console.warn(ev);
		if ( ev.code !== 1000
		  && ( typeof window !== 'undefined'
		     && !window.navigator.onLine )
		)
		{
			console.error('Network unavailable');
			return;
		}

		delete this.ws;

		this.connect();
	}
}


if (typeof process !== 'undefined' && import.meta.url === new URL(`file://${process.argv[1]}`).href) {

async function sleep(msec: number)
{
	return new Promise(resolve => setTimeout(resolve, msec));
}

(async () => {
	const ws = new wsproxy_t('wss://pubwss.bithumb.com/pub/ws');
	await ws.connect();
	const eth_cb = (tick: tick_t) => {
		console.log('ETH tick');
		console.log(tick);
	};
	const btc_cb = (tick: tick_t) => {
		console.log('BTC tick');
		console.log(tick);
	};
	ws.on('ETH_KRW', eth_cb);
	ws.on('BTC_KRW', btc_cb);

	await sleep(30 * 1000);
	console.log('BTC off');
	ws.off('BTC_KRW', btc_cb);

	await sleep(100 * 1000);

})().then(() => process.exit(0))
.catch(e => {
	console.error(e);
	process.exit(1);
});
}

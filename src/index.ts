import { LitElement, css, html } from 'lit'
import { customElement } from 'lit/decorators.js'
//import * as kc from './klinecharts';
//import { type Chart } from './klinecharts';
import * as kc from 'klinecharts';
import { type Chart } from 'klinecharts';
import { kLineDataList } from './kline';

//import fetch_bars from './datafeeds/fetch_bars';

//import {getDefaults} from './config';
//const conf = getDefaults();

//const data_feeder = new conf.Datafeeder();

import type {
	data_source_t,
	ohlc_t,
	tick_t,
} from './datafeeds/datafeeder';

import {
	timeframe_t,
	server_timeframes_t,
	get_quantizer
} from './timeframe';

import {
	bithumb_t
} from './datafeeds/bithumb';

//import {
//	adjustFromTo,
//	makeFormatDate,
//} from "./utils/dateutil";


@customElement('f-chart')
export class FinChart extends LitElement {
	static styles = css`
		:host {
			display: block;
			height: 100%;
		}
	`;

	//@state()
	protected chart: Chart|null = null;
	protected on_resize = () => this._onResize();

	// config from storage
	// timeframe, ticker
	//protected timeframe = 'w';
	//protected timeframe = 'd';
	protected timeframe = 'M';
	//protected timeframe = '10d';
	//protected timeframe = 'm';
	//protected timeframe = '10m';
	//protected timeframe = '7m';
	//protected timeframe = '14m';
	protected ticker = 'ETH_KRW';
	protected feeder? : data_source_t;

	protected timezone = 'Asia/Seoul';

	constructor()
	{
		super();
	}

	// shadow DOM => light DOM
	//createRenderRoot()
	//{
	//	return this;
	//}

	render()
	{
		return html`
			<div id="chart" style="height: 100%"></div>
		`;
	}

	connectedCallback()
	{
		super.connectedCallback();
		window.addEventListener('resize', this.on_resize);
	}

	disconnectedCallback()
	{
		window.removeEventListener('resize', this.on_resize);
		if (this.chart) {
			kc.dispose(this.chart);
			this.chart = null;
		}
		super.disconnectedCallback();
	}

	firstUpdated(_args: Map<string,any>)
	{
		this.create_chart();
	}

	protected create_chart_STATIC()
	//protected create_chart()
	{
		const chart = kc.init(
			(this.renderRoot.querySelector('#chart') as HTMLElement)!
		)!;
		chart.createIndicator('MA', false, {id: 'candle_pane'});
		chart.createIndicator('VOL');
		chart.createIndicator('MACD');

		const chartDataList = kLineDataList.map((bar: string[]) => {
			return {
				timestamp: new Date(bar[0]).getTime(),
				open: +bar[1],
				high: +bar[2],
				low: +bar[3],
				close: +bar[4],
				volume: Math.ceil(+bar[5])
			};
		});
		let [last] = chartDataList.slice(-1);
		//console.log(last);
		chart.applyNewData(chartDataList);

		this.chart = chart;

		console.log(last);
		console.log(chart.getDataList().slice(-1)[0]);

		/*
		// composables/kline/kc_exts.ts::addChartBars()
		setInterval(() => {
			let {
				open,
				high,
				low,
				close,
				volume
			} = last;

			last.high = last.close = high + 1;
			last.volume = volume + 10;
			
			chart.updateData(last);
		}, 5000);
		*/
	}

	/*
	protected create_chartX()
	{
		const chart = kc.init(
			(this.renderRoot.querySelector('#chart') as HTMLElement)!, {
				//customApi: {
				//	formatDate: makeFormatDate(conf.period.timespan)
				//}
			}
		)!;

		// watermark container

		// priceunit container

		chart.setTimezone('Asia/Seoul');

		// restore indicators
		chart.createIndicator('MA', false, {id: 'candle_pane'});
		chart.createIndicator('VOL');
		chart.createIndicator('MACD');

		// chart style

		// https://github.com/klinecharts/KLineChart/discussions/549
		chart.setLoadDataCallback(async ({
			type,
			data,
			callback
		}) => {
			console.log('load_data_callback');
			console.log(`type: ${type}`);
			console.log('data', JSON.stringify(data, null, 4));

			//const {timestamp} = data;
			const timestamp = data?.timestamp || Date.now();
			const [to] = adjustFromTo(conf.period, timestamp, 1);
			//console.log(adjustFromTo(conf.period, timestamp, 1));
			const [from] = adjustFromTo(conf.period, to, 500);
			//console.log(adjustFromTo(conf.period, to, 500));

			// get strategy

			const kdata = await data_feeder.getHistoryKLineData({
				symbol: conf.symbol,
				period: conf.period,
				from,
				to
			});

			console.log(kdata);

			// FIXME
			const more = kdata.data.length > 1;

			callback(kdata.data, true);
		});

		chart.applyNewData([]);

		this.chart = chart;
	}
	*/

	protected async create_chart()
	{
		const feeder: data_source_t = new bithumb_t();
		// TODO
		await feeder.init();

		const resolutions = [
			'1', '3', '5', '10', '30',
			'h', '6h', '12h',
			'd'
		];
		const stf = new server_timeframes_t(resolutions);
		const tf = timeframe_t.parse(this.timeframe);

		const req_tf = stf.server_timeframe(tf);
		//console.log(req_tf);


		/*
		const chart = kc.init(
			(this.renderRoot.querySelector('#chart') as HTMLElement)!, {
				//timzezone: this.timzezone,
				customApi: {
					// XXX don't care right now
					formatDate: makeFormatDate(conf.period.timespan)
				}
			}
		)!;
		*/
		const chart = kc.init(
			(this.renderRoot.querySelector('#chart') as HTMLElement)!, {}
		)!;


		// watermark container

		// priceunit container

		//chart.setTimezone('Asia/Seoul');
		chart.setTimezone(this.timezone);

		// restore indicators
		chart.createIndicator('MA', false, {id: 'candle_pane'});
		chart.createIndicator('VOL');
		chart.createIndicator('MACD');

		// chart style
	

		// TODO: get from symbol info
		chart.setPriceVolumePrecision(0, 4);

		console.log(req_tf);
		console.log(req_tf.toString());
		const fetcher = feeder.create_feeder(
			{ticker: this.ticker},
			//'d'
			req_tf.toString()
		);

		this.chart = chart;

		const hist = await fetcher.get_history({
			from: 0,
			to: 0,
			first: true
		});
		//console.log(hist);

		const fmt = new Intl.DateTimeFormat('en-US', {
			timeZone: 'Asia/Seoul',
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			timeZoneName: 'short'
		});



		let ohlc: ohlc_t[] = hist.ohlc;

		const quantizer = get_quantizer(tf, ohlc[0].timestamp, this.timezone);
		// TODO: check timezone other than 'm'
		//if (req_tf.toString() === this.timeframe) {
		if (req_tf.isEqual(tf)) {
			//for (const bar of ohlc) {
				//console.log(fmt.format(new Date(bar.timestamp)));
			//}
		}
		else {
			let last_bar: ohlc_t = {
				...ohlc[0],
				timestamp: quantizer.cur_ts,
			};

			console.log(last_bar);
			console.log(fmt.format(new Date(last_bar.timestamp)));

			const merged_ohlc: ohlc_t[] = [];

			//for (const bar of ohlc) {
			for (let i=1; i<ohlc.length; ++i) {
				const bar = ohlc[i];
				const ts = quantizer.quantize(bar.timestamp);
				// update
				if (last_bar.timestamp === ts) {
					last_bar.close = bar.close;
					last_bar.high = Math.max(last_bar.high, bar.high);
					last_bar.low = Math.min(last_bar.low, bar.low);
					last_bar.volume += bar.volume;
				}
				// new one
				else {
					merged_ohlc.push(last_bar);
					last_bar = {
						...bar,
						timestamp: ts,
					};

					console.log(fmt.format(new Date(last_bar.timestamp)));
				}
			}
			merged_ohlc.push(last_bar);

			ohlc = merged_ohlc;


		}

		console.log(ohlc);

		chart.applyNewData(ohlc);

		let last_bar = ohlc[ohlc.length-1];

		fetcher.subscribe((tick: tick_t) => {
			const ts = quantizer.quantize(tick.timestamp);
			if (last_bar.timestamp === ts) {
				last_bar.high = Math.max(last_bar.high, tick.price);
				last_bar.low = Math.min(last_bar.low, tick.price);
				last_bar.close = tick.price;
				last_bar.volume += tick.volume;
			}
			else {
				last_bar = {
					timestamp: ts,
					open: tick.price,
					high: tick.price,
					low: tick.price,
					close: tick.price,
					volume: tick.volume,
				};
			}

			chart.updateData(last_bar);
			console.log(last_bar);
		});
	}


	protected _onResize()
	{
		//console.log('resize');
		this.chart?.resize();
		//this.requestUpdate();
	}
}

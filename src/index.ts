import { LitElement, css, html } from 'lit'
import { customElement } from 'lit/decorators.js'
//import * as kc from './klinecharts';
//import { type Chart } from './klinecharts';
import * as kc from 'klinecharts';
import { type Chart } from 'klinecharts';
import { kLineDataList } from './kline';

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

	protected create_chart()
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
		chart.applyNewData(chartDataList);

		this.chart = chart;
	}

	protected _onResize()
	{
		console.log('resize');
		this.chart?.resize();
		//this.requestUpdate();
	}
}

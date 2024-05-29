import { LitElement, css, html } from 'lit'
//import { customElement, property } from 'lit/decorators.js'
import { customElement } from 'lit/decorators.js'
//import * as kc from './klinecharts';
import * as kc from 'klinecharts';
import { kLineDataList } from './kline';

@customElement('f-chart')
export class FinChart extends LitElement {
	/*
	static styles = css`
		:host {
			display: block;
			height: 100%;
		}
	`;
	*/

	static styles = css``;

	constructor()
	{
		super();
		this.style.display = 'block';
		this.style.height = '100%';
	}

	// shadow DOM => light DOM
	createRenderRoot()
	{
		return this;
	}


	/*
	render()
	{
		return html`
			<style>
				#chart {
					height: 100%;
				}
			</style>
			<div id="chart"></div>
		`;
	}
	*/

	render()
	{
		return html``;
	}


	//	connectedCallback()
	//	{
	//		super.connectedCallback();
	//		// #shadow-root
	//		//console.log(this.renderRoot);
	//		//console.log(this.renderRoot.querySelector('div'));
	//		//kc.init(this.renderRoot.querySelector('div'));
	//
	//	}
	connectedCallback()
	{
		super.connectedCallback();
		//this.style.height = '100%';
	}

	firstUpdated(_args: Map<string,any>)
	{
		//this.style.height = '100%';
		//console.log(this.renderRoot.querySelector('div'));
		//kc.init(this.renderRoot.querySelector('div'));
		//const chart = kc.init(this.renderRoot.querySelector('#chart'));
		const chart = kc.init(this)!;
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
	}
}

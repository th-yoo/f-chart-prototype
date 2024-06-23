import dict_t from './dict';
import type {sym_info_t} from './datafeeder';

// https://charting-library.tradingview-widget.com/checksession.html
// session

// https://www.tradingview.com/charting-library-docs/latest/connecting_data/Symbology/
/*
export interface symbol_info_t {
	//symbol: string;
	// It's the name of the symbol.
	// It is a string that your users will be able to see.
	// Also, it will be used for data requests if you are not using tickers.
	// displayed on the top toobar
	name?: string;
	// It's an unique identifier for this particular symbol
	// in your symbology.
	// If you specify this property
	// then its value will be used for all data requests for this symbol.
	// ticker will be treated the same as name if not specified explicitly.
	ticker?: string;
	// Description of a symbol. Will be displayed
	// in the chart legend for this symbol.
	// shown in the candidate lists
	description?: string;
	// optional
	// {stock, index, forex, futures, crypto, expression, spread, cfd, *}
	type?: string;

	session?: string;
	session_holidays?: string;
	// override session, holiday
	corrections?: string;

	exchange?: string;
	listed_exchange?: string;

	timezone?: string;

	// fractional digits
	pricescale?: number;
	// minium moving price
	minmov?: number;

	// redundant
	has_intraday?: boolean;

	supported_resolution?: string[];
	data_status?: string;
	has_daily?: boolean;
	has_weekly_and_monthly?: boolean;
	full_name?: string;
};
*/

export default class symbols_t {
	//protected syms = new Map<string, sym_info_t>();
	protected searcher = new dict_t<sym_info_t>();

	constructor()
	{
	}

	// XXX: we only know the ticker name
	// exchange, type
	add_ticker(ticker: string)
	{
		// TODO
		const sym_info: sym_info_t = {
			ticker,
			exchange: 'bithumb',
			type: 'crypto',
		};
		//this.syms.set(ticker, sym_info);
		this.searcher.add(ticker, sym_info);
	}

	resolve(ticker: string): sym_info_t|undefined
	{
		//return this.syms.get(ticker);
		return this.searcher.lookup(ticker);
	}

	// FIXME: arguments
	search(key: string): sym_info_t[]
	{
		return this.searcher.commonPrefixSearch(key);
	}
}

// bithumb
//{
//	status: '0000'
//	data: [[
//		[0] timestamp: UNIX time
//		[1] open: string
//		[2] close: string
//		[3] high: string
//		[4] low: string
//		[5] volume: string
//	]...]
//}

//// available resolution
//// {1, 3, 5, 10, 30}m, {1, 6, 12, 24}h
//
//// 1500
////fetch(`https://api.bithumb.com/public/candlestick/ETH_KRW/1m`)
//// 2799
////fetch(`https://api.bithumb.com/public/candlestick/ETH_KRW/24h`)
//// 5001
//fetch(`https://api.bithumb.com/public/candlestick/ETH_KRW/1h`)
//.then(res => {
//	return res.json();
//})
//.then(res => {
//	console.log(Object.keys(res));
//	const {status, data} = res;
//	console.log(`status: ${status}`);
//
//	console.log(data.length);
//	console.log(data[0]);
//	console.log(data.slice(-1)[0]);
//	//console.log(res[res.length-1]);
//});

// https://apidocs.bithumb.com/reference/candlestick-rest-api

const endpoint = 'https://api.bithumb.com/public/candlestick';

// TODO: weekly, monthly

//function conv_resolution_tv2bithumb(res: string)
//{
//	if (/^\d+$/.test(res)) {
//		const m = Number(res);
//		if (m < 60) {
//			return `${m}m`;
//		}
//
//		const h = m/60;
//		if (!Number.isInteger(h)) {
//			throw new Error(`Unsupported resolution: ${res}`);
//		}
//
//		return `${m/60}h`;
//	}
//
//	if (res !== 'D' && res !== '1D') {
//		throw new Error(`Unsupported resolution: ${res}`);
//	}
//
//	return '24h';
//}

//const resolutions = [
//	'1', '3', '5', '10', '30',
//	'h', '6h', '12h',
//	'd'
//];

function conv_resolution_dayjs2bithumb(res: string)
{
	res = res.trim();

	console.log(`res: ${res}`);

	let unit = '';
	let val = 1;
	if (/^\d+$/.test(res)) {
		unit = 'm';
		val = Number(res);
	}
	else {
		unit = res.slice(-1);
		val = Number(res.slice(0, -1) || '1');
	}

	if (isNaN(val)) {
		throw new Error(`Invalid resolution: ${res}`);
	}

	switch (unit) {
	case 'm':
		if (![1, 3, 5, 10, 30].includes(val)) {
			//throw new Error(`Invalid resolution: ${res}`);
			break;
		}
		return `${val}${unit}`;
	case 'h':
		if (![1, 6, 12].includes(val)) {
			//throw new Error(`Invalid resolution: ${res}`);
			break;
		}
		return `${val}${unit}`;
	case 'd':
		if (val !== 1) {
			//throw new Error(`Invalid resolution: ${res}`);
			break;
		}
		return '24h';
	}

	throw new Error(`Invalid resolution: ${res}`);
}

export default async function fetch_bars(ticker: string, resolution: string)
{
	//resolution = conv_resolution_tv2bithumb(resolution);
	resolution = conv_resolution_dayjs2bithumb(resolution);

	const resp = await (
		await fetch(`${endpoint}/${ticker}/${resolution}`)
	).json();

	//	const fmt = new Intl.DateTimeFormat('en-US', {
	//		timzeZone: 'Asia/Seoul',
	//
	//		year: 'numeric',
	//		month: '2-digit',
	//		day: '2-digit',
	//		hour: '2-digit',
	//		minute: '2-digit',
	//		second: '2-digit',
	//		timeZoneName: 'short'
	//	});
	//
	//	console.log(typeof resp.data[0][0]);
	//	console.log(fmt.format(new Date(resp.data[0][0])));
	//	console.log(new Date(resp.data[0][0]));


	// bithumb specific
	//	const ts = resolution === '24h'
	//		? ((ts: number) => ts - 15 * 60 * 60 * 1000)
	//		: ((ts: number) => ts);

	// convert here
	return resp.data.map(bar => ({
		//timestamp: ts(bar[0]),
		timestamp: Number(bar[0]),
		open: Number(bar[1]),
		high: Number(bar[3]),
		low: Number(bar[4]),
		close: Number(bar[2]),
		volume: Number(bar[5])
	}));
}


if (typeof process !== 'undefined' && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
(async () => {
	// available resolution
	// {1, 3, 5, 10, 30}m, {1, 6, 12, 24}h
	// 24h UTC 15:00:00
	// 1h UTC
	// 1m UTC
	//const resp = await fetch_bars('ETH_KRW', '3m');
	const resp = await fetch_bars('ETH_KRW', 'd');
	console.log(resp);

	console.log(resp[0].timestamp);
	console.log(new Date(resp[0].timestamp));

	console.log(resp.slice(-1)[0].timestamp);
	console.log(new Date(resp.slice(-1)[0].timestamp));

	const now = Date.now();
	console.log(now);
	console.log(new Date(now));

})().then(() => process.exit(0))
.catch(e => {
	console.error(e);
	process.exit(1);
});
}


// https://apidocs.bithumb.com/reference/%ED%98%84%EC%9E%AC%EA%B0%80-%EC%A0%95%EB%B3%B4-%EC%A1%B0%ED%9A%8C-all?

const endpoint = 'https://api.bithumb.com/public/ticker';

// market = {'KRW', 'BTC'}
async function _fetch_symbols(market: string)
{
	const resp = await (
		await fetch(`${endpoint}/ALL_${market}`)
	).json();

	return Object.keys(resp.data).map(token => `${token}_${market}`);
}

export default async function fetch_symbols()
{
	const rv = await Promise.all(
		['KRW', 'BTC'].map(market => _fetch_symbols(market))
	);
	return rv.flat();
}

if (typeof process !== 'undefined' && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
(async () => {
	//const resp = await _fetch_symbols('KRW');
	const resp = await fetch_symbols();
	console.log(resp);

})().then(() => process.exit(0))
.catch(e => {
	console.error(e);
	process.exit(1);
});
}

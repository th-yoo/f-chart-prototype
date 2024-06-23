class entry_t<T> {
	protected prefixed_by_this: Set<string> = new Set();
	detail?: T;

	add_prefixed(s: string)
	{
		this.prefixed_by_this.add(s);
	}

	get prefixed()
	{
		return [...this.prefixed_by_this].sort();
	}
}

export default class dict_t<T> {
	//protected entries: Map<string, T> = new Map(); 
	protected entries: Map<string, entry_t<T>> = new Map(); 

	constructor()
	{
	}

	add(word: string, detail: T)
	{
		for (let i=1; i<=word.length; ++i) {
			let sub = word.slice(0, i);
			this.entries.set(
				sub,
				this.entries.get(sub) || new entry_t<T>()
			);
			this.entries.get(sub)!.add_prefixed(word);
		}
		this.entries.get(word)!.detail = detail;
	}

	lookup(word: string): T|undefined
	{
		return this.entries.get(word)?.detail;
	}

	//commonPrefixSearch(key: string): Array<T|undefined>
	commonPrefixSearch(key: string): Array<T>
	{
		//return this.entries.get(key)?.prefixed.map(
		//	e => this.lookup(e)
		//) || [];
		
		if (!this.entries.has(key)) {
			return [];
		}

		// ts doesn't understand what filter() does.
		return this.entries.get(key)!.prefixed
			.map(e => this.lookup(e)!)
			//.filter(e => this.lookup(e));
			.filter(e => e);

	}
}

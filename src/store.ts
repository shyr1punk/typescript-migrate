import {Item, ItemList, ItemQuery, ItemUpdate, emptyItemQuery} from './item';

export default class Store {
	localStorage: Storage;

	liveTodos: ItemList;

	/**
	 * @param {!string} name Database name
	 * @param {function()} [callback] Called when the Store is ready
	 */
	constructor(name: string, callback?: () => void) {
		this.localStorage = window.localStorage;

		if (callback) {
			callback();
		}
	}

	/**
	 * Read the local ItemList from localStorage.
	 *
	 * @returns {ItemList} Current array of todos
	 */
	getLocalStorage(): ItemList {
		return this.liveTodos || JSON.parse(localStorage.getItem(name) || '[]');
	};

	/**
	 * Write the local ItemList to localStorage.
	 *
	 * @param {ItemList} todos Array of todos to write
	 */
	setLocalStorage(todos: ItemList) {
		localStorage.setItem(name, JSON.stringify(this.liveTodos = todos));
	};

	/**
	 * Find items with properties matching those on query.
	 *
	 * @param {ItemQuery} query Query to match
	 * @param {function(ItemList)} callback Called when the query is done
	 *
	 * @example
	 * db.find({completed: true}, data => {
	 *	 // data shall contain items whose completed properties are true
	 * })
	 */
	find(query: ItemQuery, callback: (arg0: ItemList) => void) {
		const todos = this.getLocalStorage();
		let k;

		callback(todos.filter(todo => {
			for (k in query) {
				if (query[k] !== todo[k]) {
					return false;
				}
			}
			return true;
		}));
	}

	/**
	 * Update an item in the Store.
	 *
	 * @param {ItemUpdate} update Record with an id and a property to update
	 * @param {function()} [callback] Called when partialRecord is applied
	 */
	update(update: ItemUpdate, callback?: () => void) {
		const id = update.id;
		const todos = this.getLocalStorage();
		let i = todos.length;
		let k;

		while (i--) {
			if (todos[i].id === id) {
				for (k in update) {
					todos[i][k] = update[k];
				}
				break;
			}
		}

		this.setLocalStorage(todos);

		if (callback) {
			callback();
		}
	}

	/**
	 * Insert an item into the Store.
	 *
	 * @param {Item} item Item to insert
	 * @param {function()} [callback] Called when item is inserted
	 */
	insert(item: Item, callback?: () => void) {
		const todos = this.getLocalStorage();
		todos.push(item);
		this.setLocalStorage(todos);

		if (callback) {
			callback();
		}
	}

	/**
	 * Remove items from the Store based on a query.
	 *
	 * @param {ItemQuery} query Query matching the items to remove
	 * @param {function(ItemList)|function()} [callback] Called when records matching query are removed
	 */
	remove(query: ItemQuery, callback?: (arg0?: ItemList) => void) {
		let k;

		const todos = this.getLocalStorage().filter(todo => {
			for (k in query) {
				if (query[k] !== todo[k]) {
					return true;
				}
			}
			return false;
		});

		this.setLocalStorage(todos);

		if (callback) {
			callback(todos);
		}
	}

	/**
	 * Count total, active, and completed todos.
	 *
	 * @param {function(number, number, number)} callback Called when the count is completed
	 */
	count(callback: (arg0: number, arg1: number, arg2: number) => void) {
		this.find(emptyItemQuery, data => {
			const total = data.length;

			let i = total;
			let completed = 0;

			while (i--) {
				if(data[i].completed) {
					completed += 1;
				}
			}
			callback(total, total - completed, completed);
		});
	}
}

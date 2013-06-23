var clone = function(x) {
	return JSON.parse(JSON.stringify(x));
};

var do_diff = function(a, b) {
	if(typeof a === typeof b) {
		if(JSON.stringify(a) == JSON.stringify(b)) {
			return undefined;
		}

		if(typeof b !== 'object') {
			return b;
		}

		var diff = {}, key, allkeys = {};

		for(key in a) { allkeys[key] = true; }
		for(key in b) { allkeys[key] = true; }

		for(key in allkeys) {
			var d = do_diff(a[key], b[key]);
			if(typeof d !== 'undefined')
				diff[key] = d;
		}

		return diff;
	} else if(typeof b === 'undefined') {
		return 'delete';
	} else {
		return b;
	}
};

var apply_diff = function(obj, diff) {
	if(typeof obj === 'undefined') {
		return diff;
	}

	var local = JSON.parse(JSON.stringify(obj));

	if(typeof diff === 'object') {
		for(var key in diff) {
			local[key] = apply_diff(local[key], diff[key]);
			if(diff[key] == 'delete') {
				delete local[key];
			}
		}
		return local;
	}
	return diff;
};

if(typeof module !== 'undefined') {
	module.exports.apply_diff = apply_diff;
	module.exports.do_diff = do_diff;
	module.exports.clone = clone;
}

// TESTS

/*

var a = {
	treasures: {
		1: { x: 5, y: 8 },
		2: { x: 1, y: 0 }
	},
	pirates: {
		'lol': { x: 5, y: 5 }
	}
};

console.log('a', a);

var b = {
	treasures: {
		1: { x: 5 }
	},
	pirates: {
		'lol': { x: 7, y: 5 },
		'omg': { x: 11, y: 12 }
	}
};

console.log('b', b);

var diff = do_diff(a, b);

console.log('diff', diff);

var patched = apply_diff(a, diff);

console.log('patched', patched);

*/

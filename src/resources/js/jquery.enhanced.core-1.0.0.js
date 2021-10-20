/**
 * jquery.enhanced.core v1.0.0 DESCRIPTION: jquery 확장 Utilities SUPPORTED
 * BROWSERS: Modern Browsers and IE8+
 */
;
(function($, win, doc) {
	'use strict';

	var $win = $(win);
	var $doc = $(doc);
	var $html = $doc.find('html');
	var html = $html.get(0);
	var body, $body;

	// console이 없는 IE8에서 오류 방지
	(function() {
		if (win.console) {
			return;
		}
		var methods = ['assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error', 'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log', 'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd', 'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'];

		win.console = {};

		for (var i = 0, m; m = methods[i++];) {
			win.console[m] = $.noop;
		}
	}());

	$.clone = function(obj) {
		if (obj instanceof Date) {
			return new Date(obj);
		} else if (this.isArray(obj)) {
			return obj.slice(0);
		} else if (this.isPlainObject(obj)) {
			return this.extend(true, {}, obj);
		}
		return obj;
	};

	$.configuration = {
		ajax: {
			contentType: 'application/json;charset=UTF-8',
			dataType: 'json',
			progress: $.noop,
			traditional: true
		},
		pattern: {
			cellphone: /^\d{3}[-]?\d{3,4}[-]?\d{4}$/,
			email: /^.+@.+(\..+)+$/,
			password: /^.{6,}$/,
			telephone: /^\d{2,3}[-]?\d{3,4}[-]?\d{4}$/
		}
	};

	function writeCooike(name, value, options, shouldPrevent) {
		if (shouldPrevent) {
			return false;
		}
		options = $.extend({
			path: '/',
			expires: 10000
		// semi-permanent
		}, options);

		if ($.isNumber(options.expires)) {
			options.expires = $.time.slipDayOfMonth($.time.now(), options.expires);
		}
		try {
			var j = $.stringifyJSON(value);

			if (/^[{\[]/.test(j)) {
				value = j;
			}
		} catch (e) {
			// DO NOTHING
		}
		doc.cookie = [encodeURIComponent(String(name)), '=', encodeURIComponent(String(value)),
			options.expires && ';expires=' + options.expires.toString(),
			options.path && ';path=' + options.path,
			options.domain && ';domain=' + options.domain,
			options.secure && ';secure=' + options.secure,
			options.httpOnly && ';httpOnly=' + options.httpOnly].join('');

		return true;
	}

	$.cookie = {};
	$.cookie.isEnabled = function() {
		return !!win.navigator.cookieEnabled;
	};
	$.cookie.read = function(name) {
		var result = {};

		$.iterate(doc.cookie ? doc.cookie.split(/;\s*/) : [], function(s, i) {
			var p = s.split(/\s*=\s*/);
			var n = decodeURIComponent(p[0]);
			var v = decodeURIComponent(p[1]);

			if (name && name !== n) {
				return;
			}
			try {
				v = $.parseJSON(v);
			} catch (e) {
				// DO NOTHING
			}
			if (name === n) {
				result = v;
				return false;
			}
			if (!name) {
				result[n] = v;
			}
		});

		return name && $.isEmpty(result) ? undefined : result;
	};
	$.cookie.remove = function(name) {
		writeCooike(name, '', {
			expires: -1
		});
		return this;
	};
	$.cookie.write = function(name, value, options) {
		writeCooike(name, value, options);
		return this;
	};
	$.cookie.writeIfNotEqual = function(name, value, options) {
		return writeCooike(name, value, options, this.read(name) == value);
	};
	$.cookie.writeIfNotExist = function(name, value, options) {
		return writeCooike(name, value, options, this.read(name) !== undefined);
	};

	$.existsIn = function(item, container) {
		if (this.isString(container)) {
			return new RegExp('(^|\\s+)(' + item + ')(\\s+|$)', 'g').test(container);
		}
		if (this.isArray(container)) {
			return this.inArray(item, container) >= 0;
		}
		if (this.isPlainObject(container)) {
			return container[item] !== undefined;
		}
		return false;
	};

	function weed(s, p) {
		return (s || '').replace(p, '');
	}

	$.format = function(pattern) {
		var args = $.makeArray(arguments);

		return pattern.replace(/\{(\d+)}/g, function(holder, val) {
			return (args[$.parseNumber(val) + 1] || holder).toString();
		});
	};
	$.format.ISO8601 = /^(\d{4})-(\d{2})-(\d{2})([T](\d{2}):(\d{2}):(\d{2})(\.\d{3})?(Z|z|([+-])(\d{2})(:(\d{2}))?)?)?$/;
	$.format.formatCurrency = function(n) {
		return (n || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	};
	$.format.formatDate = function(date) {
		date = $.time.parse(date);
		return this('{0}-{1}-{2}', date.getFullYear(), $.zerofill(date.getMonth() + 1), $.zerofill(date.getDate()));
	};
	$.format.formatDateTime = function(date) {
		return [this.formatDate(date), this.formatTime(date)].join(' ');
	};
	$.format.formatISO8601 = function(date) {
		return [this.formatDate(date), 'T', this.formatTime(date), $.time.getTimeZone(date)].join('');
	};
	$.format.formatTime = function(date) {
		date = $.time.parse(date);
		return this('{0}:{1}:{2}', $.zerofill(date.getHours()), $.zerofill(date.getMinutes()), $.zerofill(date.getSeconds()));
	};
	$.format.isCellphone = function(s) {
		return this.isMatched(s, $.configuration.pattern.cellphone);
	};
	$.format.isEmail = function(s) {
		return this.isMatched(s, $.configuration.pattern.email);
	};
	$.format.isISO8601 = function(s) {
		return this.isMatched(s, this.ISO8601);
	};
	$.format.isMatched = function(s, pattern) {
		return pattern.test(s);
	};
	$.format.isPassword = function(s) {
		return this.isMatched(s, $.configuration.pattern.password);
	};
	$.format.isTelephone = function(s) {
		return this.isMatched(s, $.configuration.pattern.telephone);
	};
	$.format.weedHyphen = function(s) {
		return weed(s, /(-)/g);
	};
	$.format.weed = function(s, w) {
		return weed(s, new RegExp('(' + w + ')', 'g'));
	};
	$.format.weedSlash = function(s) {
		return weed(s, /(\/)/g);
	};

	$.issueToken = function(prefix, length) {
		if ($.isNumber(prefix)) {
			length = prefix;
			prefix = undefined;
		}
		length = length || 64;
		var tokens = [prefix || ''];
		var TOKEN_SOURCE = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

		for (var i = 0; i < length; i++) {
			tokens.push(TOKEN_SOURCE[Math.floor(Math.random() * TOKEN_SOURCE.length)]);
		}
		return tokens.join('');
	};

	$.keys = function(obj) {
		var keys = [];

		$.iterate(obj, function(value, key) {
			keys.push(key);
		});

		return keys;
	};

	$.http = function(method, path, data, headers) {
		if ($.isPlainObject(data) && $.existsIn(method, ['post', 'patch', 'put']) && /^application\/json.+$/.test($.configuration.ajax.contentType)) {
			data = $.stringifyJSON(data);
		}
		var deferred = $.Deferred();
		$.configuration.ajax.progress();

		if(!headers) {
			headers = {'X-SmartOne-Api-Token': 'PN2VLJKGUGVYgbvlZIcvkoIYjjfRy6BE'};
		}
		$.ajax($.extend({}, $.configuration.ajax, {
			headers: headers,
			method: method,
			url: path,
			data: data
		})).done(function(response) {
			$.configuration.ajax.progress(true);
			deferred.resolve(response);
		}).fail(function(rawRespose) {
			$.configuration.ajax.progress(true);
			deferred.reject($.http.parseResponse(rawRespose));
		});

		return deferred.promise();
	};
	$.http.del = function(path, data, headers) {
		return this('delete', path, data, headers);
	};
	$.http.get = function(path, data, headers) {
		return this('get', path, data, headers);
	};
	$.http.patch = function(path, data, headers) {
		return this('patch', path, data, headers);
	};
	$.http.post = function(path, data, headers) {
		return this('post', path, data, headers);
	};
	$.http.put = function(path, data, headers) {
		return this('put', path, data, headers);
	};
	$.http.parseResponse = function(rawResponse) {
		if ($.isPlainObject(rawResponse.responseJSON)) {
			return rawResponse.responseJSON;
		}
		try {
			return $.parseJSON(/<script>window\['ngineeus-response-text-html']='(.+)';<\/script>/.exec(rawResponse.responseText)[1]);
		} catch (e) {
			return {
				result: {
					status: rawResponse.status,
					code: -1,
					message: rawResponse.statusText
				},
				data: {},
				info: {}
			};
		}
	};
	$.http.redirect = function(hideHistory, url, data) {
		if (typeof hideHistory !== 'boolean') {
			data = url;
			url = hideHistory;
			hideHistory = false;
		}
		var urlAndQuerystring = this.querystringify(url, data);

		if (!hideHistory) {
			location.replace(urlAndQuerystring);
		} else {
			location.href = urlAndQuerystring;
		}
		return this;
	};
	$.http.urlencode = function(data) {
		if (!$.isPlainObject(data)) {
			return '';
		}
		var encoded = [];

		$.iterate(data, function(v, k) {
			encoded.push(k + '=' + encodeURIComponent(v));
		});

		return encoded.join('&');
	};
	$.http.querystringify = function(url, data) {
		var querystring = this.urlencode(data);
		return url + (querystring ? '?' + querystring : '');
	};

	$.isEmpty = function(obj) {
		if (obj === undefined || obj === null) {
			return true;
		}
		if (this.isString(obj)) {
			return this.trim(obj).length < 1;
		}
		if (obj.length !== undefined && $.isNumber(obj.length)) {
			return obj.length < 1;
		}
		if (this.isPlainObject(obj)) {
			return this.isEmptyObject(obj);
		}
		return false;
	};

	$.isEqual = function(a, b) {
		if (typeof a !== typeof b) {
			return false;
		}
		if (a instanceof $.DateTime && b instanceof $.DateTime) {
			return a.equals(b);
		}
		if (this.isArray(a) && this.isArray(b)) {
			if (a.length !== b.length) {
				return false;
			}
			for (var i = 0, item; item = a[i]; i++) {
				if (!this.isEqual(item, b[i])) {
					return false;
				}
			}
			return true;
		}
		if (this.isPlainObject(a) && this.isPlainObject(b)) {
			var keysOfA = this.findKeys(a);

			for (var j = 0, k; i = keysOfA[j]; j++) {
				if (!this.isEqual(a[k], b[k])) {
					return false;
				}
			}
			return true;
		}
		return a === b;
	};

	$.isJq = function(el) {
		return !!(el && el.jquery);
	};

	$.isNumber = function(obj) {
		return typeof obj === 'number';
	};

	$.isString = function(obj) {
		return typeof obj === 'string';
	};

	$.iterate = function(collection, fn) {
		if ($.isArray(collection) || ($.isJq(collection) && collection.length)) {
			for (var i = 0; i < collection.length; i++) {
				if (fn(collection[i], i, collection) === false) {
					break;
				}
			}
		} else if ($.isPlainObject(collection)) {
			for ( var k in collection) {
				if (!collection.hasOwnProperty(k)) {
					continue;
				}
				if (fn(collection[k], k, collection) === false) {
					break;
				}
			}
		} else {
			return null;
		}
		return this;
	};

	$.jq = function(el) {
		return this.isJq(el) ? el : $(el);
	};

	$.keyCode = {
		ALT: 18,
		ARROW_DOWN: 40,
		ARROW_LEFT: 37,
		ARROW_RIGHT: 39,
		ARROW_UP: 38,
		BACKSPACE: 8,
		CTRL: 17,
		DELETE: 46,
		END: 35,
		ENTER: 13,
		ESC: 27,
		HOME: 36,
		PAGE_DOWN: 34,
		PAGE_UP: 33,
		SHIFT: 16,
		SPACE: 32,
		TAB: 9
	};
	$.keyCode.getActivatable = function(tagName) {
		switch (tagName) {
		case 'a':
			return [this.ENTER];
		case 'button':
			return [this.ENTER, this.SPACE];
		default:
			return [this.SPACE];
		}
	};
	$.keyCode.find = function(ev) {
		ev = ev || win.event;
		return ev.which || ev.keyCode;
	};
	$.keyCode.isNumberStroked = function(ev) {
		return (48 <= ev.keyCode && ev.keyCode <= 57 && !ev.shiftKey) || (96 <= ev.keyCode && ev.keyCode <= 105);
	};

	function filterDialogOptions(options) {
		return $.extend({}, $.mbox.defaultOptions, $.isString(options) ? {
			text: options
		} : options);
	}

	$.mbox = {};
	$.mbox.alert = function(options) {
		options = filterDialogOptions(options);
		alert(options.text);
		options.onClose();
	};
	$.mbox.confirm = function(options) {
		options = filterDialogOptions(options);

		if (confirm(options.text)) {
			options.onOK();
		} else {
			options.onCancel();
		}
	};
	$.mbox.defaultOptions = {
		onCancel: $.noop,
		onClose: $.noop,
		onOK: $.noop,
		text: '',
		title: ''
	};

	$.normalize = function(s, defaultValue) {
		if ($.isString(s)) {
			return s.replace(/[A-Z]/g, function($1) {
				return '-' + $1.toLowerCase();
			}).replace(/[<|>|~|\+|\*|#|\s|_]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
		}
		return defaultValue;
	};

	/**
	 * ex. fn of fns --------------- function(callback) { // DO SOMETHING
	 * callback(err, result); }
	 *
	 * ex. callback --------------- function(results) { // DO SOMETHING with
	 * results // results is array of {err: null, result: SOMETHING} }
	 */

	$.parallel = function(fns, callback) {
		var results = [];
		var count = 0;

		if (!fns.length) {
			callback(results);
			return this;
		}
		return this.iterate(fns, function(fn, i) {
			fn(function(result) {
				results[i] = result;

				if (++count === fns.length) {
					callback(results);
				}
			});
		});
	};

	$.parseNumber = function(s) {
		if (this.isNumber(s)) {
			return s;
		}
		if (!this.isString(s)) {
			return 0;
		}
		s = s.replace(/,/g, '');

		if (isNaN(s) || $.isEmpty(s)) {
			return 0;
		}
		return s.search(/\./) < 0 ? parseInt(s, 10) : parseFloat(s);
	};

	$.phone = {};
	$.phone.pattern = /^([A-Z]{2})(-\d+)+$/;
	$.phone.isValid = function(value) {
		return this.pattern.test(value);
	};
	$.phone.parse = function(value) {
		if (!this.isValid(value)) {
			return {
				country: 'XX',
				numbers: []
			};
		}
		value = value.split('-');
		var phone = {
			country: value[0],
			numbers: []
		};

		for (var i = 1, number; number = value[i++];) {
			phone.numbers.push(number);
		}
		return phone;
	};
	$.phone.stringify = function(showCountry, phone) {
		if (typeof showCountry !== 'boolean') {
			phone = showCountry;
			showCountry = false;
		}
		var phoneNumber = phone.numbers.join('-');

		if (showCountry) {
			phoneNumber = phone.country + '-' + phoneNumber;
		}
		return phoneNumber;
	};

	$.stringifyJSON = function(j) {
		return JSON.stringify(j);
	};

	function slipTime(date, unit, step) {
		return withTime(date, unit, step + Date.prototype['get' + unit].call(date));
	}

	function withTime(date, unit, time) {
		var d = new Date(date);
		Date.prototype['set' + unit].call(d, time);

		return d;
	}

	$.time = {};
	$.time.atStartOfDay = function(date) {
		var d = new Date(date);

		d.setHours(0);
		d.setMinutes(0);
		d.setSeconds(0);
		d.setMilliseconds(0);

		return d;
	};
	$.time.getTimeZone = function(date) {
		var offset = (date || this.now()).getTimezoneOffset();
		var timezone = [];

		if (offset < 0) {
			offset *= -1;
			timezone.push('+', $.zerofill(Math.floor(offset / 60)), ':', $.zerofill(offset % 60));
		} else if (offset > 0) {
			timezone.push('-', $.zerofill(Math.floor(offset / 60)), ':', $.zerofill(offset % 60));
		} else {
			timezone.push('Z');
		}
		return timezone.join('');
	};
	$.time.isValid = function(year, month, dayOfMonth) {
		if ($.isEmpty(year)) {
			return false;
		}
		if (month === undefined && $.isString(year)) {
			var data = /^(\d{4})-?(\d{2})-?(\d{2})$/.exec(year);

			if (!data) {
				return false;
			}
			year = data[1];
			month = data[2];
			dayOfMonth = data[3];
		}
		year = $.parseNumber(year);
		month = $.parseNumber(month) - 1;
		dayOfMonth = $.parseNumber(dayOfMonth);
		var d = new Date(year, month, dayOfMonth);

		return year === d.getFullYear() && month === d.getMonth() && dayOfMonth === d.getDate();
	};
	$.time.now = function() {
		return new Date();
	};
	$.time.of = function(year, month, dayOfMonth, hour, minute, second, millisecond) {
		year = year || 1970;
		month = month || 0;
		dayOfMonth = dayOfMonth || 1;
		hour = hour || 0;
		minute = minute || 0;
		second = second || 0;
		millisecond = millisecond || 0;

		return new Date(year, month, dayOfMonth, hour, minute, second, millisecond);
	};
	$.time.parse = function(s) {
		if (s instanceof Date) {
			return new Date(s);
		}
		if (/^\d{4}-?\d{2}-?\d{2}$/.test(s)) {
			s = $.format.weedHyphen(s);
			return new Date($.parseNumber(s.substr(0, 4)), $.parseNumber(s.substr(4, 2)) - 1, $.parseNumber(s.substr(6, 2)));
		}
		if ($.format.isISO8601(s)) {
			return this.parseISO8601(s);
		}
		return new Date(s);
	};
	$.time.parseISO8601 = function(s) {
		if ($.env.browser.isModern()) {
			return new Date(s);
		}
		var data = $.format.ISO8601.exec(s);
		var y = $.parseNumber(data[1] || 1970);
		var m = $.parseNumber(data[2] || 1) - 1;
		var d = $.parseNumber(data[3] || 1);

		if (!data[4]) {
			return new Date(y, m, d);
		}
		var H = $.parseNumber(data[5] || 0);
		var M = $.parseNumber(data[6] || 0);
		var S = $.parseNumber(data[7] || 0);
		var ms = data[8] ? $.parseNumber(data[8].substr(1)) : 0;
		var timestamp = Date.UTC(y, m, d, H, M, S, ms);
		var zH = $.parseNumber(data[11] || 0);
		var zM = $.parseNumber(data[13] || 0);

		return new Date(timestamp + (data[10] === '+' ? -1 : 1) * (zH * 60 + zM) * 60 * 1000);
	};
	$.time.slipYears = function(date, years) {
		return slipTime(date, 'FullYear', years);
	};
	$.time.slipMonths = function(date, months) {
		return slipTime(date, 'Month', months);
	};
	$.time.slipDayOfMonth = function(date, daysOfMonth) {
		return slipTime(date, 'Date', daysOfMonth);
	};
	$.time.slipHours = function(date, hours) {
		return slipTime(date, 'Hours', hours);
	};
	$.time.slipMinutes = function(date, minutes) {
		return slipTime(date, 'Minutes', minutes);
	};
	$.time.slipSeconds = function(date, seconds) {
		return slipTime(date, 'Seconds', seconds);
	};
	$.time.slipMilliseconds = function(date, milliseconds) {
		return slipTime(date, 'Milliseconds', milliseconds);
	};
	$.time.stamp = function(date) {
		date = date || this.now();
		return $.format('{0}{1}{2}{3}{4}{5}', $.zerofill(date.getFullYear(), 4), $.zerofill(date.getMonth() + 1, 2), $.zerofill(date.getDate(), 2), $.zerofill(date.getHours(), 2), $.zerofill(date.getMinutes(), 2), $.zerofill(date.getSeconds(), 2));
	};
	$.time.withYear = function(date, year) {
		return withTime(date, 'FullYear', year);
	};
	$.time.withMonth = function(date, month) {
		return withTime(date, 'Month', month);
	};
	$.time.withDayOfMonth = function(date, dayOfMonth) {
		return withTime(date, 'Date', dayOfMonth);
	};
	$.time.withHour = function(date, hour) {
		return withTime(date, 'Hours', hour);
	};
	$.time.withMinute = function(date, minute) {
		return withTime(date, 'Minutes', minute);
	};
	$.time.withSecond = function(date, second) {
		return withTime(date, 'Seconds', second);
	};
	$.time.withMillisecond = function(date, millisecond) {
		return withTime(date, 'Milliseconds', millisecond);
	};

	function waterfall(fns, err, result, callback) {
		(fns.shift() || callback)(err, result, function(e, r) {
			waterfall(fns, e, r, callback);
		});

		return this;
	}

	/**
	 * ex. 1st fn of fns --------------- function(callback) { // DO SOMETHING
	 * callback(err, result); }
	 *
	 * ex. 2nd and later fn of fns --------------- function(err, result,
	 * callback) { // DO SOMETHING with err and result callback(err, result); }
	 *
	 * ex. callback --------------- function(err, result) { // DO SOMETHING with
	 * err and result }
	 */

	$.unescapeHtml = function(value) {
		return $('<textarea/>').html(value).text();
	};
	$.waterfall = function(fns, callback) {
		fns = this.clone(fns);

		fns.shift()(function(err, result) {
			waterfall(fns, err, result, callback);
		});

		return this;
	};

	$.zerofill = function(value, length) {
		length = (length || 2) - value.toString().length;
		return (length > 0 ? (new Array(length + (/\./.test(value) ? 2 : 1))).join('0') : '') + value;
	};

	$.fn.calcDimension = function() {
		if (!this.length) {
			return {};
		}
		var el = this.get(0);
		var rect = el.getBoundingClientRect();
		var docElem = doc.documentElement;

		return {
			height: this.outerHeight(true),
			left: Math.round(rect.left + (win.pageXOffset || docElem.scrollLeft || body.scrollLeft) - (docElem.clientLeft || body.clientLeft || 0)),
			top: Math.round(rect.top + (win.pageYOffset || docElem.scrollTop || body.scrollTop) - (docElem.clientTop || body.clientTop || 0)),
			width: this.outerWidth(true)
		};
	};

	$.fn.forEach = function(callback) {
		return this.each(function(i, el) {
			var $el = $(el);
			callback.call($el, i, $el);
		});
	}

	$.fn.upload = function(callback, progress, interval) {
		return this.each(function(i) {
			var $form = $(this);

			if (this.tagName !== 'FORM') {
				$form = $form.closest('form');
			}
			if ($.isEmpty($form)) {
				return;
			}
			var UPLOAD_IFRAME = 'ngineeus-upload-iframe-' + i;

			var $iframe = $(doc.createElement('iframe')).attr({
				id: UPLOAD_IFRAME,
				name: UPLOAD_IFRAME,
				style: 'position:absolute;top:0;left:-999999px;width:0;height:0;border:0;'
			}).appendTo(body).on('load', function() {
				var innerWindow = $iframe.get(0).contentWindow;
				var data = innerWindow['ngineeus-response-text-html'];

				if (data) {
					callback($.parseJSON(data));
				} else {
					callback($.http.parseResponse(innerWindow.document.head.innerHTML));
				}
				$form.removeAttr('target');
				$iframe.remove();
			});

			$form.attr('target', UPLOAD_IFRAME).append().submit();
		});
	};

	// 실행 환경 분석
	(function() {
		if (!$.ua) {
			return;
		}
		$.env = {};
		$.env.browser = {
			name: $.normalize($.ua.browser.name, 'unknown'),
			version: $.parseNumber($.ua.browser.major)
		};
		$.env.browser.isIE = function() {
			return this.name === 'ie';
		};
		$.env.browser.isModern = function() {
			return !this.isIE() || this.version >= 9;
		};
		$.env.device = {
			model: $.normalize($.ua.device.model, 'unknown'),
			type: $.normalize($.ua.device.type, 'normal')
		};
		$.env.device.isMobile = function() {
			return this.type === 'mobile';
		};
		$.env.device.isNormal = function() {
			return this.type === 'normal'
		};
		$.env.device.isTablet = function() {
			return this.type === 'tablet';
		};
		$.env.os = {
			archit: $.normalize($.ua.cpu.architecture, 'unknown'),
			name: $.normalize($.ua.os.name, 'unknown'),
			version: $.normalize($.ua.os.version, 'unknown')
		};

		if (!$.env.browser.isModern()) {
			$.iterate(['article', 'aside', 'footer', 'header', 'main', 'nav', 'section'], function(tag) {
				var el = doc.createElement(tag);
				el = null;
			});
		}

		var classes = [];

		if ($.env.browser.isIE() && $.env.browser.version < 12) {
			for (var i = 11; i > $.env.browser.version; i--) {
				classes.unshift('lt-ie' + i);
			}
			classes.unshift('is-ie', 'is-ie' + $.env.browser.version);
		}

		classes.unshift('js');

		classes.push('browser-name-' + $.env.browser.name, 'browser-version-' + $.env.browser.version, 'device-model-' + $.env.device.model, 'device-type-' + $.env.device.type, 'os-archit-' + $.env.os.archit, 'os-name-' + $.env.os.name, 'os-version-' + $.env.os.version);

		$html.removeClass('no-js').addClass(classes.join(' '));
	})();

	// supports Handlebars.js
	(function() {
		var Handlebars = win.Handlebars;

		function each(args, fn) {
			var result;

			$.iterate(filterArguments(args), function(v, i) {
				result = i === 0 ? v : fn(result, v);
			});

			return result;
		}

		function filterArguments(args) {
			return $.makeArray(args).splice(0, args.length - 1);
		}

		$.fn.template = function(data) {
			var template = $(this).eq(0).html();
			return Handlebars ? Handlebars.compile(template)(data) : template;
		};

		if (Handlebars) {
			Handlebars.registerHelper({
				add: function() {
					return each(arguments, function(p, v) {
						return p + v;
					});
				},
				and: function() {
					return !!each(arguments, function(p, v) {
						return p && v;
					});
				},
				empty: function(v) {
					return $.isEmpty(v);
				},
				eq: function(a, b) {
					return a == b;
				},
				formatCurrency: function(n) {
					return $.format.formatCurrency(n);
				},
				formatDate: function(date) {
					if ($.isString(date)) {
						date = $.time.parse(date)
					}
					return $.format.formatDate(date);
				},
				formatDateTime: function(date, breaksDateAndTime) {
					if ($.isString(date)) {
						date = $.time.parse(date)
					}
					date = $.format.formatDateTime(date);

					if (breaksDateAndTime) {
						date = date.replace(' ', '<br>');
					}
					return date;
				},
				formatPhoneNumber: function(s, showCountry) {
					return $.phone.stringify(showCountry, $.phone.parse(s));
				},
				formatScale: function(number, scale) {
					return number.toFixed(scale);
				},
				gt: function(a, b) {
					return a > b;
				},
				gte: function(a, b) {
					return a >= b;
				},
				length: function(c) {
					return c && c.length || 0;
				},
				lt: function(a, b) {
					return a < b;
				},
				lte: function(a, b) {
					return a <= b;
				},
				mod: function(a, b) {
					return a % b;
				},
				multiply: function(a, b) {
					return a * b;
				},
				ne: function(a, b) {
					return a != b;
				},
				not: function(v) {
					return !v;
				},
				notEmpty: function(v) {
					return !$.isEmpty(v);
				},
				or: function() {
					return !!each(arguments, function(p, v) {
						return p || v;
					});
				},
				stringifyJSON: function(o) {
					return $.stringifyJSON(o);
				}
			});
		}
	})();

	// supports Hammer.js
	(function() {
		if (!win.Hammer) {
			$.fn.hammer = function() {
				return this;
			};

			return;
		}
		var Hammer = win.Hammer;
		var emit = Hammer.Manager.prototype.emit;

		$.fn.hammer = function(options) {
			return this.each(function() {
				var $el = $(this);

				if (!$el.data('hammer')) {
					$el.data('hammer', new Hammer(this, options));
				}
			});
		};

		Hammer.Manager.prototype.emit = function(type, data) {
			emit.call(this, type, data);
			$(this.element).trigger({
				type: type,
				gesture: data
			});
		};
	})();

	$(function($) {
		body = doc.body;
		$body = $(body);
	});

	
	// strage
	$.storage = {};
	$.storage.get = function(key) {
		if (storageAvailable('localStorage')) {
			//return localStorage[key];
			if(!localStorage[key]) {
				return $.cookie.read(key);	// compatibility for previous version
			} else {
				return localStorage[key];
			}
		} else {
			return $.cookie.read(key);
		}
	};
	$.storage.set = function(key, value) {
		if (storageAvailable('localStorage')) {
			localStorage[key] = value;
		} else {
			$.cookie.write(key, value, {expires: 2147483647});
		}
	};
	$.storage.remove = function(key) {
		if (storageAvailable('localStorage')) {
			localStorage.removeItem(key);
		} else {
			$.cookie.remove(key);
		}
	};
	$.storage.getJson = function(key) {
		if (storageAvailable('localStorage')) {
			if(localStorage[key])
				return JSON.parse(localStorage[key]);
		} else {
			return $.cookie.read(key);
		}
	};
	$.storage.setJson = function(key, value) {
		if (storageAvailable('localStorage')) {
			localStorage[key] = JSON.stringify(value);
		} else {
			$.cookie.write(key, value, {expires: 2147483647});
		}
	};
	function storageAvailable(type) {
	    try {
	        var storage = window[type],
	            x = '__storage_test__';
	        storage.setItem(x, x);
	        storage.removeItem(x);
	        return true;
	    }
	    catch(e) {
	        return e instanceof DOMException && (
	            // Firefox를 제외한 모든 브라우저
	            e.code === 22 ||
	            // Firefox
	            e.code === 1014 ||
	            // 코드가 존재하지 않을 수도 있기 때문에 테스트 이름 필드도 있습니다.
	            // Firefox를 제외한 모든 브라우저
	            e.name === 'QuotaExceededError' ||
	            // Firefox
	            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
	            // 이미 저장된 것이있는 경우에만 QuotaExceededError를 확인하십시오.
	            storage.length !== 0;
	    }
	}

	
})(jQuery, window, document);
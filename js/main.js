// Avoid `console` errors in browsers that lack a console.
(function() {
	var method;
	var noop = function () {};
	var methods = [
		'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
		'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
		'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
		'timeStamp', 'trace', 'warn'
	];
	var length = methods.length;
	var console = (window.console = window.console || {});

	while (length--) {
		method = methods[length];

		// Only stub undefined methods.
		if (!console[method]) {
			console[method] = noop;
		}
	}
}());

// ===============================================================[ Plugins ]===



// ==================================================================[ Code ]===
$(function() { // document.ready

	// Edit player names
	$('table')
		.on('click', 'div.player', function() {
			var el = $(this);
			var th = el.parent();
			var val = el.html();

			th.html(
				$('<input>')
					.addClass('player')
					.val(val)
			);
			th.find('input').focus();
		})
		.on('blur', 'input.player', function() {
			var el = $(this);
			var th = el.parent();
			var val = el.val();

			th.html(
				$('<div>')
					.addClass('player')
					.html(val)
			);
		});

});


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

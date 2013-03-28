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

/**
 * TableDnD plug-in for JQuery, allows you to drag and drop table rows
 * You can set up various options to control how the system will work
 * Copyright (c) Denis Howlett <denish@isocra.com>
 * Licensed like jQuery, see http://docs.jquery.com/License.
 *
 * Configuration options:
 *
 * onDragStyle
 *     This is the style that is assigned to the row during drag. There are limitations to the styles that can be
 *     associated with a row (such as you can't assign a border--well you can, but it won't be
 *     displayed). (So instead consider using onDragClass.) The CSS style to apply is specified as
 *     a map (as used in the jQuery css(...) function).
 * onDropStyle
 *     This is the style that is assigned to the row when it is dropped. As for onDragStyle, there are limitations
 *     to what you can do. Also this replaces the original style, so again consider using onDragClass which
 *     is simply added and then removed on drop.
 * onDragClass
 *     This class is added for the duration of the drag and then removed when the row is dropped. It is more
 *     flexible than using onDragStyle since it can be inherited by the row cells and other content. The default
 *     is class is tDnD_whileDrag. So to use the default, simply customise this CSS class in your
 *     stylesheet.
 * onDrop
 *     Pass a function that will be called when the row is dropped. The function takes 2 parameters: the table
 *     and the row that was dropped. You can work out the new order of the rows by using
 *     table.rows.
 * onDragStart
 *     Pass a function that will be called when the user starts dragging. The function takes 2 parameters: the
 *     table and the row which the user has started to drag.
 * onAllowDrop
 *     Pass a function that will be called as a row is over another row. If the function returns true, allow
 *     dropping on that row, otherwise not. The function takes 2 parameters: the dragged row and the row under
 *     the cursor. It returns a boolean: true allows the drop, false doesn't allow it.
 * scrollAmount
 *     This is the number of pixels to scroll if the user moves the mouse cursor to the top or bottom of the
 *     window. The page should automatically scroll up or down as appropriate (tested in IE6, IE7, Safari, FF2,
 *     FF3 beta
 * dragHandle
 *     This is a jQuery mach string for one or more cells in each row that is draggable. If you
 *     specify this, then you are responsible for setting cursor: move in the CSS and only these cells
 *     will have the drag behaviour. If you do not specify a dragHandle, then you get the old behaviour where
 *     the whole row is draggable.
 *
 * Other ways to control behaviour:
 *
 * Add class="nodrop" to any rows for which you don't want to allow dropping, and class="nodrag" to any rows
 * that you don't want to be draggable.
 *
 * Inside the onDrop method you can also call $.tableDnD.serialize() this returns a string of the form
 * <tableID>[]=<rowID1>&<tableID>[]=<rowID2> so that you can send this back to the server. The table must have
 * an ID as must all the rows.
 *
 * Other methods:
 *
 * $("...").tableDnDUpdate()
 * Will update all the matching tables, that is it will reapply the mousedown method to the rows (or handle cells).
 * This is useful if you have updated the table rows using Ajax and you want to make the table draggable again.
 * The table maintains the original configuration (so you don't have to specify it again).
 *
 * $("...").tableDnDSerialize()
 * Will serialize and return the serialized string as above, but for each of the matching tables--so it can be
 * called from anywhere and isn't dependent on the currentTable being set up correctly before calling
 *
 * Known problems:
 * - Auto-scoll has some problems with IE7  (it scrolls even when it shouldn't), work-around: set scrollAmount to 0
 *
 * Version 0.2: 2008-02-20 First public version
 * Version 0.3: 2008-02-07 Added onDragStart option
 *                         Made the scroll amount configurable (default is 5 as before)
 * Version 0.4: 2008-03-15 Changed the noDrag/noDrop attributes to nodrag/nodrop classes
 *                         Added onAllowDrop to control dropping
 *                         Fixed a bug which meant that you couldn't set the scroll amount in both directions
 *                         Added serialize method
 * Version 0.5: 2008-05-16 Changed so that if you specify a dragHandle class it doesn't make the whole row
 *                         draggable
 *                         Improved the serialize method to use a default (and settable) regular expression.
 *                         Added tableDnDupate() and tableDnDSerialize() to be called when you are outside the table
 * Version 0.6: 2011-12-02 Added support for touch devices
 * Version 0.7  2012-04-09 Now works with jQuery 1.7 and supports touch, tidied up tabs and spaces
 */
var hasTouch="ontouchstart"in document.documentElement,startEvent=hasTouch?"touchstart":"mousedown",moveEvent=hasTouch?"touchmove":"mousemove",endEvent=hasTouch?"touchend":"mouseup";hasTouch&&($.each(["touchstart","touchmove","touchend"],function(a,b){jQuery.event.fixHooks[b]=jQuery.event.mouseHooks}),alert("has Touch"));
jQuery.tableDnD={currentTable:null,dragObject:null,mouseOffset:null,oldY:0,build:function(a){this.each(function(){this.tableDnDConfig=jQuery.extend({onDragStyle:null,onDropStyle:null,onDragClass:"tDnD_whileDrag",onDrop:null,onDragStart:null,scrollAmount:5,serializeRegexp:/[^\-]*$/,serializeParamName:null,dragHandle:null},a||{});jQuery.tableDnD.makeDraggable(this)});return this},makeDraggable:function(a){var b=a.tableDnDConfig;b.dragHandle?jQuery(a.tableDnDConfig.dragHandle,a).each(function(){jQuery(this).bind(startEvent,
function(c){jQuery.tableDnD.initialiseDrag(jQuery(this).parents("tr")[0],a,this,c,b);return!1})}):jQuery("tr",a).each(function(){var c=jQuery(this);c.hasClass("nodrag")||c.bind(startEvent,function(c){if("TD"==c.target.tagName)return jQuery.tableDnD.initialiseDrag(this,a,this,c,b),!1}).css("cursor","move")})},initialiseDrag:function(a,b,c,e,d){jQuery.tableDnD.dragObject=a;jQuery.tableDnD.currentTable=b;jQuery.tableDnD.mouseOffset=jQuery.tableDnD.getMouseOffset(c,e);jQuery.tableDnD.originalOrder=jQuery.tableDnD.serialize();
jQuery(document).bind(moveEvent,jQuery.tableDnD.mousemove).bind(endEvent,jQuery.tableDnD.mouseup);if(d.onDragStart)d.onDragStart(b,c)},updateTables:function(){this.each(function(){this.tableDnDConfig&&jQuery.tableDnD.makeDraggable(this)})},mouseCoords:function(a){return a.pageX||a.pageY?{x:a.pageX,y:a.pageY}:{x:a.clientX+document.body.scrollLeft-document.body.clientLeft,y:a.clientY+document.body.scrollTop-document.body.clientTop}},getMouseOffset:function(a,b){b=b||window.event;var c=this.getPosition(a),
e=this.mouseCoords(b);return{x:e.x-c.x,y:e.y-c.y}},getPosition:function(a){var b=0,c=0;0==a.offsetHeight&&(a=a.firstChild);for(;a.offsetParent;)b+=a.offsetLeft,c+=a.offsetTop,a=a.offsetParent;b+=a.offsetLeft;c+=a.offsetTop;return{x:b,y:c}},mousemove:function(a){if(null!=jQuery.tableDnD.dragObject){"touchmove"==a.type&&event.preventDefault();var b=jQuery(jQuery.tableDnD.dragObject),c=jQuery.tableDnD.currentTable.tableDnDConfig,e=jQuery.tableDnD.mouseCoords(a);a=e.y-jQuery.tableDnD.mouseOffset.y;var d=
window.pageYOffset;document.all&&("undefined"!=typeof document.compatMode&&"BackCompat"!=document.compatMode?d=document.documentElement.scrollTop:"undefined"!=typeof document.body&&(d=document.body.scrollTop));e.y-d<c.scrollAmount?window.scrollBy(0,-c.scrollAmount):(window.innerHeight?window.innerHeight:document.documentElement.clientHeight?document.documentElement.clientHeight:document.body.clientHeight)-(e.y-d)<c.scrollAmount&&window.scrollBy(0,c.scrollAmount);a!=jQuery.tableDnD.oldY&&(e=a>jQuery.tableDnD.oldY,
jQuery.tableDnD.oldY=a,c.onDragClass?b.addClass(c.onDragClass):b.css(c.onDragStyle),(b=jQuery.tableDnD.findDropTargetRow(b,a))&&(e&&jQuery.tableDnD.dragObject!=b?jQuery.tableDnD.dragObject.parentNode.insertBefore(jQuery.tableDnD.dragObject,b.nextSibling):!e&&jQuery.tableDnD.dragObject!=b&&jQuery.tableDnD.dragObject.parentNode.insertBefore(jQuery.tableDnD.dragObject,b)));return!1}},findDropTargetRow:function(a,b){for(var c=jQuery.tableDnD.currentTable.rows,e=0;e<c.length;e++){var d=c[e],f=this.getPosition(d).y,
g=parseInt(d.offsetHeight)/2;0==d.offsetHeight&&(f=this.getPosition(d.firstChild).y,g=parseInt(d.firstChild.offsetHeight)/2);if(b>f-g&&b<f+g){if(d==a)break;c=jQuery.tableDnD.currentTable.tableDnDConfig;if(c.onAllowDrop){if(c.onAllowDrop(a,d))return d;break}else if(jQuery(d).hasClass("nodrop"))break;else return d}}return null},mouseup:function(a){if(jQuery.tableDnD.currentTable&&jQuery.tableDnD.dragObject){jQuery(document).unbind(moveEvent,jQuery.tableDnD.mousemove).unbind(endEvent,jQuery.tableDnD.mouseup);
a=jQuery.tableDnD.dragObject;var b=jQuery.tableDnD.currentTable.tableDnDConfig;b.onDragClass?jQuery(a).removeClass(b.onDragClass):jQuery(a).css(b.onDropStyle);jQuery.tableDnD.dragObject=null;var c=jQuery.tableDnD.serialize();if(b.onDrop&&jQuery.tableDnD.originalOrder!=c)b.onDrop(jQuery.tableDnD.currentTable,a);jQuery.tableDnD.currentTable=null}},serialize:function(){return jQuery.tableDnD.currentTable?jQuery.tableDnD.serializeTable(jQuery.tableDnD.currentTable):"Error: No Table id set, you need to set an id on your table and every row"},
serializeTable:function(a){for(var b="",c=a.id,e=a.rows,d=0;d<e.length;d++){0<b.length&&(b+="&");var f=e[d].id;f&&(f&&a.tableDnDConfig&&a.tableDnDConfig.serializeRegexp)&&(f=f.match(a.tableDnDConfig.serializeRegexp)[0]);b+=c+"[]="+f}return b},serializeTables:function(){var a="";this.each(function(){a+=jQuery.tableDnD.serializeTable(this)});return a}};jQuery.fn.extend({tableDnD:jQuery.tableDnD.build,tableDnDUpdate:jQuery.tableDnD.updateTables,tableDnDSerialize:jQuery.tableDnD.serializeTables});


// ==================================================================[ Code ]===
$(function() { // document.ready

	// Edit player names
	$('table')
		.tableDnD({
			onDragClass: 'warning',
			dragHandle: '.icon'
		})
		.on('blur keyup', 'input.score', function() {
			for (var i = 1; i <= 4; i++) {
				var total = 0;
				$('.score.p'+i).each(function() {
					var el = $(this);
					var score = parseInt(el.val(), 10);
					if (isNumber(score)) {
						el.removeClass('error');
						total += score;
					} else {
						el.addClass('error');
					}
				});
				$('.total .p'+i).html(total);
			}
		});

});

function isNumber(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

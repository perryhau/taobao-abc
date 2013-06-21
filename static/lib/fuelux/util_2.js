// custom case-insensitive match expression
function fuelTextExactCI(elem, text) {
	return (elem.textContent || elem.innerText || $(elem).text() || '').toLowerCase() === (text || '').toLowerCase();
}

$.expr[':'].fuelTextExactCI = $.expr.createPseudo ?
	$.expr.createPseudo(function (text) {
		return function (elem) {
			return fuelTextExactCI(elem, text);
		};
	}) :
	function (elem, i, match) {
		return fuelTextExactCI(elem, match[3]);
	};
// 
// Alexander Hofstätter 
// https://github.com/alexanderhofstaetter/visual-captcha-solver
// 
// A tool to bypass visual captcha
//

var images = {
	'das-auge': 'eye',
	'das-auto': 'car',
	'das-blatt': 'leaf',
	'das-diagram': 'graph',
	'das-etikett': 'tag',
	'das-flugzeug': 'airplane',
	'das-haus': 'house',
	'das-schloss': 'lock',
	'das-t-shirt': 'tshirt',
	'den-baum': 'tree',
	'den-computer': 'computer',
	'den-drucker': 'printer',
	'den-fuß': 'foot',
	'den-lkw': 'truck',
	'den-mann': 'man',
	'den-notenschlüssel': 'music-note',
	'den-ordner': 'folder',
	'den-regenschirm': 'umbrella',
	'den-roboter': 'robot',
	'den-schlüssel': 'key',
	'den-sessel': 'chair',
	'den-stift': 'pencil',
	'den-umschlag': 'envelope',
	'den-wecker': 'clock',
	'die-uhr': 'clock',
	'die-ballone': 'balloons',
	'die-büroklammer': 'clip',
	'die-flagge': 'flag',
	'die-frau': 'woman',
	'die-glühbirne': 'lamp',
	'die-hose': 'pants',
	'die-kamera': 'camera',
	'die-katze': 'cat',
	'die-lupe': 'magnifying-glass',
	'die-schere': 'scissors',
	'die-sonnenbrille': 'sunglasses',
	'die-weltkugel': 'world',
	'die-wolke': 'cloud'
};

var styles = `
	#loginForm .btn { float: right; }
	#loginForm .row:nth-child(1) > div { width: 100% !important; margin-left: 0 !important; }
	#loginForm .row:nth-child(2) { display: none; }
`;

function base64Encode(str) {
	var CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	var out = '', i = 0, len = str.length, c1, c2, c3;
	while (i < len) {
		c1 = str.charCodeAt(i++) & 0xff;
		if (i == len) {
			out += CHARS.charAt(c1 >> 2);
			out += CHARS.charAt((c1 & 0x3) << 4);
			out += '==';
			break;
		}
		c2 = str.charCodeAt(i++);
		if (i == len) {
			out += CHARS.charAt(c1 >> 2);
			out += CHARS.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
			out += CHARS.charAt((c2 & 0xF) << 2);
			out += '=';
			break;
		}
		c3 = str.charCodeAt(i++);
		out += CHARS.charAt(c1 >> 2);
		out += CHARS.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
		out += CHARS.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
		out += CHARS.charAt(c3 & 0x3F);
	}
	return out;
}

var button_html = `
	<div class="form-group">
		<input type="submit" class="btn btn-primary" value="Einfach einloggen" />
	</div>
`;

$(document).ready(function(){
	if (document.getElementById('loginForm') === null) {
		return false;
	}

	$('head').append('<style type="text/css">' + styles + '</style>');

	var $button = $(button_html);
    $button.appendTo($('#loginForm .row:nth-child(1) > div'));

	// get the slug for the solution captcha image
	var solution_text = $('.visualCaptcha-explanation strong').text().toLowerCase().replace(/ /g,'-');
	// translate it via dict and get the correspondending image URL from github
	var github_url = 'https://raw.githubusercontent.com/alexanderhofstaetter/visual-captcha-solver/master/images/';
	var solution_img_url = github_url + images[solution_text] + '.png';
	var solution_img_url_retina = github_url + images[solution_text] + '@2x.png';
	var solution_img_data = '';
	var solution_img_data_retina = '';
	var solution_img_index = false;
	
	// get the solution images and store their base64
	// standard resolution (32x32)
	$.ajax({
		url: solution_img_url,
		type: 'GET',
		async: false,
	    global: false,
	}).done(function( data, textStatus, jqXHR ){
		solution_img_data = base64Encode(data);
	});

	// retina resolution
	$.ajax({
		url: solution_img_url_retina,
		type: 'GET',
		async: false,
	    global: false,
	}).done(function( data, textStatus, jqXHR ){
		solution_img_data_retina = base64Encode(data);
	});

	// loop through all displayed captcha images
	$('.visualCaptcha-possibilities img').each(function () {
		
		// and get their URL
		var img_src_url = $(this).attr('src');
		var img_index = $(this).attr('data-index');
		// then retrieve the image (binary) data
		$.ajax({
			url: img_src_url,
			type: 'GET',
			async: false,
		    global: false,
		}).done(function( data, textStatus, jqXHR ){
			// get the image data and check with their base64 against the known solution img
			// check against the first 1000 chars, images have a different body ?!
			if ( base64Encode(data).substr(0, 1000) == solution_img_data.substr(0, 1000) ||
				 base64Encode(data).substr(0, 1000) == solution_img_data_retina.substr(0, 1000)) {
				// the number of the correct image
				solution_img_index = img_index;
				// false -> breaks the each loop
				return false;
			}
			return true;
		});
	});
	
	// On Button click -> login
	$button.click({index: solution_img_index}, function(event) {
		event.preventDefault();
		// get captcha img by id and submit the parent anchor tag
		$("img[data-index='" + event.data.index + "']").click(); 
	});
	// On Enter (input) -> login
	$('input').keydown({index: solution_img_index}, function (event) {
		if (event.which == 13) {
			$("img[data-index='" + event.data.index + "']").click(); 
		}
	});
});

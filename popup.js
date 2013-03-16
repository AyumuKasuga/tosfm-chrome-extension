function get_radio(){
	var background_page = chrome.extension.getBackgroundPage();
	return background_page.document.getElementById('radio');
}

function get_stream_url(){
	return 'http://tosfm.serveblog.net:8000/;';
}

function play_pause(button, radio){
	var url = get_stream_url();
	if (radio.src != url){
		radio.src = url;
	}
	if (radio.paused){
		radio.play();
		button.setAttribute("class", "icon-pause");
	}
	else{
		radio.pause();
		button.setAttribute("class", "icon-play");
	}
}

function pause(radio){
	radio.pause();
}

function stop(radio){
	radio.pause();
	radio.src = '';
	document.getElementById('play-pause-button').setAttribute("class", "icon-play");
}

function get_current_song(){
	var background_page = chrome.extension.getBackgroundPage();
	var current_song = background_page.document.getElementById('current-song');
	var status = document.getElementById('play-status');
	status.innerHTML = current_song.getAttribute('song');
	var last_updated = current_song.getAttribute('updated');
	var delta = new Date().getTime() - last_updated;

	if (delta > 10000){
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "http://tosfm.serveblog.net:8000", true);
		xhr.onreadystatechange = function() {
			var regexp = /Current Song: <\/font><\/td><td><font class=default><b>(.*)<\/b><\/td><\/tr><\/table><br>/im;
			var fresh_song = xhr.responseText.match(regexp)[1];
			status.innerHTML = fresh_song;
			current_song.setAttribute('song', fresh_song);
			current_song.setAttribute('updated', new Date().getTime());
		}
		xhr.send();
	}
}

function change_volume(radio, action){
	if(action == 'up'){
		radio.volume += 0.1;
	}
	else if(action == 'down'){
		radio.volume -= 0.1;
	}
	var current_volume = document.getElementById('current-volume');
	current_volume.innerHTML = radio.volume.toFixed(1) * 10;
}

function restore_volume(){

}

function set_volume(event){
	var radio = get_radio();
	if(event == undefined){
		var volume_scale = radio.volume.toFixed(1) * 10;
	}
	else{
		var volume_scale = parseInt(event.toElement.getAttribute('id').replace('volume-item-', ''));
		radio.volume = volume_scale / 10;
	}

	var volume_items = document.getElementsByClassName('volume-item');
    for (var i = 0, len = volume_items.length; i < len; i++) {
        volume_items[i].classList.remove('volume-item-active');
    }

    for (var i = 0, len = volume_items.length; i < len; i++) {
        volume_items[i].classList.add('volume-item-active');
        if(i>=volume_scale){break;}
    }
}

function init(){
	get_current_song();

	var play_pause_button = document.getElementById('play-pause-button');
	var stop_button = document.getElementById('stop-button');
	var volume_up_button = document.getElementById('volume-up');
	var volume_down_button = document.getElementById('volume-down');
	
	var radio = get_radio();

	if (radio.paused){
		play_pause_button.setAttribute("class", "icon-play");
	}
	else{
		play_pause_button.setAttribute("class", "icon-pause");
	}
	
	set_volume(undefined);

	var volume_items = document.getElementsByClassName('volume-item');
    
    for (var i = 0, len = volume_items.length; i < len; i++) {
        volume_items[i].addEventListener('click', set_volume, false);
    }

	play_pause_button.addEventListener('click', function(){
		play_pause(this, radio);
	}, false);

	stop_button.addEventListener('click', function(){
		stop(radio);
	}, false);

	volume_up_button.addEventListener('click', function(){
		change_volume(radio, 'up');
	}, false);

	volume_down_button.addEventListener('click', function(){
		change_volume(radio, 'down');
	}, false);
}

document.addEventListener('DOMContentLoaded',function() {
	init();
}, false);

var body;
var main_f = $('<div id="main"></div>');
var err_msg = '';
var scene;

var START_NORMALLY = 0;
var START_ADVTEST = 1;
var START_SKIP_OP = 2;
var START_FLAG = START_NORMALLY;
//var START_FLAG = START_ADVTEST;
//var START_FLAG = START_SKIP_OP;

$(document).ready(hh_main);

function hh_keyup(event)
{
	if (scene.key_up)
	{
		scene.key_up(event);
	}
}

function hh_keydown(event)
{
	if (scene.key_down)
	{
		scene.key_down(event);
	}
}

function hh_keypress(event)
{
	if (scene.key_press)
	{
		scene.key_press(event);
	}
}

function hh_init ()
{
	log(LOG_MSG, "女僕更衣中..");
	if(is_ndef(Storage))
	{
		log(LOG_ERROR, "無法存檔！");
		alert("女僕回報: 您的瀏覽器無法存檔！請選用支持local storage的瀏覽器，如 Chrome、Firefox。");
		return false;
	}
	body = $(document.body);
	document.oncontextmenu = ALWAYS_RETURN(false);
	// setup environment
	body.append($('<div id="title">'+game.TITLE+'</div>'));
	body.append($('<div id="sub_title">'+game.SUB_TITLE+'</div>'));
	body.append(main_f);
	hh_preload();
	body.keyup(hh_keyup);
	body.keydown(hh_keydown);
	body.keypress(hh_keypress);
	log(LOG_MSG, "女僕準備完畢！");
	return true;
}

function hh_preload ()
{
	var cnt = 0;
	for (var key in IMAGE)
	{
		cnt++;
		if (!image[key])
		{
			var img = new Image();
			img.addEventListener("load", hh_preload_image_callback, true);
			img.src = IMAGE[key];
			image[key] = img;
		}
	}
	image.__max_cnt = cnt;
	
	cnt = 0;
	for (var key in AUDIO)
	{
		cnt++;
		if (!audio[key])
		{
			var sound = new Audio();
			sound.addEventListener("canplaythrough", hh_preload_audio_callback, true);
			sound.preload = 'auto';
			sound.src = AUDIO[key];
			audio[key] = sound;
		}
	}
	audio.__max_cnt = cnt;
}

function hh_preload_image_callback ()
{
	image.__cnt++;
}

function hh_preload_audio_callback ()
{
	audio.__cnt++;
}

function hh_start ()
{
	log(LOG_MSG, "與魔共舞、盛宴開始！");
	log(LOG_MSG, to_uppercase('aAbZzcaDd'));
	switch (START_FLAG)
	{
	case START_NORMALLY:
		log(LOG_MSG, "選擇了正常路線！");
		scene = TitleScene();
		scene.start();
		break;
	case START_ADVTEST:
		log(LOG_MSG, "ADV測試路線！");
		scene = ADVScene();
		scene.start();
		break;
	case START_SKIP_OP:
		log(LOG_MSG, "忽略OP，標頭直達列車！");
		scene = TitleScene();
		scene.debug_skip = true;
		scene.start();
		break;
	default:
		log(LOG_ERROR, "未知的路線！");
		break;
	}
	game.load_global();
	setInterval(hh_update, game.UPDATE_INTERVAL);
}

function hh_update ()
{
	if (scene)
	{
		scene.update();
	}
}

function hh_main ()
{
	hh_init();
	hh_start();
}

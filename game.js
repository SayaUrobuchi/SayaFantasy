
var __DEBUG = true;

var UI = {
	ADV_AUTO: "自動模式", 
	ADV_SKIP: "快進模式", 
};

var game = {
	// ------ UI顯示名稱
	FULL_TITLE: "Saya FANTASY ~Noob Saya No Talent~", 
	TITLE: "Saya FANTASY", 
	SUB_TITLE: "Noob Saya No Talent", 
	
	UPDATE_INTERVAL: 30, 
	TEXT_DISPLAY_SPEED: 2, 
	NEWLINE_DISPLAY_WIDTH: 8, 
	
	BGM_CHANGED: true, 
	CG_CHANGED: true, 
	TIP_CHANGED: true, 
	
	get_global_save_obj: function ()
	{
	}, 
	
	get_save_obj: function ()
	{
		var ret = {};
		ret.data = data;
		return ret;
	}, 
	
	load_from_save_obj: function (obj)
	{
		data = clone_hash(data, obj);
	}, 
	
	load_global: function ()
	{
		var gdata = localStorage['global'];
		if (gdata)
		{
			try
			{
				global = clone_hash(data, JSON.parse(gdata));
			}
			catch (e)
			{
				log(LOG_ERROR, 'load_global() fail: '+e);
			}
		}
	}, 
	
	load_from_slot: function (slot_id)
	{
		var slot = localStorage['save'+slot_id];
		if (!slot)
		{
			return null;
		}
		try
		{
			return JSON.parse(slot);
		}
		catch (e)
		{
			log(LOG_ERROR, 'load_from_slot('+slot_id+') fail: '+e);
			return null;
		}
	}, 
	
	save_global: function ()
	{
		localStorage['global'] = JSON.stringify(global);
	}, 
	
	save_to_slot: function (slot_id, save)
	{
		localStorage['save'+slot_id] = JSON.stringify(save);
	}, 
};

var data = {
	// ------ 各種遊戲內部數據
	flag: {}, 
	value: {}, 
	scene_id: 0, 
};

var global = {
	tip: {}, 
	cg: {}, 
	bgm: {}, 
	config: {}, 
	flag: {}, 
	value: {}, 
};

function add_tip(id)
{
	if (!global.tip[id])
	{
		global.tip[id] = true;
		game.save_global();
		game.TIP_CHANGED = true;
	}
}

function add_cg(id)
{
	if (!global.cg[id])
	{
		global.cg[id] = true;
		game.save_global();
		game.CG_CHANGED = true;
		cg_count_group = {};
	}
}

function add_bgm(id)
{
	if (!global.bgm[id])
	{
		global.bgm[id] = true;
		game.save_global();
		game.BGM_CHANGED = true;
	}
}

function add_flag(flag)
{
	log(LOG_MSG, 'add_flag['+flag+']');
	data.flag[flag] = true;
}

function break_flag(flag)
{
	log(LOG_MSG, 'break_flag['+flag+']');
	delete data.flag[flag];
}

function add_global_flag(flag)
{
	log(LOG_MSG, 'add_global_flag['+flag+']');
	global.flag[flag] = true;
	game.save_global();
}

function break_global_flag(flag)
{
	log(LOG_MSG, 'break_global_flag['+flag+']');
	delete global.flag[flag];
	game.save_global();
}

function __change_value(obj, target, op, value)
{
	switch (op)
	{
	case 'ASSIGN':
		obj.value[target] = value;
		break;
	case 'ADD':
		obj.value[target] += value;
		break;
	case 'SUB':
		obj.value[target] -= value;
		break;
	case 'MUL':
		obj.value[target] *= value;
		break;
	case 'DIV':
		if (value != 0)
		{
			obj.value[target] = Math.floor(obj.value[target]/value);
		}
		break;
	case 'MOD':
		if (value != 0)
		{
			obj.value[target] %= value;
		}
		break;
	}
	log(LOG_MSG, 'value['+target+'] change to ['+obj.value[target]+']');
}

function change_value(value)
{
	var target = value.target;
	var op = to_uppercase(value.op);
	var val = value.value;
	log(LOG_MSG, 'change_value['+target+']');
	__change_value(data, target, op, val);
}

function change_global_value(value)
{
	var target = value.target;
	var op = to_uppercase(value.op);
	var val = value.value;
	log(LOG_MSG, 'change_global_value['+target+']');
	__change_value(global, target, op, val);
}

function is_flag(flag)
{
	return data.flag[flag];
}

function is_global_flag(flag)
{
	return global.flag[flag];
}

function __is_value(obj, value)
{
/*
		value (optional): COMPARE 或 COMPARE陣列
		global_value (optional): COMPARE 或 COMPARE陣列
		COMPARE: struct
		- 符合時視為true
			target: value名
			op: EQ | NEQ | GT | GEQ | LT | LEQ
			- 分別是: 等於、不等於、大於、大於等於、小於、小於等於
			value: 整數 或 value名
	*/
	var compare_list = to_array(value);
	var ret = true;
	for (var i=0; i<compare_list.length&&ret; i++)
	{
		var compare = compare_list[i];
		var target = compare.target;
		var op = to_uppercase(compare.op);
		var val = compare.value;
		var lval = obj.value[target];
		var rval;
		if (is_int(val))
		{
			rval = val;
		}
		else
		{
			rval = obj.value[val];
		}
		switch (op)
		{
		case 'EQ':
			ret = (lval == rval);
			break;
		case 'NEQ':
			ret = (lval != rval);
			break;
		case 'GT':
			ret = (lval > rval);
			break;
		case 'GEQ':
			ret = (lval >= rval);
			break;
		case 'LT':
			ret = (lval < rval);
			break;
		case 'LEQ':
			ret = (lval <= rval);
			break;
		}
	}
	return ret;
}

function is_value(value)
{
	return __is_value(data, value);
}

function is_global_value(value)
{
	return __is_value(global, value);
}

var tip_count = 0;

function get_tip_count()
{
	if (game.TIP_CHANGED)
	{
		tip_count = 0;
		for (var i=0; i<tip_list.length; i++)
		{
			if (global.tip[tip_list[i].id])
			{
				tip_count++;
			}
		}
		game.TIP_CHANGED = false;
	}
	return tip_count;
}

var cg_count = 0;
var cg_total_count;

function get_total_cg_count()
{
	if (is_ndef(cg_total_count))
	{
		cg_total_count = 0;
		for (var i=0; i<cg_list.length; i++)
		{
			cg_total_count += get_cg_group_total_count(i);
		}
	}
	return cg_total_count;
}

function get_cg_count()
{
	if (game.CG_CHANGED)
	{
		cg_count = 0;
		for (var i=0; i<cg_list.length; i++)
		{
			cg_count += get_cg_group_own_count(i);
		}
		game.CG_CHANGED = false;
	}
	return cg_count;
}

var cg_count_group = {};

function get_cg_group_total_count(group)
{
	var ret = 0;
	var key = cg_list[group].key;
	if ($.isArray(key))
	{
		ret = key.length;
	}
	else
	{
		ret = 1;
	}
	return ret;
}

function get_cg_group_own_count(group)
{
	var ret = cg_count_group[group];
	if (is_ndef(ret))
	{
		ret = 0;
		var cg_group = cg_list[group].key;
		if (!$.isArray(cg_group))
		{
			cg_group = [cg_group];
		}
		for (var i=0; i<cg_group.length; i++)
		{
			if (global.cg[cg_group[i]])
			{
				ret++;
			}
		}
		cg_count_group[group] = ret;
	}
	return ret;
}

var bgm_count = 0;

function get_bgm_count()
{
	if (game.BGM_CHANGED)
	{
		bgm_count = 0;
		for (var i=0; i<bgm_list.length; i++)
		{
			if (global.bgm[bgm_list[i].key])
			{
				bgm_count++;
			}
		}
		game.BGM_CHANGED = false;
	}
	return bgm_count;
}

var adv_data = {
	add: function(adv_scene) {
		if (!adv_scene.id || adv_scene.id < 0)
		{
			log(LOG_ERROR, "ADV場景未設定ID");
			return false;
		}
		if (adv_data[adv_scene.id])
		{
			log(LOG_ERROR, "場景ID ["+adv_scene.id+"] 重覆");
			return false;
		}
		adv_data[adv_scene.id] = adv_scene;
		return true;
	}, 
};

var image = {
	__cnt: 0, 
	__preloaded: false, 
};

var audio = {
	__cnt: 0, 
	__preloaded: false, 
};

var IMAGE = {
	BG_MOON: "p/bg_moon.jpg", 
	BG_TPE101: "p/bg_tpe101.jpg", 
	
	CG_ATHENA: "p/cg_athena.jpg", 
	CG_ARCUEID: "p/cg_arcueid.jpg", 
	CG_BLOCKER: "p/cg_blocker.png", 
	
	IMAGE_SEER: "p/ta_seer.png", 
	IMAGE_SENBAI: "p/ta_senbai.png", 
	
	UI_DIALOG_NEXT: "p/ui_dialog_next.png", 
};

var AUDIO = {
	BGM_FANTASY: "m/fanta.mp3", 
	BGM_BATORU: "m/batoru.mp3", 
};

var cg_list = [
{
	id: 1, 
	name: '幻想', 
	key: ['CG_ATHENA', 'CG_ARCUEID', ], 
}, 
{
	id: 2, 
	name: '現實', 
	key: ['CG_BLOCKER', ], 
}, 
];

var bgm_list = [
{
	id: 1, 
	name: '幻想', 
	key: 'BGM_FANTASY', 
}, 
{
	id: 2, 
	name: '迎戰', 
	key: 'BGM_BATORU', 
}, 
];

var tip_list = [
{
	id: 1, 
	name: '愉悅', 
}, 
{
	id: 2, 
	name: '才藝', 
}, 
{
	id: 3, 
	name: '你不是還有生命嗎', 
}, 
{
	id: 4, 
	name: '妄想', 
}, 
{
	id: 5, 
	name: '空想具現', 
}, 
];

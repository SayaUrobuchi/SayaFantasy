// 共同的lib

var LOG_LEVEL = 0;
var LOG_DEV = 0;
var LOG_DEBUG = 10;
var LOG_WARNING = 30;
var LOG_ERROR = 40;
var LOG_MSG = 50;

var ASCII_A = 65;
var ASCII_Z = 90;
var ASCII_a = 97;
var ASCII_z = 122;

var MOUSE_LEFT = 0;
var MOUSE_MIDDLE = 1;
var MOUSE_RIGHT = 2;

var KEY_ENTER = 13;
var KEY_CTRL = 17;

function Object ()
{
	var self = function ()
	{
	};
	
	return self;
}

function DONOTHING()
{
}

function ALWAYS_RETURN(value)
{
	return function()
	{
		return value;
	}
}

function rand(p, q)
{
	t = Math.random();
	if(is_ndef(q))
	{
		return Math.floor(t*p);
	}
	if(p > q)
	{
		r = p;
		p = q;
		q = r;
	}
	return floor(t*(q-p)+p);
}

function is_def(t)
{
	return t !== undefined;
}

function is_ndef(t)
{
	return t === undefined;
}

function log(level, msg)
{
	if(LOG_LEVEL <= level)
	{
		var header = '';
		switch (level)
		{
		case LOG_DEV:
			header = '養成中.. ';
			break;
		case LOG_DEBUG:
			header = '調教中.. ';
			break;
		case LOG_WARNING:
			header = '女僕困惑中。';
			break;
		case LOG_ERROR:
			header = '女僕暴走中！';
			break;
		case LOG_MSG:
			header = '女僕回報: ';
			break;
		}
		console.log(header+msg);
	}
}

function clone_hash(h, t, c)
{
	if (is_def(c))
	{
		var ret = {};
		for (var i=0; i<arguments.length; i++) {
			$.extend(ret, arguments[i]);
		}
		return ret;
	}
	else
	{
		if(is_ndef(t))
		{
			t = {};
		}
		return $.extend({}, h, t);
	}
}

function clone_ary(ary)
{
	return $.extend(true, [], ary);
}

function is_animating(obj)
{
	return obj.is(':animated');
}

function is_int(obj)
{
	try
	{
		return obj === parseInt(obj);
	}
	catch (e)
	{
		return false;
	}
}

function format_string(pattern, args)
{
	var s = pattern;
	for(item in args)
	{
		s = s.replace('%'+item, args[item]);
	}
	return s;
}

function create_div(args)
{
	var res = $('<div></div>');
	return res;
}

function to_array(obj)
{
	if (!$.isArray(obj))
	{
		obj = [obj];
	}
	return obj;
}

function to_uppercase(str)
{
	var ret = '';
	var dif = -ASCII_a+ASCII_A;
	for (var i=0; i<str.length; i++)
	{
		var code = str.charCodeAt(i);
		if (code >= ASCII_a && code <= ASCII_z)
		{
			ret += String.fromCharCode(code+dif);
		}
		else
		{
			ret += str.charAt(i);
		}
	}
	return ret;
}

function to_lowercase(str)
{
	var ret = '';
	var dif = ASCII_a-ASCII_A;
	for (var i=0; i<str.length; i++)
	{
		var code = str.charCodeAt(i);
		if (code >= ASCII_A && code <= ASCII_Z)
		{
			ret += String.fromCharCode(code+dif);
		}
		else
		{
			ret += str.charAt(i);
		}
	}
	return ret;
}

function max(a, b)
{
	return Math.max(a, b);
}

function min(a, b)
{
	return Math.min(a, b);
}

function floor(a)
{
	return Math.floor(a);
}

function set_unselectable(target)
{
	target.attr('unselectable', 'on').css('user-select', 'none');
	//target.draggable('disable');
}

var shake_temp = {};

function shake(args)
{
	var strength = args.strength;
	if(is_ndef(strength) || strength < 4)
	{
		strength = 4;
	}
	second_str = strength*0.4;
	var target = args.target;
	if(is_ndef(target))
	{
		target = $('#main');
	}
	duration = args.duration;
	if(is_ndef(duration))
	{
		duration = 30;
	}
	target.stop(true, true);
	if(target.css('bottom') != 'auto')
	{
		ani_attr = 'bottom';
		dir = '+=';
		bdir = '-=';
	}
	else
	{
		ani_attr = 'top';
		dir = '-=';
		bdir = '+=';
	}
	var temp = shake_temp[target];
	if(is_ndef(temp))
	{
		temp = {attr: ani_attr, value: target.css(ani_attr)};
		shake_temp[target] = temp;
	}
	var ani0 = {};
	ani0[ani_attr] = dir+strength+'px';
	var ani1 = {};
	ani1[ani_attr] = bdir+strength+'px';
	var ani2 = {};
	ani2[ani_attr] = dir+second_str+'px';
	var ani3 = {};
	ani3[ani_attr] = bdir+second_str+'px';
	var recover = function()
	{
		target.css(temp.attr, temp.value);
	}
	target.animate(ani0, {duration: duration, fail: recover, complete: function()
	{
		target.animate(ani1, {duration: duration, fail: recover, complete: function()
		{
			if(args.jump)
			{
				recover();
				return;
			}
			target.animate(ani2, {duration: duration, fail: recover, complete: function()
			{
				target.animate(ani3, {duration: duration, always: recover, complete: function()
				{
					recover();
				}});
			}});
		}});
	}});
};

function jump(args)
{
	if(is_ndef(args))
	{
		args = {};
	}
	args.jump = true;
	args.strength = 25;
	args.duration = 100;
	shake(args);
}

var ALIGN_LEFT = 0;
var ALIGN_RIGHT = 1;

function format(str, length, align)
{
	var l = 0;
	var sp = '																											 				  ';
	for(var i=0; i<str.length; i++)
	{
		l++;
		if(str.charCodeAt(i) > 128)
		{
			l++;
		}
	}
	var s = '';
	if(l < length)
	{
		s = sp.slice(0, length-l);
	}
	if(align == ALIGN_RIGHT)
	{
		return s+str;
	}
	return str+s;
}

function adjust_range(val, at_least, at_most)
{
	if(is_ndef(at_least))
	{
		at_least = val;
	}
	if(is_ndef(at_most))
	{
		at_most = val;
	}
	return Math.max(at_least, Math.min(val, at_most));
}

function fixed_width(val, length, ch)
{
	if (!ch)
	{
		ch = ' ';
	}
	ch = ch.charAt(0);
	ret = '';
	var cval = val;
	if (cval < 1)
	{
		cval = 1;
	}
	for (var i=0, j=1; i<length; i++, j*=10)
	{
		if (cval < j)
		{
			ret += ch;
		}
	}
	ret += val;
	return ret;
}

var __trans_tip_list;

function translate_adv_text(text)
{
	var ret = '';
	var CMD_PATTERN = /^\[(\w*?):(.*?)\]/g;
	var len = 0;
	__trans_tip_list = [];
	while (len < text.length)
	{
		var next_length = 0;
		var next_char = text.charCodeAt(len);
		var next_str = text.charAt(len);
		CMD_PATTERN.lastIndex = 0;
		if (next_char == 10)
		{
			next_length = 1;
		}
		else if (next_char == '['.charCodeAt(0) && 
			(res = CMD_PATTERN.exec(text.substr(len))).length > 0)
		{
			var cmd = to_lowercase(res[1]);
			var param = res[2];
			next_length = res[0].length;
			next_str = '';
			switch (cmd)
			{
			case 'c':
			case 'color':
				next_str = '<span style="color: '+param+';">';
				break;
			case 'w':
			case 'wait':
				break;
			case 't':
			case 'tip':
				var tid = parseInt(param);
				__trans_tip_list.push(tid);
				next_str = '<span class="tip tip'+param+'"><span class="tip_sup">*'+param+'</span>';
				break;
			case '':
				next_str = '</span>';
				break;
			}
		}
		else if (next_char < 128)
		{
			next_length = 1;
			if (next_str == '<')
			{
				next_str = '&lt;';
			}
			else if (next_str == '>')
			{
				next_str = '&gt;';
			}
		}
		else
		{
			next_length = 1;
		}
		len += next_length;
		ret += next_str;
	}
	// TODO
	return ret;
}

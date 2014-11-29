
var extra_main = $('<div id="extra_main"></div>');

function ExtraScene ()
{
	var self = Scene();
	
	EXTRA_STAGE = {
		BGM: 1, 
		CG: 2, 
		TIP: 3, 
	};
	
	self.command = [
	{
		id: EXTRA_STAGE.CG, 
		name: '回憶相簿', 
		click: function ()
		{
			self.switch_tab(EXTRA_STAGE.CG);
		}, 
	}, 
	{
		id: EXTRA_STAGE.BGM, 
		name: '音樂懷古', 
		click: function ()
		{
			self.switch_tab(EXTRA_STAGE.BGM);
		}, 
	}, 
	{
		id: EXTRA_STAGE.TIP, 
		name: '名詞注釋', 
		click: function ()
		{
			self.switch_tab(EXTRA_STAGE.TIP);
		}, 
	}, 
	{
		id: 0, 
		name: '結束回想', 
		click: function ()
		{
			self.dispose();
		}, 
	}, 
	];
	
	FADE_IN_TIME = 200;
	FADE_OUT_TIME = 200;
	TAB_FADE_IN_TIME = 200;
	TAB_FADE_OUT_TIME = 200;
	
	BGM_COUNT_PER_COLUMN = 10;
	BGM_NUM_WIDTH = 2;
	BGM_UNKNOWN_NAME = '？？？';
	
	CG_COUNT_PER_ROW = 4;
	CG_ROW_COUNT_PER_PAGE = 2;
	CG_SWITCH_FADE_IN_TIME = 400;
	CG_SWITCH_FADE_OUT_TIME = 200;
	
	TIP_COUNT_PER_PAGE = 11;
	TIP_ITEM_HEIGHT = 40;
	
	self.div = extra_main;
	
	self.start = function ()
	{
		self.fcnt = 0;
		
		self.div.hide();
		self.div.fadeIn(FADE_IN_TIME);
		
		extra_main.empty();
		extra_main.mousedown(self.mouse_down);
		
		// 共通
		self.container = $('<div class="container"></div>');
		{
			self.header_div = $('<div class="header"></div>');
			{
				self.title_div = $('<div class="title"></div>');
				self.title_div.text('回想');
				self.header_div.append(self.title_div);
				
				self.command_div = $('<div class="extra_command"></div>');
				{
					for (var i=0; i<self.command.length; i++)
					{
						var command = self.command[i];
						var div = $('<div class="command"></div>');
						div.addClass('clickable');
						div.text(command.name);
						div.click({id: command.id, }, command.click);
						command.div = div;
						self.command_div.append(div);
					}
				}
				self.header_div.append(self.command_div);
			}
			self.container.append(self.header_div);
			
			self.content_div = $('<div class="content"></div>');
			self.container.append(self.content_div);
		}
		extra_main.append(self.container);
		
		// BGM回想
		self.bgm_main = $('<div class="extra_bgm"></div>');
		{
			self.bgm_title_div = $('<div class="title"></div>');
			{
				self.bgm_title_text_div = $('<div class="text"></div>');
				self.bgm_title_text_div.text('現正播放: 無');
				self.bgm_title_div.append(self.bgm_title_text_div);
				
				self.bgm_title_stop_div = $('<div class="command"></div>');
				self.bgm_title_stop_div.addClass('clickable');
				self.bgm_title_stop_div.text('停止播放');
				self.bgm_title_stop_div.click(self.bgm_stop);
				self.bgm_title_div.append(self.bgm_title_stop_div);
			}
			self.bgm_main.append(self.bgm_title_div);
			
			self.bgm_rate_div = $('<div class="rate"></div>');
			self.refresh_bgm_collect_rate();
			self.bgm_main.append(self.bgm_rate_div);
			
			self.bgm_data_div = $('<div class="data"></div>');
			{
				self.bgm_column_div = [
					$('<div class="column"></div>'), 
					$('<div class="column"></div>'), 
				];
				for (var i=0; i<self.bgm_column_div.length; i++)
				{
					self.bgm_data_div.append(self.bgm_column_div[i]);
				}
				
				self.display_bgm_data(0);
			}
			self.bgm_main.append(self.bgm_data_div);
		}
		
		// CG回想
		self.cg_main = $('<div class="extra_cg"></div>');
		{
			self.cg_title_div = $('<div class="title"></div>');
			self.cg_title_div.text('----');
			self.cg_main.append(self.cg_title_div);

			self.cg_page_div = $('<div class="page"></div>');
			{
				self.cg_page_title_div = $('<div class="text"></div>');
				self.cg_page_title_div.text('頁籤: ');
				self.cg_page_div.append(self.cg_page_title_div);
				
				self.cg_page_link_div = [];
				var cg_total_count = get_total_cg_count();
				var cg_count_per_page = self.get_cg_count_per_page();
				var cg_page_count = Math.floor((cg_total_count-1)/cg_count_per_page)+1;
				for (var i=0; i<cg_page_count; i++)
				{
					var div = $('<div class="page_link"></div>');
					div.addClass('clickable');
					div.text(i+1);
					div.click({id: i, }, self.cg_click_page);
					self.cg_page_link_div.push(div);
					self.cg_page_div.append(div);
				}
			}
			self.cg_main.append(self.cg_page_div);
			
			self.cg_rate_div = $('<div class="rate"></div>');
			self.refresh_cg_collect_rate();
			self.cg_main.append(self.cg_rate_div);
			
			self.cg_data_div = $('<div class="data"></div>');
			{
				self.cg_row_div = [
					$('<div class="row"></div>'), 
					$('<div class="row"></div>'), 
				];
				for (var i=0; i<self.cg_row_div.length; i++)
				{
					self.cg_data_div.append(self.cg_row_div[i]);
				}
			}
			self.cg_main.append(self.cg_data_div);
		}
			
		self.cg_display_div = $('<div class="cg_display"></div>');
		self.cg_display_div.click(self.cg_click_on_display);
		self.cg_display_div.hide();
		self.container.append(self.cg_display_div);
		
		// 名詞注釋回想
		self.tip_position = 0;
		self.tip_right_page = [];
		self.tip_main = $('<div class="extra_tip"></div>');
		{
			self.tip_left_div = $('<div class="left"></div>');
			{
				self.tip_title_div = $('<div class="title"></div>');
				self.tip_title_div.text('名詞注釋');
				self.tip_left_div.append(self.tip_title_div);
				
				self.tip_left_container = $('<div class="container"></div>');
				{
					self.tip_list_div = $('<div class="list"></div>');
					{
						for (var i=0; i<tip_list.length; i++)
						{
							var div = $('<div class="tip"></div>');
							var tip = tip_list[i];
							var id = tip.id;
							var num_span = $('<span class="num"></span>');
							num_span.text(id+'. ');
							div.append(num_span);
							var name_span = $('<span class="name"></span>');
							div.append(name_span);
							if (global.tip[id])
							{
								div.addClass('clickable');
								div.mouseenter({id: id, }, self.tip_mouse_enter);
								name_span.text(tip.name);
							}
							else
							{
								name_span.text('？？？');
							}
							self.tip_list_div.append(div);
						}
					}
					self.tip_list_div.mousewheel(self.tip_wheel);
					self.tip_left_container.append(self.tip_list_div);
				}
				self.tip_left_div.append(self.tip_left_container);
			}
			self.tip_main.append(self.tip_left_div);
			
			self.tip_right_div = $('<div class="right"></div>');
			{
				self.tip_rate_div = $('<div class="rate"></div>');
				self.refresh_tip_collect_rate();
				self.tip_right_div.append(self.tip_rate_div);
				
				self.tip_right_container = $('<div class="container"></div>');
				self.tip_right_div.append(self.tip_right_container);
			}
			self.tip_main.append(self.tip_right_div);
		}
		
		self.command[0].click();
	}
	
	self.tip_create_right_page = function (id)
	{
		if (!self.tip_right_page[id])
		{
			var tip = tip_data[id];
			var div = $('<div></div>');
			var title_div = $('<div class="title"></div>');
			title_div.text(tip.name+'：');
			div.append(title_div);
			var text_div = $('<div class="text"></div>');
			text_div.html(translate_adv_text(tip.desc));
			div.append(text_div);
			self.tip_right_page[id] = div;
		}
	}
	
	self.get_cg_count_per_page = function ()
	{
		return CG_COUNT_PER_ROW * CG_ROW_COUNT_PER_PAGE;
	}
	
	self.find_next_cg = function (group, from)
	{
		var idx = self.find_next_cg_index(group, from);
		if (idx < 0)
		{
			return null;
		}
		var key = to_array(cg_list[group].key);
		return key[idx];
	}
	
	self.find_next_cg_index = function (group, from)
	{
		var key = to_array(cg_list[group].key);
		for (var i=from; i<key.length; i++)
		{
			if (global.cg[key[i]])
			{
				return i;
			}
		}
		return -1;
	}
	
	self.display_cg_data = function (page)
	{
		var cg_per_page = self.get_cg_count_per_page();
		var start = page * cg_per_page;
		var end = start + cg_per_page;
		for (var i=0; i<self.cg_row_div.length; i++)
		{
			self.cg_row_div[i].empty();
		}
		self.current_cg_div = [];
		for (var i=start; i<end&&i<cg_list.length; i++)
		{
			var cg = cg_list[i];
			var div = $('<div class="cg"></div>');
			var img_div = $('<div class="cg_image"></div>');
			var rate_div = $('<div class="cg_rate"></div>');
			div.append(img_div);
			div.append(rate_div);
			var own = get_cg_group_own_count(i);
			var total = get_cg_group_total_count(i);
			rate_div.text(own + ' / ' + total);
			if (own > 0)
			{
				div.addClass('clickable');
				div.click({id: i, }, self.cg_click);
				key = self.find_next_cg(i, 0);
				var img = $(image[key]).clone();
				img.addClass('image');
				img_div.html(img);
			}
			if (i%cg_per_page < CG_COUNT_PER_ROW)
			{
				self.cg_row_div[0].append(div);
			}
			else
			{
				self.cg_row_div[1].append(div);
			}
			self.current_cg_div.push(div);
		}
	}
	
	self.display_bgm_data = function (page)
	{
		var bgm_per_page = self.bgm_column_div.length * BGM_COUNT_PER_COLUMN;
		var start = page * bgm_per_page;
		var end = start + bgm_per_page;
		for (var i=0; i<self.bgm_column_div.length; i++)
		{
			self.bgm_column_div[i].empty();
		}
		self.current_bgm_div = [];
		for (var i=start; i<end&&i<bgm_list.length; i++)
		{
			var bgm = bgm_list[i];
			var div = $('<div class="bgm"></div>');
			var num_div = $('<div class="num"></div>');
			var text_div = $('<div class="text"></div>');
			div.append(num_div);
			div.append(text_div);
			num_div.text(fixed_width(bgm.id, BGM_NUM_WIDTH, '0')+'. ');
			if (global.bgm[bgm.key])
			{
				div.addClass('clickable');
				text_div.text(bgm.name);
				div.click({id: i, }, self.bgm_click);
			}
			else
			{
				text_div.text(BGM_UNKNOWN_NAME);
			}
			if (i%bgm_per_page < BGM_COUNT_PER_COLUMN)
			{
				self.bgm_column_div[0].append(div);
			}
			else
			{
				self.bgm_column_div[1].append(div);
			}
			self.current_bgm_div.push(div);
		}
	}
	
	self.refresh_cg_collect_rate = function ()
	{
		var total = get_total_cg_count();
		var own = get_cg_count();
		var text = '收集率: '+own+'/ '+total+' ('+Math.floor(own*100.0/total)+'%)';
		self.cg_rate_div.text(text);
	}
	
	self.refresh_bgm_collect_rate = function ()
	{
		var total = bgm_list.length;
		var own = get_bgm_count();
		var text = '收集率: '+own+'/ '+total+' ('+Math.floor(own*100.0/total)+'%)';
		self.bgm_rate_div.text(text);
	}
	
	self.refresh_tip_collect_rate = function ()
	{
		var total = tip_list.length;
		var own = get_tip_count();
		var text = '收集率: '+own+'/ '+total+' ('+Math.floor(own*100.0/total)+'%)';
		self.tip_rate_div.text(text);
	}
	
	self.refresh_tab = function ()
	{
		for (var i=0; i<self.command.length; i++)
		{
			var command = self.command[i];
			if (self.stage == command.id)
			{
				command.div.removeClass('clickable');
				command.div.addClass('selected');
			}
			else
			{
				command.div.addClass('clickable');
				command.div.removeClass('selected');
			}
		}
	}
	
	self.bgm_play = function (id)
	{
		self.bgm = audio[bgm_list[id].key];
		self.bgm.loop = true;
		self.bgm.currentTime = 0;
		self.bgm.play();
	}
	
	self.bgm_stop = function ()
	{
		if (self.bgm)
		{
			self.bgm.pause();
		}
	}
	
	self.update = function ()
	{
	}
	
	self.dispose = function ()
	{
		self.bgm_stop();
		self.cg_display_div.remove();
		self.div.fadeOut(FADE_OUT_TIME, function () {
			self.finished = true;
		});
	}
	
	self.switch_tab = function (id)
	{
		if (id == self.stage)
		{
			return;
		}
		if (self.current_tab)
		{
			self.current_tab.fadeOut(TAB_FADE_OUT_TIME);
		}
		switch (id)
		{
		case EXTRA_STAGE.BGM:
			self.current_tab = self.bgm_main;
			break;
		case EXTRA_STAGE.CG:
			self.current_tab = self.cg_main;
			if (is_ndef(self.current_cg_page))
			{
				self.switch_cg_page(0);
			}
			break;
		case EXTRA_STAGE.TIP:
			self.current_tab = self.tip_main;
			break;
		}
		self.stage = id;
		self.content_div.append(self.current_tab);
		self.current_tab.hide();
		self.current_tab.fadeIn(TAB_FADE_IN_TIME);
		self.refresh_tab();
	}
	
	self.switch_cg_page = function (page)
	{
		var div;
		if (is_def(self.current_cg_page))
		{
			div = self.cg_page_link_div[self.current_cg_page];
			div.removeClass('selected');
			div.addClass('clickable');
		}
		self.display_cg_data(page);
		div = self.cg_page_link_div[page];
		div.removeClass('clickable');
		div.addClass('selected');
	}
	
	self.mouse_down = function (event)
	{
		if (event.button == MOUSE_RIGHT)
		{
			self.dispose();
			return false;
		}
	}
	
	self.bgm_click = function (event)
	{
		var id = event.data.id;
		var bgm_per_page = self.bgm_column_div.length * BGM_COUNT_PER_COLUMN;
		var div;
		if (self.current_bgm_id)
		{
			div = self.current_bgm_div[self.current_bgm_id%bgm_per_page];
			div.removeClass('selected');
			div.addClass('clickable');
			self.bgm_stop();
		}
		self.bgm_play(id);
		self.bgm_title_text_div.text('現正播放: '+bgm_list[id].name);
		self.current_bgm_id = id;
		div = self.current_bgm_div[self.current_bgm_id%bgm_per_page];
		div.removeClass('clickable');
		div.addClass('selected');
	}
	
	self.cg_click_page = function (event)
	{
		var id = event.data.id;
		self.switch_cg_page(id);
	}
	
	self.cg_click = function (event)
	{
		var id = event.data.id;
		if (get_cg_group_own_count(id) > 0)
		{
			self.cg_display_id = id;
			self.cg_display_list = to_array(cg_list[id].key);
			self.cg_display_idx = self.find_next_cg_index(id, 0);
			self.cg_display_img = $(image[self.cg_display_list[self.cg_display_idx]]).clone();
			self.cg_display_img.addClass('image');
			self.cg_display_div.html(self.cg_display_img);
			self.cg_display_div.fadeIn(CG_SWITCH_FADE_IN_TIME);
		}
	}
	
	self.cg_click_on_display = function ()
	{
		if (self.cg_display_idx < 0)
		{
			return;
		}
		var id = self.cg_display_id;
		self.cg_display_idx = self.find_next_cg_index(id, self.cg_display_idx+1);
		if (self.cg_display_idx < 0)
		{
			self.cg_display_div.fadeOut(CG_SWITCH_FADE_OUT_TIME);
		}
		else
		{
			var img = $(image[self.cg_display_list[self.cg_display_idx]]).clone();
			img.addClass('image');
			img.hide();
			self.cg_display_div.append(img);
			if (is_animating(self.cg_display_img))
			{
				self.cg_display_img.stop(false, true);
			}
			var img_temp = self.cg_display_img;
			img.fadeIn(CG_SWITCH_FADE_IN_TIME, function ()
			{
				img_temp.remove();
			});
			self.cg_display_img = img;
		}
	}
	
	self.tip_mouse_enter = function (event)
	{
		var id = event.data.id;
		if (!self.tip_right_page[id])
		{
			self.tip_create_right_page(id);
		}
		self.tip_right_container.html(self.tip_right_page[id]);
	}
	
	self.tip_wheel = function (event, delta)
	{
		var total = get_tip_count();
		self.tip_position = max(0, min(total-TIP_COUNT_PER_PAGE, self.tip_position-delta));
		console.log('wheel!'+(-self.tip_position*TIP_ITEM_HEIGHT)+'px');
		if (is_animating(self.tip_list_div))
		{
			self.tip_list_div.stop(false, false);
		}
		self.tip_list_div.animate({top: (-self.tip_position*TIP_ITEM_HEIGHT)+'px', }, {
			duration: 200, 
		});
	}
	
	return self;
}

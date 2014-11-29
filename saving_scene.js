
var saving_main = $('<div id="saving_main"></div>');

function SavingScene ()
{
	var self = Scene();
	
	self.result = false;
	
	self.command_id = {
		back: 1, 
	};
	
	self.result_type = {
		waiting: 0, 
		save: 1, 
		load: 2, 
		cancel: 3, 
	};
	
	self.command = [
	{
		id: self.command_id.back, 
		name: '返回', 
		click: function ()
		{
			self.dispose();
		}, 
	}, 
	];
	
	SAVE_SLOT_COUNT = 8;
	SLOT_OFFSET = 200;
	FADE_IN_TIME = 200;
	FADE_OUT_TIME = 200;
	
	self.div = saving_main;
	
	self.start = function ()
	{
		self.fcnt = 0;
		self.current_slot = 0;
		self.new_slot = -1;
		
		self.div.hide();
		self.div.fadeIn(FADE_IN_TIME);
		
		saving_main.empty();
		saving_main.mousedown(self.mouse_down);
		
		self.outer_div = $('<div id="outer">');
		{
			self.container = $('<div class="container"></div>');
			{
				self.save_title_div = $('<div class="save_title"></div>');
				if (self.saving)
				{
					self.save_title_div.text('儲存回憶');
				}
				else
				{
					self.save_title_div.text('再現過去');
				}
				self.container.append(self.save_title_div);
				
				self.save_command_div = $('<div class="save_command"></div>');
				{
					for (var i=0; i<self.command.length; i++)
					{
						var cmd = self.command[i];
						var div = $('<div class="command"></div>');
						div.text(cmd.name);
						div.click({id: cmd.id, }, cmd.click);
						div.addClass('clickable');
						self.save_command_div.append(div);
					}
				}
				self.container.append(self.save_command_div);
				
				self.save_data_div = $('<div class="save_data"></div>');
				{
					self.slot_container_div = $('<div class="slot_container"></div>');
					if (!self.slot)
					{
						self.slot = [];
						for (var i=0; i<SAVE_SLOT_COUNT; i++)
						{
							self.slot[i] = game.load_from_slot(i);
						}
					}
					self.refresh_slots();
					self.current_slot = self.calc_target(self.new_slot);
					self.slot_container_div.css('top', self.calc_top(self.current_slot));
					self.slot_container_div.mousewheel(self.wheel_slot);
					self.save_data_div.append(self.slot_container_div);
				}
				self.container.append(self.save_data_div);
			}
			self.outer_div.append(self.container);
		}
		saving_main.append(self.outer_div);
	}
	
	self.refresh_slots = function ()
	{
		self.slot_container_div.empty();
		for (var i=0; i<SAVE_SLOT_COUNT; i++)
		{
			var slot = self.slot[i];
			var has_data = slot;
			if (!slot)
			{
				slot = self.get_default_slot();
				slot.id = i;
			}
			
			var div = $('<div class="slot">');
			{
				slot.div = div;
				
				slot.title_div = $('<div class="title"></div>');
				{
					slot.id_div = $('<div class="id"></div>');
					var id_str = '';
					if (slot.id < 10)
					{
						id_str = '0';
					}
					id_str += slot.id;
					slot.id_div.text(id_str);
					slot.title_div.append(slot.id_div);
					
					slot.title_text_div = $('<div class="title_text"></div>');
					slot.title_text_div.text(slot.title);
					slot.title_div.append(slot.title_text_div);
				}
				slot.div.append(slot.title_div);
				
				slot.date_div = $('<div class="date"></div>');
				slot.date_div.text(slot.date);
				slot.div.append(slot.date_div);
				
				slot.preview_div = $('<div class="preview"></div>');
				slot.preview_div.html('<img class="image" src="p/bg_moon.jpg">');
				slot.div.append(slot.preview_div);
				
				slot.text_div = $('<div class="text"></div>');
				var text_preview = self.get_text_preview(slot.text_preview);
				slot.text_div.text(text_preview);
				slot.div.append(slot.text_div);
				
				if (slot.new_flag)
				{
					slot.new_div = $('<div class="new"></div>');
					slot.new_div.text('最新！');
					slot.div.append(slot.new_div);
					self.new_slot = i;
				}
			}
			if (self.saving || has_data)
			{
				div.addClass('clickable');
			}
			div.click({id: i, }, self.click_slot);
			self.slot_container_div.append(div);
		}
	}
	
	self.update = function ()
	{
	}
	
	self.dispose = function ()
	{
		self.div.fadeOut(FADE_OUT_TIME, function () {
			self.finished = true;
		});
	}
	
	self.get_default_slot = function ()
	{
		var ret = {};
		ret.title = "空白";
		ret.date = "----/--/-- --:--:--";
		ret.text_preview = "暫無資料";
		return ret;
	}
	
	self.get_text_preview = function (text)
	{
		return text;
	}
	
	self.calc_target = function (val)
	{
		return max(0, min(val, SAVE_SLOT_COUNT-2));
	}
	
	self.calc_top = function (val)
	{
		return -(val*SLOT_OFFSET)+'px';
	}
	
	self.click_slot = function (event)
	{
		var id = event.data.id;
		// 如果是存檔
		if (self.saving)
		{
			var slot = {save_obj: self.save_obj, };
			slot.id = id;
			slot.title = self.save_obj.adv.save_title;
			slot.date = $.format.date(new Date(), "yyyy/MM/dd HH:mm:ss");
			slot.text_preview = self.save_obj.adv.text;
			for (var i=0; i<SAVE_SLOT_COUNT; i++)
			{
				if (self.slot[i] && self.slot[i].new_flag)
				{
					if (i != id)
					{
						self.slot[i] = game.load_from_slot(i);
						delete self.slot[i].new_flag;
						game.save_to_slot(i, self.slot[i]);
					}
				}
			}
			slot.new_flag = true;
			self.slot[id] = slot;
			game.save_to_slot(id, slot);
			self.refresh_slots();
		}
		// 如果是讀檔
		else
		{
			// 如果self.result已有東西，表示已讀檔了
			if (!self.result)
			{
				var slot = self.slot[id];
				// 如果該欄並不是空白的
				if (slot)
				{
					var ret = {};
					ret.loaded = true;
					ret.data = slot.save_obj;
					self.result = ret;
					self.dispose();
				}
			}
		}
	}
	
	self.mouse_down = function (event)
	{
		if (event.button == MOUSE_RIGHT)
		{
			self.dispose();
			return false;
		}
	}
	
	self.wheel_slot = function (event, delta)
	{
		var target = self.calc_target(self.current_slot-delta);
		if (target != self.current_slot)
		{
			self.current_slot = target;
			if (is_animating(self.slot_container_div))
			{
				self.slot_container_div.stop(false, false);
			}
			self.slot_container_div.animate({top: self.calc_top(self.current_slot), }, {
				duration: 300, 
			});
		}
	}
	
	return self;
}

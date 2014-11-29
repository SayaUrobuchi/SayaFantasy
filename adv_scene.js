
var adv_main = $('<div id="adv_main"></div>');

function ADVScene ()
{
	var self = Scene();
	
	var ADV = {
		READY: 0, 
		LOADING: 1, 
		PLAYING: 8, 
	};
	
	var ADV_SCENE = {
		CONTINUE: 0, 
		NEXT_SCENE: 1, 
	}
	
	var ADV_STAT = {
		READY: 0, 
		PLAYING: 1, 
		SKIP_SCENE: 2, 
		PLAY_END: 3, 
		END: 4, 
	}
	
	var ADV_PLAY = {
		NORMAL: 0, 
		AUTO: 1, 
		SKIP: 2, 
	}
	
	var ADV_PREPARE = {
		READY: 0, 
		GRAPHICS_FIN: 1, 
		GRAPHICS_FOUT: 2, 
		DIALOG_FIN: 3, 
		DIALOG_FOUT: 4, 
		BRANCH_FIN: 5, 
		BRANCH_FOUT: 6, 
		DONE: 8, 
	}
	
	var ADV_CHAPTER_STAT = {
		FIN: 1, 
		WAIT: 2, 
		FOUT: 3, 
	}
	
	var ADV_IMAGE_ATTR = [
		'left', 
		'right', 
		'top', 
		'bottom', 
		'width', 
		'height', 
		'zIndex', 
	];
	
	self.command = [
	{
		name: "自動", 
		click: function ()
		{
			if (self.play_mode == ADV_PLAY.AUTO)
			{
				self.switch_playmode(ADV_PLAY.NORMAL);
			}
			else
			{
				self.switch_playmode(ADV_PLAY.AUTO);
			}
			return false;
		}, 
	}, 
	{
		name: "快進", 
		click: function ()
		{
			if (self.play_mode == ADV_PLAY.SKIP)
			{
				self.switch_playmode(ADV_PLAY.NORMAL);
			}
			else
			{
				self.switch_playmode(ADV_PLAY.SKIP);
			}
			return false;
		}, 
	}, 
	{
		name: "存檔", 
		click: function ()
		{
			self.current_scene = SavingScene();
			self.current_scene.saving = true;
			self.current_scene.save_obj = self.get_save_obj();
			main_f.append(self.current_scene.div);
			self.current_scene.start();
			return false;
		}, 
	}, 
	{
		name: "讀檔", 
		click: function ()
		{
			self.current_scene = SavingScene();
			main_f.append(self.current_scene.div);
			self.current_scene.start();
			return false;
		}, 
	}, 
	{
		name: "設定", 
		click: function ()
		{
			return false;
		}, 
	}, 
	];
	
	var CMD_PATTERN = /^\[(\w*?):(.*?)\]/g;
	
	var DIALOG_FIN_SPEED = 300;
	var DIALOG_FOUT_SPEED = 200;
	
	var BRANCH_FIN_SPEED = 300;
	var BRANCH_FOUT_SPEED = 200;
	
	var GRAPHICS_FIN_SPEED = 600;
	var GRAPHICS_FOUT_SPEED = 400;
	
	var CHAPTER_FIN_TIME = 24;
	var CHAPTER_WAIT_TIME = 45;
	var CHAPTER_FOUT_TIME = 18;
	
	var HISTORY_FIN_TIME = 200;
	var HISTORY_FOUT_TIME = 120;
	var HISTORY_COUNT_PER_PAGE = 3;
	var HISTORY_ITEM_HEIGHT = 165;
	
	var __ADV_TEST_SCENE_ID = 1;
	
	self.init = function ()
	{
		self.stage = ADV.READY;
		self.image = {};
		self.save_title = "未知";
		self.dialog_tip = [];
		self.history = [];
		self.play_mode = ADV_PLAY.NORMAL;
		
		self.auto_timer = 0;
		self.skip_speed_rate = 8;
		self.auto_waiting_time = 0;
		self.auto_base_time = 24;
		self.auto_speed = 0.4;
		
		self.current_scene = self;
		
		main_f.html(adv_main);
		
		adv_main.empty();
		adv_main.click(self.click);
		adv_main.mousedown(self.mousedown);
		adv_main.mousewheel(self.wheel);
			
		self.tip_div = $('<div id="tip_msg"></div>');
		self.tip_div.hide();
		adv_main.append(self.tip_div);
		
		// ---- dialog
		self.dialog_div = $('<div id="dialog"></div>');
		{
			self.dialog_playmode_div = $('<div class="dialog_playmode"></div>');
			self.dialog_playmode_div.hide();
			self.dialog_div.append(self.dialog_playmode_div);
			
			self.dialog_command_div = $('<div class="dialog_command"></div>');
			{
				for (var i=0; i<self.command.length; i++)
				{
					var command = self.command[i];
					var div = $('<div class="command"></div>');
					div.text(command.name);
					div.click(command.click);
					div.addClass('clickable');
					self.dialog_command_div.append(div);
				}
			}
			self.dialog_div.append(self.dialog_command_div);
		
			self.dialog_container_div = $('<div class="container"></div>');
			{
				self.dialog_name_div = $('<div class="name"></div>');
				self.dialog_container_div.append(self.dialog_name_div);
				
				self.dialog_text_div = $('<div class="text"></div>');
				self.dialog_container_div.append(self.dialog_text_div);
				
				self.dialog_next_div = $('<div class="next"><img class="img" src="'+IMAGE.UI_DIALOG_NEXT+'"></div>');
				self.dialog_container_div.append(self.dialog_next_div);
				self.dialog_next_div.hide();
			}
			self.dialog_div.append(self.dialog_container_div);
		}
		adv_main.append(self.dialog_div);
		self.dialog_div.hide();
		self.dialog_display = false;
		
		// ---- chapter
		self.chapter_div = $('<div id="chapter"></div>');
		{
			self.chapter_main_div = $('<div class="main_title"></div>');
			self.chapter_div.append(self.chapter_main_div);
			
			self.chapter_sub_div = $('<div class="sub_title"></div>');
			self.chapter_div.append(self.chapter_sub_div);
		}
		adv_main.append(self.chapter_div);
		self.chapter_div.css('opacity', 0.0);
		
		// ---- image
		self.graphics_div = $('<div id="graphics"></div>');
		{
			self.bg_out_div = $('<div id="bg"></div>');
			self.bg_div = $('<div class="container"></div>');
			self.bg_out_div.append(self.bg_div);
			self.graphics_div.append(self.bg_out_div);
			
			self.cg_out_div = $('<div id="cg"></div>');
			self.cg_div = $('<div class="container"></div>');
			self.cg_out_div.append(self.cg_div);
			self.graphics_div.append(self.cg_out_div);
			
			self.image_out_div = $('<div id="image"></div>');
			self.image_div = $('<div class="container"></div>');
			self.image_out_div.append(self.image_div);
			self.graphics_div.append(self.image_out_div);
		}
		adv_main.append(self.graphics_div);
		self.graphics_div.hide();
		self.graphics_display = false;
		
		// ---- branch
		self.branch_div = $('<div id="branch"></div>');
		adv_main.append(self.branch_div);
		self.branch_div.hide();
		self.branch_display = false;
		
		// ---- history
		self.history_div = $('<div id="history"></div>');
		{
			self.history_display_div = $('<div class="display"></div>');
			{
				self.history_list_div = $('<div class="list"></div>');
				self.history_display_div.append(self.history_list_div);
			}
			self.history_div.append(self.history_display_div);
		}
		self.history_div.hide();
		self.history_div.mousewheel(self.wheel_history);
		adv_main.append(self.history_div);
		
		self.history_block_template = $('<div class="container"></div>');
		{
			self.history_name_div = $('<div class="name"></div>');
			self.history_block_template.append(self.history_name_div);
			
			self.history_text_div = $('<div class="text"></div>');
			self.history_block_template.append(self.history_text_div);
		}
	}
	
	self.start = function ()
	{
		if (__DEBUG && START_FLAG == START_ADVTEST)
		{
			data.scene_id = __ADV_TEST_SCENE_ID;
		}
		log(LOG_MSG, "ADV準備中..");
		main_f.html(adv_main);
		self.init();
		log(LOG_MSG, "ADV準備完成！");
	}
	
	self.deinit = function ()
	{
	}
	
	self.update = function ()
	{
		if (self.current_scene != self)
		{
			self.current_scene.update();
			if (self.current_scene.finished)
			{
				var result = self.current_scene.result;
				// 讀檔
				if (result.loaded)
				{
					var save_obj = result.data.adv;
					game.load_from_save_obj(result.data.data);
					self.load_from_save_obj(save_obj);
					self.stage = ADV.LOADING;
					self.prepare_stat = ADV_PREPARE.READY;
				}
				self.current_scene.div.remove();
				self.current_scene = self;
			}
			return;
		}
	
		if (!image.__preloaded || !audio.__preloaded)
		{
			if (!self.loading_scene)
			{
				self.loading_scene = LoadingScene();
				self.loading_scene.start();
				main_f.append(loading_main);
			}
			self.loading_scene.progress = (image.__cnt+audio.__cnt)*1.0/(image.__max_cnt+audio.__max_cnt);
			self.loading_scene.update();
			if (self.loading_scene.completed)
			{
				image.__preloaded = true;
				audio.__preloaded = true;
				loading_main.remove();
			}
			else
			{
				return;
			}
		}
		
		if (self.is_history)
		{
			return;
		}
		
		switch (self.stage)
		{
		case ADV.READY:
			self.stage = ADV.PLAYING;
			self.start_scene(data.scene_id);
			break;
		case ADV.LOADING:
			switch (self.prepare_stat)
			{
			case ADV_PREPARE.READY:
				if (self.dialog_display)
				{
					self.prepare_stat = ADV_PREPARE.DIALOG_FOUT;
					self.dialog_fout();
				}
				else if (self.graphics_display)
				{
					self.prepare_stat = ADV_PREPARE.GRAPHICS_FOUT;
					self.graphics_fout();
				}
				else
				{
					self.prepare_stat = ADV_PREPARE.DONE;
				}
				break;
			case ADV_PREPARE.DONE:
				self.bgm_stop();
				self.bgm_name = "";
				self.image_div.empty();
				self.start_scene(data.scene_id);
				self.stage = ADV.PLAYING;
				break;
			}
			break;
		case ADV.PLAYING:
		case ADV.SKIPPING:
			stat = ADV_SCENE.CONTINUE;
			switch (self.stat)
			{
			case ADV_STAT.END:
				// ---- post prepare
				switch (self.prepare_stat)
				{
				case ADV_PREPARE.READY:
					switch (self.scene.display)
					{
					case ADV_DISPLAY.DIALOG:
						if (self.scene.dispose && self.dialog_display)
						{
							self.prepare_stat = ADV_PREPARE.DIALOG_FOUT;
							delete self.text;
							self.dialog_fout();
						}
						else if (self.scene.dispose && self.graphics_display)
						{
							self.prepare_stat = ADV_PREPARE.GRAPHICS_FOUT;
							self.graphics_fout();
						}
						else
						{
							self.prepare_stat = ADV_PREPARE.DONE;
						}
						break;
					case ADV_DISPLAY.CHANGE_CHAPTER:
						self.prepare_stat = ADV_PREPARE.DONE;
						break;
					case ADV_DISPLAY.BRANCH:
						if (self.branch_display)
						{
							self.prepare_stat = ADV_PREPARE.BRANCH_FOUT;
							self.branch_fout();
						}
						else
						{
							self.prepare_stat = ADV_PREPARE.DONE;
						}
						break;
					default:
						self.prepare_stat = ADV_PREPARE.DONE;
						break;
					}
					break;
				case ADV_PREPARE.DONE:
					stat = ADV_SCENE.NEXT_SCENE;
					break;
				}
				break;
			case ADV_STAT.READY:
			case ADV_STAT.PLAYING:
			case ADV_STAT.SKIP_SCENE:
				// ---- init first
				if (self.fcnt == 0)
				{
					self.prepare_scene();
				}
				// ---- if inited, then play
				else
				{
					// ---- if pre-prepare needed
					switch (self.prepare_stat)
					{
					case ADV_PREPARE.READY:
						switch (self.scene.display)
						{
						case ADV_DISPLAY.DIALOG:
							if (!self.graphics_display)
							{
								self.prepare_stat = ADV_PREPARE.GRAPHICS_FIN;
								self.graphics_fin();
							}
							else if (!self.dialog_display)
							{
								self.prepare_stat = ADV_PREPARE.DIALOG_FIN;
								self.dialog_fin();
							}
							else
							{
								self.prepare_stat = ADV_PREPARE.DONE;
							}
							break;
						case ADV_DISPLAY.CHANGE_CHAPTER:
							if (self.dialog_display)
							{
								self.prepare_stat = ADV_PREPARE.DIALOG_FOUT;
								self.dialog_fout();
							}
							else if (self.graphics_display)
							{
								self.prepare_stat = ADV_PREPARE.GRAPHICS_FOUT;
								self.graphics_fout();
							}
							else
							{
								self.prepare_stat = ADV_PREPARE.DONE;
							}
							break;
						case ADV_DISPLAY.BRANCH:
							if (!self.graphics_display)
							{
								self.prepare_stat = ADV_PREPARE.GRAPHICS_FIN;
								self.graphics_fin();
							}
							else if (self.text && !self.dialog_display)
							{
								self.prepare_stat = ADV_PREPARE.DIALOG_FIN;
								self.dialog_fin();
							}
							else if (!self.branch_display)
							{
								self.prepare_stat = ADV_PREPARE.BRANCH_FIN;
								self.branch_fin();
							}
							else
							{
								self.prepare_stat = ADV_PREPARE.DONE;
							}
							break;
						default:
							self.prepare_stat = ADV_PREPARE.DONE;
							break;
						}
						break;
					case ADV_PREPARE.DONE:
						self.play_scene();
						break;
					}
				}
				break;
			// ---- when play end, wait for player action
			case ADV_STAT.PLAY_END:
				if (self.play_mode == ADV_PLAY.AUTO)
				{
					self.auto_timer++;
					if (self.auto_timer >= self.auto_waiting_time)
					{
						self.stat = ADV_STAT.END;
					}
				}
				else if (self.play_mode == ADV_PLAY.SKIP)
				{
					self.stat = ADV_STAT.END;
				}
				break;
			}
			self.fcnt++;
			// if scene changed
			if (stat == ADV_SCENE.NEXT_SCENE)
			{
				self.append_history();
				self.post_action(self.scene.post_action);
				if (self.scene.next_scene_id >= 0)
				{
					self.start_scene(self.scene.next_scene_id);
				}
			}
			break;
		case ADV.PAUSING:
			break;
		default:
			break;
		}
	}
	
	self.start_scene = function (id)
	{
		if (id < 0)
		{
			log(LOG_ERROR, "ADVScene: 未設置正確 next id");
			return;
		}
		data.scene_id = id;
		self.scene = adv_data[id];
		self.fcnt = 0;
		self.stat = ADV_STAT.READY;
		self.prepare_stat = ADV_PREPARE.READY;
		self.dialog_tip = [];
		if (self.scene.save_title)
		{
			self.save_title = self.scene.save_title;
		}
		if (self.scene.tip)
		{
			var tip_list = to_array(self.scene.tip);
			for (var i=0; i<tip_list.length; i++)
			{
				var tip = tip_list[i];
				add_tip(tip);
			}
		}
	}
	
	self.refresh_tip = function (tip_ary)
	{
		if (is_ndef(tip_ary))
		{
			tip_ary = self.dialog_tip;
		}
		for (var i=0; i<tip_ary.length; i++)
		{
			var id = tip_ary[i];
			var target = $('.tip'+id);
			target.mouseover({id: id, }, self.mover_tip);
			target.mouseout(self.mout_tip);
		}
	}
	
	self.refresh_dialog = function ()
	{
		self.dialog_name_div.text(self.dialog_name);
		self.dialog_text_div.html(self.dialog_text);
		if (self.dialog_next)
		{
			self.dialog_next_div.show();
		}
		else
		{
			self.dialog_next_div.hide();
		}
		self.refresh_tip();
	}
	
	self.graphics_fin = function ()
	{
		var speed = GRAPHICS_FIN_SPEED;
		if (self.play_mode == ADV_PLAY.SKIP)
		{
			speed = floor(speed/self.skip_speed_rate);
		}
		self.graphics_div.fadeIn(speed, function ()
		{
			self.prepare_stat = ADV_PREPARE.READY;
			self.graphics_display = true;
		});
	}
	
	self.graphics_fout = function ()
	{
		var speed = GRAPHICS_FOUT_SPEED;
		if (self.play_mode == ADV_PLAY.SKIP)
		{
			speed = floor(speed/self.skip_speed_rate);
		}
		self.graphics_div.fadeOut(speed, function ()
		{
			self.prepare_stat = ADV_PREPARE.READY;
			self.graphics_display = false;
		});
	}
	
	self.dialog_fin = function ()
	{
		var speed = DIALOG_FIN_SPEED;
		if (self.play_mode == ADV_PLAY.SKIP)
		{
			speed = floor(speed/self.skip_speed_rate);
		}
		self.dialog_div.fadeIn(speed, function ()
		{
			self.prepare_stat = ADV_PREPARE.READY;
			self.dialog_display = true;
		});
	}
	
	self.dialog_fout = function ()
	{
		var speed = DIALOG_FOUT_SPEED;
		if (self.play_mode == ADV_PLAY.SKIP)
		{
			speed = floor(speed/self.skip_speed_rate);
		}
		self.dialog_div.fadeOut(speed, function ()
		{
			self.prepare_stat = ADV_PREPARE.READY;
			self.dialog_display = false;
		});
	}
	
	self.branch_fin = function ()
	{
		var speed = BRANCH_FIN_SPEED;
		if (self.play_mode == ADV_PLAY.SKIP)
		{
			speed = floor(speed/self.skip_speed_rate);
		}
		self.branch_div.fadeIn(speed, function ()
		{
			self.prepare_stat = ADV_PREPARE.READY;
			self.branch_display = true;
		});
	}
	
	self.branch_fout = function ()
	{
		var speed = BRANCH_FOUT_SPEED;
		if (self.play_mode == ADV_PLAY.SKIP)
		{
			speed = floor(speed/self.skip_speed_rate);
		}
		self.branch_div.fadeOut(speed, function ()
		{
			self.prepare_stat = ADV_PREPARE.READY;
			self.branch_display = false;
		});
	}
	
	self.bgm_play = function (arg)
	{
		if (is_ndef(arg))
		{
			arg = {};
		}
		add_bgm(self.bgm_name);
		self.bgm_audio = audio[self.bgm_name];
		if (is_ndef(arg.loop))
		{
			arg.loop = true;
		}
		self.bgm_audio.loop = arg.loop;
		self.bgm_audio.currentTime = 0;
		self.bgm_audio.play();
	}
	
	self.bgm_stop = function (arg)
	{
		if (self.bgm_audio)
		{
			if (!self.bgm_audio.ended)
			{
				self.bgm_audio.pause();
			}
		}
	}
	
	self.refresh_bg = function ()
	{
		if (self.bg)
		{
			if (self.bg.display == ADV_BG.IMAGE)
			{
				self.bg_image = $(image[self.bg.image]);
				self.bg_image.addClass('image');
				self.bg_div.html(self.bg_image);
				self.bg_image.show();
			}
			else if (self.bg.display == ADV_BG.NONE)
			{
				if (self.bg_image)
				{
					self.bg_image.hide();
				}
			}
		}
	}
	
	self.refresh_cg = function ()
	{
		if (self.cg)
		{
			if (self.cg.display == ADV_CG.IMAGE)
			{
				var key = self.cg.image;
				add_cg(key);
				self.cg_image = $(image[key]);
				self.cg_image.addClass('image');
				self.cg_div.html(self.cg_image);
				self.cg_image.show();
			}
			else if (self.cg.display == ADV_CG.NONE)
			{
				if (self.cg_image)
				{
					self.cg_image.hide();
				}
			}
		}
	}
	
	self.refresh_image = function ()
	{
		self.image_div.empty();
		for (var i in self.image)
		{
			var img = self.image[i];
			var div = $('<div class="adv_image"></div>');
			var pic = $(image[img.image]).clone();
			pic.addClass('image');
			div.append(pic);
			for (var i=0; i<ADV_IMAGE_ATTR.length; i++)
			{
				var attr = ADV_IMAGE_ATTR[i];
				if (is_def(img[attr]))
				{
					div.css(attr, img[attr]);
				}
			}
			self.image_div.append(div);
		}
	}
	
	self.refresh_bgm = function ()
	{
		var play = true;
		if (self.bgm.display == ADV_BGM.NONE)
		{
			self.bgm_stop();
			self.bgm_name = "";
			play = false;
		}
		if (self.bgm.display == ADV_BGM.INHERIT)
		{
			play = false;
		}
		if (self.bgm_name == self.bgm.audio)
		{
			play = false;
		}
		
		if (play)
		{
			self.bgm_name = self.bgm.audio;
			self.bgm_stop();
			self.bgm_play({loop: self.bgm.loop, });
		}
	}
	
	self.prepare_scene = function ()
	{
		switch (self.scene.display)
		{
		case ADV_DISPLAY.DIALOG:
			self.text = self.scene.text;
			self.dialog_name = self.scene.name;
			if (self.dialog_name == "")
			{
			}
			else
			{
				self.dialog_name += "：";
			}
			self.dialog_text = "";
			self.dialog_text_div.text('');
			self.dialog_name_div.text('');
			self.dialog_next = false;
			self.dialog_next_div.hide();
			self.text_width = 0;
			self.text_length = 0;
			self.text_cnt = 0;
			self.text_speed = game.TEXT_DISPLAY_SPEED;
			if (self.scene.bg)
			{
				if (self.scene.bg.display != ADV_BG.INHERIT)
				{
					self.bg = self.scene.bg;
				}
			}
			self.refresh_bg();
			if (self.scene.cg)
			{
				if (self.scene.cg.display != ADV_CG.INHERIT)
				{
					self.cg = self.scene.cg;
				}
			}
			self.refresh_cg();
			if (self.scene.image)
			{
				var image_list = to_array(self.scene.image);
				for (var i=0; i<image_list.length; i++)
				{
					var image = image_list[i];
					var id = image.id;
					if (image.display != ADV_IMAGE.INHERIT)
					{
						if (self.image[id] && self.image[id].div)
						{
							self.image[id].div.remove();
							delete self.image[id];
						}
					}
					if (image.display == ADV_IMAGE.SHOW)
					{
						var div = $('<div class="adv_image"></div>');
						self.image[id] = clone_hash(image, {
							div: div, 
						});
					}
					switch (image.display)
					{
					case ADV_IMAGE.INHERIT:
						break;
					case ADV_IMAGE.NONE:
					case ADV_IMAGE.SHOW:
						if (self.image[id])
						{
							if (self.image[id].div)
							{
								self.image[id].div.remove();
							}
							delete self.image[id];
						}
						if (image.display == ADV_IMAGE.SHOW)
						{
							var div = $('<div class="adv_image"></div>');
							self.image[id] = clone_hash(image, {
								div: div, 
							});
						}
						break;
					case ADV_IMAGE.CHANGE_ATTR:
						delete image.display;
						self.image[id] = clone_hash(self.image[id], image);
						break;
					}
				}
			}
			self.refresh_image();
			if (self.scene.bgm)
			{
				if (self.scene.bgm.display != ADV_BGM.INHERIT)
				{
					self.bgm = self.scene.bgm;
				}
			}
			self.refresh_bgm();
			break;
		case ADV_DISPLAY.CHANGE_CHAPTER:
			self.chapter_main_div.text(self.scene.main_title);
			self.chapter_sub_div.text(self.scene.sub_title);
			self.chapter_stat = ADV_CHAPTER_STAT.FIN;
			self.chapter_cnt = 0;
			break;
		case ADV_DISPLAY.BRANCH:
			self.refresh_bg();
			self.refresh_cg();
			self.refresh_image();
			self.refresh_bgm();
			self.branch_div.empty();
			for (var i=0; i<self.scene.option.length; i++)
			{
				var option = self.scene.option[i];
				var div = $('<div class="option"></div>');
				div.addClass('clickable');
				div.html(translate_adv_text(option.text));
				div.click({id: i, }, self.click_branch);
				self.branch_div.append(div);
			}
			if (self.text)
			{
				self.dialog_text_div.html(translate_adv_text(self.text));
				self.refresh_tip(__trans_tip_list);
			}
			break;
		case ADV_DISPLAY.FATE:
			self.face_the_fate();
			break;
		}
	}
	
	self.face_the_fate = function ()
	{
		self.prepare_stat = ADV_PREPARE.READY;
		self.stat = ADV_STAT.END;
		var fate_list = self.scene.branch;
		for (var i=0; i<fate_list.length; i++)
		{
			var fate = fate_list[i];
			var res = false;
			if (i+1 >= fate_list.length)
			{
				res = true;
			}
			var condition_list = to_array(fate.condition);
			for (var j=0; j<condition_list.length&&!res; j++)
			{
				var condition = condition_list[j];
				var success = true;
				if (condition.flag && success)
				{
					var flag_list = to_array(condition.flag);
					for (var k=0; k<flag_list.length&&success; k++)
					{
						var flag = flag_list[k];
						if (!is_flag(flag))
						{
							success = false;
						}
					}
				}
				if (condition.global_flag && success)
				{
					var global_flag_list = to_array(condition.global_flag);
					for (var k=0; k<global_flag_list.length&&success; k++)
					{
						var global_flag = global_flag_list[k];
						if (!is_global_flag(global_flag))
						{
							success = false;
						}
					}
				}
				if (condition.not_flag && success)
				{
					var flag_list = to_array(condition.not_flag);
					for (var k=0; k<flag_list.length&&success; k++)
					{
						var flag = flag_list[k];
						if (is_flag(flag))
						{
							success = false;
						}
					}
				}
				if (condition.not_global_flag && success)
				{
					var global_flag_list = to_array(condition.not_global_flag);
					for (var k=0; k<global_flag_list.length&&success; k++)
					{
						var global_flag = global_flag_list[k];
						if (is_global_flag(global_flag))
						{
							success = false;
						}
					}
				}
				if (condition.value && success)
				{
					var value_list = to_array(condition.value);
					for (var k=0; k<value_list.length&&success; k++)
					{
						var value = value_list[k];
						if (!is_value(value))
						{
							success = false;
						}
					}
				}
				if (condition.global_value && success)
				{
					var global_value_list = to_array(condition.global_value);
					for (var k=0; k<global_value_list.length&&success; k++)
					{
						var global_value = global_value_list[k];
						if (!is_global_value(global_value))
						{
							success = false;
						}
					}
				}
				if (condition.func && success)
				{
					var func_list = to_array(condition.func);
					for (var k=0; k<func_list.length&&success; k++)
					{
						var func = func_list[k];
						if (!func())
						{
							success = false;
						}
					}
				}
				if (success)
				{
					res = true;
				}
			}
			if (res)
			{
				self.scene.next_scene_id = fate.next_scene_id;
				break;
			}
		}
	}
	
	self.play_scene = function ()
	{
		switch (self.scene.display)
		{
		case ADV_DISPLAY.DIALOG:
			self.play_scene_dialog();
			break;
		case ADV_DISPLAY.CHANGE_CHAPTER:
			self.play_scene_chapter();
			break;
		}
	}
	
	self.play_scene_dialog = function ()
	{
		while (self.text_length < self.scene.text.length)
		{
			var next_width = 0;
			var next_need = 0;
			var next_length = 0;
			var next_char = self.scene.text.charCodeAt(self.text_length);
			var next_str = self.scene.text.charAt(self.text_length);
			CMD_PATTERN.lastIndex = 0;
			var res;
			if (next_char == 10)
			{
				next_width = 1;
				next_need = game.NEWLINE_DISPLAY_WIDTH;
				next_length = 1;
			}
			else if (next_char == '['.charCodeAt(0) && 
				(res = CMD_PATTERN.exec(self.scene.text.substr(self.text_length))).length > 0)
			{
				var cmd = to_lowercase(res[1]);
				var param = res[2];
				next_width = 0;
				next_need = 0;
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
					next_width = 2;
					next_str = '<span class="tip tip'+param+'"><span class="tip_sup">*'+param+'</span>';
					var tid = parseInt(param);
					self.dialog_tip.push(tid);
					add_tip(tid);
					break;
				case '':
					next_str = '</span>';
					break;
				}
			}
			else if (next_char < 128)
			{
				next_width = 1;
				next_need = 1;
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
				next_width = 2;
				next_need = 2;
				next_length = 1;
			}
			if (self.play_mode == ADV_PLAY.SKIP)
			{
				self.text_cnt += self.skip_speed_rate;
			}
			else
			{
				self.text_cnt++;
			}
			var time_need = self.text_speed*next_need;
			if (self.stat == ADV_STAT.SKIP_SCENE || self.text_cnt >= time_need)
			{
				self.text_cnt -= time_need;
				self.text_width += next_width;
				self.text_length += next_length;
				self.dialog_text += next_str;
			}
			else
			{
				break;
			}
		}
		if (self.text_length >= self.scene.text.length)
		{
			if (self.play_mode == ADV_PLAY.NORMAL)
			{
				self.dialog_next = true;
			}
			self.auto_timer = 0;
			self.auto_waiting_time = self.auto_base_time + self.text_width * self.auto_speed;
			self.stat = ADV_STAT.PLAY_END;
			self.prepare_stat = ADV_PREPARE.READY;
		}
		self.refresh_dialog();
	}
	
	self.play_scene_chapter = function ()
	{
		switch (self.chapter_stat)
		{
		case ADV_CHAPTER_STAT.FIN:
			var speed = CHAPTER_FIN_TIME;
			if (self.play_mode == ADV_PLAY.SKIP)
			{
				speed = floor(speed/self.skip_speed_rate);
			}
			self.chapter_cnt++;
			self.chapter_div.css('opacity', min(1, self.chapter_cnt*1.0/speed));
			if (self.chapter_cnt >= speed)
			{
				self.chapter_stat = ADV_CHAPTER_STAT.WAIT;
				self.chapter_cnt = 0;
			}
			break;
		case ADV_CHAPTER_STAT.WAIT:
			var speed = CHAPTER_WAIT_TIME;
			if (self.play_mode == ADV_PLAY.SKIP)
			{
				speed = floor(speed/self.skip_speed_rate);
			}
			self.chapter_cnt++;
			if (self.chapter_cnt >= speed)
			{
				self.chapter_stat = ADV_CHAPTER_STAT.FOUT;
				self.chapter_cnt = 0;
			}
			break;
		case ADV_CHAPTER_STAT.FOUT:
			var speed = CHAPTER_FOUT_TIME;
			if (self.play_mode == ADV_PLAY.SKIP)
			{
				speed = floor(speed/self.skip_speed_rate);
			}
			self.chapter_cnt++;
			self.chapter_div.css('opacity', max(0, 1-self.chapter_cnt*1.0/speed));
			if (self.chapter_cnt >= speed)
			{
				self.stat = ADV_STAT.END;
			}
			break;
		}
	}
	
	self.append_history = function ()
	{
		if (self.scene.display == ADV_DISPLAY.DIALOG)
		{
			self.history.push(self.scene.id);
		}
	}
	
	self.post_action = function (post_action)
	{
		if (post_action)
		{
			var action_list = to_array(self.scene.post_action);
			for (var i=0; i<action_list.length; i++)
			{
				var action = action_list[i];
				if (action.break_flag)
				{
					var flag_list = to_array(action.flag);
					for (var j=0; j<flag_list.length; j++)
					{
						var flag = flag_list[j];
						break_flag(flag);
					}
				}
				if (action.flag)
				{
					var flag_list = to_array(action.flag);
					for (var j=0; j<flag_list.length; j++)
					{
						var flag = flag_list[j];
						add_flag(flag);
					}
				}
				if (action.break_global_flag)
				{
					var global_flag_list = to_array(action.global_flag);
					for (var j=0; j<global_flag_list.length; j++)
					{
						var global_flag = global_flag_list[j];
						break_global_flag(global_flag);
					}
				}
				if (action.global_flag)
				{
					var global_flag_list = to_array(action.global_flag);
					for (var j=0; j<global_flag_list.length; j++)
					{
						var global_flag = global_flag_list[j];
						add_global_flag(global_flag);
					}
				}
				if (action.value)
				{
					var value_list = to_array(action.value);
					for (var j=0; j<value_list.length; j++)
					{
						var value = value_list[j];
						change_value(value);
					}
				}
				if (action.global_value)
				{
					var global_value_list = to_array(action.global_value);
					for (var j=0; j<global_value_list.length; j++)
					{
						var global_value = global_value_list[j];
						change_global_value(global_value);
					}
				}
				if (action.func)
				{
					var func_list = to_array(action.func);
					for (var j=0; j<func_list.length; j++)
					{
						var func = func_list[j];
						func();
					}
				}
			}
		}
	}
	
	self.get_clear_image = function ()
	{
		var ret = {};
		for (var id in self.image)
		{
			var img = self.image[id];
			var i = img.id;
			ret[i] = clone_hash(self.image[i]);
			delete ret[i].div;
		}
		return ret;
	}
	
	self.get_save_text = function ()
	{
		var ret;
		// TODO
		ret = self.scene.text;
		return ret;
	}
	
	self.get_save_obj = function ()
	{
		var adv = {};
		adv.bg = self.bg;
		adv.bgm = self.bgm;
		adv.cg = self.cg;
		adv.image = self.get_clear_image();
		adv.text = self.get_save_text();
		adv.dialog_text = self.text;
		adv.save_title = self.save_title;
		var ret = clone_hash(game.get_save_obj(), {adv: adv, });
		return ret;
	}
	
	self.load_from_save_obj = function (save_obj)
	{
		self.bg = save_obj.bg;
		self.cg = save_obj.cg;
		self.bgm = save_obj.bgm;
		self.image = save_obj.image;
		self.text = save_obj.dialog_text;
		self.save_title = save_obj.save_title;
	}
	
	self.switch_playmode = function (mode)
	{
		self.play_mode = mode;
		switch (self.play_mode)
		{
		case ADV_PLAY.NORMAL:
			self.dialog_playmode_div.hide();
			break;
		case ADV_PLAY.AUTO:
			self.dialog_playmode_div.text(UI.ADV_AUTO);
			self.dialog_playmode_div.show();
			break;
		case ADV_PLAY.SKIP:
			self.dialog_playmode_div.text(UI.ADV_SKIP);
			self.dialog_playmode_div.show();
			break;
		}
	}
	
	self.get_history_position = function ()
	{
		return (-self.history_position*HISTORY_ITEM_HEIGHT)+'px';
	}
	
	self.build_history = function ()
	{
		self.history_list_div.empty();
		for (var i=0; i<self.history.length; i++)
		{
			var id = self.history[i];
			var scene = adv_data[id];
			self.history_name_div.text(scene.name);
			self.history_text_div.html(translate_adv_text(scene.text));
			var div = self.history_block_template.clone();
			self.history_list_div.append(div);
		}
	}
	
	self.set_hidden = function (flag, args)
	{
		if (self.scene.display == ADV_DISPLAY.DIALOG)
		{
			if (is_animating(self.dialog_div))
			{
				self.dialog_div.stop(false, false);
			}
			if (flag)
			{
				self.dialog_div.fadeOut();
			}
			else
			{
				self.dialog_div.fadeIn();
			}
			self.is_hide = flag;
		}
		else if (self.scene.display == ADV_DISPLAY.BRANCH)
		{
			if (is_animating(self.branch_div))
			{
				self.branch_div.stop(false, false);
			}
			if (flag)
			{
				self.branch_div.fadeOut();
			}
			else
			{
				self.branch_div.fadeIn();
			}
			self.is_hide = flag;
		}
	}
	
	self.mousedown = function (event)
	{
		if (event.button == MOUSE_RIGHT)
		{
			if (self.is_history)
			{
				self.history_div.fadeOut(HISTORY_FOUT_TIME, function ()
				{
					self.is_history = false;
				});
			}
			else if (self == scene)
			{
				self.set_hidden(!self.is_hide);
			}
			return false;
		}
	}
	
	self.click = function (event)
	{
		if (self.is_history)
		{
			return;
		}
		if (self.is_hide)
		{
			self.set_hidden(false);
			return;
		}
		switch (self.stat)
		{
		case ADV_STAT.PLAY_END:
			self.stat = ADV_STAT.END;
			break;
		case ADV_STAT.READY:
		case ADV_STAT.PLAYING:
			self.stat = ADV_STAT.SKIP_SCENE;
			break;
		}
	}
	
	self.key_up = function (event)
	{
		if (event.which == KEY_ENTER)
		{
			self.click();
		}
		else if (event.which == KEY_CTRL)
		{
			if (self.play_mode == ADV_PLAY.SKIP)
			{
				self.switch_playmode(ADV_PLAY.NORMAL);
			}
		}
	}
	
	self.key_down = function (event)
	{
		if (event.which == KEY_CTRL)
		{
			if (self.play_mode != ADV_PLAY.SKIP)
			{
				self.switch_playmode(ADV_PLAY.SKIP);
			}
		}
	}
	
	self.wheel = function ()
	{
		if (!self.is_history)
		{
			self.is_history = true;
			self.build_history();
			var total = self.history.length;
			self.history_position = total-HISTORY_COUNT_PER_PAGE;
			self.history_list_div.css('top', self.get_history_position());
			self.history_div.fadeIn(HISTORY_FIN_TIME);
		}
	}
	
	self.wheel_history = function (event, delta)
	{
		var total = self.history.length;
		self.history_position = max(0, min(total-HISTORY_COUNT_PER_PAGE, self.history_position-delta));
		console.log('wheel!'+self.get_history_position());
		if (is_animating(self.history_list_div))
		{
			self.history_list_div.stop(false, false);
		}
		self.history_list_div.animate({top: self.get_history_position(), }, {
			duration: 200, 
		});
	}
	
	self.click_branch = function (event)
	{
		if (self.is_history)
		{
			return;
		}
		if (self.stat != ADV_STAT.END)
		{
			var id = event.data.id;
			log(LOG_MSG, 'click_branch('+id+')');
			self.prepare_stat = ADV_PREPARE.READY;
			self.stat = ADV_STAT.END;
			self.scene.next_scene_id = self.scene.option[id].next_scene_id;
			self.scene.post_action = self.scene.option[id].post_action;
		}
	}
	
	self.mover_tip = function (event)
	{
		if (self.is_history)
		{
			return;
		}
		var id = event.data.id;
		var tip = tip_data[id];
		var desc = '未知的注釋。';
		if (tip)
		{
			desc = tip.desc;
		}
		self.tip_div.text(desc);
		self.tip_div.show();
	}
	
	self.mout_tip = function ()
	{
		self.tip_div.hide();
	}
	
	return self;
}

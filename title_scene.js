
var title_main = $('<div id="title_main"></div>');

function TitleScene ()
{
	var self = Scene();
	
	var TITLE = {
		READY: 0, 
		LOGO_FIN: 1, 
		LOGO: 2, 
		LOGO_FOUT: 3, 
		LOADING: 7, 
		TITLE_FIN: 8, 
		TITLE: 9, 
		TITLE_FOUT: 10, 
		LOAD_SCENE: 16, 
		EXTRA_SCENE: 32, 
	};
	
	var TITLE_OPTION = {
		NEW_GAME: 0, 
		LOAD_GAME: 1, 
		EXTRA: 2, 
	};
	
	self.LOGO_FIN_FRAME = 36;
	self.LOGO_FRAME = 40;
	self.LOGO_FOUT_FRAME = 12;
	self.TITLE_FIN_FRAME = 36;
	self.TITLE_FOUT_FRAME = 15;
	
	self.text_text = "本作品由 沙耶 親手刻製";
	self.title_text = "沙耶的幻想";
	self.title_option = [
	{
		name: "幻想開始", 
		id: TITLE_OPTION.NEW_GAME, 
	}, 
	{
		name: "再接再勵", 
		id: TITLE_OPTION.LOAD_GAME, 
	}, 
	{
		name: "幻想鑑賞", 
		id: TITLE_OPTION.EXTRA, 
	}, 
	];
	
	self.init = function ()
	{
		self.stage = TITLE.READY;
		
		// ---- 清空
		title_main.empty();
		
		// ---- 開頭字樣
		self.text_div = $('<div id="logo_text"></div>');
		self.text_div.text(self.text_text);
		self.text_div.css('opacity', 0.0);
		title_main.append(self.text_div);
		
		// ---- 標題畫面
		self.title_div = $('<div id="title_div"></div>');
		self.title_div.css('opacity', 0.0);
		{
			// 標題字樣
			self.title_text_div = $('<div id="title_text"></div>');
			self.title_text_div.text(self.title_text);
			self.title_div.append(self.title_text_div);
			// 標題選項
			self.title_option_div = $('<div id="title_option"></div>');
			{
				self.title_container_div = $('<div class="container"></div>');
				for (var i=0; i<self.title_option.length; i++)
				{
					var option_div = $('<div class="option"></div>');
					option_div.addClass('clickable');
					var option = self.title_option[i];
					option_div.text(option.name);
					option_div.click({id: option.id, }, self.click_option);
					self.title_container_div.append(option_div);
				}
				self.title_option_div.append(self.title_container_div);
			}
			self.title_div.append(self.title_option_div);
		}
		self.title_div.hide();
		title_main.append(self.title_div);
	}
	
	self.deinit = function ()
	{
	}
	
	self.start = function ()
	{
		log(LOG_MSG, "標頭畫面準備中..");
		main_f.html(title_main);
		self.init();
		log(LOG_MSG, "標頭畫面準備完成！");
	}
	
	self.update = function ()
	{
		switch (self.stage)
		{
		case TITLE.READY:
			self.stage = TITLE.LOGO_FIN;
			self.fcnt = 0;
			self.text_div.css('opacity', 0.0);
			break;
		case TITLE.LOGO_FIN:
			self.fcnt++;
			if (self.debug_skip)
			{
				self.fcnt = self.LOGO_FIN_FRAME;
			}
			self.text_div.css('opacity', min(1.0, self.fcnt/self.LOGO_FIN_FRAME));
			if (self.fcnt >= self.LOGO_FIN_FRAME)
			{
				self.stage = TITLE.LOGO;
				self.fcnt = 0;
			}
			break;
		case TITLE.LOGO:
			self.fcnt++;
			if (self.debug_skip)
			{
				self.fcnt = self.LOGO_FRAME;
			}
			if (self.fcnt >= self.LOGO_FRAME)
			{
				self.stage = TITLE.LOGO_FOUT;
				self.fcnt = 0;
			}
			break;
		case TITLE.LOGO_FOUT:
			self.fcnt++;
			if (self.debug_skip)
			{
				self.fcnt = self.LOGO_FOUT_FRAME;
			}
			self.text_div.css('opacity', max(0.0, 1-self.fcnt/self.LOGO_FOUT_FRAME));
			if (self.fcnt >= self.LOGO_FOUT_FRAME)
			{
				self.stage = TITLE.LOADING;
				self.fcnt = 0;
			}
			break;
		case TITLE.LOADING:
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
					self.stage = TITLE.TITLE_FIN;
					self.fcnt = 0;
				}
			}
			break;
		case TITLE.TITLE_FIN:
			self.title_div.show();
			self.fcnt++;
			if (self.debug_skip)
			{
				self.fcnt = self.TITLE_FIN_FRAME;
			}
			self.title_div.css('opacity', min(1.0, self.fcnt/self.TITLE_FIN_FRAME));
			if (self.fcnt >= self.TITLE_FIN_FRAME)
			{
				self.stage = TITLE.TITLE;
				self.fcnt = 0;
			}
			break;
		case TITLE.TITLE:
			break;
		case TITLE.TITLE_FOUT:
			self.fcnt++;
			self.title_div.css('opacity', max(0.0, 1-self.fcnt/self.TITLE_FOUT_FRAME));
			if (self.fcnt >= self.TITLE_FOUT_FRAME)
			{
				self.stage = TITLE.END;
			}
			break;
		case TITLE.END:
			self.deinit();
			scene = ADVScene();
			if (self.next_stage == TITLE_OPTION.NEW_GAME)
			{
				data.scene_id = 1;
				scene.start();
			}
			else if (self.next_stage == TITLE_OPTION.LOAD_GAME)
			{
				scene.start();
				scene.load_from_save_obj(self.save_obj);
			}
			break;
		case TITLE.LOAD_SCENE:
			self.current_scene.update();
			if (self.current_scene.finished)
			{
				var result = self.current_scene.result;
				// 讀檔
				if (result.loaded)
				{
					var save_obj = result.data.adv;
					game.load_from_save_obj(result.data.data);
					self.save_obj = save_obj;
					self.stage = TITLE.TITLE_FOUT;
				}
				else
				{
					self.stage = TITLE.TITLE;
				}
				self.current_scene.div.remove();
			}
			break;
		case TITLE.EXTRA_SCENE:
			self.current_scene.update();
			if (self.current_scene.finished)
			{
				self.stage = TITLE.TITLE;
				self.current_scene.div.remove();
			}
			break;
		default:
			break;
		}
	}
	
	self.click_option = function (event)
	{
		switch (event.data.id)
		{
		case TITLE_OPTION.NEW_GAME:
			self.stage = TITLE.TITLE_FOUT;
			self.fcnt = 0;
			self.next_stage = event.data.id;
			break;
		case TITLE_OPTION.LOAD_GAME:
			self.stage = TITLE.LOAD_SCENE;
			self.fcnt = 0;
			self.next_stage = event.data.id;
			self.current_scene = SavingScene();
			main_f.append(self.current_scene.div);
			self.current_scene.start();
			break;
		case TITLE_OPTION.EXTRA:
			self.stage = TITLE.EXTRA_SCENE;
			self.fcnt = 0;
			self.current_scene = ExtraScene();
			main_f.append(self.current_scene.div);
			self.current_scene.start();
			break;
		default:
			log(LOG_ERR, "未知的按鈕..");
		}
	}
	
	return self;
}

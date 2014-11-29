
var loading_main = $('<div id="loading_main"></div>');

function LoadingScene ()
{
	var self = Scene();
	
	self.progress = 0;
	self.completed = false;
	
	MAX_LOADING_DOT = 3;
	LOADING_DOT_TIME = 25;
	LOADING_BAR_SPEED = 500;
	LOADING_POST_DELAY = 3;
	
	self.start = function ()
	{
		self.progress = 0;
		self.progress_temp = self.progress;
		self.completed = false;
		self.fcnt = 0;
		
		loading_main.empty();
		
		self.container = $('<div class="container"></div>');
		{
			self.loading_text_div = $('<div id="loading_text"></div>');
			self.loading_text = "少女祈禱中";
			self.loading_text_cnt = 0;
			self.loading_dot_cnt = 0;
			self.loading_text_div.text(self.loading_text);
			self.container.append(self.loading_text_div);
			
			self.loading_progress_div = $('<div id="loading_progress"></div>');
			{
				self.progress_text_div = $('<div class="text"></div>');
				self.loading_progress_div.append(self.progress_text_div);
				self.progress_text_div.text('0%');
				
				self.progress_bar_div = $('<div class="bar"></div>');
				self.loading_progress_div.append(self.progress_bar_div);
				self.progress_bar_div.css('width', '0%');
			}
			self.container.append(self.loading_progress_div);
		}
		loading_main.append(self.container);
	}
	
	self.update = function ()
	{
		self.loading_text_cnt++;
		if (self.loading_text_cnt >= LOADING_DOT_TIME)
		{
			self.loading_dot_cnt++;
			if (self.loading_dot_cnt > MAX_LOADING_DOT)
			{
				self.loading_dot_cnt = 0;
				self.loading_text_div.text(self.loading_text);
			}
			else
			{
				self.loading_text_div.text(self.loading_text_div.text()+'.');
			}
			self.loading_text_cnt = 0;
		}
		if (self.progress != self.progress_temp)
		{
			var prog = self.progress*100 + '%';
			if (self.animating)
			{
				console.log(prog);
				self.progress_bar_div.stop(false, false);
			}
			self.animating = true;
			self.progress_bar_div.animate({width: prog, }, {
				duration: LOADING_BAR_SPEED, 
				step: function (now, tween)
				{
					self.progress_text_div.text(Math.floor(tween.now)+'%');
				}, 
				complete: function ()
				{
					self.animating = false;
				}, 
			});
			self.progress_temp = self.progress;
		}
		else if (!self.animating)
		{
			if (self.progress >= 1)
			{
				self.fcnt++;
				if (self.fcnt >= LOADING_POST_DELAY)
				{
					self.completed = true;
				}
			}
		}
	}
	
	return self;
}

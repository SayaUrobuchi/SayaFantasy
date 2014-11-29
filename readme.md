# 關於牠

由沙耶所創造、飼育，緣自阿童所著短篇小說『獵心者』，
因對於原作中劉佳穎路線稍有不滿，於心不忍之下，
盼能略盡綿力，助其對抗那悲慘的命運。

適逢阿童生日將至，心意無以表之，
便將『獵心者』遊戲化，作為禮物祝壽，
同時亦希望能藉此改變命運。

未敢奢望這異想天開的禮物，對方會喜歡，
但對於從不記朋友生日也從不送禮的沙耶，
耗時數週的親手製作，以及難以估量的後續調整，
儘管笨拙，想是已盡最大努力，用自己的方式傳達心意了。

祝阿童2014生日快樂！
並不像沙耶的其它使魔，牠還沒有既定的形象與個性。
盼未來的新主人，也能待其如同親女兒般地養育。
期待著牠未來長大後的模樣！

沙耶 2014

# 關於牠的構造解析

- index.html: 一旦有新的.js，必須在此手動追加。
打包下載於本地執行時，會因安全性問題而封鎖動態載入script。
- game.js: 大部份參數、UI用語、圖與聲音檔、回想的構成都在這裡。
- adv_0.js: ADV script的共通樣板。有些類似繼承概念。
- adv_X.js: ADV script，可自行依喜好決定如何安排它們。
- tip.js: 注釋的script。

# 關於如何養育牠、教導牠、和牠相處

基本上一切皆由hash table組成。
也可以看成struct，幾乎只有資料。

除特殊欄位外，使用陣列的欄位，也可以放單一元素而不須是陣列形式。
若標示為 optional 則表示非必要欄位。

善用本身是script的特性，多使用樣板和constant以及enum吧！
javascript的{}是hash table，可以直接當enum或class使用

clone_hash()用來複製樣板，免得做更動時更改到原本的樣板。
而且支援可變長度參數，第二個以後的參數則是會以合併的方式，
合併到結果的hash table。欄位互衝時越後面的參數，覆蓋優先度越大。

可以參考我目前的幾個簡單範例。

## ADV共通

ADV部份由許多場景 (scene) 所組成。
可以視為是一個 graph，每個場景是一個 vertex，
場景間可以轉移即視為兩點間有一條 edge (單向)。
可以有 cycle。

編輯時建議將不同段落或章節的id用constant的方式記錄在adv_0.js，
會比較清楚易於整理，也比較容易修改

- id (int): 該場景的唯一 key，不可重覆，必須大於 0。
- display (enum ADV_DISPLAY): 該場景的類型。

	- ADV_DISPLAY.DIALOG: 一般對話
	- ADV_DISPLAY.CHANGE_CHAPTER: 顯示章節
	- ADV_DISPLAY.BRANCH: 顯示選項分支
	- ADV_DISPLAY.FATE: 直接按條件進行分歧
	
## ADV_DISPLAY.DIALOG

一般對話場景，最泛用的一種。
適用auto，於skip時會加快指定倍率。

- name (string): 說話者。也可以是多人或？？？等，佔用一行。
空字串時不佔行數。
- text (Hstring): 所說的話。為自定義格式之字串，可內嵌顏色與注釋等。
支援使用\n換行。
- next_scene_id (int): 下一個場景的id。
- bg (struct BG, optional): 指定背景。預設為繼承。
- bgm (struct BGM, optional): 指定背景音樂。預設為繼承。
- image (struct IMAGE[], optional): 指定圖片，通常用於立繪。
- cg (struct CG, optional): 指定CG。CG顯示會覆蓋所有BG與IMAGE，但不會消滅它們。
- save_title (string, optional): 指定存檔時顯示的標題概要。
- tip (int[], optional): 進入該場景時，將指定注釋ID列為已獲取。
- post_action (struct ACTION[], optional): 進入下一個場景時執行的動作。
通常是改動flag或變數，因為我們不希望變數改動因SL被執行多次。
- dispose (boolean, optional): 結束場景時消去對話框與所有圖片。可用於換幕。

## Hstring

自定義的格式，用於內嵌格式使用。目前僅支援內嵌注釋與內嵌顏色。
用法與概念均和html tag雷同。因此亦可堆疊。

實作上會將其轉為對應的span標籤。

格式為 [CMD:VALUE]

CMD無視大小寫。提供全名以及單字母縮寫兩種格式以供選擇。

- COLOR (C): 改變文字顏色。VALUE只要是符合CSS格式的字串皆可使用。
可以用#開頭的十六進位RGB色碼，也可用red、white等CSS支援的顏色。
- TIP (T): 加入注釋。VALUE為TIP的ID，型態為int。
- (空字串): 作為內嵌格式結尾使用。

## struct BG

指定背景用。由於重覆性大，建議於adv_0.js建立樣板使用。內容如下：

- display (ADV_BG): 決定顯示方式

	- ADV_BG.NONE: 清除背景。
	- ADV_BG.INHERIT: 繼承上個場景的處理方式。
	- ADV_BG.IMAGE: 顯示指定的背景。
	
- image (string, optional): 只在display值為ADV_BG.IMAGE時生效。
使用game.js的IMAGE中的key而非實體路徑。

## struct BGM

指定背景音樂用。由於重覆性大，建議於adv_0.js建立樣板使用。內容如下：

- display (ADV_BGM): 決定播放方式

	- ADV_BGM.NONE: 清除背景音樂。
	- ADV_BGM.INHERIT: 繼承上個場景的處理方式。
	- ADV_BGM.PLAY: 播放指定的背景音樂。
	
- audio (string, optional): 只在display值為ADV_BGM.PLAY時生效。
使用game.js的AUDIO中的key而非實體路徑。
- loop (boolean, optional): 是否重覆播放。不指定時默認為true。

## struct IMAGE

指定立繪用。由於重覆性大，建議於adv_0.js建立樣板使用。
由於屬性複雜，建議將不同屬性 (例如位置和圖的key) 分開建樣板再來合併。

內容如下：

- id (int): 指定所使用的目標slot，與其位置或重疊時的上下沒有一定關係。
- display (ADV_IMAGE): 指定顯示方式。

	- ADV_IMAGE.NONE: 清除該slot
	- ADV_IMAGE.INHERIT: 繼承之前場景的處理方式
	- ADV_IMAGE.SHOW: 將該slot替換掉
	- ADV_IMAGE.CHANGE_ATTR: 繼承該slot並覆蓋指定的屬性
	
- image (string, optional): 只在display值為ADV_IMAGE.SHOW
或者ADV_IMAGE.CHANGE_ATTR時生效。
使用game.js的IMAGE中的key而非實體路徑。
- left / right / top / bottom: 同CSS中的同名屬性。
格式參考CSS，可使用%。記得加入單位，常用單位是px。
- width / height: 同CSS中的同名屬性。
格式參考CSS，可使用%。記得加入單位，常用單位是px。

	若只指定width或height其中之一，則未指定的一項，會自動依比例進行縮放。
	
- zIndex: 同CSS的同名屬性，為重疊時的上下關係。

	- 背景: 10
	- IMAGE預設: 50
	- CG: 995
	- 對話框: 1000
	- 選項分歧: 1050

## struct CG

指定CG用。由於重覆性大，建議於adv_0.js建立樣板使用。內容如下：

- display (ADV_CG): 決定顯示方式

	- ADV_CG.NONE: 清除CG。
	- ADV_CG.INHERIT: 繼承上個場景的處理方式。
	- ADV_CG.IMAGE: 顯示指定的CG。
	
- image (string, optional): 只在display值為ADV_CG.IMAGE時生效。
使用game.js的IMAGE中的key而非實體路徑。

## struct ACTION

執行指定的動作用。通常是改變flag或counter。以下所有動作全都會執行。

幾乎都有全域以及非全域版本，兩邊會以namespace分開，同名不會衝突。

- flag (string/string[], optional): 插上flag
- global_flag (string/string[], optional): 同上，對象為全域flag
- break_flag (string/string[], optional): 拆掉flag
- break_global_flag (string/string[], optional): 同上，但對象為全域flag
- value (VALUE/VALUE[], optional): 改變計數器
- global_value (VALUE/VALUE[], optional): 同上，但對象為全域

	VALUE內容: 
	
	- target (string): 對象名
	- op (OPERATOR): 運算子，除法為整數運算，會無條件捨去
	
		- OPERATOR: ASSIGN / ADD / SUB / MUL / DIV / MOD
		
		分別為賦值、加、減、乘、除、取餘
		
	- value (string/int): 整數常數或對象名
		
- func (FUNCTION/FUNCTION[], optional): 會依序執行，
可寫function樣板產生器，或直接寫匿名function。

## ADV_DISPLAY.CHANGE_CHAPTER

切換章節使用。也可用於換日換幕等。
會強制性地消去對話框與圖片。
於skip時會加快指定倍率。

- main_title (string): 主要文字 (較大)
- sub_title (string): 次要文字 (較小)

## ADV_DISPLAY.BRANCH

顯示分歧讓玩家選擇用。
auto，skip到這都會停下等待，但仍會維持到之後的場景。

- option (struct OPTION[]): 可選擇的選項一覽。

## OPTION

讓玩家選擇的分歧。

- next_scene_id (int): 選擇此分歧後，跳到哪一個場景
- text (Hstring): 該選項顯示於畫面上的文字。內嵌注釋無用。
- post_action (ACTION/ACTION[], optional): 
選擇此選項時執行的動作，通常是立flag。

## ADV_DISPLAY.FATE

也是用於分支，但不是讓玩家選擇，而是直接判定條件後，
跳至指定場景。所以是命運。

- branch (struct BRANCH[]): 所有的分支以及其條件。
從第一個分支開始測試，條件符合會忽略剩下的分支，直接跳轉。

	如果無符合條件者，無條件走最後一個分支。

## BRANCH

依當前狀態直接決定走向哪條分支。通常取決於flag和counter。

- next_scene_id (int): 當測試條件通過時，前往哪一個場景
- condition (CONDITION/CONDITION[]): 前往此分支的條件。
存在多個條件時會依序判斷，只要其中一個CONDITION成立就視為測試通過。

	CONDITION:
	
		以下的所有欄位都可同時存在，不同欄位間以and連接。
		即，所有欄位全部成立才算成立。略過的欄位直接視為成立。

	- flag (string/string[], optional): 若指定flag全部成立時為true，
	否則為false。
	- global_flag (string/string[], optional): 同上，但目標為全域flag。
	- not_flag (string/string[], optional): 若指定flag全部不成立時為true，
	否則為false。
	- not_global_flag (string/string[], optional): 同上，但目標為全域flag。
	- value (COMPARE/COMPARE[], optional): 若指定counter全部符合比較式時為true，
	否則為false。
	- global_value (COMPARE/COMPARE[], optional): 同上，對象為全域。
	
		COMPARE:
		
		- target (string): 對象名
		- op (COMP_OPERATOR): 
		
			- COMP_OPERATOR: EQ / NEQ / GT / GEQ / LT / LEQ
			
				分別是: 等於、不等於、大於、大於等於、小於、小於等於
				
		- value: 整數常數 或 對象名
		
	- func (FUNCTION/FUNCTION[], optional): 依序執行，以回傳值判定。
	若有一者判定為false則視為false，且停止執行後面的function。
	回傳值全部判定為true時才算成立。
	
		回傳值判定方式比照javascript，
		例如undefined, 0和null在js皆視同false。

## 回想共通

回想目前共有三塊: BGM、CG、TIP。
BGM獲取方式: 在ADV中播放過
CG獲取方式: 在ADV中顯示過
TIP獲取方式: 在ADV中內嵌過，或透過tip屬性指定獲取

這些多被分成內容以及索引兩個部份，平時會直接取內容使用，
回想時則取索引，透過索引獲得內容。

因此回想的順序編排、哪些要進回想哪些不要，都透過索引處理。

BGM與CG須加入game.js的IMAGE以及AUDIO，才能放進回想以及使用預讀功能，
免得顯示後才開始載入以致顯示效果不佳。

tip則必須在tip.js自行輸入內容。

## IMAGE以及AUDIO

結構為hash table，以string為key、檔案路徑為value。
被放在IMAGE以及AUDIO的檔案，會被預先載入。

key被用於識別用，須唯一。

## BGM回想索引

位於game.js中的bgm_list，型態為BGM_INDEX[]。

顯示順序依照bgm_list中的元素先後順序決定。

BGM_INDEX內容如下:

- id (int): 顯示於畫面上的BGM編號。與顯示順序無關。
- name (string): 顯示於畫面上的BGM曲名。
- key (string): 對應至AUDIO中的key。

## CG回想索引

位於game.js中的cg_list，型態為CG_INDEX[]。

顯示順序依照cg_list中的元素先後順序決定。

CG_INDEX內容如下:

- id (int): 顯示於畫面上的CG編號。與顯示順序無關。
- name (string): 顯示於畫面上的CG曲名。
- key (string or string[]): 對應至IMAGE中的key。
不同於BGM，可將多張CG集中於同一格。

	注意: 無法指定封面，顯示的會是已獲取CG之中，
	在陣列裡面索引最小者。
	
## tip回想索引

位於game.js中的tip_list，型態為TIP_INDEX[]。

顯示順序依照tip_list中的元素先後順序決定。

不同於其它回想，tip於ADV畫面上會顯示其ID，
故為防止混淆，只能使用ID作為key。因此沒有key欄位。

TIP_INDEX內容如下:

- id (int): 顯示於畫面上的TIP編號，同時作為key使用。
- name (string): 顯示於左側TIP列表的名稱。

注意: TIP_INDEX的name欄位將顯示於TIP回想左側，
而tip本身在tip.js中的name欄位將顯示於TIP回想右側作為標題。
兩者可一致、可不一致，視需求可自行決定。

## tip

位於tip.js中，為一hash table，以int為key，TIP為value。

TIP內容如下:

- name (string): 名稱，顯示於回想右側作為標題，ADV中不顯示。
- desc (Hstring): 注釋內容，與ADV對話內文使用相同自定義格式，
內嵌注釋無用。

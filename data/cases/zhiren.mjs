// 《纸人夜嫁》——由 tools/build-case.mjs 从 story-src/zhiren/ 生成，改源文件后重新运行即可。
export const PACK = {
  "id": "zhiren",
  "title": "纸人夜嫁",
  "subtitle": "中式民俗 · 本格推理",
  "meta": "光绪二十六年 · 七月十四 · 湘西甄家寨",
  "blurb": "中元前夜，甄家给死去的少爷娶一具骨匣做新娘。灵堂里的老太爷整晚端坐不动，子时纸灰飞起，他已经凉了。六个人，各自以为是自己下的手。",
  "tags": [
    "中式民俗",
    "本格推理"
  ],
  "difficulty": "★★★★★",
  "artStyle": "Chinese papercut art (剪纸) illustration, layered red and black cut-paper silhouettes with intricate pierced patterns on aged rice paper",
  "cover": "Chinese papercut art (剪纸) poster illustration, a paper bride sedan chair and a paper horse in a rainy courtyard at night, a candle-lit mourning hall door with the silhouette of a seated man in a skullcap, falling paper money, layered red and black cut-paper silhouettes on aged rice paper, no people, no text",
  "bgPrompt": "Chinese papercut art (剪纸) backdrop, a dark old courtyard house roofline in the rain, hanging white lanterns, drifting paper money, low contrast, empty scene, no people, layered red and black cut-paper silhouettes",
  "card": {
    "players": "6 人",
    "duration": "3.5 小时",
    "genres": [
      "中式民俗"
    ],
    "category": [
      "本格",
      "推理"
    ]
  },
  "newRules": true,
  "roleModel": true,
  "case": {
    "title": "纸人夜嫁",
    "subtitle": "中式民俗 · 本格推理",
    "meta": "光绪二十六年 · 七月十四 · 湘西甄家寨",
    "intro": "子时的纸灰还在冒烟，阴阳先生推开灵堂的门去请老太爷送棺。太师椅里，甄德厚脸朝着喜棺，头垂在胸前，已经没有了气息。门外的人都说，他一整晚都端端正正坐在那里。",
    "common": "光绪二十六年七月十四，中元节前夜，湘西甄家寨下着连夜的雨。寨里首富甄德厚给去年坠马身亡的小儿子甄少康办一场阴亲，新娘是一具十六岁姑娘的骨匣。按阴阳先生定下的规矩：拜过堂，主婚人要独自坐在灵堂里守到子时，中间谁也不许进去，只有阴阳先生能进去添长明灯的油；子时在院子里把纸轿纸马纸人统统烧掉，化完纸，再请主婚人出来送棺。山路被雨冲断，寨子里的人一个也出不去。",
    "victim": {
      "name": "甄德厚",
      "age": 63,
      "desc": "甄家寨首富，脾气暴戾，铜手炉一年四季不离手，今晚给死去的小儿子办阴亲，独自在灵堂守灵。"
    },
    "truth": {
      "killerId": "liu",
      "methodId": "m_needle",
      "motiveId": "n_daughter",
      "killerLine": "凶手是纸扎匠刘巧手。",
      "summary": "真凶是纸扎匠刘巧手。他的女儿春妮在甄家做丫鬟，四月初九夜里在后院井台落井，井台石缝里那枚铜纽扣、大有余旧账上那件湿马褂，都指向甄德厚当晚就在井边。春妮死后，尸骨被鬼三娘从甄家义庄偷起，配给了甄少康做阴亲。刘巧手接下冥婚的纸活，从骨边的银镯认出了女儿。\n这一夜，甄德厚先后经历了三件事：20:50 戚小蛾往参汤里下了老鼠药，他只尝一口就吐了；22:00 蓉翠娥用他的铜手炉砸中他的后脑，他趴在供桌边不动，但仍有呼吸；22:15 鬼三娘隔着门缝看见他趴着，以为在打盹，回去扎了个小人。\n22:30 刘巧手扛着照甄德厚样子开脸的纸管家从侧门进灵堂，用磨尖的一尺二寸篾针从后颈发际下扎了进去。22:35 他把尸体拖进供桌后的白幔里，让纸管家背对着门坐在太师椅上，把两支白烛挪到椅前，门纸上便映出一个端坐的人影；他用围裙擦了血，把篾针插进纸管家后背当骨架。22:40 他在灶房洗手，把围裙塞进要烧的纸马肚子里，随后去院子里和别人一起干活。\n23:00 大有余从门缝里、23:20 撒半仙在屋里、23:30 蓉翠娥和 23:40 鬼三娘从窗里，看到的都是那个纸人。23:50 刘巧手奉命进灵堂搬纸活，把尸体扶回椅子，把纸管家当作纸活扛出来，00:00 子时化纸时连同篾针和围裙一起烧掉。破绽留在白幔后的拖痕和马褂上的灰与蛛网、挪过位置的白烛、灰里那半张画着黑痣的纸脸，以及那根比纸轿篾粗一倍、尖头发暗的竹篾。",
      "timeline": [
        {
          "t": "20:30",
          "who": "刘巧手",
          "what": "喜宴上甄德厚当众说新娘命好能做甄家少奶奶，刘巧手坐在末席，看着骨匣上系着的银镯。"
        },
        {
          "t": "20:30",
          "who": "蓉翠娥",
          "what": "喜宴上甄德厚当众说冥婚过后要蓉翠娥搬进正院伺候起居，蓉翠娥放下了筷子。"
        },
        {
          "t": "20:30",
          "who": "戚小蛾",
          "what": "戚小蛾在喜宴上端菜，听到甄德厚说春妮命好，手一抖洒了汤，退了出去。"
        },
        {
          "t": "20:30",
          "who": "鬼三娘",
          "what": "喜宴上鬼三娘提尾款，甄德厚当众冷笑拒付，说要把起骨的事报给县衙。"
        },
        {
          "t": "20:30",
          "who": "撒半仙",
          "what": "撒半仙在喜宴上坐上首说吉利话。"
        },
        {
          "t": "20:30",
          "who": "大有余",
          "what": "喜宴上甄德厚吩咐大有余明早拿冥婚的账来核对。"
        },
        {
          "t": "20:50",
          "who": "戚小蛾",
          "what": "戚小蛾在灶房把参汤盛进白瓷碗，从柴堆后取出老鼠药抖了小半包进去，围裙上沾了药粉。"
        },
        {
          "t": "21:00",
          "who": "蓉翠娥",
          "what": "蓉翠娥在廊下看见撒半仙在灵堂门口交代规矩，甄德厚揣着手炉进了灵堂。"
        },
        {
          "t": "21:00",
          "who": "撒半仙",
          "what": "撒半仙在灵堂门口向甄德厚交代守灵规矩，甄德厚揣着手炉进去关门，蓉翠娥站在廊下。"
        },
        {
          "t": "21:00",
          "who": "甄德厚",
          "what": "揣着铜手炉进灵堂独自守灵，关上了门。"
        },
        {
          "t": "21:10",
          "who": "戚小蛾",
          "what": "戚小蛾把参汤送进灵堂，甄德厚喝了一口嫌苦吐回碗里，把碗推到一边。"
        },
        {
          "t": "21:10",
          "who": "甄德厚",
          "what": "喝了一口参汤嫌苦吐回碗里，把碗推到一边。"
        },
        {
          "t": "21:20",
          "who": "大有余",
          "what": "大有余在账房把鬼三娘写明一百两的收条丢进火盆烧掉，又把账本上骨匣二百两那一笔描了一遍。"
        },
        {
          "t": "21:30",
          "who": "刘巧手",
          "what": "刘巧手在作坊取下一根一尺二寸的篾针磨尖，给照甄德厚样子开脸的纸管家套上黑纸马褂和瓜皮帽。"
        },
        {
          "t": "21:40",
          "who": "蓉翠娥",
          "what": "蓉翠娥在厢房清点包袱里的碎银子，决定去灵堂求甄德厚放她回辰州。"
        },
        {
          "t": "21:50",
          "who": "鬼三娘",
          "what": "鬼三娘在西厢客房数银子、翻小本子，想到甄德厚若死了就没人报官。"
        },
        {
          "t": "22:00",
          "who": "蓉翠娥",
          "what": "蓉翠娥进灵堂求甄德厚放她回辰州，被他扯住孝服，抓起铜手炉砸在他后脑，手炉滚到供桌底下，甄德厚趴在供桌边不动，她以为他死了，跑了出去。"
        },
        {
          "t": "22:00",
          "who": "撒半仙",
          "what": "撒半仙在西厢静室听见灵堂那边当啷一声铜器落地，没有去看。"
        },
        {
          "t": "22:00",
          "who": "甄德厚",
          "what": "后脑被铜手炉砸中，趴在供桌边不动，仍有呼吸。"
        },
        {
          "t": "22:05",
          "who": "蓉翠娥",
          "what": "蓉翠娥跑过后院井台，看见戚小蛾在井边烧纸，没有停脚。"
        },
        {
          "t": "22:05",
          "who": "戚小蛾",
          "what": "戚小蛾在后院井台烧纸，看见蓉翠娥从灵堂方向跑过，头发散乱、脸色发白。"
        },
        {
          "t": "22:10",
          "who": "蓉翠娥",
          "what": "蓉翠娥回厢房洗手，盆里的水泛红，孝服袖口沾着几点黑灰。"
        },
        {
          "t": "22:15",
          "who": "鬼三娘",
          "what": "鬼三娘在喜堂婚书上抄下甄德厚的生辰八字，到灵堂门口隔着门缝叫他，见他趴在供桌边不动，以为在打盹，回了西厢。"
        },
        {
          "t": "22:20",
          "who": "鬼三娘",
          "what": "鬼三娘在客房用稻草扎小人，缠上写着甄德厚八字的红纸，扎了三根缝衣针。"
        },
        {
          "t": "22:25",
          "who": "鬼三娘",
          "what": "鬼三娘把扎了针的稻草小人丢进炭盆烧掉。"
        },
        {
          "t": "22:30",
          "who": "刘巧手",
          "what": "刘巧手扛着纸管家从灵堂侧门进去，见甄德厚趴在供桌边、脑后有包、仍有呼吸，把磨尖的篾针从他后颈发际下扎进去，直到他不动。"
        },
        {
          "t": "22:30",
          "who": "撒半仙",
          "what": "撒半仙听见灵堂侧门吱呀一声，从窗缝看见夹道里有个影子一晃，看不清。"
        },
        {
          "t": "22:30",
          "who": "甄德厚",
          "what": "被刘巧手用磨尖的篾针从后颈发际下扎入，不再动弹。"
        },
        {
          "t": "22:35",
          "who": "刘巧手",
          "what": "刘巧手把甄德厚拖进供桌后的白幔里，把纸管家安在太师椅上背对门，把两支白烛挪到椅前，用围裙擦掉地上的血，把篾针插进纸管家后背。"
        },
        {
          "t": "22:35",
          "who": "——",
          "what": "甄德厚被拖进供桌后的白幔里，太师椅上坐着照他样子开脸的纸管家。"
        },
        {
          "t": "22:40",
          "who": "刘巧手",
          "what": "刘巧手在灶房水缸边洗手，回作坊把蓝布围裙卷起塞进要烧的纸马肚子里糊好。"
        },
        {
          "t": "22:50",
          "who": "刘巧手",
          "what": "刘巧手到院子里和大有余、戚小蛾一起摆纸活。"
        },
        {
          "t": "22:50",
          "who": "戚小蛾",
          "what": "戚小蛾在院子里和大有余、刘巧手一起摆纸活。"
        },
        {
          "t": "22:50",
          "who": "大有余",
          "what": "大有余叫戚小蛾到院子里摆纸活，刘巧手过来帮忙。"
        },
        {
          "t": "23:00",
          "who": "刘巧手",
          "what": "刘巧手看见大有余去灵堂门口问话，回来说老太爷坐着打盹。"
        },
        {
          "t": "23:00",
          "who": "戚小蛾",
          "what": "戚小蛾看见大有余去灵堂门口问话，回来说老太爷坐着打盹。"
        },
        {
          "t": "23:00",
          "who": "大有余",
          "what": "大有余到灵堂门口问添炭，无人应答，从门缝看见太师椅里戴瓜皮帽的人背对门不动，回来说老太爷睡着了。"
        },
        {
          "t": "23:20",
          "who": "刘巧手",
          "what": "刘巧手看见撒半仙提灯油壶进灵堂添灯，过了一会儿出来。"
        },
        {
          "t": "23:20",
          "who": "戚小蛾",
          "what": "戚小蛾看见撒半仙提灯油壶进灵堂，过了一会儿出来。"
        },
        {
          "t": "23:20",
          "who": "撒半仙",
          "what": "撒半仙进灵堂添长明灯油，见太师椅里戴瓜皮帽的人背对着门不动，没绕到前面看，从聘礼盘里偷拿一锭金元宝。"
        },
        {
          "t": "23:20",
          "who": "大有余",
          "what": "大有余看见撒半仙提灯油壶进灵堂，过了一会儿出来，脸色发白。"
        },
        {
          "t": "23:30",
          "who": "蓉翠娥",
          "what": "蓉翠娥从后窗望见灵堂后窗的白纸上映着一个戴瓜皮帽、坐着不动的人影，以为甄德厚还活着。"
        },
        {
          "t": "23:40",
          "who": "鬼三娘",
          "what": "鬼三娘从西厢窗缝望见灵堂门纸上映着戴瓜皮帽、端坐的人影。"
        },
        {
          "t": "23:50",
          "who": "刘巧手",
          "what": "刘巧手进灵堂，把甄德厚从白幔里拖回太师椅坐好，扛着纸管家和一对纸童从正门出来，鬼三娘这时从西厢走进院子。"
        },
        {
          "t": "23:50",
          "who": "戚小蛾",
          "what": "戚小蛾看见刘巧手从灵堂扛出纸管家、抱出一对纸童，鬼三娘从西厢过来。"
        },
        {
          "t": "23:50",
          "who": "鬼三娘",
          "what": "鬼三娘走进院子，看见刘巧手从灵堂扛出纸管家、抱出一对纸童，没看清纸管家的脸。"
        },
        {
          "t": "23:50",
          "who": "撒半仙",
          "what": "撒半仙吩咐刘巧手搬出灵前纸活，刘巧手扛着纸管家抱着纸童出来，鬼三娘从西厢过来。"
        },
        {
          "t": "23:50",
          "who": "大有余",
          "what": "大有余看见刘巧手从灵堂扛出纸管家、抱出纸童，鬼三娘从西厢过来。"
        },
        {
          "t": "23:50",
          "who": "——",
          "what": "甄德厚被扶回太师椅，纸管家被当作纸活扛出灵堂。"
        },
        {
          "t": "00:00",
          "who": "刘巧手",
          "what": "子时化纸，刘巧手把纸童、肚里塞着围裙的纸马和纸管家依次丢进化纸池。"
        },
        {
          "t": "00:00",
          "who": "蓉翠娥",
          "what": "蓉翠娥在院子里参加子时化纸，站在最后，看着刘巧手往火里丢纸活。"
        },
        {
          "t": "00:00",
          "who": "戚小蛾",
          "what": "戚小蛾在子时化纸时往火里撒纸钱。"
        },
        {
          "t": "00:00",
          "who": "鬼三娘",
          "what": "鬼三娘在子时化纸时站在化纸池边。"
        },
        {
          "t": "00:00",
          "who": "撒半仙",
          "what": "撒半仙在子时摇铃念咒，主持化纸。"
        },
        {
          "t": "00:00",
          "who": "大有余",
          "what": "大有余在子时化纸时带头往化纸池里丢纸钱。"
        },
        {
          "t": "00:10",
          "who": "撒半仙",
          "what": "撒半仙化纸后进灵堂请甄德厚送棺，发现他坐在太师椅里没有鼻息，脑后有乌青的包。"
        },
        {
          "t": "00:12",
          "who": "刘巧手",
          "what": "刘巧手随众人跑进灵堂，站在人后。"
        },
        {
          "t": "00:12",
          "who": "蓉翠娥",
          "what": "蓉翠娥随众人进灵堂，见甄德厚坐在太师椅里，与她离开时趴在供桌边的样子不同。"
        },
        {
          "t": "00:12",
          "who": "戚小蛾",
          "what": "戚小蛾随众人进灵堂，看见供桌上那碗参汤，以为是老鼠药发作。"
        },
        {
          "t": "00:12",
          "who": "鬼三娘",
          "what": "鬼三娘随众人进灵堂，以为是自己扎小人咒死了甄德厚。"
        },
        {
          "t": "00:12",
          "who": "撒半仙",
          "what": "撒半仙在灵堂门口喊人，众人涌入，他想起自己进灵堂时没看清椅中人的脸。"
        },
        {
          "t": "00:12",
          "who": "大有余",
          "what": "大有余冲进灵堂，看见甄德厚黑缎马褂后背皱巴沾灰、下摆挂着蛛网。"
        }
      ],
      "epilogue": "天亮雨停，县衙的人从井里捞起了一只灯笼，灯笼骨上还挂着那年四月的水草。刘巧手把女儿的骨匣从喜堂里抱出来，没有送进甄家的祖坟。他在刘家湾的河边给她扎了最后一顶纸轿，轿帘上剪着一朵梅花。"
    }
  },
  "victim": {
    "name": "甄德厚",
    "age": 63,
    "desc": "甄家寨首富，脾气暴戾，铜手炉一年四季不离手，今晚给死去的小儿子办阴亲，独自在灵堂守灵。"
  },
  "characters": [
    {
      "id": "liu",
      "name": "刘巧手",
      "gender": "男",
      "age": 41,
      "role": "纸扎匠",
      "roleKind": "killer",
      "coverage": [
        "motive",
        "secret",
        "action",
        "unique"
      ],
      "avatar": "扎",
      "color": "#7a2e23",
      "room": "r_liu",
      "appearance": "四十一岁，个子不高，背有点驼，十根手指又细又糙，指甲缝里嵌着洗不掉的颜料，说话轻声细气，见人先笑，笑完又低下头。",
      "relation": "甄家请来扎冥婚纸活的纸扎匠，纸轿、纸马、纸童、纸管家都出自你手，这几天就住在东厢的作坊里。",
      "publicInfo": "刘巧手，四十一岁，寨子里最好的纸扎匠，这回包了甄家冥婚的全部纸活，住在东厢作坊。",
      "portrait": "portrait of a 41-year-old Chinese man, late Qing dynasty western Hunan village, a paper effigy craftsman, slightly hunched, short hair under a dark cloth headwrap, indigo cotton jacket with a worn blue apron, thin rough fingers stained with paint, faint lines across the forehead, Chinese papercut art (剪纸) illustration, layered red and black cut-paper silhouettes with intricate pierced patterns on aged rice paper, half-length portrait, restrained calm expression",
      "avatarSpec": {
        "era": "late Qing dynasty (1900) western Hunan",
        "ethnicity": "Chinese (Han)",
        "age": 41,
        "gender": "男",
        "job": "纸扎匠",
        "dress": "靛蓝土布短褂、蓝布围裙、黑布包头（cloth headwrap, cotton jacket）",
        "style": "剪纸 papercut illustration"
      },
      "script": {
        "background": "你生在甄家寨下游的刘家湾，祖上三代都是扎纸活的。你七岁起跟着父亲劈篾、糊纸、开脸，十二岁扎的纸马就有人出钱买去烧给先人。父亲说，纸扎匠的手艺全在一张脸上，脸开得像，阴间的人才认得是谁送去的。你记住了这句话。\n\n你三十岁才娶亲，媳妇生下女儿春妮那年冬天就病走了。你一个人把春妮拉扯大，她三岁会递浆糊，七岁会剪窗花，十二岁能替你给纸人画眉毛。你在她十四岁生辰那天，亲手打了一只银镯给她，镯子内侧錾了一朵小梅花，旁边一个春字，梅花是她自己画的样子。\n\n前年山洪冲了刘家湾，作坊塌了半边，你欠了一屁股债。甄家的大管家大有余来湾里招丫鬟，说甄府管吃管住，一年给三两银子。春妮自己点了头，说爹的债她帮着还。你送她到寨门口，她回头冲你笑，手腕上那只银镯晃了一下。\n\n今年四月初九，甄家来人说春妮夜里去后院井台打水，失足掉进了井里，人捞上来就没气了。甄家给了五两银子，说怕冲撞，尸身就停在甄家的义庄，择日下葬，不让你看。你在义庄门口跪了一夜，第二天去问，管义庄的人说已经埋了，埋在哪里没人说得清。你回到湾里，在空了的作坊里坐了三天。\n\n上个月，鬼三娘拿着一张生辰八字来湾里，说甄家要给死了一年的小少爷甄少康结阴亲，新娘已经找好了，叫你照着尺寸扎一顶纸轿、一个纸新娘，还要照新娘的样子开脸。她递过来一只银镯，说是新娘随身的东西，纸新娘手上要画一只一样的。你接过镯子，看见内侧那朵梅花和那个春字，手抖得端不住碗。\n\n你没有声张。你接下了这单活，住进甄家东厢的作坊。几天里你看清了这户人家：老太爷甄德厚说一不二，管家大有余替他办所有见不得光的事；撒半仙替这桩阴亲算了八字，说上上大吉；戚小蛾是春妮在甄家最要好的丫鬟，她偷偷告诉你，四月初九那晚，她在后院看见老太爷从井台那边回来，衣襟是湿的。\n\n你还知道甄家冥婚的规矩，都是撒半仙定的：拜过堂，老太爷要一个人坐在灵堂里守灵，守到子时化纸，中间谁也不许进去冲撞，只有撒半仙能进去添灯油。化纸的时候，灵前的纸童纸马都要由你搬出来，一件件丢进化纸池。\n\n你扎了二十多年纸人，知道烛光下一个纸人坐在椅子里，从背后看和活人没有两样。你也知道竹篾削尖了，比铁针还硬。这些年你开过上千张纸脸，这一回，你照着甄德厚的样子开了一张，花白的胡子，左颊一颗黑痣。\n\n你住进作坊的头一天，就把甄家的院子走了一遍：灵堂正门对着院子，门上糊着白纸，侧门开在东边的夹道里，夹道一头通你的作坊，一头通灶房。",
        "tonight": "20:30 喜宴摆在正厅，你被安排在末席。老太爷端着酒杯说，春妮这孩子命好，死了还能做甄家的少奶奶，满桌人跟着说吉利话。你知道他说的就是你女儿，筷子攥得发白，心里像有把刀在绞，脸上却跟着笑。你看见骨匣上系着的那只银镯，在烛光下一闪一闪。\n21:30 你回到东厢作坊，想着今晚只有这一次机会，便从墙上那排篾针里取下最长的一根，一尺二寸，在磨刀石上把尖头磨得发亮。你又把那个纸管家搬到灯下，给它套上照老太爷的样子糊的黑纸马褂和瓜皮帽，最后一笔点上左颊那颗痣。你看着那张纸脸，心里出奇地静。\n22:30 你扛着纸管家，从东厢的夹道摸到灵堂侧门，侧门吱呀响了一声，你停了半天，没听见人声才进去。白烛下老太爷趴在供桌边，脑后鼓起一个包，头发里有血，背还在一起一伏。你愣住了，不知道是谁先来过，怕他醒过来叫人，心一横，左手按住他的头，右手把篾针从他后颈发际下面那个窝里扎进去，一直扎到不能再深。他抖了几下，就不动了。你拔出篾针，手背上溅了两点血，心跳得像打鼓。\n22:35 你怕有人随时进来，赶紧把老太爷拖到供桌后面的白幔里，放平在喜棺旁边。你把纸管家安在那张太师椅上，脸朝着棺材，后背冲着门，又把两支白烛从供桌两头挪到椅子前面，让门纸上映出一个坐着的人影。你用围裙擦了地上那两滴血，顺手把篾针插进纸管家的后背，充作一根骨架。\n22:40 你从侧门退出来，绕到灶房，灶房里没人。你在水缸边把手洗了三遍，用抹布擦干。回到作坊，你脱下那条蓝布围裙，卷成一团，塞进那匹要烧的纸马肚子里，再糊上一层纸，看不出一点痕迹。\n22:50 你想着这时候身边人越多越好，便去院子里帮大有余和戚小蛾摆纸活。纸轿、纸马、金山银山一样样摆到化纸池边，你一边摆一边说说笑笑，手却一直在发凉。\n23:00 大有余说要去问问老太爷添不添炭，走到灵堂门口问了一声，没人应。他扒着门缝看了一眼，回来说老太爷坐着打盹呢。你没抬头，心想门纸上那个影子果然骗过了人。\n23:20 撒半仙提着灯油壶进了灵堂，说要添长明灯。你手里的纸钱一下子攥皱了，担心他看见白幔后头。过了一会儿他出来了，脸色如常，你才松了口气。\n23:50 撒半仙吩咐你把灵前的纸童纸马搬出来，你知道换回来的时候到了。你进了灵堂，掩上门，赶紧把老太爷从白幔里拖出来，扶回太师椅，让他脸朝棺材坐好，把瓜皮帽给他扶正。你扛起纸管家，又抱上一对纸童，从正门出来，鬼三娘这时也从西厢过来了。院子里的人只看见你搬纸活，没人多看一眼。\n00:00 子时一到，撒半仙念过咒，众人往化纸池里丢纸活。你先丢纸童，再丢那匹肚子里塞着围裙的纸马，最后把纸管家丢进火里，火一下子窜起来，那张画着黑痣的纸脸卷起来，烧成一片黑。你站在火边，脸被烤得发烫，心里一遍遍念着春妮的名字。\n00:12 撒半仙在灵堂里喊出了人命。你跟着众人跑进去，老太爷坐在太师椅里，头垂着。你站在人后，看着他后颈那块被衣领遮住的地方，什么也没说，只觉得两腿发软，不知道是怕还是松了一口气。",
        "hide": "春妮是你的女儿。你在灵堂里用磨尖的篾针扎进了甄德厚的后颈，把他藏进白幔，用照他样子扎的纸管家坐在太师椅上骗过众人；你把沾血的围裙塞进纸马，把篾针插进纸管家后背，子时一起烧了。你要藏住这一切。",
        "know": "你知道撒半仙定的规矩：守灵期间谁也不许进灵堂，只有撒半仙能进去添灯油，化纸时纸活由你搬出；你进灵堂时，老太爷已经趴在供桌边，脑后有包，你不知道是谁先来过；戚小蛾说四月初九那晚看见老太爷从井台回来，衣襟是湿的。",
        "mission": "1. 隐瞒你和春妮的父女关系。\n2. 别让人想到灵堂里坐着的曾经是一个纸人。\n3. 把怀疑引向脑后那个包和那碗参汤。\n4. 在投票中让真凶的得票低于一半。"
      },
      "isKiller": true
    },
    {
      "id": "rong",
      "name": "蓉翠娥",
      "gender": "女",
      "age": 32,
      "role": "甄家大儿媳",
      "roleKind": "fake",
      "coverage": [
        "motive",
        "secret",
        "action",
        "tension"
      ],
      "avatar": "娥",
      "color": "#5b3b6b",
      "room": "r_rong",
      "appearance": "三十二岁，身量高挑，眉眼清秀，常年穿一身素白孝服，头发挽成一个紧紧的髻，插一根乌木簪，说话温吞，眼底却总压着一股冷。",
      "relation": "甄德厚的大儿媳，丈夫甄少安五年前病故，你守寡至今，老太爷在喜宴上说冥婚过后要你搬进他的正院。",
      "publicInfo": "蓉翠娥，三十二岁，甄家大少爷甄少安的遗孀，守寡五年，住在后院的厢房。",
      "portrait": "portrait of a 32-year-old Chinese woman, late Qing dynasty western Hunan, a widowed daughter-in-law of a wealthy family, hair in a tight bun with a black wooden hairpin, plain white mourning robe with a hemp collar, slender face with faint lines at the mouth corners, Chinese papercut art (剪纸) illustration, layered red and black cut-paper silhouettes with intricate pierced patterns on aged rice paper, half-length portrait, restrained calm expression",
      "avatarSpec": {
        "era": "late Qing dynasty (1900) western Hunan",
        "ethnicity": "Chinese (Han)",
        "age": 32,
        "gender": "女",
        "job": "大户人家的寡妇儿媳",
        "dress": "素白孝服、麻布领、紧髻乌木簪（tight bun hair, mourning robe）",
        "style": "剪纸 papercut illustration"
      },
      "script": {
        "background": "你是辰州城里绸缎铺蓉家的女儿，十八岁嫁进甄家寨，做了甄家大少爷甄少安的媳妇。成亲那天你坐着八抬大轿走了两天山路，掀开盖头，看见甄少安咳得满脸通红，冲你歉意地笑。他是个读书人，身子弱，待你极好，夜里会给你念诗。\n\n你们成亲第九年，甄少安的痨病重了，咳出的血染红了半条手帕。临走那晚他攥着你的手说，甄家不是好地方，等他走了，你就回辰州去。你答应了他。可他出殡第二天，老太爷甄德厚就叫人把你的嫁妆箱子锁进了库房，说甄家的媳妇要守节，甄家要给你请贞节牌坊。\n\n你在后院的厢房里守了五年。白天替甄家抄经，夜里对着少安的牌位做针线。头两年老太爷还算规矩，后来他喝了酒就爱往后院走，站在你的窗外咳嗽，有一回推门进来，被你拿剪刀逼了出去。从那以后，你夜里睡觉都在枕下压着那把剪刀。\n\n甄家的人你看得清楚。管家大有余是老太爷的一条狗，你的嫁妆箱子就是他锁的，钥匙也在他手里；鬼三娘这回张罗冥婚，前前后后来了好几趟，看人的眼神像在称斤两；撒半仙是老太爷请来的，嘴上说的全是吉利话，你不信他。\n\n后院的丫鬟戚小蛾心眼好，常偷偷给你送热水。四月初九春妮出事后，小蛾哭了好几夜，你去问她，她只说怕，什么也不肯讲。你记得那几天老太爷的一件黑缎马褂送去浆洗，掉了一颗铜纽扣，大有余满院子找了半天。\n\n前些日子你托辰州来的货郎给娘家捎了一封信，娘家回信说，只要你能出甄家寨，就派船在沅水码头接你。你把一点碎银子和几件衣裳包进包袱，藏在床底下，只等一个机会。\n\n老太爷有一只铜手炉，一年四季不离手，夏天也揣着，说是暖胃。你见过他拿那只手炉砸过下人的头，砸完了还慢悠悠地吹一吹炉口的灰。你那时就想，这东西沉得很。\n\n你嫁进甄家第二年，少安带你去后院井台打过一回水，说那口井是甄家祖上挖的，井水甜。春妮出事后，那口井被撒半仙贴了符，你再没去过。可你常在夜里听见戚小蛾从你窗下走过，往井台那边去，第二天一早，井边总有一小堆纸灰。\n\n少安生前最爱读的一本诗集，你一直压在枕下。书里夹着他写给你的一张字条，只有八个字：此身虽死，愿卿得归。你读了五年，每读一回，就在心里对他说一遍，再等等。\n\n你知道老太爷请来扎纸活的刘巧手就是春妮的爹，是戚小蛾告诉你的。你在作坊门口远远见过他一回，他蹲在门槛上给一个纸童开脸，一笔一笔，画得很慢。",
        "tonight": "20:30 喜宴上老太爷当着众人说，冥婚办完了，你就搬进正院，伺候他的起居，省得一个人在后院冷清。满桌人都不吭声，你放下筷子，指甲掐进了手心。你想起少安临走那句话，心里像压了一块冰。\n21:00 你从正厅出来，站在廊下，看见撒半仙在灵堂门口跟老太爷交代守灵的规矩，老太爷揣着手炉进了灵堂，门在他身后关上。你想着他今晚一个人守在里头，心里拿不定主意。\n21:40 你回到厢房，从床底下拖出包袱，把碎银子数了一遍。你想，与其被他拖进正院，不如今晚就去灵堂当面求他，求他放你回辰州。求不成，你也不打算再回这间屋子。\n22:00 你推开灵堂的门进去，老太爷坐在太师椅里喝着残酒。你跪下来求他，他眯着眼笑，说你是甄家的人，死了也是。你站起来要走，他一把扯住你的孝服往怀里拽，嘴里一股酒气。你害怕极了，伸手乱抓，抓到了他搁在供桌上的那只铜手炉，抡起来砸在他后脑上。当啷一声，手炉滚到供桌底下，炭灰撒了一地。他往前一扑，趴在供桌边不动了，脑后的头发里慢慢渗出血来。你叫了一声老太爷，他没应。你以为他死了，浑身发抖，转身就跑。\n22:05 你从灵堂后面绕过后院，跑过井台的时候，看见戚小蛾蹲在井边烧纸。小蛾抬头看了你一眼，你没停脚，也不敢开口，一路跑回了厢房。\n22:10 你关上门，在脸盆里洗手，盆里的水一下子泛了红。你用帕子使劲搓，搓到手背发红。你看见孝服的袖口上沾着几点黑灰，想脱下来又不敢，怕明天被人问起，只好坐在床沿，一动也不敢动。\n23:30 你睡不着，推开后窗往灵堂那边看。灵堂的后窗糊着白纸，里头烛光一晃，映出一个坐着的人影，戴着瓜皮帽，一动不动。你捂住了嘴，心里又惊又乱：他还活着，还能坐起来。你不知道该松口气，还是该更怕。\n00:00 子时化纸，家里的人都得到院子里去。你低着头站在最后，看着刘巧手把纸童纸马和一个纸管家丢进火里，火光照得每个人脸上都通红。你怕有人看见你的袖口，一直把手缩在袖子里。\n00:12 撒半仙在灵堂里喊出了人命，你跟着跑进去。老太爷坐在太师椅里，头垂在胸前，脸对着喜棺。你明明记得他是趴在供桌边的，现在却好好地坐着。你看见他脑后那块乌青，腿一软扶住了门框，心想是不是他自己爬起来坐回去，又被那一下要了命。",
        "hide": "你在灵堂里用老太爷的铜手炉砸了他的后脑，他趴在供桌边不动，你以为他死了。你回房洗过手，孝服袖口沾着炭灰。你还收拾好了包袱，打算回辰州。",
        "know": "你知道老太爷的铜手炉一年四季不离手；你离开灵堂时他趴在供桌边，手炉滚到了供桌底下；你跑过井台时看见戚小蛾在井边烧纸；你记得四月初九前后，老太爷的黑缎马褂掉了一颗铜纽扣；你在后窗看见灵堂里坐着一个戴瓜皮帽的人影。",
        "mission": "1. 隐瞒你用铜手炉砸过老太爷的事。\n2. 弄清你离开之后，灵堂里还发生了什么。\n3. 想办法拿回你的嫁妆，离开甄家寨。\n4. 在投票中指认你认为的真凶，别让自己成为得票最多的人。"
      }
    },
    {
      "id": "qi",
      "name": "戚小蛾",
      "gender": "女",
      "age": 19,
      "role": "丫鬟",
      "roleKind": "fake",
      "coverage": [
        "motive",
        "secret",
        "action",
        "unique"
      ],
      "avatar": "蛾",
      "color": "#9a4a2a",
      "room": "r_qi",
      "appearance": "十九岁，瘦小，两根粗辫子垂在胸前，脸上还有少女的婴儿肥，手背被灶火燎得一块块发红，见了老爷就缩着肩膀，走路没有声音。",
      "relation": "甄家的丫鬟，在甄家做了五年，管灶房和后院的杂事，晚饭后给守灵的老太爷送了一碗参汤。",
      "publicInfo": "戚小蛾，十九岁，甄家的丫鬟，管灶房的火和老太爷的茶饭，住在后罩房的下人房。",
      "portrait": "portrait of a 19-year-old Chinese girl, late Qing dynasty western Hunan, a household maid servant, two thick braids over the shoulders, youthful round cheeks, faded red cotton jacket with a patched apron, small burn marks on the back of her hands, Chinese papercut art (剪纸) illustration, layered red and black cut-paper silhouettes with intricate pierced patterns on aged rice paper, half-length portrait, restrained calm expression",
      "avatarSpec": {
        "era": "late Qing dynasty (1900) western Hunan",
        "ethnicity": "Chinese (Han)",
        "age": 19,
        "gender": "女",
        "job": "丫鬟",
        "dress": "褪色红布袄、打补丁的围裙、两根粗辫子（braids, cotton jacket）",
        "style": "剪纸 papercut illustration"
      },
      "script": {
        "background": "你是甄家寨后山戚家坳人，家里七个孩子，你排第五。十四岁那年家里交不起租子，爹把你卖进甄家，卖身契写了五年，签字画押的是管家大有余。你记得那天爹蹲在甄家门口抽了半天旱烟，走的时候没回头。\n\n你在甄家管灶房和后院的杂事，天不亮起来烧火，夜里最后一个睡。老太爷脾气坏，汤咸了要摔碗，茶凉了要罚跪。你学会了走路不出声，学会了低着头听话，也学会了在后院的井台边一个人偷偷哭。\n\n去年秋天，刘家湾的春妮进了甄家，跟你住一间屋。春妮手巧，会剪窗花，夜里两个人挤在一张床上，她给你讲她爹扎的纸马能驮着人上天。她头上总扎一根红头绳，说是她爹买的，你也扎了一根，两个人像亲姐妹一样。\n\n四月初九那晚下着雨，春妮被叫去正院给老太爷送夜宵，一直没回来。你半夜起来解手，在后院看见一个人影从井台那边往正院走，提着灯笼，是老太爷，衣襟湿了一大片。第二天一早，春妮被人从井里捞了上来。大有余给了你一吊钱，叫你别乱说话。你把那吊钱扔进了井里。\n\n那之后，撒半仙来后院做了一场法事，在井口贴了一道黄符，说井里有女鬼，谁也不许再去打水。你偏要去，每月初九夜里都去井边给春妮烧纸，你不怕她，你只怕正院里那个人。\n\n前几天你才知道，这回冥婚的新娘就是春妮。鬼三娘拿着春妮的生辰八字跟撒半仙合婚，说八字上上大吉。你在灶房听见她们说话，手里的碗差点掉在地上。纸扎匠刘巧手住进东厢后，你偷偷告诉过他四月初九的事，他听完一个字也没说，只是一直盯着自己的手。\n\n上个月你的卖身契满了五年，你去找大有余要回去，大有余说老太爷发了话，再留你五年，契上的日子已经改了。你知道那意思：你就是下一个春妮。你在灶房的柴堆后面藏了一包老鼠药，那是买来药耗子的，包上写着人误食会腹痛呕吐。你看了它很多个晚上。\n\n后院的蓉翠娥少奶奶待你好，你常给她送热水，她也从不对你大声说话。你知道她也想走，你们谁也不说破。\n\n你在甄家五年，最熟的是灶房。灶房西墙有一扇小门通夹道，夹道另一头是灵堂的侧门，平日里只有你送茶饭才走那条路。灶房的水缸在门边，你每天天不亮就去后院挑满它，从没让它见过底。\n\n鬼三娘来府里那几回，你都给她端过茶。她喝茶的时候眼睛不看人，看屋里的摆设，你觉得她在估价。撒半仙在井口贴符那天，你躲在柴房后头看着，他贴完符，在井栏上看了很久，伸手摸了摸，最后什么也没说就走了。",
        "tonight": "20:30 喜宴上你端菜添酒，跑前跑后。老太爷喝得满脸通红，说春妮命好，死了还能做少奶奶。你端着汤的手一抖，汤洒在了托盘上，赶紧低头退了出去，心里像被针扎了一下。\n20:50 老太爷交代过，守灵前要喝一碗参汤。你在灶房里把参汤盛进白瓷碗，想起春妮被捞上来时的样子，从柴堆后头摸出那包老鼠药，抖了小半包进去，用勺子搅匀。药粉沾了些在你的围裙上，你拍了几下没拍干净。你心里怕得要命，又觉得这是唯一的法子。\n21:10 你端着参汤进了灵堂，老太爷已经坐在太师椅里，揣着手炉。他喝了一口，皱着眉吐回碗里，骂你汤熬苦了，把碗推到一边，叫你滚。你端不走也不敢端，低着头退出来，手心全是汗，不知道那一口够不够。\n22:05 你想着今晚春妮也该有人陪，便揣着一叠纸钱去后院井台，蹲下来烧。火刚点着，就看见蓉翠娥少奶奶从灵堂那边跑过来，头发散了，脸白得吓人，从你身边跑过去，一句话也没说。你愣了一下，心里犯嘀咕，没敢追上去问。\n22:50 大有余叫你去院子里帮着摆纸活，你想着人多些心里不慌，就去了。刘巧手也在，三个人把纸轿、纸马、金山银山一样样摆在化纸池边。\n23:00 你看到大有余去灵堂门口问老太爷添不添炭，没人应。他扒着门缝看了看，回来说老太爷坐着打盹呢。你听了心里一沉：他没事，那碗汤没用。\n23:20 撒半仙提着灯油壶进了灵堂，你盯着那扇门，怕他看见那碗没喝完的汤。过了一会儿他出来了，什么也没说。\n23:50 你听见撒半仙叫刘巧手把灵前的纸童纸马搬出来。刘巧手进去了一阵，扛着一个纸管家、抱着一对纸童出来，鬼三娘也从西厢过来了。你接过纸童，摆在化纸池边，纸童的脸冲着你笑，你不敢看。\n00:00 子时一到，撒半仙念咒，众人往火里丢纸活。你想着春妮，把纸钱一把把撒进火里，心里对春妮说，再等等。\n00:12 撒半仙在灵堂里喊出了人命，你跟着跑进去。老太爷坐在太师椅里，头垂着，嘴角挂着一道白沫似的口涎。你一眼看见供桌上那碗参汤还在，脑子里嗡的一声，以为是那一口药慢慢发作，要了他的命。你腿一软跪在门槛上，又怕又想哭，不知道是为春妮还是为自己。",
        "hide": "你在参汤里下了小半包老鼠药，老太爷喝了一口吐了回去，你以为是那一口药要了他的命。你四月初九夜里看见老太爷从井台回来，衣襟是湿的；你把这件事告诉过刘巧手。",
        "know": "你知道春妮就是冥婚的新娘；四月初九夜里你看见老太爷从井台回来；你在井台边看见蓉翠娥从灵堂方向跑过；你看见大有余在灵堂门口问话、撒半仙进灵堂添灯油、刘巧手从灵堂搬出纸活；老鼠药包上写着人误食会腹痛呕吐。",
        "mission": "1. 隐瞒你在参汤里下了老鼠药的事。\n2. 替春妮讨一个公道，让人知道四月初九那晚的事。\n3. 拿回你的卖身契。\n4. 在投票中指认你认为的真凶。"
      }
    },
    {
      "id": "gui",
      "name": "鬼三娘",
      "gender": "女",
      "age": 58,
      "role": "鬼媒人",
      "roleKind": "fake",
      "coverage": [
        "motive",
        "secret",
        "action",
        "tension"
      ],
      "avatar": "媒",
      "color": "#3d3d3d",
      "room": "r_gui",
      "appearance": "五十八岁，干瘦，满头白发梳得一丝不乱，鬓边插一朵褪色的纸红花，眼角的皱纹像刀刻，一双眼睛却亮得很，笑起来露出一颗金牙。",
      "relation": "给甄家说这门阴亲的鬼媒人，新娘的骨匣是你找来的，甄德厚说好一百两，只付了五十两，晚上还当众翻了脸。",
      "publicInfo": "鬼三娘，五十八岁，湘西一带有名的鬼媒人，专给死人说亲，这回替甄家小少爷说了这门阴亲，住在西厢客房。",
      "portrait": "portrait of a 58-year-old Chinese woman, late Qing dynasty western Hunan, a ghost-marriage matchmaker, neatly combed white hair in a bun with a faded red paper flower, deep-carved wrinkles, a gold tooth, black satin jacket with wide embroidered cuffs, Chinese papercut art (剪纸) illustration, layered red and black cut-paper silhouettes with intricate pierced patterns on aged rice paper, half-length portrait, restrained calm expression",
      "avatarSpec": {
        "era": "late Qing dynasty (1900) western Hunan",
        "ethnicity": "Chinese (Han)",
        "age": 58,
        "gender": "女",
        "job": "鬼媒人",
        "dress": "黑缎宽袖大襟袄、白发圆髻插纸红花（white hair bun, satin jacket）",
        "style": "剪纸 papercut illustration"
      },
      "script": {
        "background": "你本名不叫三娘，年轻时在辰州的戏班里唱旦角，嗓子倒了以后流落到乡下，替人哭丧、说亲，后来专给死人说阴亲。湘西的老规矩，未婚而死的后生不能单葬，要配一门阴亲才进得了祖坟，这门生意你一做就是三十年。人家怕你，背地里叫你鬼三娘，你也就认了这个名字。\n\n说阴亲的规矩是先合八字，再找骨，最后下聘。八字由阴阳先生合，你跟撒半仙打了十几年交道，你出钱，他说吉利话，从没失过手。找骨最难，年纪、八字、死期都要对得上，好骨难求，有时候你也会去打听哪个村新埋了未出阁的姑娘。这些事你记在一个小本子上，本子从不离身。\n\n甄家的小少爷甄少康去年秋天坠马死了，十九岁，没成亲。老太爷甄德厚找到你，说要给小儿子配一门最体面的阴亲，女方要十六岁，要清白，要八字合。你开价一百两，他眼都没眨。你跑了两个月，最后在甄家自己的义庄里找到了一具，十六岁，四月初九落井死的，叫春妮。\n\n这件事你做得不干净。那具骨是你半夜从义庄起出来的，起骨那晚大有余替你开的门，收条上写的是二百两，到你手里只有一百两，另一半进了谁的口袋，你心里清楚。你还在骨边摸到一只银镯，内侧有一朵梅花，你拿去给纸扎匠刘巧手看，叫他照着画在纸新娘手上。他接镯子的时候手抖得厉害，你当时只当他是怕晦气。\n\n冥婚定下以后，老太爷只付了一半，说剩下的五十两等拜完堂再给。你催过两回，他翻脸说起骨的事他全知道，你要是再啰嗦，他就把你偷起义庄尸骨的事报给县衙。你在湘西混了三十年，没被人这样拿捏过。\n\n你也看得出这家里没一个省心的人。大少奶奶蓉翠娥守寡五年，看老太爷的眼神像看仇人；丫鬟戚小蛾听见新娘的名字，碗都端不稳；撒半仙收了你的红包，合婚书上的印盖得比谁都快。\n\n你年轻时在戏班里学过一手扎小人的把戏，戏班的老旦说，写上生辰八字，扎三针，烧成灰，那人就活不过当晚。你从没真用过，只在心里记着。\n\n你走南闯北，见过不少死人，也见过不少活人装死。说阴亲的人不怕死人，怕的是活人翻脸。你在辰州有个干女儿，开着一间杂货铺，你攒下的钱都存在她那里，只等再做几单，就回辰州养老，再不碰这行当。\n\n你这回在甄家住西厢客房，隔壁就是撒半仙的静室。你夜里听得见他抄符时笔尖划纸的声音，也听得见他数铜钱。你知道他手头紧，在沅陵欠了赌债，这样的人，什么都肯写。",
        "tonight": "20:30 喜宴上你提了一句尾款，老太爷当着满桌人冷笑，说起骨的事他全知道，五十两一个子儿也不会给，你要是再提，就送你去县衙。你脸上的笑僵住了，金牙在烛光底下发凉，满桌人都低头吃菜，没人替你说一句话。\n21:50 你回到西厢客房，把那五十两银子倒在桌上数了一遍，又翻开小本子，看着那一行甄家义庄，女，十六。你越想越窝火，心想这老东西要是今晚就死了，县衙就没人去报了。\n22:15 你想再去讨一回尾款，经过喜堂时，顺手在婚书上主婚人一栏抄下了老太爷的生辰八字。你走到灵堂门口，规矩不许进，你隔着门缝叫了两声老太爷，没人应。门缝里看见他趴在供桌边，一动不动，你只当他喝多了打盹，心里骂了一句，扭头回了西厢。\n22:20 你关上门，抽了几根稻草扎成一个小人，把抄来的八字用朱砂写在红纸上，缠在小人身上，再从针线包里抽出三根缝衣针，一根扎头，一根扎心，一根扎后颈。扎的时候你的手竟然有点抖，你暗骂自己老了。\n22:25 你把小人丢进炭盆，看着稻草卷起来，烧成一撮灰，那截红线烧得慢，最后才断。你对着炭盆念了一遍戏班老旦教的词，心里又怕又解气。\n23:40 你在西厢的窗缝里往灵堂望，灵堂门纸上映着一个人影，戴着瓜皮帽，端端正正坐着。你心里一凉：那老东西还活着，什么扎小人，全是戏班里骗人的玩意儿。\n23:50 你想着化纸总得露个面，就走进院子，正碰上刘巧手从灵堂里出来，肩上扛着一个纸管家，怀里抱着一对纸童。那纸管家戴着瓜皮帽，你只扫了一眼，没看清脸，心里还在为那扎小人的事懊恼。\n00:00 子时化纸，你站在化纸池边，看着纸轿、纸马、纸管家一样样烧起来。火光里你想起自己那个稻草小人，觉得自己这把年纪还信这些，可笑得很。\n00:12 撒半仙在灵堂里喊出了人命。你挤进去一看，老太爷坐在太师椅里，头垂着，后颈被衣领遮着。你浑身的汗毛都竖了起来，心里念着：头、心、后颈，三针，真灵了。你扶着门框，后背一阵阵发冷，再也不敢小看戏班老旦的话。",
        "hide": "你扎了一个写着老太爷八字的稻草小人，扎了三针烧掉，你以为是你咒死了他。你从甄家义庄偷起了春妮的骨，收条上的二百两有一半被大有余吞了。你在灵堂门缝里看见过老太爷趴在供桌边。",
        "know": "你知道新娘春妮是四月初九落井死的，骨是从甄家义庄起出来的；你知道骨边那只银镯内侧有一朵梅花；你知道撒半仙收了你的红包才合的八字；你隔着门缝看见老太爷趴在供桌边，后来又看见门纸上映着一个端坐的人影。",
        "mission": "1. 隐瞒你扎小人咒老太爷的事。\n2. 隐瞒你从义庄偷起尸骨的事。\n3. 想办法拿到剩下的五十两尾款。\n4. 在投票中指认你认为的真凶。"
      }
    },
    {
      "id": "sa",
      "name": "撒半仙",
      "gender": "男",
      "age": 50,
      "role": "阴阳先生",
      "roleKind": "suspect",
      "coverage": [
        "secret",
        "action",
        "tension",
        "unique"
      ],
      "avatar": "仙",
      "color": "#5a5a2a",
      "room": "r_sa",
      "appearance": "五十岁，瘦长脸，留着山羊胡，眼睛半睁半闭，穿一件洗得发灰的道袍，腰里挂着罗盘和铜铃，说话拖着长腔，一开口就是阴阳五行。",
      "relation": "甄家请来主持冥婚的阴阳先生，替这门阴亲合了八字、定了守灵的规矩，是唯一能进灵堂添灯油的人，也是第一个发现老太爷出事的人。",
      "publicInfo": "撒半仙，五十岁，湘西一带的阴阳先生，看风水、合八字、做法事，这回主持甄家冥婚，住在西厢静室。",
      "portrait": "portrait of a 50-year-old Chinese man, late Qing dynasty western Hunan, a Taoist geomancer and ritual master, long face with a thin goatee going grey, hair tied in a topknot with a wooden pin, faded grey Taoist robe, a bronze compass hanging at the waist, half-closed eyes, Chinese papercut art (剪纸) illustration, layered red and black cut-paper silhouettes with intricate pierced patterns on aged rice paper, half-length portrait, restrained calm expression",
      "avatarSpec": {
        "era": "late Qing dynasty (1900) western Hunan",
        "ethnicity": "Chinese (Han)",
        "age": 50,
        "gender": "男",
        "job": "阴阳先生",
        "dress": "灰道袍、木簪道髻、山羊胡、腰挂罗盘（topknot hair, Taoist robe）",
        "style": "剪纸 papercut illustration"
      },
      "script": {
        "background": "你本是沅陵一户读书人家的孩子，考了三回秀才都没中，二十五岁拜了一个游方道士做师父，学了看风水、合八字、画符念咒。师父临死前跟你说，这行当七分看人，三分看天，人想听什么，你就说什么。你记了二十五年。\n\n你在湘西走街串巷，靠一张嘴吃饭。大户人家请你看坟地，你挑最贵的那块说是龙脉；穷人家请你驱邪，你画一道符收一吊钱。你和鬼三娘是老相识了，她说阴亲，你合八字，她塞给你的红包有多厚，八字就合得有多好。\n\n甄家是你最大的主顾。甄家的祖坟、宅子的朝向、小少爷甄少康下葬的日子，都是你定的。去年小少爷坠马，老太爷差点砸了你的罗盘，是你说小少爷命里缺一门亲，配上阴亲就能保甄家人丁兴旺，他才消了气。这门阴亲，说起来是你起的头。\n\n四月初九甄家丫鬟春妮落井以后，管家大有余半夜来找你，给了你二两银子，叫你去后院做一场法事，就说井里出了女鬼，谁也不许靠近。你去了，在井口贴了封井符。贴符的时候你看见井栏上缠着一根红头绳，你没多问，回去把那张写坏的符纸夹进了自己的书里。\n\n这回合八字，鬼三娘拿来的新娘八字正是春妮的。你认出来了，手里的笔停了一下。鬼三娘把红包往你袖子里一塞，你就写下了八字相合，上上大吉，盖了印。你对自己说，死人跟死人配，碍不着活人。\n\n冥婚的规矩是你定的：拜过堂，主婚人要独自在灵堂守到子时，中间谁也不许进去，只有你能进去添长明灯的油；子时在院子里化纸，纸活由扎纸的人从灵前搬出来；化完纸再请主婚人出来送棺。这些规矩一半是老辈传下来的，一半是你编的，为的是显得郑重。\n\n你近来手头紧，在沅陵赌坊欠了三十两。甄家灵前的聘礼盘里摆着四锭金元宝，是给新娘的聘礼，要跟着骨匣一起下葬。你在拜堂的时候多看了好几眼，心想埋进土里，谁也不知道少没少。\n\n甄家的人你都打过交道。纸扎匠刘巧手手艺好，话少；丫鬟戚小蛾每月初九偷偷去井边烧纸，你知道，没管；大少奶奶蓉翠娥从不正眼看你。\n\n你住的静室在西厢，窗子斜对着灵堂的侧门夹道。前几夜你睡不着，常看见纸扎匠的作坊里灯亮到很晚，窗纸上映着他弯腰扎篾的影子。你这一行讲究夜里不往暗处看，可你偏偏总忍不住多看两眼。\n\n你最怕的是县衙。你替人看风水二十多年，说错的地方不知道有多少，真要有人去县衙告你一状，你这块招牌就砸了。所以你一向只说吉利话，只收现银，从不留字据。",
        "tonight": "20:30 喜宴上你坐在上首，知道老太爷爱听什么，替他说了一大串吉利话。你看见老太爷当众给鬼三娘难堪，又看见戚小蛾洒了汤，心里明白这一桌没一个人是真高兴，脸上还是笑着举杯。\n21:00 你送老太爷到灵堂门口，按规矩交代：子时以前独自守灵，谁来都不许开门，只有你会进来添灯油。老太爷揣着手炉点点头，进去把门关上了。你回头时看见蓉翠娥站在廊下，眼神冷冷的。\n22:00 你在西厢静室里抄符，忽然听见灵堂那边当啷一声，像铜器掉在了地上，接着一阵乱响，又没了声。你搁下笔听了一会儿，想是老太爷碰翻了什么，规矩是你定的，你不好去敲门，便没理会。\n22:30 你正要吹灯，又听见灵堂侧门吱呀响了一声。你从窗缝往外看，夹道里黑漆漆的，只觉得有个影子一晃，看不清是人是什么。你心里发毛，告诉自己是风，缩回了床上。\n23:20 到了添灯油的时辰，你提着油壶推开灵堂正门。太师椅背对着门，椅子里的人戴着瓜皮帽，一动不动，你轻声叫了句老太爷，没应，想是睡着了，你怕吵醒他挨骂，没绕到前面去看。你给长明灯添了油，眼睛却落在聘礼盘上，四锭金元宝摆得整整齐齐。你心跳得厉害，伸手拿了一锭揣进怀里，退出来时腿都是软的。\n23:50 你怕误了时辰，回到院子里，吩咐刘巧手把灵前的纸童纸马搬出来，好赶在子时化纸。刘巧手进去一阵，扛着纸管家、抱着纸童出来了，鬼三娘也从西厢过来。你怀里那锭金子硌得慌，一直不敢挺直腰。\n00:00 子时一到，你摇铃念咒，叫众人往化纸池里丢纸活。火光冲起来，你念得比平时快，只想早点把这一套走完。\n00:10 化完纸，按规矩要请老太爷出来送棺。你推开灵堂门，太师椅里的人坐着没动。你走到前面，提灯一照，老太爷头垂在胸前，脸色青灰，嘴角挂着口涎，脑后一个乌青的包，头发里结着血痂。你伸手探他鼻息，冰凉，一点气也没有。你心里一阵发毛，吓得灯都差点掉了，第一个念头竟是怀里那锭金子，你想着这下要被人搜身了，浑身直冒冷汗。\n00:12 你跑到门口喊出人命，众人一窝蜂挤进来。你站在长明灯旁边，看着那个空了一个位置的聘礼盘，又看了看刚才自己背对着的那把太师椅，越想越怕：自己二十三点二十分进来时，椅子里坐着的到底是不是他。",
        "hide": "你在添灯油的时候偷拿了聘礼盘里的一锭金元宝，藏在褡裢里；你进灵堂时没看清椅子里那人的脸；你收了鬼三娘的红包，明知新娘是春妮还写了上上大吉；四月初九你替大有余封了后院的井。",
        "know": "你知道守灵的规矩是你定的，只有你能进灵堂添灯油；你听见过灵堂里当啷一声铜器落地，后来又听见侧门吱呀一声；你进灵堂时椅子里的人戴着瓜皮帽背对着门；封井时你看见井栏上缠着一根红头绳。",
        "mission": "1. 藏好那锭金元宝，别被人搜出来。\n2. 隐瞒你收红包合八字、替人封井的事。\n3. 弄清你进灵堂时，椅子里坐的到底是谁。\n4. 在投票中指认你认为的真凶。"
      }
    },
    {
      "id": "da",
      "name": "大有余",
      "gender": "男",
      "age": 45,
      "role": "大管家",
      "roleKind": "suspect",
      "coverage": [
        "motive",
        "secret",
        "action",
        "tension"
      ],
      "avatar": "余",
      "color": "#2f4f4f",
      "room": "r_da",
      "appearance": "四十五岁，膀大腰圆，红脸膛，留着两撇八字胡，腰里挂着一大串钥匙，走起路来叮当响，见了老太爷弯腰，见了下人瞪眼。",
      "relation": "甄家的大管家，跟了甄德厚二十年，替他管田租、管账、管所有见不得光的事，喜宴上被告知明天要清点冥婚的账。",
      "publicInfo": "大有余，四十五岁，甄家大管家，管田租、银钱和全府的钥匙，住在前院的账房。",
      "portrait": "portrait of a 45-year-old Chinese man, late Qing dynasty western Hunan, a burly head steward of a rich family, ruddy broad face with a drooping moustache, short hair with a queue under a black skullcap, dark brown silk jacket with a large ring of iron keys at the belt, deep lines between the brows, Chinese papercut art (剪纸) illustration, layered red and black cut-paper silhouettes with intricate pierced patterns on aged rice paper, half-length portrait, restrained calm expression",
      "avatarSpec": {
        "era": "late Qing dynasty (1900) western Hunan",
        "ethnicity": "Chinese (Han)",
        "age": 45,
        "gender": "男",
        "job": "大管家",
        "dress": "褐色绸短褂、黑瓜皮小帽、辫子、八字胡、腰挂钥匙串（skullcap, queue hair, silk jacket）",
        "style": "剪纸 papercut illustration"
      },
      "script": {
        "background": "你是甄家佃户的儿子，十五岁进府当跑腿，二十五岁当上管家。你靠的是两样本事：账算得清，嘴闭得紧。老太爷甄德厚说过，甄家的钥匙只能挂在两个人身上，一个是他，一个是你。你腰里那串钥匙，库房、义庄、后院、账房，一把不少。\n\n二十年里你替老太爷办过很多事。佃户交不上租，是你带人去拆的屋；大少奶奶蓉翠娥的嫁妆箱子，是你锁进库房的；四月初九那晚丫鬟春妮落井，是你半夜叫人捞的尸，给了戚小蛾一吊钱叫她闭嘴，又给了撒半仙二两银子去封井。那晚老太爷回到正院，脱下一件湿透的黑缎马褂交给你，叫你拿去浆洗，你洗的时候发现前襟少了一颗铜纽扣。\n\n春妮是你从刘家湾招进府的。她爹刘巧手送她到寨门口，你记得那个驼背的纸扎匠冲你作了个揖，说孩子小，劳管家多照看。春妮出事后，甄家给了刘巧手五两银子，是你亲手递过去的，他没接，银子落在了地上。这回冥婚的纸活请的又是他，是老太爷点的名，你劝过一句，被骂了回来。\n\n冥婚的事是老太爷交代给你和鬼三娘办的。鬼三娘找骨，找来找去，找到了甄家自己的义庄。那天夜里是你替她开的义庄门，起骨的时候你站在门外，一直没往里看。事后鬼三娘开了张收条，写明收银一百两；你在账上记的却是二百两，多出来的一百两进了你自己的钱匣。\n\n你吞这一百两，是因为你在寨子外头养着一房外室，孩子刚满周岁，老太爷要是知道了，你这管家就当到头了。你算过，冥婚的账除了老太爷没人会看，而老太爷从不细看。\n\n你也知道府里人人都怕老太爷，也人人都恨他。戚小蛾的卖身契是你奉命改的，多改了五年；鬼三娘的尾款是老太爷不让给的；蓉翠娥要被叫进正院伺候，也是你去传的话。你常对自己说，管家只是一把刀，握刀的不是你。\n\n这些年你学会了一件事：老太爷守灵、念经、发脾气的时候，谁也别去惹。他揣着那只铜手炉坐着不动，就是在打盹，叫他也不会应。\n\n你管着全府的钥匙，也管着府里的柴米油盐。冥婚这几天，纸扎铺的竹篾、白纸、颜料，都是你从寨子里赊来的，账也记在你那里。刘巧手要的东西不多，只是篾针要得比往常长，你问过一句，他说纸管家个子高，要撑得住。\n\n灵堂里那两口棺材，一口是小少爷甄少康的，一口是给新娘骨匣备的喜棺，都是你去辰州订的。喜棺放在供桌后头的白幔里，幔子后面那块地方，平日没人去扫，积着一层灰，墙角还结着蛛网。",
        "tonight": "20:30 喜宴上你照规矩站在老太爷身后伺候。老太爷忽然说，明天一早把冥婚的账拿来，他要一笔一笔对。你想到那笔二百两，应了声是，后背一下子出了汗，心里盘算着那张二百两的账怎么圆过去。\n21:20 你回到账房，越想越怕，怕鬼三娘那张写着一百两的收条哪天被翻出来，便从钱匣里取出收条，划了根火柴在火盆里烧了。烧剩一个角，你用脚碾了碾，又翻开账本，把骨匣那一笔的墨描了一遍，让二百两看上去更像原样。\n22:50 你想着子时化纸不能出岔子，叫上戚小蛾去院子里摆纸活，刘巧手也过来搭手。三个人把纸轿、纸马、金山银山摆在化纸池边，你一边指挥一边心不在焉。\n23:00 你想起老太爷怕冷，便走到灵堂门口问添不添炭。没人应。你扒着门缝看了一眼，太师椅背冲着门，椅子里的人戴着瓜皮帽，坐得端端正正，一动不动。你知道他揣着手炉不动就是在打盹，没敢再叫，回到院子里说老太爷睡着了。\n23:20 撒半仙提着灯油壶进了灵堂。你在院子里盯着那扇门，心想他添个油怎么这么久，过了一会儿他出来了，脸色有点白。\n23:50 你看到刘巧手奉撒半仙的话进灵堂搬纸活，扛着一个纸管家、抱着一对纸童出来，鬼三娘也从西厢过来了。你帮着把纸童接过来，看都没看那纸管家一眼，心里只惦记着明天的账。\n00:00 子时一到，你带头往化纸池里丢纸钱，火光冲得老高。你望着那一池火，心想账本要是也能这样烧了就好了。\n00:12 撒半仙在灵堂里喊出人命，你第一个冲进去。老太爷坐在太师椅里，头垂着，脸色青灰。你下意识先摸腰里的钥匙，又去看老太爷那件黑缎马褂，马褂后背皱巴巴的，沾着一片灰，下摆挂着一缕蛛网。你心里咯噔一下：老太爷最爱干净，这灰是从哪里蹭来的。可你没敢说，怕一开口，人家就问起你的账。",
        "hide": "你在冥婚的账上多记了一百两，吞进了自己的钱匣，今晚烧了鬼三娘那张写明一百两的收条；四月初九你替老太爷捞尸、封口、请人封井，还洗过他那件掉了一颗铜纽扣的湿马褂；你把戚小蛾的卖身契多改了五年。",
        "know": "你知道老太爷揣着手炉坐着不动就是在打盹；你在二十三点从门缝看见太师椅里戴瓜皮帽的人背对着门；你知道四月初九那晚老太爷的黑缎马褂湿透了，掉了一颗铜纽扣；你知道春妮是刘巧手的女儿，刘巧手没接那五两银子。",
        "mission": "1. 隐瞒你吞了一百两骨钱、烧了收条的事。\n2. 隐瞒四月初九你替老太爷做过的事。\n3. 弄清老太爷的马褂后背为什么会沾灰。\n4. 在投票中指认你认为的真凶。"
      }
    }
  ],
  "locations": [
    {
      "id": "r_liu",
      "phase": "search1",
      "owner": "liu",
      "name": "纸扎作坊-刘巧手",
      "desc": "东厢的作坊，满屋纸人纸马，墙上挂着一排篾针，后门通侧边的夹道。",
      "img": "Chinese papercut art (剪纸) illustration, layered red and black cut-paper silhouettes with intricate pierced patterns on aged rice paper, late Qing dynasty western Hunan courtyard house, rainy night of the ghost festival eve, empty scene, no people, a paper effigy workshop, rows of paper figures and paper horses, bundles of bamboo strips, a wall rack of long bamboo needles, a work table with ink and white pigment dishes"
    },
    {
      "id": "r_rong",
      "phase": "search1",
      "owner": "rong",
      "name": "蓉翠娥的厢房",
      "desc": "后院的厢房，屋里素净，供着亡夫甄少安的牌位，后窗望得见灵堂的后窗。",
      "img": "Chinese papercut art (剪纸) illustration, layered red and black cut-paper silhouettes with intricate pierced patterns on aged rice paper, late Qing dynasty western Hunan courtyard house, rainy night of the ghost festival eve, empty scene, no people, a widow's plain bedroom, a small memorial tablet with a white candle, a washbasin on a stand, an embroidery frame, a back window with paper lattice"
    },
    {
      "id": "r_qi",
      "phase": "search1",
      "owner": "qi",
      "name": "戚小蛾的下人房",
      "desc": "后罩房最边上的一间下人房，两张窄床，墙上贴着剪纸窗花。",
      "img": "Chinese papercut art (剪纸) illustration, layered red and black cut-paper silhouettes with intricate pierced patterns on aged rice paper, late Qing dynasty western Hunan courtyard house, rainy night of the ghost festival eve, empty scene, no people, a tiny servant room with two narrow plank beds, paper-cut window flowers on the wall, a sewing basket, a little wooden chest"
    },
    {
      "id": "r_gui",
      "phase": "search1",
      "owner": "gui",
      "name": "鬼三娘的客房",
      "desc": "西厢的客房，桌上摆着一只炭盆，窗缝正对着院子和灵堂。",
      "img": "Chinese papercut art (剪纸) illustration, layered red and black cut-paper silhouettes with intricate pierced patterns on aged rice paper, late Qing dynasty western Hunan courtyard house, rainy night of the ghost festival eve, empty scene, no people, a guest room in the west wing, a brazier of charcoal on the floor, a table with silver ingots and a small notebook, a red paper flower, a window facing the courtyard"
    },
    {
      "id": "r_sa",
      "phase": "search1",
      "owner": "sa",
      "name": "撒半仙的静室",
      "desc": "西厢的静室，挂着八卦图，案上摆着罗盘、桃木剑和一叠黄符。",
      "img": "Chinese papercut art (剪纸) illustration, layered red and black cut-paper silhouettes with intricate pierced patterns on aged rice paper, late Qing dynasty western Hunan courtyard house, rainy night of the ghost festival eve, empty scene, no people, a Taoist geomancer's quiet room, a bagua diagram on the wall, a peachwood sword, a bronze compass and yellow talismans on a desk, a lamp oil pot, a cloth saddlebag"
    },
    {
      "id": "r_da",
      "phase": "search1",
      "owner": "da",
      "name": "账房-大有余",
      "desc": "前院倒座房的账房，柜子上锁，门后挂满了钥匙，地上一只火盆。",
      "img": "Chinese papercut art (剪纸) illustration, layered red and black cut-paper silhouettes with intricate pierced patterns on aged rice paper, late Qing dynasty western Hunan courtyard house, rainy night of the ghost festival eve, empty scene, no people, a steward's counting room, locked cabinets, an abacus and ledgers on a desk, a brass money box, a small fire basin, rows of iron keys hanging behind the door"
    },
    {
      "id": "lingtang",
      "phase": "search2",
      "owner": null,
      "name": "灵堂",
      "desc": "正房改成的灵堂，两口棺材停在供桌后的白幔里，太师椅摆在供桌前面朝棺材；正门对院子，侧门通东边夹道。",
      "img": "Chinese papercut art (剪纸) illustration, layered red and black cut-paper silhouettes with intricate pierced patterns on aged rice paper, late Qing dynasty western Hunan courtyard house, rainy night of the ghost festival eve, empty scene, no people, a mourning hall for a ghost wedding, a carved armchair facing an altar table with white candles, a memorial tablet and a red bone casket, a white funeral curtain behind the altar hiding two coffins, a long-burning oil lamp"
    },
    {
      "id": "yard",
      "phase": "search2",
      "owner": null,
      "name": "院子",
      "desc": "甄家正院的院子，正中砌着化纸池，四面是正房、东西厢和倒座房。",
      "img": "Chinese papercut art (剪纸) illustration, layered red and black cut-paper silhouettes with intricate pierced patterns on aged rice paper, late Qing dynasty western Hunan courtyard house, rainy night of the ghost festival eve, empty scene, no people, a traditional courtyard at night, a stone burning pit full of glowing ash in the centre, paper sedan chair and paper horses beside it, the paper-windowed door of the main hall lit by candles"
    },
    {
      "id": "hall",
      "phase": "search2",
      "owner": null,
      "name": "喜堂",
      "desc": "前院的正厅，今晚布成红白两色的喜堂，摆过拜堂和喜宴。",
      "img": "Chinese papercut art (剪纸) illustration, layered red and black cut-paper silhouettes with intricate pierced patterns on aged rice paper, late Qing dynasty western Hunan courtyard house, rainy night of the ghost festival eve, empty scene, no people, a hall decorated for a ghost wedding in red and white, a banquet table with leftover dishes, a memorial tablet beside a red-draped bone casket, a marriage contract on the altar, paper lanterns"
    },
    {
      "id": "kitchen",
      "phase": "search2",
      "owner": null,
      "name": "灶房",
      "desc": "东厢南头的灶房，一口大灶、一口水缸，西墙一扇小门通夹道，东边的后门顺着墙外小路通后院井台。",
      "img": "Chinese papercut art (剪纸) illustration, layered red and black cut-paper silhouettes with intricate pierced patterns on aged rice paper, late Qing dynasty western Hunan courtyard house, rainy night of the ghost festival eve, empty scene, no people, an old rural kitchen, a big brick stove with an iron wok, a large water vat by a small side door, a woodpile, a ginseng soup pot, a muddy back door threshold"
    },
    {
      "id": "well",
      "phase": "search2",
      "owner": null,
      "name": "后院井台",
      "desc": "后院的一口老井，井口贴着黄符，四周是泥地。",
      "img": "Chinese papercut art (剪纸) illustration, layered red and black cut-paper silhouettes with intricate pierced patterns on aged rice paper, late Qing dynasty western Hunan courtyard house, rainy night of the ghost festival eve, empty scene, no people, an old stone well in a muddy back yard at night, a yellow talisman pasted on the well rim, a wooden bucket, a small pile of burnt paper money, rain puddles"
    }
  ],
  "clues": [
    {
      "id": "zr_ling_1",
      "location": "lingtang",
      "depth": 0,
      "private": false,
      "title": "太师椅里的甄德厚",
      "text": "甄德厚坐在太师椅里，脸朝着供桌后的棺材，头垂到胸前，双手搭在膝上。脸色青灰，嘴角挂着一道干了的口涎，左颊一颗黑痣。脑后鼓起一个乌青的包，头发里结着血痂；拨开衣领，后颈发际下有一个针眼大小的圆孔，孔边一圈发黑，衣领内侧沾着一小块血渍。黑缎马褂的后背皱巴巴的，沾着一片灰，下摆挂着一缕蛛网。",
      "source": "00:10|撒半仙",
      "mention": "脑后一个乌青的包",
      "corpse": true
    },
    {
      "id": "zr_ling_2",
      "location": "lingtang",
      "depth": 0,
      "private": false,
      "title": "供桌底下的铜手炉",
      "text": "供桌底下滚着一只铜手炉，炉盖开着，炉身侧面瘪进去一块，瘪处沾着几根花白头发；炉里的炭灰撒了一地，灰上有半个女人绣鞋的鞋尖印。",
      "source": "22:00|蓉翠娥",
      "mention": "铜手炉"
    },
    {
      "id": "zr_ling_3",
      "location": "lingtang",
      "depth": 1,
      "private": false,
      "title": "供桌上的参汤碗",
      "text": "供桌一角推着一只白瓷参汤碗，汤几乎是满的，表面浮着一层油花，碗底沉着一层白色细粉；碗沿外侧挂着一道吐回去的汤渍，桌面上也溅了几滴。",
      "source": "21:10|戚小蛾",
      "mention": "参汤"
    },
    {
      "id": "zr_ling_4",
      "location": "lingtang",
      "depth": 1,
      "private": true,
      "title": "白幔后面",
      "text": "供桌后的白幔下摆沾着灰。掀开白幔，两口棺材之间的地上积着厚灰，灰里有一大片被蹭乱的印子，从幔口一直拖到喜棺旁边，墙角的蛛网破了一块。",
      "source": "22:35|刘巧手",
      "mention": "供桌后面的白幔里"
    },
    {
      "id": "zr_ling_5",
      "location": "lingtang",
      "depth": 2,
      "private": true,
      "title": "挪过的白烛与聘礼盘",
      "text": "两支白烛立在太师椅正前方的左右两边，供桌两头的桌面上各有一圈烛油的旧印，印子里没有烛台。供桌正中的聘礼盘里摆着三锭金元宝，盘底的红绒上压着四个圆坑，其中一个空着。",
      "source": "22:35|刘巧手",
      "mention": "两支白烛"
    },
    {
      "id": "zr_yard_1",
      "location": "yard",
      "depth": 0,
      "private": false,
      "title": "化纸池里的灰",
      "text": "化纸池里的灰堆还冒着烟，纸轿和纸马的竹骨架烧成了一堆细黑篾，几张没烧尽的纸钱被雨水打湿，贴在池沿上。",
      "source": "00:00|刘巧手",
      "mention": "化纸池"
    },
    {
      "id": "zr_yard_2",
      "location": "yard",
      "depth": 0,
      "private": false,
      "title": "从院子里看灵堂",
      "text": "站在院子正中望向灵堂，灵堂正门糊着白纸；门里点着蜡烛时，太师椅背对着门，门纸上只映得出椅背上方一个戴瓜皮帽的后脑和两肩的影子。",
      "source": "23:00|大有余",
      "mention": "坐得端端正正"
    },
    {
      "id": "zr_yard_3",
      "location": "yard",
      "depth": 1,
      "private": false,
      "title": "灰里的半张纸脸",
      "text": "化纸池边缘的灰里压着半张没烧尽的纸脸，纸上用墨画着花白的胡子，左颊点着一颗黑痣，眉眼的画法和作坊里的纸童一个路数。",
      "source": "00:00|刘巧手",
      "mention": "那张画着黑痣的纸脸"
    },
    {
      "id": "zr_yard_4",
      "location": "yard",
      "depth": 2,
      "private": true,
      "title": "灰底的粗篾与铜扣",
      "text": "把灰拨到底，有一根烧黑的竹篾，比纸轿的篾粗一倍，一尺来长，一头削得尖细，尖头那一寸颜色发暗发硬。旁边一堆马形骨架的灰里，埋着一枚烧黑的铜纽扣和一小片没烧透的蓝布。",
      "source": "00:00|刘巧手",
      "mention": "肚子里塞着围裙的纸马"
    },
    {
      "id": "zr_hall_1",
      "location": "hall",
      "depth": 0,
      "private": false,
      "title": "喜堂上的牌位与婚书",
      "text": "喜堂正中并排摆着一块牌位和一只红布裹着的骨匣，牌位写着甄门少康之灵。供桌上铺着婚书：新郎甄少康，十九岁，去年秋坠马而亡；新娘春妮，十六岁；主婚人甄德厚；合婚人撒半仙，批语八字相合，上上大吉。",
      "source": "20:30|撒半仙",
      "mention": "上上大吉"
    },
    {
      "id": "zr_hall_2",
      "location": "hall",
      "depth": 0,
      "private": false,
      "title": "喜宴的残席",
      "text": "喜宴桌上杯盘狼藉，主位前一只酒杯倒着；下首一个座位前的筷子整整齐齐放着，碗里的菜一口没动；末席的托盘边洒着一滩汤。",
      "source": "20:30|蓉翠娥",
      "mention": "放下了筷子"
    },
    {
      "id": "zr_hall_3",
      "location": "hall",
      "depth": 1,
      "private": true,
      "title": "婚书上的朱砂指印",
      "text": "婚书主婚人甄德厚那一栏旁边，挨着他的生辰八字，有一个淡淡的手指印，指印上沾着朱砂和一点炭灰。",
      "source": "22:15|鬼三娘",
      "mention": "抄下了老太爷的生辰八字"
    },
    {
      "id": "zr_hall_4",
      "location": "hall",
      "depth": 2,
      "private": true,
      "title": "骨匣上的银镯",
      "text": "骨匣的红绳上系着一只银镯，镯身磨得发亮，内侧錾着一朵小梅花，梅花旁边一个春字，錾工细密。",
      "source": "20:30|刘巧手",
      "mention": "骨匣上系着的那只银镯"
    },
    {
      "id": "zr_kit_1",
      "location": "kitchen",
      "depth": 0,
      "private": false,
      "title": "灶上的参汤锅",
      "text": "灶上的砂锅里还剩小半锅参汤，汤面结了一层油皮；锅边的汤勺上沾着几粒白色的细粉，没有化开。",
      "source": "20:50|戚小蛾",
      "mention": "参汤盛进白瓷碗"
    },
    {
      "id": "zr_kit_2",
      "location": "kitchen",
      "depth": 0,
      "private": false,
      "title": "通夹道的小门",
      "text": "灶房西墙的小门通着夹道，门闩没插；夹道的泥地上有几串脚印，往北通灵堂侧门，往南通东厢作坊。后门门槛上糊着一层黄泥。",
      "source": "22:40|刘巧手",
      "mention": "绕到灶房"
    },
    {
      "id": "zr_kit_3",
      "location": "kitchen",
      "depth": 1,
      "private": true,
      "title": "柴堆后的纸包",
      "text": "柴堆后面塞着一个纸包，包上印着：灭鼠灵药，人误食半个时辰内腹痛呕吐，勿近饮食。纸包空了小半，折口处沾着白粉。",
      "source": "20:50|戚小蛾",
      "mention": "那包老鼠药"
    },
    {
      "id": "zr_kit_4",
      "location": "kitchen",
      "depth": 2,
      "private": true,
      "title": "水缸边的抹布",
      "text": "水缸沿上搭着一块湿抹布，抹布上有几道淡红的水渍；缸里的水面上浮着一层很淡的红色，舀起来看不出颜色。",
      "source": "22:40|刘巧手",
      "mention": "在水缸边把手洗了三遍"
    },
    {
      "id": "zr_well_1",
      "location": "well",
      "depth": 0,
      "private": false,
      "title": "井边的纸灰与脚印",
      "text": "井台边有一小堆纸钱烧剩的灰，灰旁的泥地上有一双小布鞋蹲过的脚印；另有一串绣花鞋印从灵堂后面的方向跑过来，步子很大，一直通往后院的厢房。",
      "source": "22:05|蓉翠娥",
      "mention": "跑过井台"
    },
    {
      "id": "zr_well_2",
      "location": "well",
      "depth": 0,
      "private": false,
      "title": "井口的黄符",
      "text": "井口压着一道黄符，符纸被雨泡得发软，朱砂字晕开了；井台的石板上用炭写着：四月初九封，勿近。",
      "source": "22:05|戚小蛾",
      "mention": "井边烧纸"
    },
    {
      "id": "zr_well_3",
      "location": "well",
      "depth": 1,
      "private": true,
      "title": "井栏上的红头绳",
      "text": "井栏内侧的石缝里缠着一根褪了色的红头绳，打着死结，绳头被磨得起毛。",
      "source": "22:05|戚小蛾",
      "mention": "红头绳"
    },
    {
      "id": "zr_well_4",
      "location": "well",
      "depth": 2,
      "private": true,
      "title": "石缝里的铜纽扣",
      "text": "井台石板的缝隙里卡着一枚铜纽扣，纽扣上铸着回纹，扣鼻上还挂着一小截黑缎线头。",
      "source": "22:05|戚小蛾",
      "mention": "铜纽扣"
    },
    {
      "id": "zr_liu_1",
      "location": "r_liu",
      "depth": 0,
      "private": false,
      "title": "墙上的篾针",
      "text": "墙上钉着一排竹钉，挂着一尺来长的篾针，尖头朝下，从短到长排着；最长那一头空了一个钉子，钉子下的墙皮上有一道竹屑。",
      "source": "21:30|刘巧手",
      "mention": "最长的一根"
    },
    {
      "id": "zr_liu_2",
      "location": "r_liu",
      "depth": 0,
      "private": false,
      "title": "开脸的颜料碟",
      "text": "工作台上摆着一碟墨、一碟白粉、一碟胭脂，毛笔笔尖上留着墨；地上散落着几片剪下来的纸边，有一片上画着几根花白的胡须。",
      "source": "21:30|刘巧手",
      "mention": "照老太爷的样子"
    },
    {
      "id": "zr_liu_3",
      "location": "r_liu",
      "depth": 1,
      "private": true,
      "title": "门后的钩子",
      "text": "门后钉着两只挂围裙的铁钩，左边那只挂着一条沾满浆糊的蓝布围裙，右边那只空着；空钩下的墙上蹭着一块浅浅的黄泥。",
      "source": "22:40|刘巧手",
      "mention": "蓝布围裙"
    },
    {
      "id": "zr_liu_4",
      "location": "r_liu",
      "depth": 2,
      "private": true,
      "title": "枕下的布包",
      "text": "枕头底下压着一个布包，包里是一张红纸剪的小像，剪的是个扎双髻的女孩，背面写着春妮十六；还有一块蜡模，上面印着一朵小梅花。",
      "source": "20:30|刘巧手",
      "mention": "梅花是她自己画的样子"
    },
    {
      "id": "zr_rong_1",
      "location": "r_rong",
      "depth": 0,
      "private": false,
      "title": "脸盆里的水",
      "text": "脸盆架上的铜盆里有半盆凉水，水色泛着淡红，盆沿搭着一块搓皱了的帕子。",
      "source": "22:10|蓉翠娥",
      "mention": "盆里的水一下子泛了红"
    },
    {
      "id": "zr_rong_2",
      "location": "r_rong",
      "depth": 0,
      "private": false,
      "title": "孝服的袖口",
      "text": "床头搭着一件素白孝服，右手袖口沾着几点黑灰，搓过，没搓掉；领口的一颗盘扣被扯开了。",
      "source": "22:00|蓉翠娥",
      "mention": "扯住你的孝服"
    },
    {
      "id": "zr_rong_3",
      "location": "r_rong",
      "depth": 1,
      "private": true,
      "title": "床底的包袱",
      "text": "床底下藏着一个包袱，里面是几件换洗衣裳、一小包碎银子和一封辰州来的信，信上说只要人能出寨，就派船在沅水码头接。",
      "source": "21:40|蓉翠娥",
      "mention": "包袱"
    },
    {
      "id": "zr_rong_4",
      "location": "r_rong",
      "depth": 2,
      "private": true,
      "title": "枕下的诗集",
      "text": "枕头底下压着一本诗集，扉页写着甄少安三个字；书里夹着一张字条：此身虽死，愿卿得归。",
      "source": "20:30|蓉翠娥",
      "mention": "愿卿得归"
    },
    {
      "id": "zr_qi_1",
      "location": "r_qi",
      "depth": 0,
      "private": false,
      "title": "针线笸箩里的红头绳",
      "text": "床头的针线笸箩里卷着一根红头绳，颜色和样式与寨子货郎卖的一样，绳尾打着一个活结。",
      "source": "22:05|戚小蛾",
      "mention": "红头绳"
    },
    {
      "id": "zr_qi_2",
      "location": "r_qi",
      "depth": 0,
      "private": false,
      "title": "围裙上的白粉",
      "text": "门后挂着一条打补丁的围裙，前襟沾着几处白色细粉，拍过，粉嵌在布纹里。",
      "source": "20:50|戚小蛾",
      "mention": "围裙上"
    },
    {
      "id": "zr_qi_3",
      "location": "r_qi",
      "depth": 1,
      "private": true,
      "title": "床下的纸钱与鞋样",
      "text": "另一张空床底下塞着一叠纸钱和一张剪好的鞋样，鞋样上用炭笔写着春妮的鞋。",
      "source": "22:05|戚小蛾",
      "mention": "揣着一叠纸钱"
    },
    {
      "id": "zr_qi_4",
      "location": "r_qi",
      "depth": 2,
      "private": true,
      "title": "改过的卖身契",
      "text": "枕头下面压着一张卖身契，期限五年一处被墨涂黑，旁边改写成十年，改字的墨色比别处深，落款处是大有余的花押。",
      "source": "20:30|戚小蛾",
      "mention": "再留你五年"
    },
    {
      "id": "zr_gui_1",
      "location": "r_gui",
      "depth": 0,
      "private": false,
      "title": "炭盆里的稻草灰",
      "text": "炭盆里有一撮烧剩的稻草灰，灰里夹着一截没烧透的红线和三根烧黑的缝衣针。",
      "source": "22:25|鬼三娘",
      "mention": "丢进炭盆"
    },
    {
      "id": "zr_gui_2",
      "location": "r_gui",
      "depth": 0,
      "private": false,
      "title": "桌上的银子",
      "text": "桌上摊着五锭十两的银子，压着一张字条：甄府阴亲，议定纹银一百两，先付五十两。",
      "source": "21:50|鬼三娘",
      "mention": "五十两银子"
    },
    {
      "id": "zr_gui_3",
      "location": "r_gui",
      "depth": 1,
      "private": true,
      "title": "针线包与桌面",
      "text": "针线包里的缝衣针少了三根；桌面上有一块朱砂写过字又用袖子擦掉的红印，旁边一小截稻草。",
      "source": "22:20|鬼三娘",
      "mention": "缝衣针"
    },
    {
      "id": "zr_gui_4",
      "location": "r_gui",
      "depth": 2,
      "private": true,
      "title": "贴身的小本子",
      "text": "枕边一个油布包着的小本子，记着几个月来各村新坟的位置和死者年岁，最后一行写着：甄家义庄，女，十六，四月初九，大开门。",
      "source": "21:50|鬼三娘",
      "mention": "甄家义庄，女，十六"
    },
    {
      "id": "zr_sa_1",
      "location": "r_sa",
      "depth": 0,
      "private": false,
      "title": "案上的法器",
      "text": "案上摆着罗盘、桃木剑和一叠黄符，长明灯油壶放在案角，壶里的油下去了一截，壶嘴挂着油滴。",
      "source": "23:20|撒半仙",
      "mention": "提着灯油壶"
    },
    {
      "id": "zr_sa_2",
      "location": "r_sa",
      "depth": 0,
      "private": false,
      "title": "合婚书的底稿",
      "text": "案上压着一张合婚书底稿，写着八字相合，上上大吉；底稿下面是一个空红包，红包背面写着一个鬼字。",
      "source": "20:30|撒半仙",
      "mention": "八字"
    },
    {
      "id": "zr_sa_3",
      "location": "r_sa",
      "depth": 1,
      "private": true,
      "title": "褡裢夹层",
      "text": "墙上挂着的褡裢有一个夹层，里面裹着一锭金元宝，底部錾着甄记两个字，元宝上沾着一点灯油。",
      "source": "23:20|撒半仙",
      "mention": "金元宝"
    },
    {
      "id": "zr_sa_4",
      "location": "r_sa",
      "depth": 2,
      "private": true,
      "title": "书里夹着的废符",
      "text": "一本旧黄历里夹着一张写坏的封井符，背面用小字记着：四月初九夜，后院井，大管家请，银二两，井栏上有红绳。",
      "source": "21:00|撒半仙",
      "mention": "写坏的符纸"
    },
    {
      "id": "zr_da_1",
      "location": "r_da",
      "depth": 0,
      "private": false,
      "title": "冥婚账本",
      "text": "桌上的账本翻在冥婚那一页，骨匣一具，纹银二百两；这一笔的墨色比前后几行深，二字的笔画描过两遍。",
      "source": "21:20|大有余",
      "mention": "描了一遍"
    },
    {
      "id": "zr_da_2",
      "location": "r_da",
      "depth": 0,
      "private": false,
      "title": "火盆里的纸角",
      "text": "地上的火盆里有一撮纸灰，边上剩着一个没烧尽的纸角，能认出收到甄府纹银一百和半个鬼字。",
      "source": "21:20|大有余",
      "mention": "收条"
    },
    {
      "id": "zr_da_3",
      "location": "r_da",
      "depth": 1,
      "private": true,
      "title": "钱匣里的银票",
      "text": "上锁的钱匣里有一张一百两的银票，叠得方方正正，压在几封寨外寄来的信底下，信里写着孩子满周岁了。",
      "source": "21:20|大有余",
      "mention": "钱匣"
    },
    {
      "id": "zr_da_4",
      "location": "r_da",
      "depth": 2,
      "private": true,
      "title": "旧账里的一行",
      "text": "柜子最底层一本旧账，四月那页记着：初九，春妮落井，赏戚小蛾钱一吊，撒半仙封井银二两，马褂浆洗，失铜扣一枚。",
      "source": "20:30|大有余",
      "mention": "铜纽扣"
    }
  ],
  "props": [
    {
      "id": "p_needle",
      "name": "篾针",
      "from": "r_liu",
      "by": "liu",
      "used": "22:30",
      "ends": "yard",
      "clues": [
        "zr_liu_1",
        "zr_ling_1",
        "zr_yard_4"
      ]
    },
    {
      "id": "p_dummy",
      "name": "纸管家",
      "from": "r_liu",
      "by": "liu",
      "used": "22:35",
      "ends": "yard",
      "clues": [
        "zr_liu_2",
        "zr_yard_2",
        "zr_yard_3"
      ]
    },
    {
      "id": "p_apron",
      "name": "蓝布围裙",
      "from": "r_liu",
      "by": "liu",
      "used": "22:40",
      "ends": "yard",
      "clues": [
        "zr_liu_3",
        "zr_kit_4",
        "zr_yard_4"
      ]
    },
    {
      "id": "p_poison",
      "name": "老鼠药",
      "from": "kitchen",
      "by": "qi",
      "used": "20:50",
      "ends": "lingtang",
      "clues": [
        "zr_kit_3",
        "zr_kit_1",
        "zr_ling_3"
      ]
    },
    {
      "id": "p_stove",
      "name": "铜手炉",
      "from": "lingtang",
      "by": "rong",
      "used": "22:00",
      "ends": "lingtang",
      "clues": [
        "zr_ling_2",
        "zr_rong_2"
      ]
    },
    {
      "id": "p_gold",
      "name": "金元宝",
      "from": "lingtang",
      "by": "sa",
      "used": "23:20",
      "ends": "r_sa",
      "clues": [
        "zr_ling_5",
        "zr_sa_3"
      ]
    },
    {
      "id": "p_receipt",
      "name": "收条",
      "from": "r_da",
      "by": "da",
      "used": "21:20",
      "ends": "r_da",
      "clues": [
        "zr_da_2"
      ]
    }
  ],
  "tricks": [
    {
      "id": "t_dummy",
      "name": "纸人替身：照死者开脸的纸管家坐在太师椅里，骗过门外的每一双眼睛",
      "clues": [
        "zr_yard_2",
        "zr_yard_3",
        "zr_ling_4",
        "zr_ling_5",
        "zr_liu_2"
      ],
      "times": [
        "22:35",
        "23:00",
        "23:20",
        "23:50"
      ],
      "difficulty": "★★★★★"
    },
    {
      "id": "t_weapon",
      "name": "凶器消失：篾针插进纸人后背当骨架，子时一同烧掉",
      "clues": [
        "zr_liu_1",
        "zr_ling_1",
        "zr_yard_4",
        "zr_kit_2"
      ],
      "times": [
        "22:30",
        "00:00"
      ],
      "difficulty": "★★★★☆"
    },
    {
      "id": "t_poison",
      "name": "毒源误导：参汤里的老鼠药只被尝了一口",
      "clues": [
        "zr_kit_3",
        "zr_ling_3",
        "zr_kit_1"
      ],
      "times": [
        "20:50",
        "21:10"
      ],
      "difficulty": "★★★★☆"
    },
    {
      "id": "t_blow",
      "name": "多重行凶：脑后的包在先，后颈的孔在后",
      "clues": [
        "zr_ling_1",
        "zr_ling_2",
        "zr_rong_2"
      ],
      "times": [
        "22:00",
        "22:30"
      ],
      "difficulty": "★★★★☆"
    }
  ],
  "depthGate": {
    "0": 0,
    "1": 2,
    "2": 4
  },
  "quiz": [
    {
      "id": "q1",
      "q": "冥婚的新郎甄少康，生前是怎么没的？",
      "options": [
        {
          "key": "A",
          "text": "得痨病咳血而亡"
        },
        {
          "key": "B",
          "text": "坠马而亡"
        },
        {
          "key": "C",
          "text": "落井而亡"
        },
        {
          "key": "D",
          "text": "山洪里被冲走"
        }
      ],
      "answer": "B",
      "clue": "zr_hall_1",
      "explain": "喜堂婚书写明：新郎甄少康，十九岁，去年秋坠马而亡。"
    },
    {
      "id": "q2",
      "q": "骨匣上那只银镯，原本是谁给谁打的？",
      "options": [
        {
          "key": "A",
          "text": "甄德厚给亡妻打的"
        },
        {
          "key": "B",
          "text": "鬼三娘给干女儿打的"
        },
        {
          "key": "C",
          "text": "刘巧手给女儿春妮打的"
        },
        {
          "key": "D",
          "text": "甄少安给蓉翠娥打的"
        }
      ],
      "answer": "C",
      "clue": "zr_liu_4",
      "explain": "银镯内侧錾着梅花和春字；刘巧手枕下有春妮的剪纸小像和印着同一朵梅花的蜡模。"
    },
    {
      "id": "q3",
      "q": "春妮四月初九出事的地方是哪里？",
      "options": [
        {
          "key": "A",
          "text": "甄家义庄"
        },
        {
          "key": "B",
          "text": "后院井台"
        },
        {
          "key": "C",
          "text": "沅水码头"
        },
        {
          "key": "D",
          "text": "刘家湾的河边"
        }
      ],
      "answer": "B",
      "clue": "zr_well_2",
      "explain": "后院井台的石板上写着四月初九封，勿近；撒半仙书里的废符也记着四月初九夜后院井。"
    },
    {
      "id": "q4",
      "q": "鬼三娘和甄家议定的阴亲价钱是多少？",
      "options": [
        {
          "key": "A",
          "text": "五十两"
        },
        {
          "key": "B",
          "text": "一百两"
        },
        {
          "key": "C",
          "text": "二百两"
        },
        {
          "key": "D",
          "text": "四锭金元宝"
        }
      ],
      "answer": "B",
      "clue": "zr_gui_2",
      "explain": "鬼三娘桌上的字条写着议定纹银一百两，先付五十两；账上记的二百两是大有余多记的。"
    },
    {
      "id": "q5",
      "q": "蓉翠娥的丈夫甄少安，临走前给她留下了什么话？",
      "options": [
        {
          "key": "A",
          "text": "守住甄家的家业"
        },
        {
          "key": "B",
          "text": "此身虽死，愿卿得归"
        },
        {
          "key": "C",
          "text": "替他照看小弟甄少康"
        },
        {
          "key": "D",
          "text": "把嫁妆留给甄家"
        }
      ],
      "answer": "B",
      "clue": "zr_rong_4",
      "explain": "蓉翠娥枕下诗集里夹着的字条：此身虽死，愿卿得归。"
    },
    {
      "id": "q6",
      "q": "四月初九那晚，被大有余拿去浆洗的那件黑缎马褂少了什么？",
      "options": [
        {
          "key": "A",
          "text": "一颗铜纽扣"
        },
        {
          "key": "B",
          "text": "一截袖口"
        },
        {
          "key": "C",
          "text": "一只暗袋"
        },
        {
          "key": "D",
          "text": "一条腰带"
        }
      ],
      "answer": "A",
      "clue": "zr_da_4",
      "explain": "大有余的旧账记着马褂浆洗，失铜扣一枚；井台石缝里正卡着一枚挂着黑缎线头的铜纽扣。"
    }
  ],
  "voting": {
    "methods": [
      {
        "id": "m_needle",
        "label": "用磨尖的篾针扎进后颈，再用照死者开脸的纸人坐在椅上拖延发现，子时把纸人和篾针一起烧掉"
      },
      {
        "id": "m_stove",
        "label": "抡起铜手炉砸在后脑"
      },
      {
        "id": "m_poison",
        "label": "在参汤里下老鼠药"
      },
      {
        "id": "m_curse",
        "label": "扎小人写上八字、扎针咒杀"
      }
    ],
    "motives": [
      {
        "id": "n_daughter",
        "label": "为被害落井、又被偷骨配了阴亲的女儿讨命"
      },
      {
        "id": "n_widow",
        "label": "不愿被逼搬进正院伺候"
      },
      {
        "id": "n_debt",
        "label": "被拒付尾款，又被要挟送官"
      },
      {
        "id": "n_contract",
        "label": "怕自己成为下一个落井的丫鬟"
      }
    ]
  },
  "npc": {
    "names": [
      "夜雨敲窗",
      "纸灰飞",
      "寨口老槐",
      "沅水船家",
      "白幔后的风",
      "长明灯",
      "化纸池",
      "铜铃响"
    ],
    "personas": {
      "liu": {
        "bias": {
          "lingtang": 2,
          "kitchen": 2,
          "hall": 2
        },
        "quiz": {
          "q1": "B",
          "q2": "C",
          "q3": "B",
          "q4": "B",
          "q5": "B",
          "q6": "A"
        },
        "suspects": {
          "rong": 3,
          "qi": 3,
          "gui": 2,
          "sa": 2,
          "da": 2
        }
      },
      "rong": {
        "bias": {
          "lingtang": 2,
          "well": 2,
          "r_da": 2
        },
        "quiz": {
          "q1": "B",
          "q2": "A",
          "q3": "B",
          "q4": "B",
          "q5": "B",
          "q6": "A"
        },
        "suspects": {
          "da": 3,
          "sa": 3,
          "gui": 2,
          "qi": 1,
          "liu": 1
        }
      },
      "qi": {
        "bias": {
          "lingtang": 2,
          "r_da": 2,
          "hall": 2
        },
        "quiz": {
          "q1": "B",
          "q2": "C",
          "q3": "B",
          "q4": "B",
          "q5": "A",
          "q6": "A"
        },
        "suspects": {
          "da": 3,
          "rong": 2,
          "gui": 3,
          "sa": 2,
          "liu": 1
        }
      },
      "gui": {
        "bias": {
          "lingtang": 2,
          "r_sa": 2,
          "yard": 2
        },
        "quiz": {
          "q1": "B",
          "q2": "C",
          "q3": "B",
          "q4": "B",
          "q5": "B",
          "q6": "C"
        },
        "suspects": {
          "rong": 3,
          "qi": 3,
          "da": 2,
          "liu": 1,
          "sa": 2
        }
      },
      "sa": {
        "bias": {
          "lingtang": 2,
          "r_gui": 2,
          "kitchen": 2
        },
        "quiz": {
          "q1": "B",
          "q2": "C",
          "q3": "B",
          "q4": "C",
          "q5": "B",
          "q6": "A"
        },
        "suspects": {
          "gui": 3,
          "rong": 3,
          "qi": 2,
          "da": 2,
          "liu": 1
        }
      },
      "da": {
        "bias": {
          "lingtang": 2,
          "r_sa": 2,
          "r_rong": 2
        },
        "quiz": {
          "q1": "A",
          "q2": "C",
          "q3": "B",
          "q4": "B",
          "q5": "B",
          "q6": "A"
        },
        "suspects": {
          "sa": 3,
          "gui": 3,
          "rong": 2,
          "qi": 2,
          "liu": 1
        }
      }
    },
    "clueSuspect": {
      "zr_ling_1": {
        "rong": 2,
        "sa": 2
      },
      "zr_ling_2": {
        "rong": 4
      },
      "zr_ling_3": {
        "qi": 4
      },
      "zr_ling_4": {
        "liu": 2,
        "da": 2
      },
      "zr_ling_5": {
        "sa": 3,
        "liu": 1
      },
      "zr_yard_1": {
        "liu": 1,
        "da": 1
      },
      "zr_yard_2": {
        "da": 2,
        "sa": 2
      },
      "zr_yard_3": {
        "liu": 2,
        "gui": 1
      },
      "zr_yard_4": {
        "liu": 2,
        "gui": 1
      },
      "zr_hall_1": {
        "sa": 2,
        "gui": 2
      },
      "zr_hall_2": {
        "rong": 2,
        "qi": 1
      },
      "zr_hall_3": {
        "gui": 3
      },
      "zr_hall_4": {
        "liu": 2,
        "gui": 2
      },
      "zr_kit_1": {
        "qi": 3
      },
      "zr_kit_2": {
        "liu": 2,
        "qi": 2
      },
      "zr_kit_3": {
        "qi": 4
      },
      "zr_kit_4": {
        "liu": 1,
        "qi": 2
      },
      "zr_well_1": {
        "rong": 2,
        "qi": 2
      },
      "zr_well_2": {
        "sa": 2,
        "qi": 1
      },
      "zr_well_3": {
        "qi": 2,
        "sa": 1
      },
      "zr_well_4": {
        "da": 3
      },
      "zr_liu_1": {
        "liu": 2
      },
      "zr_liu_2": {
        "liu": 2
      },
      "zr_liu_3": {
        "liu": 2
      },
      "zr_liu_4": {
        "liu": 2
      },
      "zr_rong_1": {
        "rong": 3
      },
      "zr_rong_2": {
        "rong": 3
      },
      "zr_rong_3": {
        "rong": 2
      },
      "zr_rong_4": {
        "rong": 1
      },
      "zr_qi_1": {
        "qi": 2
      },
      "zr_qi_2": {
        "qi": 3
      },
      "zr_qi_3": {
        "qi": 2
      },
      "zr_qi_4": {
        "qi": 2,
        "da": 2
      },
      "zr_gui_1": {
        "gui": 3
      },
      "zr_gui_2": {
        "gui": 2
      },
      "zr_gui_3": {
        "gui": 3
      },
      "zr_gui_4": {
        "gui": 2,
        "da": 1
      },
      "zr_sa_1": {
        "sa": 2
      },
      "zr_sa_2": {
        "sa": 2,
        "gui": 1
      },
      "zr_sa_3": {
        "sa": 4
      },
      "zr_sa_4": {
        "sa": 2,
        "da": 2
      },
      "zr_da_1": {
        "da": 3
      },
      "zr_da_2": {
        "da": 3,
        "gui": 1
      },
      "zr_da_3": {
        "da": 2
      },
      "zr_da_4": {
        "da": 3
      }
    }
  },
  "layout": {
    "plan": "甄家大院坐北朝南，是一座两进的院子。前院南面是倒座房的账房，北面是喜堂；穿过喜堂进正院，正中是院子和化纸池，北面正房是灵堂，东厢是纸扎作坊和灶房，西厢是鬼三娘的客房和撒半仙的静室；灵堂东侧有一条夹道连着作坊、灶房和灵堂侧门。正房背后是后院，有井台、蓉翠娥的厢房和后罩房的下人房。",
    "areas": [
      {
        "id": "back",
        "name": "后院",
        "nameEn": "back courtyard",
        "note": "井台、蓉翠娥的厢房与下人房",
        "floor": "一楼"
      },
      {
        "id": "main",
        "name": "正院",
        "nameEn": "main courtyard",
        "note": "灵堂与化纸池",
        "floor": "一楼"
      },
      {
        "id": "east",
        "name": "东厢与夹道",
        "nameEn": "east wing",
        "note": "纸扎作坊与灶房，夹道通灵堂侧门",
        "floor": "一楼"
      },
      {
        "id": "west",
        "name": "西厢",
        "nameEn": "west wing",
        "note": "鬼三娘的客房与撒半仙的静室",
        "floor": "一楼"
      },
      {
        "id": "front",
        "name": "前院",
        "nameEn": "front courtyard",
        "note": "喜堂与账房",
        "floor": "一楼"
      }
    ],
    "slots": {
      "r_rong": {
        "area": "back",
        "row": 1,
        "col": 1
      },
      "well": {
        "area": "back",
        "row": 1,
        "col": 2
      },
      "r_qi": {
        "area": "back",
        "row": 1,
        "col": 3
      },
      "lingtang": {
        "area": "main",
        "row": 1,
        "col": 1
      },
      "yard": {
        "area": "main",
        "row": 1,
        "col": 2
      },
      "r_liu": {
        "area": "east",
        "row": 1,
        "col": 1
      },
      "kitchen": {
        "area": "east",
        "row": 1,
        "col": 2
      },
      "r_gui": {
        "area": "west",
        "row": 1,
        "col": 1
      },
      "r_sa": {
        "area": "west",
        "row": 1,
        "col": 2
      },
      "hall": {
        "area": "front",
        "row": 1,
        "col": 1
      },
      "r_da": {
        "area": "front",
        "row": 1,
        "col": 2
      }
    },
    "svg": "<svg class=\"mappaper hand\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1000 1060\" preserveAspectRatio=\"xMidYMid meet\" role=\"img\" aria-label=\"平面图\">\n<defs><filter id=\"zrRough\" x=\"-2%\" y=\"-2%\" width=\"104%\" height=\"104%\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.022\" numOctaves=\"2\" seed=\"7\" result=\"n\"/><feDisplacementMap in=\"SourceGraphic\" in2=\"n\" scale=\"3.2\"/></filter></defs>\n<g filter=\"url(#zrRough)\" font-family=\"'Noto Serif CJK SC','Songti SC','STSong','SimSun','Source Han Serif SC',serif\">\n<rect x=\"0\" y=\"0\" width=\"1000\" height=\"1060\" fill=\"#f3e9d0\" stroke=\"none\" stroke-width=\"0\"/>\n<text x=\"500\" y=\"46\" font-size=\"32\" fill=\"#2b1f14\" text-anchor=\"middle\" font-weight=\"bold\" letter-spacing=\"6\">甄家大院</text>\n<text x=\"500\" y=\"76\" font-size=\"16\" fill=\"#6b5334\" text-anchor=\"middle\" font-weight=\"normal\" letter-spacing=\"2\">公知平面图 · 坐北朝南 · 两进院落</text>\n<rect x=\"80\" y=\"110\" width=\"840\" height=\"190\" fill=\"none\" stroke=\"#b9a47a\" stroke-width=\"2\" stroke-dasharray=\"8 6\"/>\n<text x=\"88\" y=\"102\" font-size=\"15\" fill=\"#6b5334\" text-anchor=\"start\" font-weight=\"bold\">后院</text>\n<rect x=\"80\" y=\"110\" width=\"840\" height=\"190\" fill=\"#e7dcb4\" stroke=\"none\" stroke-width=\"0\"/>\n<rect x=\"90\" y=\"120\" width=\"230\" height=\"170\" fill=\"#fbf4e0\" stroke=\"none\" stroke-width=\"0\"/>\n<line x1=\"90\" y1=\"120\" x2=\"320\" y2=\"120\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"90\" y1=\"290\" x2=\"175\" y2=\"290\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"245\" y1=\"290\" x2=\"320\" y2=\"290\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"90\" y1=\"120\" x2=\"90\" y2=\"290\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"320\" y1=\"120\" x2=\"320\" y2=\"210\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"320\" y1=\"250\" x2=\"320\" y2=\"290\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"316\" y1=\"210\" x2=\"324\" y2=\"210\" stroke=\"#2b1f14\" stroke-width=\"4\" stroke-linecap=\"round\"/>\n<line x1=\"316\" y1=\"250\" x2=\"324\" y2=\"250\" stroke=\"#2b1f14\" stroke-width=\"4\" stroke-linecap=\"round\"/>\n<line x1=\"320\" y1=\"210\" x2=\"280\" y2=\"210\" stroke=\"#b8321f\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n<path d=\"M 320 250 A 40 40 0 0 1 280 210\" fill=\"none\" stroke=\"#b9a47a\" stroke-width=\"1.6\" stroke-dasharray=\"4 3\"/>\n<line x1=\"175\" y1=\"286.5\" x2=\"245\" y2=\"286.5\" stroke=\"#2b1f14\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<line x1=\"175\" y1=\"293.5\" x2=\"245\" y2=\"293.5\" stroke=\"#2b1f14\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<line x1=\"175\" y1=\"290\" x2=\"245\" y2=\"290\" stroke=\"#6b5334\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<line x1=\"198.1\" y1=\"286.5\" x2=\"198.1\" y2=\"293.5\" stroke=\"#2b1f14\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<line x1=\"221.2\" y1=\"286.5\" x2=\"221.2\" y2=\"293.5\" stroke=\"#2b1f14\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<circle cx=\"112\" cy=\"144\" r=\"14\" fill=\"#f3e9d0\" stroke=\"#b8321f\" stroke-width=\"2.4\"/>\n<text x=\"112\" y=\"150\" font-size=\"17\" fill=\"#b8321f\" text-anchor=\"middle\" font-weight=\"bold\">1</text>\n<text x=\"205\" y=\"212\" font-size=\"17\" fill=\"#2b1f14\" text-anchor=\"middle\" font-weight=\"bold\">蓉翠娥的厢房</text>\n<text x=\"205\" y=\"235\" font-size=\"13\" fill=\"#6b5334\" text-anchor=\"middle\" font-weight=\"normal\">后窗望灵堂后窗</text>\n<rect x=\"262\" y=\"150\" width=\"48\" height=\"70\" fill=\"#f1e4c4\" stroke=\"#6b5334\" stroke-width=\"1.6\"/>\n<rect x=\"268\" y=\"156\" width=\"36\" height=\"16\" fill=\"#fbf4e0\" stroke=\"#6b5334\" stroke-width=\"1.2\"/>\n<circle cx=\"380\" cy=\"140\" r=\"14\" fill=\"#f3e9d0\" stroke=\"#b8321f\" stroke-width=\"2.4\"/>\n<text x=\"380\" y=\"146\" font-size=\"17\" fill=\"#b8321f\" text-anchor=\"middle\" font-weight=\"bold\">3</text>\n<text x=\"500\" y=\"150\" font-size=\"19\" fill=\"#2b1f14\" text-anchor=\"middle\" font-weight=\"bold\">后院井台</text>\n<circle cx=\"500\" cy=\"215\" r=\"34\" fill=\"#d9e2d8\" stroke=\"#2b1f14\" stroke-width=\"3\"/>\n<circle cx=\"500\" cy=\"215\" r=\"20\" fill=\"#b9a47a\" stroke=\"#6b5334\" stroke-width=\"1.5\"/>\n<text x=\"500\" y=\"275\" font-size=\"12\" fill=\"#b8321f\" text-anchor=\"middle\" font-weight=\"normal\">井口贴黄符</text>\n<rect x=\"680\" y=\"120\" width=\"230\" height=\"170\" fill=\"#fbf4e0\" stroke=\"none\" stroke-width=\"0\"/>\n<line x1=\"680\" y1=\"120\" x2=\"910\" y2=\"120\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"680\" y1=\"290\" x2=\"770\" y2=\"290\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"830\" y1=\"290\" x2=\"910\" y2=\"290\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"680\" y1=\"120\" x2=\"680\" y2=\"210\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"680\" y1=\"250\" x2=\"680\" y2=\"290\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"910\" y1=\"120\" x2=\"910\" y2=\"290\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"676\" y1=\"210\" x2=\"684\" y2=\"210\" stroke=\"#2b1f14\" stroke-width=\"4\" stroke-linecap=\"round\"/>\n<line x1=\"676\" y1=\"250\" x2=\"684\" y2=\"250\" stroke=\"#2b1f14\" stroke-width=\"4\" stroke-linecap=\"round\"/>\n<line x1=\"680\" y1=\"210\" x2=\"720\" y2=\"210\" stroke=\"#b8321f\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n<path d=\"M 680 250 A 40 40 0 0 0 720 210\" fill=\"none\" stroke=\"#b9a47a\" stroke-width=\"1.6\" stroke-dasharray=\"4 3\"/>\n<line x1=\"770\" y1=\"286.5\" x2=\"830\" y2=\"286.5\" stroke=\"#2b1f14\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<line x1=\"770\" y1=\"293.5\" x2=\"830\" y2=\"293.5\" stroke=\"#2b1f14\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<line x1=\"770\" y1=\"290\" x2=\"830\" y2=\"290\" stroke=\"#6b5334\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<line x1=\"789.8\" y1=\"286.5\" x2=\"789.8\" y2=\"293.5\" stroke=\"#2b1f14\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<line x1=\"809.6\" y1=\"286.5\" x2=\"809.6\" y2=\"293.5\" stroke=\"#2b1f14\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<circle cx=\"702\" cy=\"144\" r=\"14\" fill=\"#f3e9d0\" stroke=\"#b8321f\" stroke-width=\"2.4\"/>\n<text x=\"702\" y=\"150\" font-size=\"17\" fill=\"#b8321f\" text-anchor=\"middle\" font-weight=\"bold\">2</text>\n<text x=\"795\" y=\"212\" font-size=\"17\" fill=\"#2b1f14\" text-anchor=\"middle\" font-weight=\"bold\">戚小蛾的下人房</text>\n<text x=\"795\" y=\"235\" font-size=\"13\" fill=\"#6b5334\" text-anchor=\"middle\" font-weight=\"normal\">后罩房</text>\n<rect x=\"80\" y=\"320\" width=\"840\" height=\"440\" fill=\"none\" stroke=\"#b9a47a\" stroke-width=\"2\" stroke-dasharray=\"8 6\"/>\n<text x=\"88\" y=\"312\" font-size=\"15\" fill=\"#6b5334\" text-anchor=\"start\" font-weight=\"bold\">正院</text>\n<rect x=\"330\" y=\"330\" width=\"330\" height=\"170\" fill=\"#fbf4e0\" stroke=\"none\" stroke-width=\"0\"/>\n<line x1=\"330\" y1=\"330\" x2=\"440\" y2=\"330\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"550\" y1=\"330\" x2=\"660\" y2=\"330\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"330\" y1=\"500\" x2=\"460\" y2=\"500\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"530\" y1=\"500\" x2=\"660\" y2=\"500\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"330\" y1=\"330\" x2=\"330\" y2=\"500\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"660\" y1=\"330\" x2=\"660\" y2=\"422\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"660\" y1=\"458\" x2=\"660\" y2=\"500\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"460\" y1=\"496\" x2=\"460\" y2=\"504\" stroke=\"#2b1f14\" stroke-width=\"4\" stroke-linecap=\"round\"/>\n<line x1=\"530\" y1=\"496\" x2=\"530\" y2=\"504\" stroke=\"#2b1f14\" stroke-width=\"4\" stroke-linecap=\"round\"/>\n<line x1=\"460\" y1=\"500\" x2=\"460\" y2=\"430\" stroke=\"#b8321f\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n<path d=\"M 530 500 A 70 70 0 0 0 460 430\" fill=\"none\" stroke=\"#b9a47a\" stroke-width=\"1.6\" stroke-dasharray=\"4 3\"/>\n<line x1=\"656\" y1=\"422\" x2=\"664\" y2=\"422\" stroke=\"#2b1f14\" stroke-width=\"4\" stroke-linecap=\"round\"/>\n<line x1=\"656\" y1=\"458\" x2=\"664\" y2=\"458\" stroke=\"#2b1f14\" stroke-width=\"4\" stroke-linecap=\"round\"/>\n<line x1=\"660\" y1=\"422\" x2=\"624\" y2=\"422\" stroke=\"#b8321f\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n<path d=\"M 660 458 A 36 36 0 0 1 624 422\" fill=\"none\" stroke=\"#b9a47a\" stroke-width=\"1.6\" stroke-dasharray=\"4 3\"/>\n<line x1=\"440\" y1=\"326.5\" x2=\"550\" y2=\"326.5\" stroke=\"#2b1f14\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<line x1=\"440\" y1=\"333.5\" x2=\"550\" y2=\"333.5\" stroke=\"#2b1f14\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<line x1=\"440\" y1=\"330\" x2=\"550\" y2=\"330\" stroke=\"#6b5334\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<line x1=\"476.3\" y1=\"326.5\" x2=\"476.3\" y2=\"333.5\" stroke=\"#2b1f14\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<line x1=\"512.6\" y1=\"326.5\" x2=\"512.6\" y2=\"333.5\" stroke=\"#2b1f14\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<circle cx=\"352\" cy=\"354\" r=\"14\" fill=\"#f3e9d0\" stroke=\"#b8321f\" stroke-width=\"2.4\"/>\n<text x=\"352\" y=\"360\" font-size=\"17\" fill=\"#b8321f\" text-anchor=\"middle\" font-weight=\"bold\">4</text>\n<text x=\"495\" y=\"422\" font-size=\"19\" fill=\"#2b1f14\" text-anchor=\"middle\" font-weight=\"bold\">灵堂</text>\n<text x=\"495\" y=\"445\" font-size=\"13\" fill=\"#6b5334\" text-anchor=\"middle\" font-weight=\"normal\">正门对院子 · 侧门通夹道</text>\n<rect x=\"400\" y=\"338\" width=\"190\" height=\"24\" fill=\"#d8c9a3\" stroke=\"#6b5334\" stroke-width=\"1.5\"/>\n<text x=\"495\" y=\"356\" font-size=\"12\" fill=\"#6b5334\" text-anchor=\"middle\" font-weight=\"normal\">白幔与两口棺</text>\n<rect x=\"430\" y=\"366\" width=\"130\" height=\"18\" fill=\"#ead9b0\" stroke=\"#6b5334\" stroke-width=\"1.5\"/>\n<circle cx=\"380\" cy=\"470\" r=\"12\" fill=\"#ead9b0\" stroke=\"#6b5334\" stroke-width=\"1.5\"/>\n<text x=\"398\" y=\"475\" font-size=\"12\" fill=\"#6b5334\" text-anchor=\"start\" font-weight=\"normal\">太师椅</text>\n<polygon points=\"660,330 720,330 720,760 660,760\" fill=\"#efe2bf\" stroke=\"#6b5334\" stroke-width=\"2\" stroke-linejoin=\"round\"/>\n<text x=\"690\" y=\"600\" font-size=\"15\" fill=\"#6b5334\" text-anchor=\"middle\" font-weight=\"normal\">夹</text>\n<text x=\"690\" y=\"622\" font-size=\"15\" fill=\"#6b5334\" text-anchor=\"middle\" font-weight=\"normal\">道</text>\n<rect x=\"330\" y=\"500\" width=\"330\" height=\"260\" fill=\"#e7dcb4\" stroke=\"#6b5334\" stroke-width=\"2\"/>\n<circle cx=\"352\" cy=\"524\" r=\"14\" fill=\"#f3e9d0\" stroke=\"#b8321f\" stroke-width=\"2.4\"/>\n<text x=\"352\" y=\"530\" font-size=\"17\" fill=\"#b8321f\" text-anchor=\"middle\" font-weight=\"bold\">5</text>\n<text x=\"495\" y=\"560\" font-size=\"20\" fill=\"#2b1f14\" text-anchor=\"middle\" font-weight=\"bold\">院子</text>\n<circle cx=\"495\" cy=\"650\" r=\"52\" fill=\"#d8c9a3\" stroke=\"#2b1f14\" stroke-width=\"3\"/>\n<text x=\"495\" y=\"656\" font-size=\"14\" fill=\"#2b1f14\" text-anchor=\"middle\" font-weight=\"normal\">化纸池</text>\n<rect x=\"720\" y=\"330\" width=\"200\" height=\"200\" fill=\"#fbf4e0\" stroke=\"none\" stroke-width=\"0\"/>\n<line x1=\"720\" y1=\"330\" x2=\"920\" y2=\"330\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"720\" y1=\"530\" x2=\"842\" y2=\"530\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"878\" y1=\"530\" x2=\"920\" y2=\"530\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"720\" y1=\"330\" x2=\"720\" y2=\"400\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"720\" y1=\"440\" x2=\"720\" y2=\"530\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"920\" y1=\"330\" x2=\"920\" y2=\"400\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"920\" y1=\"460\" x2=\"920\" y2=\"530\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"716\" y1=\"400\" x2=\"724\" y2=\"400\" stroke=\"#2b1f14\" stroke-width=\"4\" stroke-linecap=\"round\"/>\n<line x1=\"716\" y1=\"440\" x2=\"724\" y2=\"440\" stroke=\"#2b1f14\" stroke-width=\"4\" stroke-linecap=\"round\"/>\n<line x1=\"720\" y1=\"400\" x2=\"760\" y2=\"400\" stroke=\"#b8321f\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n<path d=\"M 720 440 A 40 40 0 0 0 760 400\" fill=\"none\" stroke=\"#b9a47a\" stroke-width=\"1.6\" stroke-dasharray=\"4 3\"/>\n<line x1=\"842\" y1=\"526\" x2=\"842\" y2=\"534\" stroke=\"#2b1f14\" stroke-width=\"4\" stroke-linecap=\"round\"/>\n<line x1=\"878\" y1=\"526\" x2=\"878\" y2=\"534\" stroke=\"#2b1f14\" stroke-width=\"4\" stroke-linecap=\"round\"/>\n<line x1=\"842\" y1=\"530\" x2=\"842\" y2=\"494\" stroke=\"#b8321f\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n<path d=\"M 878 530 A 36 36 0 0 0 842 494\" fill=\"none\" stroke=\"#b9a47a\" stroke-width=\"1.6\" stroke-dasharray=\"4 3\"/>\n<line x1=\"916.5\" y1=\"400\" x2=\"916.5\" y2=\"460\" stroke=\"#2b1f14\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<line x1=\"923.5\" y1=\"400\" x2=\"923.5\" y2=\"460\" stroke=\"#2b1f14\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<line x1=\"920\" y1=\"400\" x2=\"920\" y2=\"460\" stroke=\"#6b5334\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<line x1=\"916.5\" y1=\"419.8\" x2=\"923.5\" y2=\"419.8\" stroke=\"#2b1f14\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<line x1=\"916.5\" y1=\"439.6\" x2=\"923.5\" y2=\"439.6\" stroke=\"#2b1f14\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<circle cx=\"742\" cy=\"354\" r=\"14\" fill=\"#f3e9d0\" stroke=\"#b8321f\" stroke-width=\"2.4\"/>\n<text x=\"742\" y=\"360\" font-size=\"17\" fill=\"#b8321f\" text-anchor=\"middle\" font-weight=\"bold\">6</text>\n<text x=\"820\" y=\"437\" font-size=\"16\" fill=\"#2b1f14\" text-anchor=\"middle\" font-weight=\"bold\">纸扎作坊-刘巧手</text>\n<text x=\"820\" y=\"460\" font-size=\"13\" fill=\"#6b5334\" text-anchor=\"middle\" font-weight=\"normal\">东厢</text>\n<rect x=\"720\" y=\"530\" width=\"200\" height=\"230\" fill=\"#fbf4e0\" stroke=\"none\" stroke-width=\"0\"/>\n<line x1=\"720\" y1=\"530\" x2=\"920\" y2=\"530\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"720\" y1=\"760\" x2=\"790\" y2=\"760\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"850\" y1=\"760\" x2=\"920\" y2=\"760\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"720\" y1=\"530\" x2=\"720\" y2=\"622\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"720\" y1=\"658\" x2=\"720\" y2=\"760\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"920\" y1=\"530\" x2=\"920\" y2=\"682\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"920\" y1=\"718\" x2=\"920\" y2=\"760\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"716\" y1=\"622\" x2=\"724\" y2=\"622\" stroke=\"#2b1f14\" stroke-width=\"4\" stroke-linecap=\"round\"/>\n<line x1=\"716\" y1=\"658\" x2=\"724\" y2=\"658\" stroke=\"#2b1f14\" stroke-width=\"4\" stroke-linecap=\"round\"/>\n<line x1=\"720\" y1=\"622\" x2=\"756\" y2=\"622\" stroke=\"#b8321f\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n<path d=\"M 720 658 A 36 36 0 0 0 756 622\" fill=\"none\" stroke=\"#b9a47a\" stroke-width=\"1.6\" stroke-dasharray=\"4 3\"/>\n<line x1=\"916\" y1=\"682\" x2=\"924\" y2=\"682\" stroke=\"#2b1f14\" stroke-width=\"4\" stroke-linecap=\"round\"/>\n<line x1=\"916\" y1=\"718\" x2=\"924\" y2=\"718\" stroke=\"#2b1f14\" stroke-width=\"4\" stroke-linecap=\"round\"/>\n<line x1=\"920\" y1=\"682\" x2=\"884\" y2=\"682\" stroke=\"#b8321f\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n<path d=\"M 920 718 A 36 36 0 0 1 884 682\" fill=\"none\" stroke=\"#b9a47a\" stroke-width=\"1.6\" stroke-dasharray=\"4 3\"/>\n<line x1=\"790\" y1=\"756.5\" x2=\"850\" y2=\"756.5\" stroke=\"#2b1f14\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<line x1=\"790\" y1=\"763.5\" x2=\"850\" y2=\"763.5\" stroke=\"#2b1f14\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<line x1=\"790\" y1=\"760\" x2=\"850\" y2=\"760\" stroke=\"#6b5334\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<line x1=\"809.8\" y1=\"756.5\" x2=\"809.8\" y2=\"763.5\" stroke=\"#2b1f14\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<line x1=\"829.6\" y1=\"756.5\" x2=\"829.6\" y2=\"763.5\" stroke=\"#2b1f14\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<circle cx=\"742\" cy=\"554\" r=\"14\" fill=\"#f3e9d0\" stroke=\"#b8321f\" stroke-width=\"2.4\"/>\n<text x=\"742\" y=\"560\" font-size=\"17\" fill=\"#b8321f\" text-anchor=\"middle\" font-weight=\"bold\">7</text>\n<text x=\"820\" y=\"652\" font-size=\"19\" fill=\"#2b1f14\" text-anchor=\"middle\" font-weight=\"bold\">灶房</text>\n<text x=\"820\" y=\"675\" font-size=\"13\" fill=\"#6b5334\" text-anchor=\"middle\" font-weight=\"normal\">西墙小门通夹道</text>\n<rect x=\"760\" y=\"560\" width=\"80\" height=\"40\" fill=\"#d8c9a3\" stroke=\"#2b1f14\" stroke-width=\"2\"/>\n<circle cx=\"880\" cy=\"680\" r=\"18\" fill=\"#d9e2d8\" stroke=\"#6b5334\" stroke-width=\"1.5\"/>\n<text x=\"880\" y=\"712\" font-size=\"12\" fill=\"#6b5334\" text-anchor=\"middle\" font-weight=\"normal\">水缸</text>\n<line x1=\"920\" y1=\"700\" x2=\"950\" y2=\"700\" stroke=\"#b8321f\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-dasharray=\"5 4\"/>\n<line x1=\"950\" y1=\"700\" x2=\"950\" y2=\"300\" stroke=\"#b8321f\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-dasharray=\"5 4\"/>\n<line x1=\"950\" y1=\"300\" x2=\"910\" y2=\"300\" stroke=\"#b8321f\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-dasharray=\"5 4\"/>\n<text x=\"958\" y=\"500\" font-size=\"12\" fill=\"#b8321f\" text-anchor=\"start\" font-weight=\"normal\">墙外小路→后院</text>\n<rect x=\"90\" y=\"330\" width=\"230\" height=\"200\" fill=\"#fbf4e0\" stroke=\"none\" stroke-width=\"0\"/>\n<line x1=\"90\" y1=\"330\" x2=\"320\" y2=\"330\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"90\" y1=\"530\" x2=\"320\" y2=\"530\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"90\" y1=\"330\" x2=\"90\" y2=\"530\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"320\" y1=\"330\" x2=\"320\" y2=\"410\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"320\" y1=\"450\" x2=\"320\" y2=\"465\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"320\" y1=\"495\" x2=\"320\" y2=\"530\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"316\" y1=\"410\" x2=\"324\" y2=\"410\" stroke=\"#2b1f14\" stroke-width=\"4\" stroke-linecap=\"round\"/>\n<line x1=\"316\" y1=\"450\" x2=\"324\" y2=\"450\" stroke=\"#2b1f14\" stroke-width=\"4\" stroke-linecap=\"round\"/>\n<line x1=\"320\" y1=\"410\" x2=\"280\" y2=\"410\" stroke=\"#b8321f\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n<path d=\"M 320 450 A 40 40 0 0 1 280 410\" fill=\"none\" stroke=\"#b9a47a\" stroke-width=\"1.6\" stroke-dasharray=\"4 3\"/>\n<line x1=\"316.5\" y1=\"465\" x2=\"316.5\" y2=\"495\" stroke=\"#2b1f14\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<line x1=\"323.5\" y1=\"465\" x2=\"323.5\" y2=\"495\" stroke=\"#2b1f14\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<line x1=\"320\" y1=\"465\" x2=\"320\" y2=\"495\" stroke=\"#6b5334\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<line x1=\"316.5\" y1=\"474.9\" x2=\"323.5\" y2=\"474.9\" stroke=\"#2b1f14\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<line x1=\"316.5\" y1=\"484.8\" x2=\"323.5\" y2=\"484.8\" stroke=\"#2b1f14\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<circle cx=\"112\" cy=\"354\" r=\"14\" fill=\"#f3e9d0\" stroke=\"#b8321f\" stroke-width=\"2.4\"/>\n<text x=\"112\" y=\"360\" font-size=\"17\" fill=\"#b8321f\" text-anchor=\"middle\" font-weight=\"bold\">8</text>\n<text x=\"205\" y=\"437\" font-size=\"17\" fill=\"#2b1f14\" text-anchor=\"middle\" font-weight=\"bold\">鬼三娘的客房</text>\n<text x=\"205\" y=\"460\" font-size=\"13\" fill=\"#6b5334\" text-anchor=\"middle\" font-weight=\"normal\">西厢 · 窗对院子</text>\n<rect x=\"90\" y=\"530\" width=\"230\" height=\"230\" fill=\"#fbf4e0\" stroke=\"none\" stroke-width=\"0\"/>\n<line x1=\"90\" y1=\"530\" x2=\"135\" y2=\"530\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"185\" y1=\"530\" x2=\"320\" y2=\"530\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"90\" y1=\"760\" x2=\"320\" y2=\"760\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"90\" y1=\"530\" x2=\"90\" y2=\"760\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"320\" y1=\"530\" x2=\"320\" y2=\"620\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"320\" y1=\"660\" x2=\"320\" y2=\"685\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"320\" y1=\"715\" x2=\"320\" y2=\"760\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"316\" y1=\"620\" x2=\"324\" y2=\"620\" stroke=\"#2b1f14\" stroke-width=\"4\" stroke-linecap=\"round\"/>\n<line x1=\"316\" y1=\"660\" x2=\"324\" y2=\"660\" stroke=\"#2b1f14\" stroke-width=\"4\" stroke-linecap=\"round\"/>\n<line x1=\"320\" y1=\"620\" x2=\"280\" y2=\"620\" stroke=\"#b8321f\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n<path d=\"M 320 660 A 40 40 0 0 1 280 620\" fill=\"none\" stroke=\"#b9a47a\" stroke-width=\"1.6\" stroke-dasharray=\"4 3\"/>\n<line x1=\"135\" y1=\"526.5\" x2=\"185\" y2=\"526.5\" stroke=\"#2b1f14\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<line x1=\"135\" y1=\"533.5\" x2=\"185\" y2=\"533.5\" stroke=\"#2b1f14\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<line x1=\"135\" y1=\"530\" x2=\"185\" y2=\"530\" stroke=\"#6b5334\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<line x1=\"151.5\" y1=\"526.5\" x2=\"151.5\" y2=\"533.5\" stroke=\"#2b1f14\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<line x1=\"168\" y1=\"526.5\" x2=\"168\" y2=\"533.5\" stroke=\"#2b1f14\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<line x1=\"316.5\" y1=\"685\" x2=\"316.5\" y2=\"715\" stroke=\"#2b1f14\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<line x1=\"323.5\" y1=\"685\" x2=\"323.5\" y2=\"715\" stroke=\"#2b1f14\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<line x1=\"320\" y1=\"685\" x2=\"320\" y2=\"715\" stroke=\"#6b5334\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<line x1=\"316.5\" y1=\"694.9\" x2=\"323.5\" y2=\"694.9\" stroke=\"#2b1f14\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<line x1=\"316.5\" y1=\"704.8\" x2=\"323.5\" y2=\"704.8\" stroke=\"#2b1f14\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<circle cx=\"112\" cy=\"554\" r=\"14\" fill=\"#f3e9d0\" stroke=\"#b8321f\" stroke-width=\"2.4\"/>\n<text x=\"112\" y=\"560\" font-size=\"17\" fill=\"#b8321f\" text-anchor=\"middle\" font-weight=\"bold\">9</text>\n<text x=\"205\" y=\"652\" font-size=\"17\" fill=\"#2b1f14\" text-anchor=\"middle\" font-weight=\"bold\">撒半仙的静室</text>\n<text x=\"205\" y=\"675\" font-size=\"13\" fill=\"#6b5334\" text-anchor=\"middle\" font-weight=\"normal\">西厢</text>\n<rect x=\"80\" y=\"780\" width=\"840\" height=\"240\" fill=\"none\" stroke=\"#b9a47a\" stroke-width=\"2\" stroke-dasharray=\"8 6\"/>\n<text x=\"88\" y=\"772\" font-size=\"15\" fill=\"#6b5334\" text-anchor=\"start\" font-weight=\"bold\">前院</text>\n<rect x=\"330\" y=\"790\" width=\"330\" height=\"120\" fill=\"#fbf4e0\" stroke=\"none\" stroke-width=\"0\"/>\n<line x1=\"330\" y1=\"790\" x2=\"465\" y2=\"790\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"525\" y1=\"790\" x2=\"660\" y2=\"790\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"330\" y1=\"910\" x2=\"465\" y2=\"910\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"525\" y1=\"910\" x2=\"660\" y2=\"910\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"330\" y1=\"790\" x2=\"330\" y2=\"830\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"330\" y1=\"870\" x2=\"330\" y2=\"910\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"660\" y1=\"790\" x2=\"660\" y2=\"830\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"660\" y1=\"870\" x2=\"660\" y2=\"910\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"465\" y1=\"786\" x2=\"465\" y2=\"794\" stroke=\"#2b1f14\" stroke-width=\"4\" stroke-linecap=\"round\"/>\n<line x1=\"525\" y1=\"786\" x2=\"525\" y2=\"794\" stroke=\"#2b1f14\" stroke-width=\"4\" stroke-linecap=\"round\"/>\n<line x1=\"465\" y1=\"790\" x2=\"465\" y2=\"850\" stroke=\"#b8321f\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n<path d=\"M 525 790 A 60 60 0 0 1 465 850\" fill=\"none\" stroke=\"#b9a47a\" stroke-width=\"1.6\" stroke-dasharray=\"4 3\"/>\n<line x1=\"465\" y1=\"906\" x2=\"465\" y2=\"914\" stroke=\"#2b1f14\" stroke-width=\"4\" stroke-linecap=\"round\"/>\n<line x1=\"525\" y1=\"906\" x2=\"525\" y2=\"914\" stroke=\"#2b1f14\" stroke-width=\"4\" stroke-linecap=\"round\"/>\n<line x1=\"465\" y1=\"910\" x2=\"465\" y2=\"850\" stroke=\"#b8321f\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n<path d=\"M 525 910 A 60 60 0 0 0 465 850\" fill=\"none\" stroke=\"#b9a47a\" stroke-width=\"1.6\" stroke-dasharray=\"4 3\"/>\n<line x1=\"326.5\" y1=\"830\" x2=\"326.5\" y2=\"870\" stroke=\"#2b1f14\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<line x1=\"333.5\" y1=\"830\" x2=\"333.5\" y2=\"870\" stroke=\"#2b1f14\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<line x1=\"330\" y1=\"830\" x2=\"330\" y2=\"870\" stroke=\"#6b5334\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<line x1=\"326.5\" y1=\"843.2\" x2=\"333.5\" y2=\"843.2\" stroke=\"#2b1f14\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<line x1=\"326.5\" y1=\"856.4\" x2=\"333.5\" y2=\"856.4\" stroke=\"#2b1f14\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<line x1=\"656.5\" y1=\"830\" x2=\"656.5\" y2=\"870\" stroke=\"#2b1f14\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<line x1=\"663.5\" y1=\"830\" x2=\"663.5\" y2=\"870\" stroke=\"#2b1f14\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<line x1=\"660\" y1=\"830\" x2=\"660\" y2=\"870\" stroke=\"#6b5334\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<line x1=\"656.5\" y1=\"843.2\" x2=\"663.5\" y2=\"843.2\" stroke=\"#2b1f14\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<line x1=\"656.5\" y1=\"856.4\" x2=\"663.5\" y2=\"856.4\" stroke=\"#2b1f14\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<circle cx=\"352\" cy=\"814\" r=\"14\" fill=\"#f3e9d0\" stroke=\"#b8321f\" stroke-width=\"2.4\"/>\n<text x=\"352\" y=\"820\" font-size=\"17\" fill=\"#b8321f\" text-anchor=\"middle\" font-weight=\"bold\">11</text>\n<text x=\"495\" y=\"857\" font-size=\"19\" fill=\"#2b1f14\" text-anchor=\"middle\" font-weight=\"bold\">喜堂</text>\n<text x=\"495\" y=\"880\" font-size=\"13\" fill=\"#6b5334\" text-anchor=\"middle\" font-weight=\"normal\">穿过喜堂进正院</text>\n<rect x=\"330\" y=\"910\" width=\"330\" height=\"30\" fill=\"#e7dcb4\" stroke=\"none\" stroke-width=\"0\"/>\n<rect x=\"330\" y=\"940\" width=\"330\" height=\"80\" fill=\"#fbf4e0\" stroke=\"none\" stroke-width=\"0\"/>\n<line x1=\"330\" y1=\"940\" x2=\"400\" y2=\"940\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"440\" y1=\"940\" x2=\"550\" y2=\"940\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"610\" y1=\"940\" x2=\"660\" y2=\"940\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"330\" y1=\"1020\" x2=\"660\" y2=\"1020\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"330\" y1=\"940\" x2=\"330\" y2=\"1020\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"660\" y1=\"940\" x2=\"660\" y2=\"1020\" stroke=\"#2b1f14\" stroke-width=\"6\" stroke-linecap=\"round\"/>\n<line x1=\"400\" y1=\"936\" x2=\"400\" y2=\"944\" stroke=\"#2b1f14\" stroke-width=\"4\" stroke-linecap=\"round\"/>\n<line x1=\"440\" y1=\"936\" x2=\"440\" y2=\"944\" stroke=\"#2b1f14\" stroke-width=\"4\" stroke-linecap=\"round\"/>\n<line x1=\"400\" y1=\"940\" x2=\"400\" y2=\"980\" stroke=\"#b8321f\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n<path d=\"M 440 940 A 40 40 0 0 1 400 980\" fill=\"none\" stroke=\"#b9a47a\" stroke-width=\"1.6\" stroke-dasharray=\"4 3\"/>\n<line x1=\"550\" y1=\"936.5\" x2=\"610\" y2=\"936.5\" stroke=\"#2b1f14\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<line x1=\"550\" y1=\"943.5\" x2=\"610\" y2=\"943.5\" stroke=\"#2b1f14\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<line x1=\"550\" y1=\"940\" x2=\"610\" y2=\"940\" stroke=\"#6b5334\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<line x1=\"569.8\" y1=\"936.5\" x2=\"569.8\" y2=\"943.5\" stroke=\"#2b1f14\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<line x1=\"589.6\" y1=\"936.5\" x2=\"589.6\" y2=\"943.5\" stroke=\"#2b1f14\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<circle cx=\"352\" cy=\"964\" r=\"14\" fill=\"#f3e9d0\" stroke=\"#b8321f\" stroke-width=\"2.4\"/>\n<text x=\"352\" y=\"970\" font-size=\"17\" fill=\"#b8321f\" text-anchor=\"middle\" font-weight=\"bold\">10</text>\n<text x=\"495\" y=\"987\" font-size=\"17\" fill=\"#2b1f14\" text-anchor=\"middle\" font-weight=\"bold\">账房-大有余</text>\n<text x=\"495\" y=\"1010\" font-size=\"13\" fill=\"#6b5334\" text-anchor=\"middle\" font-weight=\"normal\">倒座房</text>\n<text x=\"250\" y=\"1000\" font-size=\"15\" fill=\"#2b1f14\" text-anchor=\"middle\" font-weight=\"bold\">寨门 ↓</text>\n<line x1=\"230\" y1=\"1020\" x2=\"330\" y2=\"1020\" stroke=\"#2b1f14\" stroke-width=\"4\" stroke-linecap=\"round\"/>\n<rect x=\"680\" y=\"870\" width=\"250\" height=\"112\" fill=\"#f8efd8\" stroke=\"#6b5334\" stroke-width=\"2\"/>\n<line x1=\"694\" y1=\"896\" x2=\"716\" y2=\"896\" stroke=\"#2b1f14\" stroke-width=\"5\" stroke-linecap=\"round\"/>\n<line x1=\"694\" y1=\"896\" x2=\"694\" y2=\"878\" stroke=\"#b8321f\" stroke-width=\"3\" stroke-linecap=\"round\"/>\n<text x=\"726\" y=\"902\" font-size=\"15\" fill=\"#2b1f14\" text-anchor=\"start\" font-weight=\"normal\">门（红线为门扇）</text>\n<line x1=\"694\" y1=\"922\" x2=\"716\" y2=\"922\" stroke=\"#2b1f14\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<line x1=\"694\" y1=\"926\" x2=\"716\" y2=\"926\" stroke=\"#2b1f14\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<text x=\"726\" y=\"928\" font-size=\"15\" fill=\"#2b1f14\" text-anchor=\"start\" font-weight=\"normal\">窗</text>\n<circle cx=\"704\" cy=\"954\" r=\"14\" fill=\"#f3e9d0\" stroke=\"#b8321f\" stroke-width=\"2.4\"/>\n<text x=\"704\" y=\"960\" font-size=\"17\" fill=\"#b8321f\" text-anchor=\"middle\" font-weight=\"bold\">0</text>\n<text x=\"726\" y=\"960\" font-size=\"15\" fill=\"#2b1f14\" text-anchor=\"start\" font-weight=\"normal\">房号，对应图下图例</text>\n<circle cx=\"940\" cy=\"60\" r=\"26\" fill=\"#f8efd8\" stroke=\"#6b5334\" stroke-width=\"2\"/>\n<polygon points=\"940,38 947,60 940,56 933,60\" fill=\"#b8321f\" stroke=\"#b8321f\" stroke-width=\"1\" stroke-linejoin=\"round\"/>\n<text x=\"940\" y=\"30\" font-size=\"15\" fill=\"#2b1f14\" text-anchor=\"middle\" font-weight=\"bold\">北</text>\n</g></svg>"
  }
};
export default PACK;

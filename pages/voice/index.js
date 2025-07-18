// pages/voice/index.js
const common = require("../common/index");
const sourcePre = common.config.r2Domain;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    items: [{
      name: '春雨',
      icon: '/resources/voice/rain.png',
      source: sourcePre + "/voice/rain_light.mp3",
      type: 'nature',
    }, {
      name: '夏雨',
      icon: '/resources/voice/big_rain.png',
      source: sourcePre + '/voice/summer_heavy_rain.mp3',
      type: 'nature',
    }, {
      name: '海浪',
      icon: '/resources/voice/wave.png',
      source: sourcePre + '/voice/ocean-waves.mp3',
      type: 'nature',
    }, {
      name: '雷声',
      icon: '/resources/voice/thunder.png',
      source: sourcePre + '/voice/thunder.mp3',
      type: 'nature',
    }, {
      name: '鸟鸣',
      icon: '/resources/voice/bird.png',
      source: sourcePre + '/voice/birds.mp3',
      type: 'animal',
    }, {
      name: '夜虫',
      icon: '/resources/voice/night.png',
      source: sourcePre + '/voice/night-insect.mp3',
      type: 'animal',
    }, {
      name: '流水',
      icon: '/resources/voice/flow.png',
      source: sourcePre + '/voice/flowing-water.mp3',
      type: 'nature',
    }, {
      name: '爆竹',
      icon: '/resources/voice/fireworks.png',
      source: sourcePre + '/voice/fireworks.mp3',
      type: 'other',
    }, {
      name: '篝火',
      icon: '/resources/voice/fire.png',
      source: sourcePre + '/voice/campfire.mp3',
      type: 'other',
    }, {
      name: '听风',
      icon: '/resources/voice/wind.png',
      source: sourcePre + '/voice/wind.mp3',
      type: 'nature',
    }, {
      name: '瀑布',
      icon: '/resources/voice/waterfall.png',
      source: sourcePre + '/voice/waterfall.mp3',
      type: 'nature',
    }, {
      name: '小溪',
      icon: '/resources/voice/stream.png',
      source: sourcePre + '/voice/stream-water.mp3',
      type: 'nature',
    }, {
      name: '树林',
      icon: '/resources/voice/trees.png',
      source: sourcePre + '/voice/jungle.mp3',
      type: 'nature',
    }, {
      name: '落叶',
      icon: '/resources/voice/leaf.png',
      source: sourcePre + '/voice/walking-leaves.mp3',
      type: 'nature',
    }, {
      name: '冬雪',
      icon: '/resources/voice/snow.png',
      source: sourcePre + '/voice/snow.mp3',
      type: 'nature',
    }, {
      name: '乡村',
      icon: '/resources/voice/village.png',
      source: sourcePre + '/voice/village.mp3',
      type: 'other',
    }],
    currentSound: {
      name: '春雨',
      icon: '/resources/voice/rain.png',
      source: sourcePre + '/voice/rain_light.mp3',
      type: ''
    },
    timer: null,
    isPlaying: false,
    // 0:原长，1：15分钟，2：30分钟，3：1小时
    playMode: 0,
    audioContext: null,
    // 原始时长
    audioDuration: null,
    // 一共可播放[0, duration]，倒计时用
    duration: null,
    // 显示的duration
    displayDuration: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    common.setTabBarTitle('助眠白噪声');
    let audioContext = wx.createInnerAudioContext({
      useWebAudioImplement: false
    });
    audioContext.loop = true;
    this.setData({
      audioContext
    });
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    const audioContext = this.data.audioContext;
    if(audioContext) {
      audioContext.stop();
      audioContext.destroy();
    }
  },

  onShareAppMessage() {
    return {
      title: "发现一个免费好用的助眠白噪声小程序，推荐给你",
      path: "/pages/voice/index"
    }
  },
  onShareTimeline() {
    return {
      title: "发现一个免费好用的助眠白噪声小程序，推荐给你",
      query: "",
      imageUrl: "/resources/voice.png"
    };
  },
  onClickAudio(e) {
    const sound = e.target.dataset.sound;
    if(sound.source === this.data.currentSound.source) {
      console.log("未切换音频");
      return;
    }
    // 切换音频需要重新获取并设置音频时长
    this.setData({
      currentSound: sound,
      audioDuration: null
    });
    // 如果当前有播放，停止当前，重新播放选中
    this.playAudio();
  },
  // 该方法获取并设置音频的初始时长
  getAudioDuration() {
    if(!this.data.audioDuration) {
      const audioContext = this.data.audioContext;
      const duration = Math.ceil(audioContext.duration);
      this.setData({
        audioDuration: duration,
        duration: duration,
        displayDuration: this.displayDuration(duration),
        mode: 0
      });
    }
  },
  cleanPlay() {
    if(this.data.timer) {
      console.log(this.data.timer + "cleared");
      clearInterval(this.data.timer);
      this.setData({
        timer: null,
        isPlaying: false
      });
    }
    this.data.audioContext.stop();
  },
  playAudio() {
    if(!this.data.currentSound.source) {
      console.log("音源路径不存在");
      return;
    }
    let audioContext = this.data.audioContext;
    if(!audioContext) {
      console.log("页面初始化错误");
      return;
    }
    // 当前可能有其他播放，需要先清理
    this.cleanPlay();
    // 开始播放当前声音
    audioContext.src = this.data.currentSound.source;
    audioContext.play();
    audioContext.onPlay(() => {
      console.log("onPlay");
      this.getAudioDuration();
      // onCanPlay事件可能触发多次，保证不重复创建timer
      if(!this.data.timer) {
        let timer = setInterval(() => {
          // 防止onPlay异步函数里没有拿到duration，这里再取一次
          if(!this.data.duration) {
            this.getAudioDuration();
          }
          const remained = this.data.duration - 1;
          this.setData({
            duration: remained,
            displayDuration: this.displayDuration(remained)
          });
          if(remained === 0) {
            console.log("clean timer");
            this.cleanPlay();
          }
        }, 1000);
        console.log(timer + "建立了");
        this.setData({
          timer,
          isPlaying: true
        });
      }
    });
  },
  pauseAudio() {
    let audioContext = this.data.audioContext;
    if(!audioContext) {
      console.log("页面初始化错误");
      return;
    }
    audioContext.pause();
    if(this.data.timer) {
      console.log(this.data.timer + "cleared");
      clearInterval(this.data.timer);
    }
    this.setData({
      timer: null,
      isPlaying: false
    });
  },
  togglePlay() {
    const playStatus = !this.data.isPlaying;
    if(playStatus) {
      this.playAudio();
    } else {
      this.pauseAudio();
    }
  },
  displayDuration(duration) {
    if(duration === 0) {
      return "";
    }
    let minute = parseInt(duration / 60);
    let second = duration % 60;
    if(minute < 10) {
      minute = "0" + minute;
    }
    if(second < 10) {
      second = "0" + second;
    }
    return minute + ":" + second;
  },
  onTimerClick() {
    // 播放中可以调整播放时长，支持四种：原长、15分钟、30小时、1小时
    const durationMapping = {
      0: this.data.audioDuration,
      1: 15 * 60,
      2: 30 * 60,
      3: 1 * 60 * 60
    };
    if(this.data.isPlaying) {
      let mode = ++this.data.mode % 4;
      this.setData({
        mode,
        duration: durationMapping[mode],
        displayDuration: this.displayDuration(durationMapping[mode])
      });
    }
  }
})
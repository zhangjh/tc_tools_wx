// pages/voice/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    items: [{
      name: '春雨',
      icon: '/resources/voice/rain.png',
      source: '',
      type: 'nature',
    }, {
      name: '夏雨',
      icon: '/resources/voice/big_rain.png',
      source: '',
      type: 'nature',
    }, {
      name: '海浪',
      icon: '/resources/voice/wave.png',
      source: '',
      type: 'nature',
    }, {
      name: '雷声',
      icon: '/resources/voice/thunder.png',
      source: '',
      type: 'nature',
    }, {
      name: '鸟鸣',
      icon: '/resources/voice/bird.png',
      source: '',
      type: 'animal',
    }, {
      name: '夜虫',
      icon: '/resources/voice/night.png',
      source: '',
      type: 'animal',
    }, {
      name: '流水',
      icon: '/resources/voice/flow.png',
      source: '',
      type: 'nature',
    }, {
      name: '爆竹',
      icon: '/resources/voice/fireworks.png',
      source: '',
      type: 'other',
    }, {
      name: '篝火',
      icon: '/resources/voice/fire.png',
      source: '',
      type: 'other',
    }, {
      name: '听风',
      icon: '/resources/voice/wind.png',
      source: '',
      type: 'nature',
    }, {
      name: '瀑布',
      icon: '/resources/voice/waterfall.png',
      source: '',
      type: 'nature',
    }, {
      name: '小溪',
      icon: '/resources/voice/stream.png',
      source: '',
      type: 'nature',
    }, {
      name: '树林',
      icon: '/resources/voice/trees.png',
      source: '',
      type: 'nature',
    }, {
      name: '落叶',
      icon: '/resources/voice/leaf.png',
      source: '',
      type: 'nature',
    }, {
      name: '冬雪',
      icon: '/resources/voice/snow.png',
      source: '',
      type: 'nature',
    }, {
      name: '乡村',
      icon: '/resources/voice/village.png',
      source: '',
      type: 'other',
    }],
    currentSound: {
      name: '春雨',
      icon: '/resources/voice/rain.png',
      source: '/resources/voice/brown-noise-by-digitalspa-170337.mp3',
      type: ''
    },
    isPlaying: false,
    // 0:原长，1：15分钟，2：30分钟，3：1小时
    playMode: 0,
    audioContext: null,
    audioDuration: null,
    // 一共可播放[0, duration]
    duration: null,
    // 显示的duration
    displayDuration: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.setNavigationBarTitle({
      title: '白噪声'
    }); 
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

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

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  onClickAudio(e) {
    const sound = e.target.dataset.sound;
    this.setData({
      currentSound: sound
    });
  },
  togglePlay() {
    const playingStatus = !this.data.isPlaying;
    this.setData({
      isPlaying: playingStatus
    });
    let audioContext = this.data.audioContext;
    let timer = null;
    if(playingStatus) {
      // 开始播放当前音频
      if(!audioContext) {
        audioContext = wx.createInnerAudioContext({
          useWebAudioImplement: false
        });
        this.setData({
          audioContext
        });
      }
      audioContext.src = this.data.currentSound.source;
      audioContext.onCanplay(() => {
        const duration = Math.ceil(audioContext.duration);
        this.setData({
          audioDuration: duration,
          duration: duration,
          displayDuration: this.displayDuration(duration),
          mode: 0
        });
        timer = setInterval(() => {
          const remained = this.data.duration - 1;
          this.setData({
            duration: remained,
            displayDuration: this.displayDuration(remained)
          });
          if(remained === 0) {
            clearInterval(timer);
            // todo: 增加循环播放模式
            audioContext.stop();
            audioContext.destroy();
            this.setData({
              audioContext: null,
              isPlaying: false
            });
          }
        }, 1000);
      });
      audioContext.play();
    } else {
      audioContext.pause();
      if(timer) {
        clearInterval(timer);
      }
    }
  },
  displayDuration(duration) {
    if(duration === 0) {
      return "";
    }
    if(duration <= 60) {
      return duration;
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
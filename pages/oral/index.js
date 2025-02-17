// pages/oral/index.js
const common = require("../common/index");
const fs = wx.getFileSystemManager();
const wxAudio = wx.createInnerAudioContext({});
const recorderManager = wx.getRecorderManager();
const app = getApp();

const tutors = [
  // default
  {
  name: 'Evelyn',
  desc: 'A youthful voice suite for casual scenarios',
  voiceName: 'en-US-EvelynMultilingualNeural',
  avatar: '/resources/oral_tutor/teacher1_sm.png',
  lang: 'en-US',
  rate: 'medium',
}, {
  name: 'Cora',
  desc: 'A softer voice with a touch of melancholy that conveys understanding and empathy',
  voiceName: 'en-US-CoraMultilingualNeural',
  avatar: '/resources/oral_tutor/teacher2.jpg',
  lang: 'en-US',
  rate: 'medium',
}, {
  name: 'Elizabeth',
  desc: 'A professorial voice that\'s clear and authoritative, great for delivering',
  voiceName: 'en-US-ElizabethNeural',
  avatar: '/resources/oral_tutor/office_lady.png',
  lang: 'en-US',
  rate: 'medium',
}, {
  name: 'Adam',
  desc: 'A deep, engaging voice that feels warm and inviting',
  voiceName: 'en-US-AdamMultilingualNeural',
  avatar: '/resources/oral_tutor/teacher3.png',
  lang: 'en-US',
  rate: 'medium',
}];

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showTutorTip: true, 
    tutors,
    tutor: tutors[0],
    showTutorDialog: false,
    showTopicDialog: false,
    showSuggestionDialog: false,
    topics: [
    ],
    currentTopic: '',
    suggestions: [],
    // 记录录音是否被取消
    cancelled: false,
    /**
     * [{ role: 'model', content: '', type: 'base64', playing: false }]
     */
    chatContent: [],
    // 开场默认
    playContent: 'What topic do you want to talk about?',
    ttsAudio: '',
    recording: false,
    context: [],
    tmpFiles: [],
    showAdvice: false,
    advice: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    common.setTabBarTitle('英语开口说');
    // 初始化获取话题
    this.getTopics();
    // 新增延时提示
    setTimeout(() => {
      this.setData({ showTutorTip: false });
    }, 5000);
  },

  onUnload() {
    // 卸载临时文件
    const tmpFiles = this.data.tmpFiles;
    for (const tmpFile of tmpFiles) {
      console.log(tmpFile);
      fs.unlink({
        filePath: tmpFile,
        success: () => {
          console.log('临时文件已删除');
        },
      });
    }
  },

  onReady() {
    console.log("onready play");
    app.setBizCb((userId) => {
      console.log(userId);
      common.wxRequest({
        url: '/wxChat/oral/getTutor?openId=' + userId,
        cb: res => {
          if(res && res.length) {
            const voiceName = res[0].tutor_name;
            const selectedTutor = 
              this.data.tutors.find(item => item.voiceName === voiceName);
            this.setData({
              tutor: selectedTutor
            });
          }
          // this.playContent();
        }
      });
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: "【英语开口说】我刚发现了一个很棒的口语训练小程序，你一定要尝试一下！快来免费使用~",
      path: "/pages/oral/index"
    }
  },
  onShareTimeline() {
    return {
      title: "【英语开口说】我刚发现了一个很棒的口语训练小程序，你一定要尝试一下！快来免费使用~",
      imageUrl: "/resources/oral_logo.png"
    };
  },

  changeTutor() {
    this.setData({
      showTutorDialog: true,
      showTutorTip: false
    });
  },
  closeTutorDialog() {
    this.setData({
      showTutorDialog: false
    });
  },
  selectTutor(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      tutor: tutors[index],
      showTutorDialog: false,
      ttsAudio: ''        // 清空当前可能缓存的tts音频
    });
    // 切换聊天对象后立即播放当前内容
    this.playContent();
    // 持久化聊天对象
    common.wxRequest({
      url: '/wxChat/oral/saveTutor',
      method: 'POST',
      data: {
        openId: app.globalData.userInfo.userId,
        tutorName: this.data.tutor.voiceName,
      },
      cb: res => {
        console.log(res);
      }
    });
  },
  getTopics() {
    wx.showLoading({
      title: 'Topics Loading...',
    });
    common.wxRequest({
      url: '/wxChat/oral/topics',
      cb: res => {
        wx.hideLoading();
        this.setData({
          showTopicDialog: true,
          topics: JSON.parse(res)
        });
      }
    });
  },
  refreshTopics() {
    console.log("refresh");
    this.getTopics();
  },
  closeTopicDialog() {
    this.setData({
      showTopicDialog: false
    });
  },
  selectTopic(e) {
    const topic = e.currentTarget.dataset.item;
    this.closeTopicDialog();
    // 切换topic时需清理当前对话
    this.setData({
      currentTopic: topic,
      chatContent: [],
      context: []
    });
    // 选中主题后主动开启对话
    this.buildContext('user', 'hello');
    this.conversation({
      topic, 
      talkMode: 'tutor', 
      content: 'hello',
    });
  },
  conversation(data) {
    wx.showLoading({
      title: 'loading...',
    });
    let cb = res => {
      wx.hideLoading();
      console.log(res);
      const resJO = JSON.parse(res);
      // 更新用户音频文本(忽略第一个系统初始化打招呼的hello)
      let chatContent = this.data.chatContent;
      const len = chatContent.length;
      if(resJO.userContent && len >= 2) {
        // 倒序找到最后一个user content
        let userContent = chatContent.reverse().find(item => item.role === 'user');
        chatContent.reverse();
        userContent.userContent = resJO.userContent;
        const advice = resJO.advice;
        const pronunciation = resJO.pronunciation;
        const grammar = resJO.grammar;
        if(advice) {
          userContent.advice = advice;
          // 自动弹出修改意见，5s后消失
          this.showAdvice(advice);
          setTimeout(() => {
            this.closeAdvice();
          }, 5000);
        }
        if(pronunciation) {
          userContent.pronunciation = pronunciation;
        }
        if(grammar) {
          userContent.grammar = grammar;
        }
      }
      this.buildChatContent('model', resJO.conversation);
      const trans = resJO.trans;
      // 倒序找到最后一个model content
      let modelContent = chatContent.reverse().find(item => item.role === 'model');
      chatContent.reverse();
      modelContent.trans = trans;
      // play audio
      this.setData({
        ttsAudio: '',
        playContent: resJO.conversation,
        chatContent: this.data.chatContent
      });
      this.playContent();
      this.buildContext('model', this.data.playContent);
    };
    if(data.audio) {
      common.uploadFile({
        url: '/wxChat/oral',
        filePath: data.audio,
        name: 'audio',
        formData: {
          talkMode: data.talkMode ? data.talkMode : '',
          context: data.context ? JSON.stringify(data.context) : ''
        },
        cb
      });
    } else if(data.content) {
      common.wxRequest({
        url: '/wxChat/oral',
        method: 'POST',
        data: {
          topic: data.topic ? data.topic : '',
          talkMode: data.talkMode ? data.talkMode : '',
          userContent: data.content,
          context: data.context ? JSON.stringify(data.context) : ''
        },
        cb
      });
    }
    
  },
  setPlayStatus(playContent, status) {
    let chatContent = this.data.chatContent;
    for (let chatItem of chatContent) {
      if(chatItem.content === playContent) {
        chatItem.playing = status;
        this.setData({
          chatContent: this.data.chatContent
        });
      }
    }
  },
  playAudio(target, playContent) {
    wxAudio.src = target;
    wxAudio.play();
    // 添加音频播放结束的监听器
    wxAudio.onEnded(() => {
      // 关闭播放状态
      this.setPlayStatus(playContent, false);
    });
  },
  playTmpUserAudio(e) {
    const tmpFile = e.currentTarget.dataset.target;
    const content = e.currentTarget.dataset.userContent;
    this.playAudio(tmpFile, content);
  },
  playContent(e) {
    // 默认取状态，如果dataset有值则为主动点击播放
    let content = this.data.playContent;
    if(e && e.currentTarget) {
      content = e.currentTarget.dataset.content;
    }
    console.log(content);
    if(!content) {
      return;
    }
    // 开启播放状态
    this.setPlayStatus(content, true);
    if(this.data.playContent === content && this.data.ttsAudio) {
      this.playAudio(this.data.ttsAudio, content);
    } else {
      wx.downloadFile({
        url: common.config.bizDomain + "/tts/playByOral?text=" + content 
          + "&voiceName=" + this.data.tutor.voiceName
          + "&lang=" + this.data.tutor.lang
          + "&rate=" + this.data.tutor.rate,
        success: res => {
          if(res.statusCode === 200) {
            this.setData({
              playContent: content
            });
            this.playAudio(res.tempFilePath, content);
            let tmpFiles = this.data.tmpFiles;
            tmpFiles.push(res.tempFilePath);
            this.setData({
              ttsAudio: res.tempFilePath,
              tmpFiles
            });
          }
        },
        fail: err => {
          console.log(err);
        }
      });
    }
  },
  onRecord() {
    console.log("record");
    this.setData({
      recording: true,
      cancelled: false
    });
    common.requestRecordPermission();
  },
  cancelRecord() {
    recorderManager.stop();
    this.setData({
      recording: false,
      cancelled: true
    });
  },
  buildChatContent(role, content, type) {
    if(!this.data.chatContent) {
      this.data.chatContent = [];
    }
    const len = this.data.chatContent.length;
    let chatContentItem = this.data.chatContent[len - 1];
    // 同角色累加信息
    if(chatContentItem && chatContentItem.role === role) {
      // 此时用户没有录音，而是使用的推荐回答，没有audio
      if(role === 'user' && !type) {
        chatContentItem.userContent = content;
      } else {
        chatContentItem.content = content;
      }
    } else {
      if(role === 'user' && !type) {
        this.data.chatContent.push({
          role, userContent: content
        });
      } else {
        this.data.chatContent.push({
          role, content, type
        });
      }
    }
    this.setData({
      chatContent: this.data.chatContent
    });
  },
  buildContext(role, content, audio) {
    /**
      role: 'user',
        parts: [{
          text: 'Hello'
        }]
      }
     */
    let context = this.data.context;
    if(content) {
      context.push({
        role,
        parts: [{
          text: content
        }]
      });
    }
    if(audio) {
      // todo: 增加音频上下文
    }
  },
  send(e) {
    console.log("send");
    this.setData({
      recording: false
    });
    // 获取录制的音频
    recorderManager.onStop((res) => {
      console.log('停止录音', res);
      // 主动取消的录音不发送
      if(!this.data.cancelled) {
        const { tempFilePath } = res;
        // 获取文件管理器
        const fileSystemManager = wx.getFileSystemManager();
        // 读取文件并转为 Base64
        fileSystemManager.readFile({
          filePath: tempFilePath, // 录音文件的临时路径
          encoding: 'base64', // 指定编码为 base64
          success: (result) => {
            const base64Data = result.data; // 获取 Base64 数据
            // console.log('Base64 数据:', base64Data);
            // 你可以在这里将 Base64 数据上传到服务器或进行其他处理
            this.buildChatContent('user', tempFilePath, 'base64');
            this.buildContext('user', null, base64Data);
            console.log(this.data.context);
            this.conversation({
              talkMode: 'tutor', 
              audio: tempFilePath,
              context: {
                messages: this.data.context
              }
            });
          },
          fail: (err) => {
            console.error('读取文件失败:', err);
          },
        });
      }
    });
    recorderManager.stop();
  },
  showAdvice(advice) {
    this.setData({
      showAdvice: true,
      advice
    });
  },
  toggleTrans(e) {
    const item = e.currentTarget.dataset.item;
    const currentContent = item.content;
    let chatContent = 
      this.data.chatContent.find(item => item.content === currentContent);
    chatContent.showTrans = !chatContent.showTrans;
    this.setData({
      chatContent: this.data.chatContent
    });
  },
  copyTrans(e) {
    const text = e.currentTarget.dataset.content;
    wx.setClipboardData({
      data: text,
    });
  },
  closeAdvice() {
    this.setData({
      showAdvice: false,
      advice: ''
    });
  },
  viewAdvice(e) {
    const advice = e.currentTarget.dataset.advice;
    this.showAdvice(advice);
  },
  onTipClick(e) {
    const chatContent = this.data.chatContent;
    let modelContent = '';
    if(chatContent && chatContent.length) {
      modelContent = chatContent.reverse().find(item => item.role === 'model');
    }
    if(modelContent) {
      wx.showLoading({
        title: 'loading...',
      });
      common.wxRequest({
        url: '/wxChat/oral/suggestion',
        method: 'POST',
        data: {
          topic: this.data.currentTopic,
          modelContent: modelContent.content
        },
        cb: res => {
          console.log(res);
          this.setData({
            suggestions: JSON.parse(res),
            showSuggestionDialog: true
          });
          wx.hideLoading();
        }
      });
    }
  },
  onChangeTopic(e) {
    this.getTopics();
  },
  selectSuggestion(e) {
    const item = e.currentTarget.dataset.item;
    if(item) {
      this.setData({
        showSuggestionDialog: false
      });
      const content = item.replace(/^\d+\.\s*/, '');
      this.conversation({
        talkMode: 'tutor', 
        content,
        context: {
          messages: this.data.context
        }
      });
      this.buildChatContent('user', content);
      this.buildContext('user', content);
    }
  },
  closeSuggestion() {
    this.setData({
      showSuggestionDialog: false
    });
  }
})
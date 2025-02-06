// pages/oral/index.js
const common = require("../common/index");
const fs = wx.getFileSystemManager();
const canto = require("../canto/canto");
const wxAudio = wx.createInnerAudioContext({});

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showTopicDialog: false,
    topics: [
    ],
    playing: false,
    chatContent: null,
    playContent: null,
    ttsAudio: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    common.setTabBarTitle('英语开口说');
    // 初始化获取话题
    this.getTopics();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

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
    const topic = e.target.dataset.item;
    this.closeTopicDialog();
    // 选中主题后主动开启对话
    this.conversation({
      topic, 
      talkMode: 'tutor', 
      content: 'hello',
      audio: null,
      context: null
    });
  },
  conversation(data) {
    let tutorContent = '';
    const requestTask = common.wxRequest({
      url: '/wxChat/oral',
      method: 'POST',
      data: {
        topic: data.topic,
        userContent: data.content,
        talkMode: data.talkMode,
        context: data.context
      },
      enableChunked: true,
    });
    requestTask.onChunkReceived((response) => {
      try {
        const chunk = decodeURIComponent(escape(String.fromCharCode.apply(null, new Uint8Array(response.data))));
        // 动态设值
        tutorContent += chunk;
        if(!this.data.chatContent) {
          this.data.chatContent = [{
            teacher: tutorContent
          }];
        } else {
          this.data.chatContent[0].teacher = tutorContent;
        }
        this.setData({
          chatContent: this.data.chatContent
        });
      } catch (e) {
        console.error('Process chunk failed:', e);
      }
    });
  },
  playAudio(target) {
    wxAudio.src = target;
    wxAudio.play();
    // 添加音频播放结束的监听器
    wxAudio.onEnded(() => {
      // this.hideVoicePrint();
      this.setData({
        playing: false
      });
    });
  },
  playContent(e) {
    const content = e.target.dataset.content;
    console.log(content);
    this.setData({
      playing: true
    });
    if(this.data.playContent === content && this.data.ttsAudio) {
      this.playAudio(this.data.ttsAudio);
    } else {
      const target = `${wx.env.USER_DATA_PATH}/${Date.now()}.wav`;
      wx.request({
        url: canto.cantoDomain + "/canto/voice/playByOral?text=" + content 
          + "&voiceName=en-US-EvelynMultilingualNeural"
          + "&lang=en-GB"
          + "&rate=medium",
        responseType: 'arraybuffer',
        success: res => {
          if(res.statusCode === 200) {
            fs.writeFile({
              filePath: target,
              data: res.data,
              encoding: 'binary',
              success: res => {
                this.setData({
                  playContent: content
                });
                this.playAudio(target);
              }
            });
            this.setData({
              ttsAudio: target
            });
          }
        }
      });
    }
  },
  onRecord() {
    console.log("record");
    common.requestRecordPermission();
  },
})
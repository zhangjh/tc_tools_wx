// pages/oral/index.js
const common = require("../common/index");
const fs = wx.getFileSystemManager();
const canto = require("../canto/canto");
const chat = require("../common/chat");
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
    /**
     * [{ role: 'model', content: '', type: 'base64' }]
     */
    chatContent: null,
    playContent: null,
    ttsAudio: null,
    recording: false,
    context: [],
    tmpFiles: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    common.setTabBarTitle('英语开口说');
    // 初始化获取话题
    this.getTopics();
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
    this.buildContext('user', 'hello');
    this.conversation({
      topic, 
      talkMode: 'tutor', 
      content: 'hello',
      audio: null,
      context: null
    });
  },
  conversation(data) {
    let content = '';
    const requestTask = common.wxRequest({
      url: '/wxChat/oral',
      method: 'POST',
      data: {
        topic: data.topic,
        userContent: data.content,
        audio: data.audio,
        talkMode: data.talkMode,
        context: data.context
      },
      enableChunked: true,
      cb: res => {
        console.log("task end");
        // play audio
        this.setData({
          ttsAudio: null
        });
        this.playContent(this.data.playContent);
        this.buildChatContent('model', this.data.playContent);
        this.buildContext('model', this.data.playContent);
      }
    });
    requestTask.onChunkReceived((response) => {
      try {
        const chunk = decodeURIComponent(escape(String.fromCharCode.apply(null, new Uint8Array(response.data))));
        // 动态设值
        console.log("chunk");
        content += chunk;
        this.buildChatContent('model', content);
        this.setData({
          chatContent: this.data.chatContent,
          playContent: content
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
    // 默认取状态，如果dataset有值则为主动点击播放
    let content = this.data.playContent;
    if(e.target) {
      content = e.target.dataset.content;
    }
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
          + "&lang=en-US"
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
            let tmpFiles = this.data.tmpFiles;
            tmpFiles.push(target);
            this.setData({
              ttsAudio: target,
              tmpFiles
            });
          }
        }
      });
    }
  },
  onRecord() {
    console.log("record");
    this.setData({
      recording: true
    });
    common.requestRecordPermission();
  },
  cancelRecord() {
    this.setData({
      recording: false
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
      chatContentItem.content = content;
    } else {
      this.data.chatContent.push({
        role, content, type
      });
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
    const recorderManager = wx.getRecorderManager();
    recorderManager.onStop((res) => {
      console.log('停止录音', res);
      const { tempFilePath } = res;
      // 获取文件管理器
      const fileSystemManager = wx.getFileSystemManager();
      // 读取文件并转为 Base64
      fileSystemManager.readFile({
        filePath: tempFilePath, // 录音文件的临时路径
        encoding: 'base64', // 指定编码为 base64
        success: (result) => {
          const base64Data = result.data; // 获取 Base64 数据
          console.log('Base64 数据:', base64Data);
          // 你可以在这里将 Base64 数据上传到服务器或进行其他处理
          this.buildChatContent('user', tempFilePath, 'base64');
          this.buildContext('user', null, base64Data);
          this.conversation({
            talkMode: 'tutor', 
            audio: [{
              mimeType: 'audio/wav',
              base64: base64Data
            }],
            context: {
              messages: this.data.context
            }
          });
        },
        fail: (err) => {
          console.error('读取文件失败:', err);
        },
      });
    });
    recorderManager.stop();
  }
})
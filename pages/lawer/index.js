// pages/doctor/index.js
const app = getApp();
const common = require("../common/index");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    introText: "您好！我是您的AI法律顾问。请描述您的法律咨询问题，我会尽力为您提供专业的建议。请注意：我的建议仅供参考，不代表实际的诉讼结论。您的任何问题均不会被记录，请放心提问。",
    question: "",
    // 最多3张
    uploadedFileList: [],
    context: {},
    // 存储pair对：[{role: 'user', content: ''}, {role: 'model', content: ''}]
    contentArr: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    common.setTabBarTitle('赛博律师');
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  onInput(e) {
    const value = e.detail.value;
    this.setData({
      question: value
    });
  },
  onPreview(e) {
    const url = e.target.dataset.url;
    common.onPreview(url);
  },
  onDelete(e) {
    const url = e.target.dataset.url;
    let uploadedFileList = this.data.uploadedFileList;
    const updateFileList = uploadedFileList.filter(item => {
      return item.tempFilePath !== url;
    });
    this.setData({
      uploadedFileList: updateFileList
    });
  },
  chooseImage() {
    common.chooseMedia({
      count: 3,
      mediaType: ["image"],
      cb: res => {
        // const file = res.tempFiles[0].tempFilePath;
        let uploadedFileList = this.data.uploadedFileList;
        res.tempFiles.map(file => {
          uploadedFileList.push(file);
        });
        this.setData({
          uploadedFileList
        });
      },
      failCb: err => {
        console.log(err);
      }
    });
  },
  // 在提交问题时设置上下文
  setChatContext() {
    let context = this.data.context;
    let messages = context.messages ? context.messages : [];
    let contentArr = this.data.contentArr;
    // 需要成对出现，否则只是提问不添加到上下文里
    let len = contentArr.length;
    const lastContent = contentArr[len - 1];
    if(lastContent && lastContent.length !== 2) {
      len--;
    }
    for (let i = 0; i < len; i++) {
      const content = contentArr[i];
      messages.push({
        role: content[0].role,
        parts: [{
          text: content[0].content
        }]
      });
      messages.push({
        role: content[1].role,
        parts: [{
          text: content[1].chunk
        }]
      });
    }
     // 淘汰最旧的一条，保留10条
     if(messages.length > 10) {
      messages.shift();
    }
    console.log(messages);
    if(messages.length) {
      context.messages = messages;
      this.setData({
        context
      });
    }
  },
  sendMessage() {
    if(!this.data.question) {
      return;
    }
    const question = this.data.question;
    const uploadedFileList = this.data.uploadedFileList;
    const context = this.data.context;
    // 清空输入框和已上传文件
    this.setData({
      question: '',
      uploadedFileList: []
    });
    wx.showLoading({
      title: 'loading...',
      mask: true,
    });
    let data = {
      question,
    };
    let contentArr = this.data.contentArr;
    let lastContent = contentArr[contentArr.length - 1];
    // 重复提交，或者回答出错了再次提交，只需覆盖问题
    if(lastContent && lastContent.length === 1) {
      lastContent[0].content = question;
      lastContent[0].uploadedFileList = uploadedFileList;
    } else {
      // 新一轮问答添加一个新元素
      contentArr.push([{
        role: 'user',
        content: question,
        uploadedFileList
      }]);
    }
    // 及时回显问题，不必等回答响应后再显示
    this.setData({
      contentArr
    });
    this.setChatContext();
    if(context && context.messages) {
      data.context = context;
    }
    if(uploadedFileList) {
      const fs = wx.getFileSystemManager();
      const base64List = uploadedFileList.map(file => {
        const mimeType = "image/jpeg";
        const base64 = fs.readFileSync(file.tempFilePath, 'base64');
        return {
          base64,
          mimeType
        };
      });
      data.files = base64List;
    }
    const requestTask = common.wxRequest({
      url: '/wxChat/lawer',
      method: 'POST',
      data,
      enableChunked: true,
      cb: res => {
      },
      failCb: err => {
        console.log(err);
      }
    });
     // 监听数据块
     contentArr = this.data.contentArr;
     lastContent = contentArr[contentArr.length - 1];
     requestTask.onChunkReceived((response) => {
      wx.hideLoading();
      try {
        const chunk = decodeURIComponent(escape(String.fromCharCode.apply(null, new Uint8Array(response.data))));
        // 累加chunk
        if(!lastContent || lastContent.length < 2) {
          lastContent.push({
            role: 'model',
            chunk,
            content: app.towxml(chunk, "markdown")
          });
        } else {
          // markdown
          lastContent[1].chunk += chunk;
          lastContent[1].content = app.towxml(lastContent[1].chunk, "markdown");
        }
        console.log(contentArr);
        this.setData({
          contentArr
        });
      } catch (e) {
        console.error('Process chunk failed:', e);
      }
    });
  }
})
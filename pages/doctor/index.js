// pages/doctor/index.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    introText: "您好！我是您的AI医疗顾问。请描述您的症状或健康问题，我会尽力为您提供专业的建议。请注意：我的建议仅供参考，如有严重症状请及时就医。您的任何问题均不会被记录，请放心提问。",
    question: "",
    context: {},
    // 存储pair对：[{role: 'user', content: ''}, {role: 'model', content: ''}]
    contentArr: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.setNavigationBarTitle({
      title: '赛博医生',
    })
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

  onInput(e) {
    const value = e.detail.value;
    console.log(value);
    this.setData({
      question: value
    });
  },
  chooseImage() {

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
    const context = this.data.context;
    // 清空输入框
    this.setData({
      question: ''
    });
    wx.showLoading({
      title: 'loading...',
      mask: true,
    });
    let data = {
      question
    };
    let contentArr = this.data.contentArr;
    let lastContent = contentArr[contentArr.length - 1];
    // 重复提交，或者回答出错了再次提交，只需覆盖问题
    if(lastContent && lastContent.length === 1) {
      lastContent[0].content = question;
    } else {
      // 新一轮问答添加一个新元素
      contentArr.push([{
        role: 'user',
        content: question
      }]);
    }
    this.setChatContext();
    if(context && context.messages) {
      data.context = context;
    }
    console.log(data);
    const requestTask = wx.request({
      url: 'https://wx2.zhangjh.cn/wxChat/doctor',
      method: 'POST',
      data,
      enableChunked: true,
      responseType: 'text',
      success: res => {
        if(res.statusCode === 200) {
        }
      },
      fail: err => {
        console.log(err);
        wx.showToast({
          title: '请求出错',
          icon: 'error'
        })
      }
    });
     // 监听数据块
     contentArr = this.data.contentArr;
     lastContent = contentArr[contentArr.length - 1];
     requestTask.onChunkReceived((response) => {
      wx.hideLoading();
      try {
        const chunk = new TextDecoder().decode(response.data);
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
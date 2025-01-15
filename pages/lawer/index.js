// pages/doctor/index.js
const chat = require('../common/chat.js');

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
    contentArr: [],
    keyboardHeight: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    chat.init(this);
    chat.setTabBarTitle('赛博律师');
    const content = options.content;
    // 非空表示从分享进来的，设置初始分享的答案内容
    if(content) {
      this.setData({
        contentArr: [JSON.parse(content)]
      });
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage(e) {
    const content = e.target.dataset.content;
    const question = content[0].content;
    let title = question;
    if(title > 25) {
      title = question.substring(0, 25) + '...';
    }
    // 截断取前25个字
    return {
      title: '[赛博律师]' + title,
      path: '/pages/lawer/index?content=' + JSON.stringify(content)
    }
  },
  onShareTimeline() {
    return {
      title: "[赛博律师]分享一个好用的AI法律顾问小程序",
      imageUrl: "/resources/aiLaw.png"
    };
  },

  onInput(e) {
    chat.onInput(e);
  },
  onPreview(e) {
    chat.onPreview(e);
  },
  onDelete(e) {
    chat.onDelete(e);
  },
  onFocus() {
    chat.onFocus();
  },
  onBlur() {
    chat.onBlur();
  },
  chooseImage() {
    chat.chooseImage();
  },
  // 在提交问题时设置上下文
  setChatContext() {
    chat.setChatContext();
  },
  sendMessage() {
    chat.sendMessage('/wxChat/lawer');
  }
})
// pages/doctor/index.js
const chat = require('../common/chat.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    introText: "您好！我是您的AI医疗顾问。请描述您的症状或健康问题，我会尽力为您提供专业的建议。请注意：我的建议仅供参考，如有严重症状请及时就医。您的任何问题均不会被记录，请放心提问。",
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
    chat.setTabBarTitle('赛博华佗');
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

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
    chat.sendMessage();
  }
})

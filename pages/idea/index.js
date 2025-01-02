// pages/idea/idea.js
const app = getApp();
const common = require("../common/index");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    ideaContent: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    common.setNavigationBarTitle('需求反馈');
  },
  onChange(e) {
    if(e.detail.value) {
      this.setData({
        ideaContent: e.detail.value
      });
    }
  },
  onSubmit() {
    const userId = app.globalData.userInfo.userId;
    if(!this.data.ideaContent) {
      return wx.showToast({
        title: '未填写内容',
        icon: 'error',
        mask: true
      });
    }
    wx.showLoading({
      title: 'loading...',
      mask: true,
    });
    common.wxRequest({
      url: '/feedback/idea',
      method: 'POST',
      data: {
        userId,
        idea: this.data.ideaContent
      },
      cb: res => {
        wx.hideLoading();
        wx.showToast({
          title: '需求提交成功',
          mask: true,
        });
      },
      failCb: err => {
        console.log(err);
      }
    });
  }
})
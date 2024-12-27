// pages/idea/idea.js
const app = getApp();
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
    wx.setNavigationBarTitle({
      title: '需求反馈',
    });
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
    wx.request({
      url: 'https://wx2.zhangjh.cn/feedback/idea',
      method: 'POST',
      data: {
        userId,
        idea: this.data.ideaContent
      },
      success: res => {
        wx.hideLoading();
        const data = res.data;
        if(data.success) {
          wx.showToast({
            title: '需求提交成功',
            mask: true,
          });
        } else {
          wx.showToast({
            title: '需求提交失败',
            mask: true,
            icon: 'error'
          })
        }
      },
      fail: err => {
        wx.showToast({
          title: '需求提交失败',
        })
      }
    })
  }
})
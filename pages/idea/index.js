// pages/idea/idea.js
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
  onSubmit() {
    if(this.data.ideaContent) {
      // todo: 保存记录
      wx.showToast({
        title: '需求提交成功',
      })
    }
  }
})
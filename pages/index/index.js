// pages/index/index.js
const app = getApp();
const common = require("../common/index");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    items: []
  },
  getItems() {
    common.getItems(data => {
      app.globalData.items = data;
      this.setData({
        items: data
      });
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 获取当前已经有的工具列表
    if(!app.globalData.items.length) {
      this.getItems();
    } else {
      this.setData({
        items: app.globalData.items
      });
    }
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

  onShareTimeline() {
    return {
      title: "[太初工具集]发现一个好用的工具小程序，你也来试试"
    };
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: "[太初工具集]发现一个好用的工具小程序，你也来试试",
      path: "/pages/index/index"
    }
  },
  onClick(e) {
    const path = e.target.dataset.path;
    wx.redirectTo({
      url: path,
    });
  },
  onFeedBackTap() {
    wx.redirectTo({
      url: '/pages/feedback/index',
    })
  },
  onIdeaTap() {
    wx.redirectTo({
      url: '/pages/idea/index',
    })
  }
})
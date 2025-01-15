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
    this.setData({
      items: app.globalData.items
    });
    // common.getItems(res => {
    //   console.log(res);
    //   // 有更新覆盖
    //   if(res.length !== this.data.items.length) {
    //     this.setData({
    //       items: res
    //     });
    //   }
    // });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 获取当前已经有的工具列表
    this.getItems();
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
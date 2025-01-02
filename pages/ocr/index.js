// pages/ocr/index.js
const common = require("../common/index");

Page({

  /**
   * 页面的初始数据
   */
  data: {
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    common.setTabBarTitle('太初OCR');
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  startScan() {
    common.chooseMedia({
      count: 1,
      mediaType: ["image"],
      cb: res => {
        const file = res.tempFiles[0].tempFilePath;
        wx.redirectTo({
          url: '/pages/ocr/detail/index?img=' + file,
        })
      },
      failCb: err => {
        console.log(err);
      }
    });
  }
})
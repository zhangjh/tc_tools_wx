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

  onShareAppMessage() {
    return {
      title: "[太初OCR]分享一个好用的免费OCR小程序，推荐你也来用",
      path: "/pages/ocr/index"
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareTimeline() {
    return {
      title: "[太初OCR]分享一个好用的免费OCR小程序",
      imageUrl: "/resources/ocr.png"
    };
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
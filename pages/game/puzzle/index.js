// pages/game/puzzle/index.js
const common = require("../../common/index");

Page({
  data: {
    tempImagePath: '',
  },

  chooseImage() {
    common.chooseMedia({
      count: 1,
      mediaType: ["image"],
      sourceType: ['album', 'camera'],
      cb: (res) => {
        this.setData({
          tempImagePath: res.tempFiles[0].tempFilePath
        });
      }
    });
  },

  startGame() {
    if (!this.data.tempImagePath) return;
    
    wx.navigateTo({
      url: `/pages/game/puzzle/game?imagePath=${this.data.tempImagePath}`
    });
  }
});
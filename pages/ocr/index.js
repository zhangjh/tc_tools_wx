// pages/ocr/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    originImg: "",
    // 识别进度
    percent: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  startScan() {
    wx.chooseMedia({
      count: 1,
      mediaType: "image",
      success: res => {
        const file = res.tempFiles[0].tempFilePath;
        wx.redirectTo({
          url: '/pages/ocr/detail/index?img=' + file,
        })
      },
      fail: err => {
        console.log(err);
      }
    });
  }
})
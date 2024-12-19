// pages/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    items: [{
      name: "科技狠活鉴定器",
      type: "tools",
      desc: "快速识别配料表中存在潜在健康风险的成分",
      logo: "https://unsplash.zhangjh.cn/logo.png",
      path: "/pages/composition/scan/index"
    }, {
      name: "太初识物",
      type: "tools",
      desc: "快速识别动植物、品牌等信息",
      logo: "/resources/recog.png",
      path: "/pages/recog/index",
    }, {
      name: "太初OCR",
      type: "tools",
      desc: "快速OCR提取文本",
      logo: "/resources/ocr.png",
      path: "/pages/ocr/index",
    }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // todo：获取当前已经有的工具列表
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
  onClick(e) {
    const path = e.target.dataset.path;
    console.log(path);
    wx.redirectTo({
      url: path,
    });
  }
})
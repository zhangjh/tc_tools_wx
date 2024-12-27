// pages/ocr/detail/index.js
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    originImg: "",
    percent: 0,
    ocrText: "",
    ocrContent: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const img = options.img;
    console.log(img);
    if(img) {
      // 识别场景
      this.setData({
        originImg: options.img,
        percent: 20
      });
      this.scanImg(img);
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  back2Scan() {
    wx.redirectTo({
      url: '/pages/ocr/index',
    });
  },
  scanImg(img) {
    let timer = setInterval(() => {
      if(this.data.percent == 90) {
        clearInterval(timer);
        return;
      }
      this.setData({
        percent: this.data.percent + 8
      });
    }, 1000);
    wx.uploadFile({
      filePath: img,
      name: 'file',
      formData: {
        // 转成recogAnimal形式
        type: "recogOcr"
      },
      header: {
        'content-type': 'multipart/form-data'
      },
      url: 'https://wx2.zhangjh.cn/wxChat/recog',
      success: res => {
        // console.log(res);
        const resJO = JSON.parse(res.data);
        if(resJO.success) {
          if(timer) {
            clearInterval(timer);
          }
          // console.log(resJO.data);
          const data = resJO.data;
          const text = JSON.parse(data).text;
          const ocrContent = app.towxml(text, "markdown");
          this.setData({
            percent: 100,
            ocrText: text,
            ocrContent
          });
        }
      },
      fail: err => {
        console.log(err);
      }
    });
  },

  onPreviewImg() {
    console.log("preview");
    wx.previewImage({
      urls: [this.data.originImg],
    })
  },
  onCopyClick() {
    console.log(this.data.ocrText);
    wx.setClipboardData({
      data: this.data.ocrText,
    });
  }
})
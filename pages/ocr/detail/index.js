// pages/ocr/detail/index.js
const app = getApp();
const common = require("../../common/index");
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
    common.uploadFile({
      filePath: img,
      formData: {
        // 转成recogAnimal形式
        type: "recogOcr"
      },
      url: '/wxChat/recog',
      cb: res => {
        // console.log(res);
        if(timer) {
          clearInterval(timer);
        }
        // console.log(resJO.data);
        const text = JSON.parse(res).text;
        const ocrContent = app.towxml(text, "markdown");
        this.setData({
          percent: 100,
          ocrText: text,
          ocrContent
        });
      },
      failCb: err => {
        console.log(err);
      }
    });
  },

  onPreviewImg() {
    common.imgPreview(this.data.originImg);
  },
  onCopyClick() {
    console.log(this.data.ocrText);
    wx.setClipboardData({
      data: this.data.ocrText,
    });
  }
})
const common = require("../../common/index");

// pages/detail/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    originImg: "",
    percent: 0,
    analysisContent: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // console.log(options);
    const img = options.img;
    if(img) {
      // 识别场景
      this.setData({
        originImg: options.img,
        percent: 10
      });
      this.scanImg(img);
    } else if(options.data) {
      // 分享场景
      const data = JSON.parse(options.data);
      this.setData({
        originImg: data.originImg,
        analysisContent: data.analysisContent,
        percent: 100
      });
    }
  },

  scanImg(img) {
    let timer = setInterval(() => {
      if(this.data.percent === 90) {
        clearInterval(timer);
        return;
      }
      this.setData({
        percent: this.data.percent + 5
      });
    }, 1000);
    common.uploadFile({
      filePath: img,
      url: '/composite/checkComposite',
      cb: res => {
        // console.log(res);
        const resJO = JSON.parse(res.data);
        if(resJO.success) {
          if(timer) {
            clearInterval(timer);
          }
          // console.log(resJO.data);
          this.setData({
            percent: 100,
            analysisContent: resJO.data
          });
        }
      },
      failCb: err => {
        console.log(err);
      }
    });
  },

  onPreviewImg() {
    common.imgPreview(this.data.originImg);
  },

  onDetailClick(e) {
    const key = e.target.dataset.key;
    const desc = e.target.dataset.desc;
    const score = e.target.dataset.score;
    if(key && desc) {
      wx.showModal({
        title: key,
        content: desc + "（" + score + " 分）",
        showCancel: false,
        complete: (res) => {
        }
      })
    }
  },

  onBackClick() {
    wx.redirectTo({
      url: '/pages/composition/scan/index',
    })
  },

  onShareTimeline() {
    return {
      title: "[科技狠活鉴定器]分享一个神奇小工具，你也来试试"
    };
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage(e) {
    const data = e.target.dataset;
    return {
      title: "看看我分析的这个配料表",
      path: "/pages/composition/detail/index?data=" + JSON.stringify(data)
    }
  }
})
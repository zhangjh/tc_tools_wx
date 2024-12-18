// pages/detail/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    originImg: "",
    percent: 100,
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
        percent: 20
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
      header: {
        'content-type': 'multipart/form-data'
      },
      url: 'https://tx.zhangjh.cn/composite/checkComposite',
      success: res => {
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
      fail: err => {
        console.log(err);
      }
    });
  },

  onPreviewImg() {
    wx.previewImage({
      urls: [this.data.originImg],
    })
  },

  onDetailClick(e) {
    const key = e.target.dataset.key;
    const desc = e.target.dataset.desc;
    if(key && desc) {
      wx.showModal({
        title: key,
        content: desc,
        showCancel: false,
        complete: (res) => {
        }
      })
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
      title: "[科技狠活鉴定器]分享一个神奇小工具，你也来试试"
    };
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    const data = e.target.dataset;
    return {
      title: "看看我分析的这个配料表",
      path: "/pages/detail/index?data=" + JSON.stringify(data)
    }
  }
})
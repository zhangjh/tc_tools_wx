// pages/recog/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 默认植物
    tabKey: "plant",
    // tab背景图
    bgClass: "bg-plant",
    // 识别原图
    originImg: "",
    // 识别进度
    percent: 0,
    // 识别内容
    content: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.setNavigationBarTitle({
      title: '太初识物'
    });    
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
  onTabChange(e) {
    // tab切换需要重置回初始状态
    console.log(e);
    const tabKey = e.detail.key;
    this.setData({
      tabKey: tabKey,
      bgClass: "bg-" + tabKey,
      originImg: "",
      percent: 0,
      content: []
    });
  },
  onPreviewImg() {
    wx.previewImage({
      urls: [this.data.originImg],
    });
  },
  startScan() {
    const tabKey = this.data.tabKey;
    wx.chooseMedia({
      count: 1,
      mediaType: ["image"],
      success: res => {
        const file = res.tempFiles[0].tempFilePath;
        // 选择图片后设置图片并设置进度20%
        this.setData({
          originImg: file,
          percent: 20,
          // 开始识别时去除背景图
          bgClass: ""
        });
        // 开始处理计时，并设置进度更新
        let timer = setInterval(() => {
          if(this.data.percent == 90) {
            clearInterval(timer);
            return;
          }
          this.setData({
            percent: this.data.percent + 5
          });
        }, 1000);
        const recogType = "recog" + tabKey.charAt(0).toUpperCase() + tabKey.slice(1);
        wx.uploadFile({
          filePath: file,
          name: 'file',
          formData: {
            // 转成recogAnimal形式
            type: recogType
          },
          header: {
            'content-type': 'multipart/form-data'
          },
          url: 'https://tx.zhangjh.cn/wxChat/recog',
          success: res => {
            console.log(res);
            const resJO = JSON.parse(res.data);
            if(resJO.success) {
              if(timer) {
                clearInterval(timer);
              }
              // console.log(resJO.data);
              this.setData({
                percent: 100,
                content: resJO.data ? resJO.data : "未识别到内容"
              });
            } else {
              console.log(resJO.errorMsg);
            }
          },
          fail: err => {
            console.log(err);
          }
        });
      },
      fail: err => {
        console.log(err);
      }
    });
  }
})
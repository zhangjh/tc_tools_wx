// pages/recog/index.js
const common = require("../common/index");
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
    common.setTabBarTitle('太初识物');
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
    common.previewImage(this.data.originImg);
  },
  startScan() {
    const tabKey = this.data.tabKey;
    common.chooseMedia({
      count: 1,
      mediaType: ["image"],
      cb: res => {
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
        common.uploadFile({
          filePath: file,
          formData: {
            // 转成recogAnimal形式
            type: recogType
          },
          url: '/wxChat/recog',
          cb: res => {
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
          failCb: err => {
            console.log(err);
          }
        });
      },
    });
  }
})
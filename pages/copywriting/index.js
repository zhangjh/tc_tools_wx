// pages/copywriting/index.js
const common = require("../common/index");
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    visible: false,
    options: ['小红书','抖音','朋友圈','微博'],
    selectedPlatform: '小红书',
    material: {
      image: '',
      topic: '',
      keywords: ''
    },
    uploading: undefined,
    formData: {
      'bucket': 'copywriting'
    },
    previewImg: '',
    resultShow: false,
    resultContent: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    common.setTabBarTitle('文案精灵');
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: "发现一个高质量小红书文案生成器，推荐你也来用",
      path: "/pages/copywriting/index"
    }
  },
  onShareTimeline() {
    return {
      title: "发现一个高质量小红书文案生成器，快来试一试",
      query: "",
      imageUrl: "/resources/copywriting.png"
    };
  },
  onUpload(e) {
    console.log(e);
    common.chooseMedia({
      count: 1,
      mediaType: ["image"],
      cb: res => {
        console.log(res);
        const tmpFilePath = res.tempFiles[0].tempFilePath;
        this.setData({
          previewImg: tmpFilePath,
          uploading: true,
        });
        console.log(this.data.previewImg);
        const arr = tmpFilePath.split('/');
        // 上传素材获取链接
        common.uploadFile({
          filePath: tmpFilePath,
          url: '/storage/putObject',
          formData: {
            bucket: 'zhangjh',
            ossKey: 'copywriting/' + arr[arr.length - 1]
          },
          cb: res => {
            console.log(res);
            const resJO = JSON.parse(res.data);
            if(!resJO.success) {
              this.setData({
                uploading: false
              });
              return wx.showToast({
                title: resJO.errorMsg,
                icon: 'error'
              })
            }
            let material = this.data.material;
            material.image = resJO.data;
            console.log(material.image);
            this.setData({
              material,
              uploading: false
            });
          }
        });
      }
    });
  },
  onShowSelect() {
    this.setData({
      visible: true
    });
  },
  onPlatformChange(e) {
    this.setData({
      selectedPlatform: e.detail.value,
      visible: false
    });
  },
  onPlatformCancel(e) {
    this.setData({
      visible: false
    });
  },
  onTopicChange(e) {
    console.log(e.detail.value);
    let material = this.data.material;
    material.topic = e.detail.value;
    this.setData({
      material
    });
  },
  onKeywordChange(e) {
    console.log(e.detail.value);
    let keywords = e.detail.value;
    let material = this.data.material;
    material.keywords = keywords.replaceAll("，", ",");
    this.setData({
      material
    });
  },
  onGenerate() {
    const material = this.data.material;
    if(!material.image) {
      const uploading = this.data.uploading;
      if(!uploading) {
        return wx.showToast({
          title: '请先上传素材',
          icon: 'error'
        });
      }
      if(uploading) {
        return wx.showToast({
          title: '素材还在上传中',
          icon: 'loading'
        });
      }
    }
    wx.showLoading({
      title: '生成中，请稍等...',
    });
    console.log(this.data.material);
    common.wxRequest({
      url: '/wxChat/xhs',
      method: 'POST',
      data: {
        file: this.data.material.image,
        keyword: this.data.material.keywords,
        topic: this.data.material.topic,
        platform: this.data.selectedPlatform,
        bucket: 'zhangjh'
      },
      cb: res => {
        wx.hideLoading();
        console.log(res);
        let resultContent = res;
        resultContent.adviceMd = app.towxml(res.advice, "markdown");
        this.setData({
          resultShow: true,
          resultContent
        });
      },
      failCb: err => {
        wx.hideLoading();
      }
    });   
  },
  onCopy(e) {
    const text = e.currentTarget.dataset.text;
    wx.setClipboardData({
      data: text
    });
  }
})
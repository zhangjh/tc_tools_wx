// pages/feedback/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sceneName: '',
    question: '',
    uploadedImg: '',
    uploadedImgUrl: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.setNavigationBarTitle({
      title: '问题反馈',
    });
    const scene = options.scene;
    console.log(scene);
    const mapping = {
      'composition': '科技狠活鉴定器',
      'recog': '太初识物',
      'ocr': '太初OCR',
      'voice': '助眠白噪声'
    };
    this.setData({
      sceneName: mapping[scene]
    });
  },
  onTextChange(e) {
    if(e.detail.value) {
      this.setData({
        question: e.detail.value
      });
    }
  },
  uploadImg() {
    this.setData({
      uploadedImg: '',
      uploadedImgUrl: '',
    });
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album'],
      success: res => {
        const file = res.tempFiles[0];
        const filePath = file.tempFilePath;
        this.setData({
          uploadedImg: filePath
        });
        wx.uploadFile({
          filePath: filePath,
          name: 'file',
          header: {
            'content-type': 'multipart/form-data'
          },
          url: 'https://tx.zhangjh.cn/feedback/uploadFile',
          success: res => {
            const resJO = JSON.parse(res.data);
            if(resJO.success) {
              this.setData({
                uploadedImgUrl: resJO.data
              });
            }
          },
          fail: err => {
            console.log(err);
          }
        });
      },
    });
  },
  onSubmit() {
    // todo: 收集用户id
    if(!this.data.question) {
      return wx.showToast({
        title: '未填写问题描述',
        mask: true
      });
    }
    wx.showLoading({
      title: 'loading...',
      mask: true,
    });
    wx.request({
      url: 'https://tx.zhangjh.cn/feedback/feedback',
      method: 'POST',
      data: {
        question: this.data.question,
        file: this.data.uploadedImgUrl
      },
      success: res => {
        wx.hideLoading();
        const data = res.data;
        if(data.success) {
          wx.showToast({
            title: '问题提交成功',
            mask: true,
          });
        } else {
          wx.showToast({
            title: '问题提交失败',
            mask: true,
            icon: 'error'
          })
        }
      },
      fail: err => {
        wx.showToast({
          title: '问题提交失败',
        })
      }
    })
  }
})
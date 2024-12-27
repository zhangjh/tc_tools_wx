// pages/feedback/index.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    visible: false,
    options: [],
    selectedToolName: '请选择',
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
    let itemNames = [];
    for(let item of app.globalData.items) {
      itemNames.push(item.name);
    }
    this.setData({
      options: itemNames
    });
  },
  onShowSelect() {
    console.log("showSelect");
    this.setData({
      visible: true
    });
  },
  onConfirm(e) {
    if(e.detail.value) {
      this.setData({
        selectedToolName: e.detail.value,
        visible: false
      });
    }
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
          url: 'https://wx2.zhangjh.cn/feedback/uploadFile',
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
    const userId = app.globalData.userInfo.userId;
    if(!this.data.selectedToolName) {
      return wx.showToast({
        title: '未选择工具',
        icon: 'error',
        mask: true
      });
    }
    if(!this.data.question) {
      return wx.showToast({
        title: '未填写问题描述',
        icon: 'error',
        mask: true
      });
    }
    wx.showLoading({
      title: 'loading...',
      mask: true,
    });
    wx.request({
      url: 'https://wx2.zhangjh.cn/feedback/feedback',
      method: 'POST',
      data: {
        userId,
        tool: this.data.selectedToolName,
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
// pages/feedback/index.js
const app = getApp();
const common = require("../common/index");

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
    common.setTabBarTitle('问题反馈');
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
        common.uploadFile({
          filePath,
          url: '/feedback/uploadFile',
          cb: res => {
            this.setData({
              uploadedImgUrl: res
            });
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
    common.wxRequest({
      url: '/feedback/feedback',
      method: 'POST',
      data: {
        userId,
        tool: this.data.selectedToolName,
        question: this.data.question,
        file: this.data.uploadedImgUrl
      },
      cb: res => {
        wx.hideLoading();
        wx.showToast({
          title: '问题提交成功',
          mask: true,
        });
      },
      failCb: err => {
        console.log(err);
      }
    });
  }
})
const common = require("../common/index");

Page({
  data: {

  },

  onLoad(options) {
    common.setTabBarTitle('简历优化大师');
  },

  onUpload() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['pdf'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].path;
        this.analyzeResume(tempFilePath);
      },
      fail: (err) => {
        wx.showToast({
          title: '选择文件失败',
          icon: 'none'
        });
      }
    });
  },

  analyzeResume(filePath) {
    console.log(filePath);
    wx.showLoading({
      title: '正在分析简历...',
    });
    const fs = wx.getFileSystemManager();
    // 上传r2
    common.uploadFile({
      filePath,
      url: 'http://localhost:3001/storage/putObject',
      formData: { bucket: 'resume' },
      cb: res => {
        console.log(res);
        const resJO = JSON.parse(res.data);
        if(resJO.success) {
          common.wxRequest({
            url: 'http://localhost:3001/wxChat/resume',
            method: 'POST',
            data: {
              file: resJO.data,
              mimeType: 'application/pdf'
            },
            cb: res => {
              console.log(res);
              wx.hideLoading();
              wx.redirectTo({
                url: '/pages/resume/detail?data=' + JSON.stringify(res),
              });
            },
            failCb: err => {
              console.log(err);
            }
          });
        } else {
          wx.showToast({
            title: resJO.errorMsg,
            icon: 'error'
          })
        }
      },
      failCb: err => {
        console.log(err);
      }
    });
  }
});
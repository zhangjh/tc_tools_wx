const common = require("../common/index");
const app = getApp();

Page({
  data: {
    indexShow: true,
    resumeDetail: {
      score: 0,
      // 少于80红色，否则绿色
      circleColor: '',
      guidanceMd: '',
      auditMd: '',
      adviceMd: '',
      updated: '',
      updatedMd: '',
      actions: [ {
        type: 'primary',
        text: '下载',
      }]
    }
  },

  onLoad(options) {
    common.setTabBarTitle('简历优化大师');
  },
  onShareAppMessage() {
    return {
      title: "[简历优化大师]发现一个简历优化神器，推荐你也来用",
      path: "/pages/resume/index"
    }
  },
  onShareTimeline() {
    return {
      title: "发现一个简历分析优化神器，快来试一试",
      query: "",
      imageUrl: "/resources/resume.png"
    };
  },

  onUpload() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['pdf','docx'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].path;
        const fileName = res.tempFiles[0].name;
        this.setData({
          uploadFileName: fileName
        });
        this.analyzeResume(tempFilePath);
      },
      fail: (err) => {
        console.log(err);
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
      title: '正在上传简历...',
    });
    // 上传r2
    common.uploadFile({
      filePath,
      url: '/storage/putObject',
      formData: { bucket: 'resume' },
      cb: res => {
        console.log(res);
        wx.hideLoading();
        const resJO = JSON.parse(res.data);
        if(resJO.success) {
          wx.showLoading({
            title: '正在分析简历, 可能需要1分钟...',
          })
          common.wxRequest({
            url: '/wxChat/resume',
            method: 'POST',
            data: {
              file: resJO.data,
              mimeType: 'application/pdf',
              // fileName使用ossKey
              fileName: resJO.data
            },
            cb: res => {
              console.log(res);
              wx.hideLoading();
              // 展示简历内页，隐藏入口页
              let circleColor = '#ef473a';
              if(parseInt(res.score) >= 80) {
                circleColor = '#33cd5f'
              }
              let adviceMd = '';
              if(res.advice) {
                adviceMd = app.towxml(res.advice, "markdown");
              }
              let auditMd = '';
              if(res.audit) {
                auditMd = app.towxml(res.audit, "markdown");
              }
              let guidanceMd = '';
              if(res.guidance) {
                guidanceMd = app.towxml(res.guidance, "markdown");
              }
              let updatedMd = '';
              if(res.updated) {
                updatedMd = app.towxml(res.updated, "markdown");
              }
              let actions = this.data.resumeDetail.actions;
              this.setData({
                indexShow: false,
                resumeDetail: {
                  score: res.score,
                  circleColor,
                  guidanceMd,
                  auditMd,
                  adviceMd,
                  updated: res.updated,
                  updatedMd,
                  actions
                }
              });
            },
            failCb: err => {
              console.log(err);
            }
          });
        } else {
          wx.hideLoading();
          wx.showToast({
            title: resJO.errorMsg,
            icon: 'error'
          })
        }
      },
      failCb: err => {
        console.log(err);
        wx.hideLoading();
      }
    });
  },
  // 下载依赖服务器
  onDownload(e) {
    console.log(e);
    wx.showLoading({
      title: '下载中,请稍等...',
    });
    if(this.data.resumeDetail.updated) {
      common.wxRequest({
        url: 'https://tx.zhangjh.cn/wxChat/md2pdf',
        method: 'POST',
        data: {
          md: this.data.resumeDetail.updated,
          fileName: this.data.uploadFileName
        },
        cb: res => {
          wx.hideLoading();
          console.log(res);
          if(res) {
            common.downloadFile({
              url: res,
              fileName: this.data.uploadFileName,
              extension: "pdf"
            });
          }
        },
        failCb: err => {
          console.log(err);
          wx.hideLoading();
        }
      });
    }  
  },
});
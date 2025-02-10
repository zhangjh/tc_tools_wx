const debug = false;
const domain = debug ? "http://localhost:3001" : "https://tx.zhangjh.cn";

const objectEmpty = function (object) {
  if(!object) {
    return true;
  }
  return Object.keys(object).length === 0;
}
const startRecording = function () {
  const recorderManager = wx.getRecorderManager();
  recorderManager.onStart(() => {
    console.log('recorder start');
  });
  recorderManager.onError((res) => {
    console.error('recorder error:', res);
  });
  // 录音配置
  const options = {
    duration: 60000,  // 最长录音时间（毫秒）
    sampleRate: 16000,  // 采样率
    numberOfChannels: 1,  // 录音通道数
    encodeBitRate: 96000,  // 编码码率
    format: 'wav'  // 音频格式
  };
  recorderManager.start(options);
}
// 请求录音权限
const requestRecordPermission = function() {
  wx.authorize({
    scope: 'scope.record',
    success: () => {
      startRecording();
    },
    fail: () => {
      wx.showModal({
        title: '用户未授权',
        content: '录音功能需要授权才能使用，请在设置中打开授权',
        showCancel: false,
        success: modalRes => {
          if (modalRes.confirm) {
            wx.openSetting();
          }
        }
      });
    }
  });
}

module.exports = {
  config: {
    r2Domain: "https://r2.zhangjh.cn",
    unsplashDomain: "https://unsplash.zhangjh.cn/",
  },
  objectEmpty,
  requestRecordPermission,
  wxRequest: (req) => {
    let url = req.url;
    if(!url.startsWith('http')) {
      url = domain + url;
    }
    if(!req.method) {
      req.method = 'GET';
    }
    if(!req.header) {
      req.header = {
        'content-type': 'application/json'
      };
    }
    return wx.request({
      url,
      data: req.data,
      method: req.method,
      enableChunked: !!req.enableChunked,
      timeout: req.timeout ? req.timeout : 60000,
      responseType: req.responseType ? req.responseType : 'text',
      complete: req.completeCb,
      success: ret => {
        // ret.data为空（流式响应）或者对应success为true
        if(ret.statusCode === 200) {
          if(req.cb) {
            if(!ret.data) {
              req.cb();
            } else if(ret.data.success) {
              req.cb(ret.data.data);
            }
          }
        } else {
          console.log(ret.data.errorMsg);
          if(req.failCb) {
            req.failCb(ret.data.errorMsg);
          }
          wx.showToast({
            title: '请求错误',
            icon: 'error'
          })
        }
      },
      fail: err => {
        if(req.failCb) {
          req.failCb(err)
        }
        wx.showToast({
          title: '网络好像有点问题?',
          icon: 'error'
        })
      }
    })
  },
  getItems: (cb) => {
    wx.request({
      url: domain + '/wx/getToolItems',
      success: ret => {
        if(ret.statusCode === 200 && ret.data.success) {
          cb(ret.data.data);
        }
      },
      fail: err => {
        wx.showToast({
          title: '获取列表出错',
          icon: 'error'
        });
      }
    });
  },
  imgPreview: (url) => {
    wx.previewImage({
      urls: [url],
    })
  },
  setTabBarTitle: (title) => {
    wx.setNavigationBarTitle({
      title,
    })
  },
  chooseMedia: (req) => {
    const count = req.count;
    const mediaType = req.mediaType;
    const sourceType = req.sourceType;
    let data = {
      count, 
      mediaType,
    };
    if(sourceType) {
      data.sourceType = sourceType;
    }
    data.success = res => {
      if(req.cb) {
        req.cb(res);
      }
    }
    data.fail = (err) => {
      if(req.failCb) {
        console.log(err);
        req.failCb(err);
      }
    }
    wx.chooseMedia(data);
  },
  uploadFile: (req) => {
    const filePath = req.filePath;
    let url = req.url;
    if(!filePath || !url) {
      console.log("参数缺失");
      return;
    }
    if(!url.startsWith('http')) {
      url = domain + url;
    }
    wx.uploadFile({
      filePath,
      name: req.name || 'file',
      url,
      header: {
        'content-type': 'multipart/form-data'
      },
      formData: req.formData,
      success: ret => {
        if(ret.statusCode === 200) {
          if(req.cb) {
            if(!ret.data) {
              return req.cb();
            } 
            const retData = JSON.parse(ret.data);
            if(retData.success) {
              req.cb(retData.data);
            } else {
              if(req.failCb) {
                req.failCb(retData.errorMsg);
              }
              wx.showToast({
                title: '请求失败',
                icon: 'error'
              })
            }
          }
        } else {
          console.log(ret.data.errorMsg);
          if(req.failCb) {
            req.failCb(ret.data.errorMsg);
          }
          wx.showToast({
            title: '请求错误',
            icon: 'error'
          })
        }
      },
      fail: err => {
        console.log(err);
        if(req.failCb) {
          req.failCb(err);
        }
        wx.showToast({
          title: '上传失败',
          icon: 'error'
        });
      }
    })
  },
  downloadFile: (req) => {
    const downloadFileUrl = req.url;
    const downloadFileName = req.fileName;
    const extension = req.extension;
    wx.showToast({
      title: '请在下载完成后的预览页面点击右上角自行保存',
    });
    wx.downloadFile({
      url: downloadFileUrl,
      success: ret => {
        const fileManager = wx.getFileSystemManager();
        fileManager.saveFile({
          tempFilePath: ret.tempFilePath,
          filePath: wx.env.USER_DATA_PATH + "/" + downloadFileName + "." + extension,
          success: saveRes => {
            wx.showToast({
              title: '下载成功',
            });
            wx.openDocument({
              filePath: saveRes.savedFilePath,
              showMenu: true,
              fileType: extension
            });
          },
          fail: saveErr => {
            console.error(saveErr);
            wx.showToast({
              title: '文件存储失败',
              icon: 'error'
            });
          }
        });
      },
      fail: err => {
        console.log(err);
        wx.showToast({
          title: '文件下载失败',
          icon: 'error'
        });
      }
    });
  }
};
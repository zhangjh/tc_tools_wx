const debug = false;
const domain = debug ? "http://localhost:3001" : "https://wx2.zhangjh.cn";

module.exports = {
  config: {
    r2Domain: "https://r2.zhangjh.cn",
  },
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
      name: 'file',
      url,
      header: {
        'content-type': 'multipart/form-data'
      },
      formData: req.formData,
      success: res => {
        if(req.cb) {
          req.cb(res);
        }
      },
      fail: err => {
        if(req.failCb) {
          req.failCb(err);
        }
        wx.showToast({
          title: '上传失败',
          icon: 'error'
        });
      }
    })
  }
};
const debug = false;
const domain = debug ? "http://localhost:3001" : "https://wx2.zhangjh.cn/";

module.exports = {
  config: {
    
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
    wx.request({
      url,
      data: req.data,
      method: req.method,
      timeout: req.timeout ? req.timeout : 60000,
      complete: req.completeCb,
      success: ret => {
        if(ret.statusCode === 200 && ret.data.success) {
          if(req.cb) {
            ret.cb(ret.data.data);
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
  getItems: () => {
    wx.request({
      url: this.constans.domain + '/wx/getToolItems',
      success: ret => {
        if(ret.statusCode === 200 && ret.data.success) {
          app.globalData.items = ret.data.data;
          this.setData({
            items: ret.data.data
          });
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
    wx.chooseMedia({
      camera: camera,
      count,
      mediaType,
      sourceType,
      success: (res) => {
        if(req.cb) {
          req.cb(res);
        }
      },
      fail: (err) => {
        if(req.failCb) {
          console.log(err);
          req.failCb(err);
        }
      },
    })
  },
  
};
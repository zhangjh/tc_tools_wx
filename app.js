// app.js
App({
  towxml:require('./towxml/index'),
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        wx.request({
          url: 'https://wx.zhangjh.cn/wx/getOpenId?productType=TC_TOOL&jsCode=' + res.code,
          success: ret => {
            if(ret.statusCode === 200 && ret.data.success) {
              const data = ret.data.data;
              const openId = data.openId;
              this.globalData.userInfo.userId = openId;
            }
          },
          fail: err => {
            console.log("getOpenId err:" + err);
          }
        });
      }
    });
  },
  globalData: {
    userInfo: {},
    items: []
  },
})

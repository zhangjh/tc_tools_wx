// app.js
App({
  towxml: require('./towxml/index'),
  // 代存公用逻辑对应的调用页面实例
  page: null,
  onLaunch() {
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

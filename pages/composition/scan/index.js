// index.js
const common = require("../../common/index");

Page({
  data: {
    img: common.config.unsplashDomain + Math.ceil(Math.random() * 3) + ".jpg",
  },
  onLoad(options) {
    common.setTabBarTitle('科技狠活鉴定器');
  },
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
  startScan() {
    console.log("scan");
    common.chooseMedia({
      count: 1,
      mediaType: ["image"],
      cb: res => {
        const file = res.tempFiles[0].tempFilePath;
        wx.redirectTo({
          url: '/pages/composition/detail/index?img=' + file,
        })
      },
      failCb: err => {
        console.log(err);
      }
    });
  },
})

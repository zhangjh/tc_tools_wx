// index.js
Page({
  data: {
    img: "/resources/unsplash/" + Math.ceil(Math.random() * 3) + ".jpg",
  },
  onLoad(options) {
    wx.setNavigationBarTitle({
      title: '科技与狠活鉴定器'
    })
  },
  onReady: {

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
    wx.chooseMedia({
      count: 1,
      mediaType: "image",
      success: res => {
        const file = res.tempFiles[0].tempFilePath;
        wx.redirectTo({
          url: '/pages/composition/detail/index?img=' + file,
        })
      },
      fail: err => {
        console.log(err);
      }
    });
  },
  onShareTimeline() {
    return {
      title: "[科技狠活鉴定器]分享一个神奇小工具，你也来试试"
    };
  },
})

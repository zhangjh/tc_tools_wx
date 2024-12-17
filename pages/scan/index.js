// index.js
Page({
  data: {
    img: "../../resources/1.jpg",
    // + Math.ceil(Math.random() * 30) + ".jpg",
  },
  onReady: {

  },
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
  onProgress(e) {
    console.log(e);
  },
  onChange(e) {
    console.log(e);
  },
  onFail(e) {
    console.log('onFail', e)
  },
  onSuccess(e) {
    console.log("scan");
    console.log(e);
  },
  startScan() {
    console.log("scan");
    wx.chooseMedia({
      count: 1,
      mediaType: "image",
      success: res => {
        console.log(res);
        const file = res.tempFiles[0].tempFilePath;
        console.log(file);
        wx.redirectTo({
          url: '/pages/detail/index?img=' + file,
        })
      },
      fail: err => {
        console.log(err);
      }
    });
  }
})

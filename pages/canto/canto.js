module.exports = {
  cantoDomain: "https://wx.zhangjh.cn/",
  tabItems: [{
    key: 'lyric',
    title: '歌词',
    ico: '/pages/canto/resources/lyric.png',
    ico_selected: '/pages/canto/resources/lyric_selected.png'
  }, {
    key: 'practice',
    title: '练习',
    ico: '/pages/canto/resources/practice.png',
    ico_selected: '/pages/canto/resources/practice_selected.png'
  }, {
    key: 'user',
    title: '我的',
    ico: '/pages/canto/resources/user.png',
    ico_selected: '/pages/canto/resources/user_selected.png'
  }],
  onTabChange(e) {
    const tabKey = e.detail.key;
    console.log(tabKey);
    let url = "";
    switch (tabKey) {
      case 'lyric':
        url = "/pages/canto/lyric/index";
        break;
      case 'practice':
        url = "/pages/canto/practice/index"
        break;
      case 'user':
        url = "/pages/canto/user/index"
        break;
    }
    if(url) {
      wx.redirectTo({ url });
    }    
  },
};
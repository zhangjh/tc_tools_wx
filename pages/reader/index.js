Page({
  data: {
    searchQuery: '' // 搜索关键词
  },

  onShareAppMessage() {
    return {
      title: "[智阅找书]推荐一个电子书查找小程序，快来试试你要找的书",
      path: "/pages/reader/index"
    }
  },
  onShareTimeline() {
    return {
      title: "[智阅找书]推荐一个电子书查找小程序，快来试试你要找的书",
      query: "",
      imageUrl: "/resources/reader.ico"
    };
  },

  onInput(e) {
    this.setData({
      searchQuery: e.detail.value
    });
  },

  onSearch() {
    const query = this.data.searchQuery.trim();
    if (!query) {
      wx.showToast({
        title: '请输入关键词',
        icon: 'none'
      });
      return;
    }
    // 跳转到结果页，传递搜索关键词
    wx.navigateTo({
      url: `/pages/reader/result?query=${query}`
    });
  }
});
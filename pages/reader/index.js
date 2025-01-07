Page({
  data: {
    searchQuery: '' // 搜索关键词
  },

  onInput(e) {
    this.setData({
      searchQuery: e.detail.value
    });
  },

  onSearch() {
    console.log("search");
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
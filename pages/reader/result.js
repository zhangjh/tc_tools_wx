const common = require("../common/index");

Page({
  data: {
    searchQuery: '',   // 搜索关键词
    bookList: [],      // 当前页的书籍数据列表  
    hasMore: true, 
    page: 1,
    limit: 5
  },

  onLoad(options) {
    // 获取传递的关键词
    const query = options.query || '';
    this.setData({ searchQuery: query });

    // 开始搜索
    this.searchBooks();
  },

  onReachBottom() {
    if(!this.data.hasMore) {
      wx.showToast({
        title: '没有更多了...'
      });
      return;
    }
    this.setData({
      page: this.data.page + 1
    });
    this.searchBooks();
  },
  onShareAppMessage() {
    return {
      title: "[太初工具集]发现一个电子书查找小程序，你也来试试",
      path: "/pages/reader/index"
    }
  },

  searchBooks() {
    wx.showLoading({
      title: '搜索中，请稍等...',
    });
    common.wxRequest({
      url: `/books/search?page=${this.data.page}&limit=${this.data.limit}&keyword=` + encodeURIComponent(this.data.searchQuery),
      cb: res => {
        wx.hideLoading();
        if(!res || !res.length) {
          this.setData({
            hasMore: false
          });
          return;
        }
        let bookList = this.data.bookList;
        res.map(item => {
          bookList.push(item);
        });
        this.setData({
          bookList
        });
      },
      failCb: err => {
        console.log(err);
        wx.hideLoading();
      }
    });
  },
  onDownload(e) {
    const bookid = e.currentTarget.dataset.id;
    const hash = e.currentTarget.dataset.hash;
    const name = e.currentTarget.dataset.name;
    const extension = e.currentTarget.dataset.extension;
    wx.showLoading({
      title: '文件下载中',
    });
    common.wxRequest({
      url: '/books/download',
      method: 'POST',
      data: {
        bookId: bookid,
        hashId: hash
      },
      cb: res => {
        common.downloadFile({
          url: res,
          fileName: name,
          extension
        });   
      },
      failCb: err => {
        wx.hideLoading();
        console.log(err);
      }
    });
  }
});
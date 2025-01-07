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

  searchBooks() {
    common.wxRequest({
      url: `/books/search?page=${this.data.page}&limit=${this.data.limit}&keyword=` + encodeURIComponent(this.data.searchQuery),
      cb: res => {
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
      }
    });
  },
  onDownload(e) {
    const bookid = e.currentTarget.dataset.id;
    const hash = e.currentTarget.dataset.hash;
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
        wx.downloadFile({
          url: res,
          success: ret => {
            wx.hideLoading();
            const fileManager = wx.getFileSystemManager();
            fileManager.saveFile({
              tempFilePath: ret.tempFilePath,
              success: saveRes => {
                console.log(saveRes.savedFilePath);
                wx.showToast({
                  title: '下载成功',
                });
              },
              fail: saveErr => {
                console.error(saveErr);
                wx.hideLoading();
                wx.showToast({
                  title: '文件存储失败',
                  icon: 'error'
                });
              }
            });
          },
          fail: err => {
            console.log(err);
            wx.showToast({
              title: '文件下载失败',
              icon: 'error'
            });
          }
        })       
      },
      failCb: err => {
        wx.hideLoading();
        console.log(err);
      }
    });
  }
});
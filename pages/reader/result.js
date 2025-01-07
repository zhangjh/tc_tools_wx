const common = require("../common/index");

Page({
  data: {
    searchQuery: '',   // 搜索关键词
    bookList: [],      // 当前页的书籍数据列表   
    page: 1,
    limit: 5
  },

  onLoad(options) {
    // 获取传递的关键词
    const query = options.query || '';
    this.setData({ searchQuery: query });

    // 开始搜索
    this.searchBooks(query);
  },

  searchBooks(query) {
    common.wxRequest({
      url: `/books/search?page=${this.data.page}&limit=${this.data.limit}&keyword=` + encodeURIComponent(query),
      cb: res => {
        console.log(res);
        this.setData({
          bookList: res
        });
      },
      failCb: err => {
        console.log(err);
      }
    });
  },
  onDownload(e) {
    console.log(e);
    const bookid = e.currentTarget.dataset.id;
    const hash = e.currentTarget.dataset.hash;
    console.log("bookid:" + bookid);
    console.log("hash:" + hash);
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
            console.log(ret.tempFilePath);
            const fileManager = wx.getFileSystemManager();
            fileManager.saveFile(ret.tempFilePath);
            wx.showToast({
              title: '文件存储在:' + ret.tempFilePath,
            });
          },
          fail: err => {
            wx.showToast({
              title: '文件存储失败',
              icon: 'error'
            });
          }
        })       
      },
      failCb: err => {
        console.log(err);
      }
    });
  }
});
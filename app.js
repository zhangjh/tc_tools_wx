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
            if (ret.statusCode === 200 && ret.data.success) {
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
    items: [
      {
        "name": "科技狠活鉴定器",
        "type": "tools",
        "desc": "快速识别配料表中存在潜在健康风险的成分",
        "logo": "/resources/composition.png",
        "path": "/pages/composition/scan/index"
      },
      {
        "name": "太初识物",
        "type": "tools",
        "desc": "快速识别动植物、品牌等信息",
        "logo": "/resources/recog.png",
        "path": "/pages/recog/index"
      },
      {
        "name": "智阅找书",
        "type": "tools",
        "desc": "书籍是人类进步的阶梯，电子书搜索下载",
        "logo": "https://r2.zhangjh.cn/logo/reader.ico",
        "path": "/pages/reader/index"
      }, 
      {
        "name": "粤歌速成",
        "type": "tools",
        "desc": "粤语歌曲速成辅助练习工具，AI发音、跟读、智能评判",
        "logo": "https://r2.zhangjh.cn/logo/canto.png",
        "path": "/pages/canto/lyric/index"
      },
      {
        "name": "太初OCR",
        "type": "tools",
        "desc": "快速OCR识别，从图片中提取文本，支持一键复制",
        "logo": "/resources/ocr.png",
        "path": "/pages/ocr/index"
      },
      {
        "name": "助眠白噪声",
        "type": "tools",
        "desc": "多种不同类型白噪声，助您缓解压力、快速入眠",
        "logo": "/resources/voice.png",
        "path": "/pages/voice/index"
      },
    ]
  },
})

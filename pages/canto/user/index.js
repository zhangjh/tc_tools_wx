// pages/user/index.js
const common = require("../../common/index");
const canto = require("../canto");

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    activeKey: 'user',
    tabItems: canto.tabItems,
    userInfo: {
      avatar: "https://wx4.sinaimg.cn/bmiddle/62d95157ly1hb6xrvxwc8j203l03kwee.jpg",
      userId: "",
      nickName: "",
    },
    practiceds: [],
    curPageIndex: 1,
    visible: {
      prev: false,
      next: true,
    },
    isVoiceRoleFolded: true,
    voiceRoles: [{
      // 0:男声，1:女声
      value: 0,
      name: "云松",
      label: "男声语音",
      color: "dark",
      thumb: "/pages/canto/resources/male.png"
    },{
      value: 1,
      name: "晓晓",
      label: "女声语音",
      color: "dark",
      thumb: "/pages/canto/resources/female.png"
    }],
    // 默认生效是男声
    activeVoiceRole: 0,
    showPersonalQcode: false,
    personalQcodeImg: "https://wx4.sinaimg.cn/bmiddle/62d95157ly1hc2v07cwsoj20qe100mzg.jpg",
    activeQrcode: '',
    activeShow: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    common.setTabBarTitle("粤语歌曲速成");
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    const userId = app.globalData.userInfo.userId;
    this.data.userInfo.userId = userId;
    this.data.userInfo.nickName = userId;
    // 获取存储在storage里的生效发音人
    const activeVoiceRole = wx.getStorageSync("activeVoiceRole");
    this.setData({
      userInfo: this.data.userInfo,
      activeVoiceRole: activeVoiceRole ? activeVoiceRole : 0
    });
    this.getPracticed();
    console.log(this.data.voiceRoles);
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },
  onTabChange(e) {
    canto.onTabChange(e);
  },

  onChangeVoiceRole(e) {
    wx.setStorageSync('activeVoiceRole', e.detail.value);
    this.setData({
      activeVoiceRole: e.detail.value
    });
  },

  // 获取跟练记录
  getPracticed() {
    const userId = app.globalData.userInfo.userId;
    common.wxRequest({
      url: canto.cantoDomain + "/canto/lyric/getPracticed?userId=" + userId + "&pageIndex=" + this.data.curPageIndex,
      cb: ret => {
        console.log(ret);
        let practiceds = [];
        for (let practiced of ret) {
          const temp = {
            coverImg: practiced.cover,
            songId: practiced.id,
            songSummary: practiced.singer + "-" + practiced.songName
          };
          practiceds.push(temp);
        }
        console.log(practiceds);
        if(common.objectEmpty(practiceds)) {
          this.data.visible.next = false;
        }
        this.setData({
          visible: this.data.visible,
          practiceds
        });
      }
    });
  },
  openWx() {
    this.setData({
      showPersonalQcode: true
    });
  },

  goPrev(){
    let curPageIndex = this.data.curPageIndex;
    if(curPageIndex > 1) {
      curPageIndex = curPageIndex - 1;
      if(curPageIndex == 1) {
        this.data.visible.prev = false;
        if(!common.objectEmpty(this.data.practiceds)) {
          this.data.visible.next = true;
        }
      }
      this.setData({
        visible: this.data.visible,
        curPageIndex: curPageIndex
      });
      this.getPracticed();
    }
  },
  goNext(){
    let curPageIndex = this.data.curPageIndex;
    curPageIndex = curPageIndex + 1;
    this.data.visible.prev = true;
    this.setData({
      visible: this.data.visible,
        curPageIndex: curPageIndex
    });
    this.getPracticed();
  },

  bindImage() {
    this.setData({
      showPersonalQcode: false
    });
  },
  showQrcode(e) {
    const qrcode = e.target.dataset.qrcode;
    if(qrcode) {
      this.setData({
        activeQrcode: qrcode,
        activeShow: true
      });
    }
  },
  closeQrcode() {
    this.setData({
      activeShow: false
    });
  }
})
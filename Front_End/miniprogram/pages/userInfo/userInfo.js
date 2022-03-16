// index.js
// 获取应用实例
const app = getApp()


Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName'), 
    userName: app.globalData.userName,
    institute: app.globalData.institute,
    ID: app.globalData.ID,
    dep:app.globalData.dep,
    major:app.globalData.major,
    flag:app.globalData.identity
  },
  // 事件处理函数
  // bindViewTap() {
  //   wx.navigateTo({
  //     url: '../logs/logs'
  //   })
  // },
  onLoad() {
    console.log(this.data.flag)
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
  },
  getUserProfile(e) {
    wx.getUserProfile({
      desc: '展示用户信息', 
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
  getUserInfo(e) {
    // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
    console.log(e)
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },


  onShow: function () {
    this.setData({
      userName: app.globalData.userName,
      institute: app.globalData.institute,
      ID: app.globalData.ID,
      grade:app.globalData.grade,
      dep:app.globalData.dep,
      flag:app.globalData.identity,
      major:app.globalData.major,
    })
  },

  // cleanAll: function(){
  //   app.globalData.userName = "";
  //   app.globalData.ID = "";
  //   app.globalData.isSubmit = false;
  //   app.globalData.institute = "";
  //   app.globalData.isLogin = 0;
  //   app.globalData.dep="";
  //   app.globalData.bothid ="";
  //   app.globalData.grade="";
  //   app.globalData.major="";
  //   app.globalData.identity="";
  // }



})

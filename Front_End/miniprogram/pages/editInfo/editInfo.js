// index.js
// 获取应用实例
var app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName'),
    
  },


  onLoad() {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true,
        userName: app.globalData.userName,
        institute: app.globalData.institute,
        ID: app.globalData.ID,
        warn: app.globalData.warn
      })
      var that = this;
      wx.login({
        success(res) {
          console.log(res.code)
          if (res.code) {
            //发起网络请求
            wx.request({
              url: app.globalData.path+'/wxlogin',
              data: {
                code: res.code
              },
              header: {
                'content-type': 'application/json' // 默认值
              },
              method: "POST",
              success(res){
                wx.showToast({
                  title: '获取openid成功',
                  icon: 'success',
                  duration: 1000
                })
                var json = res.data
                app.globalData.openID = json.openid
                
                console.log(app.globalData.openID)
                that.setData({
                  userOpenid:json.openid
                })
              },fail(data){
                wx.showToast({
                  title: '获取openid失败',
                  icon: 'error',
                  duration: 2000
                })
              }
            })
          } else {
            console.log('登录失败！' + res.errMsg)
          }
        }
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
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  formSubmit: function (e) {
    // console.log(e.detail.value);
    // console.log(e.detail.value.userName);
    var that=this;
    let {userName, ID} = e.detail.value;
    if (!userName || !ID) {
      app.globalData.isSubmit = true;
      wx.showToast({
        icon: 'error',
        title: '有空白项',
        duration: 1000
      })
      return;
    }
    else{
      wx.request({
        url: app.globalData.path+'/login',
        data: {
          WechatId:app.globalData.openID,
          id: ID,
          role: app.globalData.identity,
          name: userName
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        method: "POST",
        success:function(res){
          var json=res.data;
          console.log(json);
          var flag = parseInt(json["flag"]);
          app.globalData.dep=json["Dep"];
          app.globalData.bothid = json["Id"];
          app.globalData.grade=json["Grade"];
          app.globalData.major=json["Major"];
          switch (flag) {
            case 0:
              wx.showToast({
                icon: 'error',
                title: '登录失败',
                duration: 1000
                })
              break;
            case 1:
              app.globalData.isLogin = 1;
              app.globalData.isSubmit = true;
              app.globalData.userName = e.detail.value.userName;
              app.globalData.ID = e.detail.value.ID;
              if(app.globalData.identity==0){
                console.log(app.globalData.bothid)
                wx.request({
                  url: app.globalData.path+'/student/search_lesson',
                  data: {
                    Id: app.globalData.bothid
                  },
                  header: {
                    'content-type': 'application/json' // 默认值
                  },
                  method: "POST",
                  success:function(res){
                    var json=res.data
                    app.globalData.lessonList = json
                  }
                })
              }
              else{
                wx.request({
                  url: app.globalData.path+'/teacher/search_lesson',
                  data: {
                    Id: app.globalData.bothid
                  },
                  header: {
                    'content-type': 'application/json' // 默认值
                  },
                  method: "POST",
                  success:function(res){
                    var json=res.data
                    app.globalData.lessonList = json
                  }
                })
              }
              wx.showToast({
                icon: 'success',
                title: '登录成功',
                duration: 1000
                })
              setTimeout(() => {
                wx.navigateBack()
              }, 1000); 
              break;
          }
        }
      })

      
    }


      app.globalData.warn = "";
      

      // console.log(app.globalData.userName)
  },
  formReset: function () {
    // console.log('Reset')
  },
})

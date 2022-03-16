// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
  },
  globalData: {
    userInfo: null,
    userName: "",
    institute: "",
    ID: "",
		isSubmit: false,
		grade:"",
		major:"",
		warn: "",
		identity: 0,
		chosenClass: "",
		chosenClass_name: "",
		chosenClass_teacher: "",
		chosenClass_code: "",
		chosenClass_num: 0,
		chosenClass_times: 0,
		chosenClass_place: "",
		openID: "",
		bothid: "",
		isLogin: 0,
		lessonlist:[],
		path:'http://121.43.177.90',
		// path:'http://127.0.0.1:5000',
  },

  getUserInfo: function(cb) {
		var that = this

		if (this.globalData.userInfo) {
			typeof cb == "function" && cb(this.globalData.userInfo)
		} else {
			//调用登录接口
			wx.login({
				success: function(r) {
					
					// 获取用户信息 
					wx.getUserInfo({
						success: function(res) {
							that.globalData.userInfo = res.userInfo
							typeof cb == "function" && cb(that.globalData.userInfo)
						}
					})
					
				}
			})
		}
	}


})




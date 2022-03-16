
var app = getApp();
var lesson;
// miniprogram/pages/checkIn_his/checkIn_his.js
Page({

  data: {
    identity: 0,
    selectedClass_Code: app.globalData.chosenClass,
    selectedClass_id: app.globalData.chosenClass,
    selectedClass_name: "",
    selectedClass_teacher: "",
    selectedClass_code: "",
    selectedClass_time: "",
    selectedClass_num: 0,
    selectedClass_times: 0,
    selectedClass_attendance:"",
    whole: 0,
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    var that = this;
    //get the class selected
    that.setData({
      selectedClass_code: app.globalData.chosenClass_code,
      selectedClass_name: app.globalData.chosenClass_name,
      selectedClass_time: app.globalData.chosenClass_times,
    })
    //get the checkin history data
    wx.request({
      url: app.globalData.path+'/search/for_student',
      data: {
        Id: app.globalData.bothid,
        Code: app.globalData.chosenClass_code,
      },
      method: 'POST',
      success: function(res){
        // success
        var json=res.data;
        var whole=Object.keys(json).length;
        var a1=0;
        var a2=0;
        var a3=0;
        if(!json[0]){
          that.setData({
            jxh:null,
            whole:0,
            cnt1:0,
            cnt2:0,
            cnt3:0,
          })
          return false;
        }
        for (var i=0;i<whole;i++){
          console.log(json[i].Attendance)
          if(json[i].Attendance=='出勤'){a1=a1+1;}
          if(json[i].Attendance=='请假'){a2=a2+1;}
          if(json[i].Attendance=='缺勤'){a3=a3+1;}
        }
        //--------end
        that.setData({
          jxh: json,
          whole:Object.keys(json).length,
          cnt1:a1,
          cnt2:a2,
          cnt3:a3,
        })
        
      },
      fail: function() {
        // fail
      },
      complete: function() {
        // complete
      }
    })

  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {
    
  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {

  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function () {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function () {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () {

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function () {

  }
})
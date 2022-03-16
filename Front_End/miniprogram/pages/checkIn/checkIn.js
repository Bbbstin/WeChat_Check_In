// pages/checkIn/checkIn.js
var app = getApp();
var util = require('../../utils/util.js');

Page({

  /**
   * Page initial data
   */
  data: {
    identity: 0,
    selectedClass_id: app.globalData.chosenClass,
    selectedClass_name: "",
    selectedClass_teacher: "",
    selectedClass_code: "",
    selectedClass_time: "",
    result: ""
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (option) {
    //load user data
    var now = new Date();
    var that = this;
    var name = app.globalData.chosenClass_name;
    var teacher = app.globalData.chosenClass_teacher;
    var code = app.globalData.chosenClass_code;
    this.setData({
      selectedClass_name: name,
      selectedClass_teacher: teacher,
      selectedClass_code: code,
      identity: app.globalData.identity,
      nowDay: util.getYMD(now)
    })

    //check if teacher has launched check-in task today.
    if(this.data.identity){
      wx.request({
        url: app.globalData.path+'/search/for_teacher_all_lesson',
        data: {
          code: app.globalData.chosenClass_code,
        },
        method: 'POST',
        success: function(res){
          // success
          var json=res.data;
          console.log(json);
          var whole=Object.keys(json).length;
          console.log(res.data[whole-1].time)
          that.setData({
            lastTime: res.data[whole-1].time
          })
        },
        fail: function() {
          // fail
        },
        complete: function() {
          // complete
        }
      })
    }
    
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

  },

  scanCode() {
    //Calculate distance
    var myThis = this;
    wx.scanCode({
      success(res) {
        app.globalData.oriLa = res.result.slice(-26, -18)/1000000;
        console.log(res.result.slice(-46, -34))
        console.log(res.result.slice(37, -54))

        app.globalData.oriLong = res.result.slice(-9,)/1000000;
        myThis.setData({
          result: res.result,
          scanType: res.scanType,
          checkurl: res.result.slice(0, 30),
          checkCode: res.result.slice(37, -54),
          checkTime: res.result.slice(-46, -34),
          oriLa: res.result.slice(-26, -18),
          oriLong: res.result.slice(-9,)
        })
      }
    })
    

    var that = this;
    var now = new Date();
    that.setData({
      checkInTime: util.QRTime(now).toString(),
    });
  }

})
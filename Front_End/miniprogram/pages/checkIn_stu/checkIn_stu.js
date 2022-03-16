
var app = getApp();
var util = require('../../utils/util.js');
var now=new Date();
Page({

  data: {
    identity: 0,
    // selectedClass_Code: app.globalData.chosenClass,
    selectedClass_id: app.globalData.chosenClass,
    selectedClass_name: "",
    selectedClass_teacher: "",
    selectedClass_code: "",
    selectedClass_time: "",
    oriLa: app.globalData.oriLa,
    oriLong: app.globalData.oriLong,
    tempFlag: 0
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    var that = this;
    var now = new Date();
    this.setData({
      name: app.globalData.userName,
      ID: app.globalData.ID,
      school: app.globalData.dep,
      oriLa: app.globalData.oriLa,
      oriLong: app.globalData.oriLong,
      checkT: util.getYMD(now).toString(),
      checkTi: util.getHM(now).toString(),
      selectedClass_code: app.globalData.chosenClass_code,
      selectedClass_name: app.globalData.chosenClass_name,
      selectedClass_time: app.globalData.chosenClass_times,
      selectedClass_place: app.globalData.chosenClass_place
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

  },

  
  checkDistance: function(){
    var that = this;
    wx.getLocation({
      type: 'gcj02',
      success(res) {
        let latitude = res.latitude.toFixed(6);
        let longitude = res.longitude.toFixed(6);
        let oriLa = app.globalData.oriLa;
        let oriLong = app.globalData.oriLong;
        console.log(oriLa)
        console.log(latitude, longitude)
        var radLat1 = oriLa * Math.PI / 180.0;
        var radLat2 = latitude * Math.PI / 180.0;
        var a = radLat1 - radLat2;
        var b = oriLong * Math.PI / 180.0 - longitude * Math.PI / 180.0;
        var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
        s = s * 6378.137;
        s = Math.round(s * 10000) / 10;
        that.setData({
          nowDist: s,
          tempFlag: 1
        })
      }
    })
  },



  submit: function(){
    var that=this;
    console.log(that.data.ID);
    console.log(util.formatTime_(now));
    wx.request({
      url: app.globalData.path+'/teacher/update_attend',

      data: {
        Id: that.data.ID,
        time: util.formatTime_(now),
        code: app.globalData.chosenClass_code,
        flag: 2,
        // time: app.globalData.chosenClass_times,
      },
      method: 'POST',
      success: function(res){
        // success
        var json=res.data;
        console.log(json);
        wx.showToast({
          icon: 'success',
          title: '签到成功',
        })
      }
    })
    
    setTimeout(() => {
      wx.navigateBack()
    }, 1500); 
  }
})
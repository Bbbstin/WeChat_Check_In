
var app = getApp();
var lesson;
var now = new Date()
var util = require('../../utils/util.js');



Page({

  /**
   * Page initial data
   */
  data: {
    identity: 0,
    selectedClass_teacher: "",
    selectedClass_times: 0,
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    var that = this;
    that.setData({
      selectedClass_id: app.globalData.chosenClass,
      selectedClass_code: app.globalData.chosenClass_code,
      selectedClass_name: app.globalData.chosenClass_name,
      selectedClass_time: app.globalData.chosenClass_times,
      selectedClass_wholenum: app.globalData.chosenClass_num,
    })
    console.log(app.globalData.chosenClass_code)
    wx.request({
      url: app.globalData.path+'/search/for_teacher_all_lesson',
      data: {
        code: app.globalData.chosenClass_code,
        // time: app.globalData.chosenClass_times,
      },
      method: 'POST',
      success: function(res){
        // success
        var json=res.data;
        console.log(json);
        var whole=Object.keys(json).length;
        console.log(whole)
        var a1=json[whole-1].attend;
        var a2=json[whole-1].absent;
        var a3=json[whole-1].leave;
        that.setData({
          jxh: json,
          a1: a1,
          a2: a2,
          a3: a3,
          //selectedClass_teacher:app.globalData.chosenClass_teacher,
        })
        
      },
      fail: function() {
        // fail
      },
      complete: function() {
        // complete
      }
    })
    console.log(util.getYMD(now))
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

  //Download Form
  getForm: function(){
    wx.request({
      url: app.globalData.path+'/create_download',
      data: {
        Code: app.globalData.chosenClass_code,
        time: util.getYMD(now)
      },
      method: 'POST',
      success: function(res){
        var url_excel = res.data;
        console.log(1)
        wx.showLoading({
          title: '下载中'
        })
        wx.downloadFile({
          url: app.globalData.path+'/download/'+url_excel,
          header: {},
          success: function(res) {
              var filePath = res.tempFilePath;
              console.log(filePath);
              wx.openDocument({
                  showMenu: true,
                  filePath: filePath,
                  success: function(res) {
                      console.log('打开文档成功')
                      wx.showToast({
                        title: '下载成功',
                        icon: 'success'
                      })
                      setTimeout(() => {
                        wx.request({
                          url: app.globalData.path+'/delete/'+url_excel,
                          method: 'GET',
                          success: function(res){
                            var json = res.data
                            console.log(json)
                          }
                        })
                      }, 2000); 
                      
                  },
                  fail: function(res) {
                      console.log(res);
                      wx.showToast({
                        title: '下载失败',
                        icon: 'error'
                      })
                  },
                  complete: function(res) {
                      console.log(res);
                  }
              })
          },
          fail: function(res) {
              console.log('文件下载失败');
          },
          complete: function(res) {},
      })
      }
    })
  }
})

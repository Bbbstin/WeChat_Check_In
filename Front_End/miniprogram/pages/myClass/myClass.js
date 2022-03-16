
var app = getApp();


Page({

  /**
   * Page initial data
   */
  data: {
    identity: app.globalData.identity,
    chosenClass: ""
  },



  
  onLoad: function () {
    this.setData({
      isLogin: app.globalData.isLogin,
      lessonList: app.globalData.lessonList,
    })
  },
  

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {
    console.log('onReady');
  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {
    this.setData({
      isLogin: app.globalData.isLogin,
      lessonList: app.globalData.lessonList,
    })    
    console.log('onShow');
  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function (e) {
    
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



  setClassName: async function (e){
    // app.globalData.chosenClass = lessonList[index]
    var index = e.currentTarget.dataset.index;
    console.log(e.currentTarget.dataset.index)


    // var classId = await db.collection("lessonInfo").get()
    var chosenClass = app.globalData.lessonList[index];
    console.log(chosenClass)
    app.globalData.chosenClass = chosenClass.id
    app.globalData.chosenClass_name = chosenClass.Name
    app.globalData.chosenClass_code = chosenClass.Code
    app.globalData.chosenClass_teacher = chosenClass.teacher
    app.globalData.chosenClass_num = chosenClass.num
    app.globalData.chosenClass_times = chosenClass.Times
    app.globalData.chosenClass_place = chosenClass.Place
    console.log(app.globalData.chosenClass)
  }
  
})



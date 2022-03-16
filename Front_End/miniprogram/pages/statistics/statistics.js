
var app = getApp();

Page({

  /**
   * Page initial data
   */
  data: {
    identity: app.globalData.identity,
    chosenClass: "",
    lessonList_temp: [],
    dimlist: ['年级','性别','学院'],
    openID: app.globalData.openID,
    lessonList: {},
    ColorList: app.globalData.ColorList,
    showSta: 0
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    
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
    this.setData({
      isLogin: app.globalData.isLogin,
      lessonList:app.globalData.lessonList,
    })
    var temp=['全部'];
    if(this.data.lessonList){
      for(var i=1;i<=this.data.lessonList.length;i++)
      {
        console.log(this.data.lessonList[i-1].Name)
        temp[i]=this.data.lessonList[i-1].Name;
      }
    }
    this.setData({
      lessonList_temp: temp,
    })
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

  chooseCourse: function(e){
    console.log(e.detail.value)
    this.setData({
      pickCourse: e.detail.value
    })
  },

  choosedim: function(e){
    console.log(e.detail.value)
    this.setData({
      pickdim: e.detail.value
    })
  },

  chooseGrade: function(e){
    console.log(e.detail.value)
    this.setData({
      pickdim: e.detail.value
    })
  },



  showModal(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target
    })
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },
  SetColor(e) {
    this.setData({
      color: e.currentTarget.dataset.color,
      modalName: null
    })
  },
  SetActive(e) {
    this.setData({
      active: e.detail.value
    })
  },


  searchInfo(){
    var that=this;
    var rate_attend=[];
    var rate_leave=[];
    var rate_not=[];
    var tolnum
    this.setData({
      showSta: 1
    })
    //查询单个课程情况
    if (that.data.pickCourse!=0){
      var nsl= that.data.dimlist[that.data.pickdim];
      var mode='';
      if(nsl=='年级'){
        mode='grade';
      }
      if(nsl=='性别'){
        mode='sex';
      }
      if(nsl=='学院'){
        mode='dep';
      }
      console.log('dim='+mode)
      console.log('code='+that.data.lessonList[that.data.pickCourse-1].Code)
      wx.request({
        url: app.globalData.path+'/search/for_all',
        data: {
          Id: app.globalData.bothid,
          code: that.data.lessonList[that.data.pickCourse-1].Code,
          mode: mode,
        },
        method: 'POST',
        success: function(res){
          // success
          var json=res.data;
          console.log(json)
          var majorList=[];
          if("dep" in json[0]){
            for (var i=0;i<json.length;i++){
              tolnum=json[i].attend+json[i].leave+json[i].absent;
              if(json[i].dep){
                majorList[i]=json[i].dep;
              }
              else{
                majorList[i]='其他';
              }
              rate_not[i]=Math.round(json[i].absent * 100/tolnum);
              rate_leave[i]=Math.round(json[i].leave * 100/tolnum);
              rate_attend[i]=Math.round(100-rate_not[i]-rate_leave[i]);
            }
          }
          else if("grade" in json[0]){
            for (var i=0;i<json.length;i++){
              tolnum=json[i].attend+json[i].leave+json[i].absent;
              if(json[i].grade){
                majorList[i]=json[i].grade+'级';
              }
              else{
                majorList[i]='其他';
              }
              rate_not[i]=Math.round(json[i].absent * 100/tolnum);
              rate_leave[i]=Math.round(json[i].leave * 100/tolnum);
              rate_attend[i]=Math.round(100-rate_not[i]-rate_leave[i]);
              console.log(rate_leave[i])
            }
          }
          else if("sex" in json[0]){
            for (var i=0;i<json.length;i++){
              tolnum=json[i].attend+json[i].leave+json[i].absent;
              if(json[i].sex){
                majorList[i]=json[i].sex;
              }
              else{
                majorList[i]='其他';
              }
              rate_not[i]=Math.round(json[i].absent * 100/tolnum);
              rate_leave[i]=Math.round(json[i].leave * 100/tolnum);
              rate_attend[i]=Math.round(100-rate_not[i]-rate_leave[i]);
            }
          }
          console.log(majorList)
          that.setData({
            majorList:majorList,
            rate_attend:rate_attend,
            rate_leave:rate_leave,
            rate_not:rate_not,
          })
          
        },
      })
    }
    else{
      var nsl= that.data.dimlist[that.data.pickdim];
      var mode='';
      if(nsl=='年级'){
        mode='grade';
      }
      if(nsl=='性别'){
        mode='sex';
      }
      if(nsl=='学院'){
        mode='dep';
      }
      console.log('dim='+mode)
      console.log('code=all')
      wx.request({
        url: app.globalData.path+'/search/for_all',
        data: {
          Id: app.globalData.bothid,
          code: 'all',
          mode: mode,
        },
        method: 'POST',
        success: function(res){
          // success
          var json=res.data;
          console.log(json)
          var majorList=[];
          if("dep" in json[0]){
            for (var i=0;i<json.length;i++){
              tolnum=json[i].attend+json[i].leave+json[i].absent;
              if(json[i].dep){
                majorList[i]=json[i].dep;
              }
              else{
                majorList[i]='其他';
              }
              rate_not[i]=Math.round(json[i].absent * 100/tolnum);
              rate_leave[i]=Math.round(json[i].leave * 100/tolnum);
              rate_attend[i]=Math.round(100-rate_not[i]-rate_leave[i]);
            }
          }
          else if("grade" in json[0]){
            for (var i=0;i<json.length;i++){
              tolnum=json[i].attend+json[i].leave+json[i].absent;
              console.log(tolnum)
              console.log(json[i].absent)
              if(json[i].grade){
                majorList[i]=json[i].grade+'级';
              }
              else{
                majorList[i]='其他';
              }
              rate_not[i]=Math.round(json[i].absent * 100/tolnum);
              rate_leave[i]=Math.round(json[i].leave * 100/tolnum);
              rate_attend[i]=Math.round(100-rate_not[i]-rate_leave[i]);
              console.log(rate_leave[i])
            }
          }
          else if("sex" in json[0]){
            for (var i=0;i<json.length;i++){
              if(json[i].sex){
                majorList[i]=json[i].sex;
              }
              else{
                majorList[i]='其他';
              }
              tolnum=json[i].attend+json[i].leave+json[i].absent;
              rate_not[i]=Math.round(json[i].absent * 100/tolnum);
              rate_leave[i]=Math.round(json[i].leave * 100/tolnum);
              rate_attend[i]=Math.round(100-rate_not[i]-rate_leave[i]);
              console.log(rate_leave[i])
            }
          }
          console.log(majorList)
          that.setData({
            majorList:majorList,
            rate_attend:rate_attend,
            rate_leave:rate_leave,
            rate_not:rate_not,
          })
          
    }
  })
  }
  },
  cleanAll: function(){
    this.setData({
      pickdim:"",
      pickCourse:"",
    })
  },
})

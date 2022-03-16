 // pages/markLeave/markLeave.js

 var temp1
 var app = getApp();
 var util = require('../../utils/util.js');
 
 
 Page({
 
   /**
    * Page initial data
    */
   data: {
     absentnum:"",
     absent: [1, 2, 3],
     Time_temp: [],
     isDisable_attend: 0,
     isDisable_leave: 0,
     hidden_leave: false,
     hidden_attend: false,
     selectedClass_name: "",
     selectedClass_code: "",
     pickTime: "",
     chooselist:[],
     chooselocation:[],
   },
 
   /**
    * Lifecycle function--Called when page load
    */
   onLoad: function (options) {
     var that = this;
      var name=app.globalData.chosenClass_name;
      var code=app.globalData.chosenClass_code;
      this.setData({
        selectedClass_name:name,
        selectedClass_code:code,
      })
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
          var timelist=[];
          for (var i=0;i<Object.keys(json).length;i++){
            timelist[Object.keys(json).length-i-1]=json[i].time;
          }
          that.setData({
            jxh: json,
            Time_temp: timelist,
          })
        },
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
 
 
 
 
 
   chooseTime: function(e){
     var that = this;
     console.log(e)
     this.setData({
       pickTime: this.data.Time_temp[e.detail.value],
     })
     wx.request({
       url: app.globalData.path+'/teacher/search_leave',
       data: {
         Code: app.globalData.chosenClass_code,
         Time:this.data.Time_temp[e.detail.value],
         // time: app.globalData.chosenClass_times,
       },
       method: 'POST',
       success: function(res){
         // success
         var json=res.data;
         console.log(json);
         that.setData({
           absent_stu_info:json,
        })
        console.log(that.data.absent_stu_info)
       }
     })
   },
 
   markLeave: function(){
     this.setData({
       hidden_leave: false
     })
     var that = this;
     console.log(temp1)
     for(var i=0, len=temp1.length; i<len ; i++){
      //Code to connect to the backend.
      temp1[i]=parseInt(temp1[i]);
    }
    var chooselist=[];
    var j = 0;
    console.log(temp1.length)
    for(var i=0, len=temp1.length; i<len ; i++){
      //Code to connect to the backend.
      chooselist[j]=that.data.absent_stu_info[temp1[i]].name;
      j = j + 1;
    }
     this.setData({
       isDisable_leave: 1,
       chooselist:chooselist,
       chooselocation: temp1,
     })
     console.log(this.data.chooselist)
   },
 
 
   markLeave_final:function(){
     var that=this;
     for(var i=0;i<this.data.chooselocation.length;i++){
       console.log(this.data.absent_stu_info[this.data.chooselocation[i]].Stu_id);
       console.log(this.data.absent_stu_info[this.data.chooselocation[i]].Time);
       console.log(this.data.selectedClass_code);
        wx.request({
          url: app.globalData.path+'/teacher/update_attend',
          data: {
            Id: this.data.absent_stu_info[this.data.chooselocation[i]].Stu_id,
            time:this.data.absent_stu_info[this.data.chooselocation[i]].Time,
            flag:3,
            code: this.data.selectedClass_code,
            // time: app.globalData.chosenClass_times,
          },
          method: 'POST',
          success: function(res){
            // success
            var json=res.data;
            console.log(json);
          }
        })
     }
   

     wx.showToast({
       icon: 'success',
       title: 'Marked',
     })
     setTimeout(() => {
       wx.redirectTo({
         url: '/pages/markLeave/markLeave',
       })
     }, 1500);
   },
 
   modalHidden_leave: function(){
     this.setData({
       hidden_leave: true,
       isDisable_leave: 0
     })
   },
 
   modalHidden_attend: function(){
     this.setData({
       hidden_attend: true,
       isDisable_attend: 0
     })
   },
 
 
    markAttend: function(){
      this.setData({
        hidden_attend: false
      })
      var that = this;
      console.log(temp1)
      var chooselist=[];
      var j = 0;
      for(var i=0, len=temp1.length; i<len ; i++){
        //Code to connect to the backend.
        chooselist[j]=that.data.absent_stu_info[temp1[i]].name;
        j = j + 1;
      }
      this.setData({
        isDisable_attend: 1,
        chooselocation: temp1,
        chooselist: chooselist
      })
    },
 
 
 
   markAttend_final:function(){
      var that=this;
      for(var i=0;i<this.data.chooselocation.length;i++){
        console.log(this.data.absent_stu_info[this.data.chooselocation[i]].Stu_id);
        console.log(this.data.absent_stu_info[this.data.chooselocation[i]].Time);
        console.log(this.data.selectedClass_code);
        wx.request({
          url: app.globalData.path+'/teacher/update_attend',
          data: {
            Id: this.data.absent_stu_info[this.data.chooselocation[i]].Stu_id,
            time:this.data.absent_stu_info[this.data.chooselocation[i]].Time,
            flag:2,
            code: this.data.selectedClass_code,
            // time: app.globalData.chosenClass_times,
          },
          method: 'POST',
          success: function(res){
            // success
            var json=res.data;
            console.log(json);
          }
        })
      }
     wx.showToast({
       icon: 'success',
       title: 'Marked',
     })
     setTimeout(() => {
       wx.redirectTo({
         url: '/pages/markLeave/markLeave',
       })
     }, 1000);
   },
 
 
   checkboxgroupBindchange:function(e){
     temp1 = e.detail.value
     var temp2 = ''
     console.log(temp1)
     if(temp1.length != 0){
       for(var i=0, len=temp1.length;i<len; i++){
         temp2=temp2+temp1[i]+','
       }
       this.setData({
       text:'You chose:'+temp2
      })
     }else{
       this.setData({
       text:''
      })
     }
   }
 
 
 
 
 })
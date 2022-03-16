const { QRTime } = require('../../utils/util.js');
var util = require('../../utils/util.js');
var app = getApp();
var QR = require("../../utils/qrcode.js");
var now = new Date();




Page({
  data: {
    task: {
      name: '',
      address: '点击获取当前地址',
      signTime: '00:00',
      signEarlyTime: '00:00',
    },
    openId: '',
    userInfo: {},
    creating: false,
    button: {
      txt: 'Launch',
      txt_chinese: '确定'
    },
    modalHidden: true,
    show: false,
    url: "",
    qrcStr: '',
    maskHidden:true,
    imagePath:'',
    qrtime: util.QRTime(new Date(now.getTime() + 1000 * 600))
  },
  canvasId: "qrcCanvas",

  // 设置任务名称
  bindKeyInput: function (e) {
    this.setData({
      'task.name': e.detail.value
    });
  },

  // 设置任务地点
  chooseLocation: function () {
    var that = this;

    wx.chooseLocation({
      success: function(res){
        
        var now = new Date();
        that.setData({
          'task.address': res.address,
          'task.latitude': res.latitude.toFixed(6),
          'task.longitude': res.longitude.toFixed(6),
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

  // 设置打卡时间
  setSignTime: function (e) {
    var that = this;
    var time = +e.detail.value.slice(3, 5) + 10;
    var hour = ((+e.detail.value.slice(0, 2) + (time < 60 ? 0 : 1)) % 24).toString();
    var time = ((+e.detail.value.slice(3, 5) + 10) % 60).toString();
    that.setData({
      'task.signTime': e.detail.value,
      'task.signEarlyTime': (hour[1] ? hour : '0' + hour) + ':' + (time[1] ? time : '0' + time),
      'qrtime': util.QRTime(now).slice(0, 8) + (hour[1] ? hour : '0' + hour) + (time[1] ? time : '0' + time)
    });
  },
  
  // 设置开始日期
  startDateChange: function (e) {
    this.setData({
      'task.startDay': e.detail.value
    })
  },

  // 设置结束日期
  endDateChange: function (e) {
    this.setData({
      'task.endDay': e.detail.value
    })
  },


  // 隐藏提示弹层
  modalChange: function (e) {
    this.setData({
      modalHidden: true
    })
  },

  // 创建任务
  createTask: function () {
    var that = this;
    this.setData({
      url: "/pages/checkIn_stu/checkIn_stu?code='" + app.globalData.chosenClass_code + "'&time='" + that.data.qrtime + "'&orila=" + that.data.task.latitude*1000000 + "&orilong=" + that.data.task.longitude*1000000
    })
    console.log(this.data.url)
    console.log(that.data.qrtime)
    var task = this.data.task;
    var openId = this.data.openId;
    var userInfo = this.data.userInfo;
    this.size = this.setCanvasSize();//动态设置画布大小
    this.createQrCode(that.data.url, that.canvasId, that.size.w, that.size.h);
  },




  // 提交、检验
  bindSubmit: function (e) {
    var that = this;
    var task = this.data.task;
    var creating = this.data.creating;
  
    if (task.name == '' || task.address == 'Click to Get Current Address' ) {
      this.setData({
        modalHidden: false
      });
    } else {
      if (!creating) {
        this.setData({
          'creating': true
        });
        console.log(app.globalData.chosenClass_code);
        console.log(util.formatTime(now));
        wx.request({
          url: app.globalData.path+'/teacher/launch',
          data: {
            code: app.globalData.chosenClass_code,
            time: util.formatTime(now),
          },
          method: 'POST',
          success: function(res){
            // success
            console.log(res.data);
            that.setData({
              modalHidden: true
            })
            console.log(res.data)
            if(res.data){
              that.createTask();
              wx.showToast({
                title: '创建成功',
                icon: 'success',
                duration: 1500
              });
            }
            else{
              wx.showToast({
                title: '创建失败',
                icon: 'error',
                duration: 1500
              });
            }
          },
          fail: function() {
            // fail
          },
          complete: function() {
            // complete
          }
        })
      }
    }

  },
  
  onShow: function () {
    // 恢复新建按钮状态
    this.setData({
      'creating': false
    });
  },

  onHide: function () {
  },

  // 初始化设置
  onLoad: function () {
    var that = this;
    var now = new Date();
    var openId = wx.getStorageSync('openId');

    // 初始化打卡时间
    that.setData({
      'task.signTime': util.getHM(now),
      'task.signEarlyTime': util.getHM(new Date(now.getTime() + 1000 * 600)),
    });
    console.log(this.data.task.signEarlyTime)
    
    // 初始化日期
    that.setData({
      'task.startDay': util.getYMD(now),
      'task.endDay': util.getYMD(now)
    });

  

    // 初始化昵称
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        userInfo:userInfo
      });

      that.setData({
        openId: openId
      })
    });
  }  ,


  //适配不同屏幕大小的canvas
  setCanvasSize:function(){
    var size={};
    try {
        var res = wx.getSystemInfoSync();
        var scale = 750/686;//不同屏幕下canvas的适配比例；设计稿是750宽
        var width = res.windowWidth/scale;
        var height = width;//canvas画布为正方形
        size.w = width;
        size.h = height;
      } catch (e) {
        // Do something when catch error
        console.log("获取设备信息失败"+e);
      } 
    return size;
  } ,

  createQrCode:function(str,canvasId,cavW,cavH){
    //调用插件中的draw方法，绘制二维码图片
    QR.api.draw(str,canvasId,cavW,cavH);
 
  },


  onQrcStrBlur: function(e) {
    this.setData({qrcStr: e.detail.value});
  },

  onGenQrc: function(e) {
    this.createQrCode(this.data.qrcStr, this.canvasId, 380, 380);
  },

  onTab: function() {
    this.setData({
      show: true
    })
  },

  close: function() {
    this.setData({
      show: false,
    })
  },

  touchMove: function() {
  },

  maskTouchMove: function() {
  },
})
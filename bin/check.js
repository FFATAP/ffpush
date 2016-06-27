'use strict';

var file = require('fs');
var colors = require('colors');

module.exports = {
  checkWidgetFile:function(fileName) {
    if(fileName.split('_').length == 3){
      // 符合命名规则 TODO 添加复杂判断检查
      // console.log(fileName.green + "符合规则");
      return true;
    }
    else {
      return false;
    }

    return false;
  },

  checkAppFile:function(fileName){
    if(fileName.split('_').length == 2){
      // 符合命名规则 TODO 添加复杂判断检查
    //   console.log(fileName.green + "符合规则");
      return true;
    }
    else {
      return false;
    }
    return false;
  }
};

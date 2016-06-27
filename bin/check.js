'use strict';

var file = require('fs');
var colors = require('colors');

function hasFile(fileName) {
  var readSubDir = process.cwd();
  var path = readSubDir+"/"+fileName;
  // console.log("path:"+readSubDir + "name:"+fileName);
  if(file.existsSync(path)){
    return true;
  }
  return false;
}

module.exports = {
  checkWidgetFile:function(fileName) {
    if(fileName.split('_').length == 3){
      // 符合命名规则 TODO 添加复杂判断检查
      // 获取文件名
      var splitName = fileName.split('.');
      splitName.pop();
      var componentName = splitName.join('');
      // console.log("name:::::"+componentName);
      // 检查当前路径下是否有对应的相同命名的json和js文件
      var jsname = componentName+".js";
      var jsonname = componentName+".json";
      if(hasFile(jsname) && hasFile(jsonname))
      {
        // console.log("js文件和json文件同时存在！")
         return true;
      }
      return false;
    }else {
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

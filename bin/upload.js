'use strict';

var http = require('http');
var path = require('path');
var fs = require('fs');
var colors = require('colors');
var checker = require('./check');

function postFile(fileKeyValue, req) {
  var boundaryKey = Math.random().toString(16);
  var enddata = '\r\n----' + boundaryKey + '--';

  var files = new Array();
  for (var i = 0; i < fileKeyValue.length; i++) {
    var content = "\r\n----" + boundaryKey + "\r\n" + "Content-Type: application/octet-stream\r\n" + "Content-Disposition: form-data; name=\"" + fileKeyValue[i].urlKey + "\"; filename=\"" + path.basename(fileKeyValue[i].urlValue) + "\"\r\n" + "Content-Transfer-Encoding: binary\r\n\r\n";
    var contentBinary = new Buffer(content, 'utf-8');//当编码为ascii时，中文会乱码。
    files.push({contentBinary: contentBinary, filePath: fileKeyValue[i].urlValue});
  }

  var contentLength = 0;
  for (var i = 0; i < files.length; i++) {
    var stat = fs.statSync(files[i].filePath);
    contentLength += files[i].contentBinary.length;
    contentLength += stat.size;
  }

  req.setHeader('Content-Type', 'multipart/form-data; boundary=--' + boundaryKey);
  req.setHeader('Content-Length', contentLength + Buffer.byteLength(enddata));

  // 将参数发出
  var fileindex = 0;
  console.log("开始上传>>>>>>>>>>>>>>>>>>>>>>");

  var doOneFile = function() {
    req.write(files[fileindex].contentBinary);
    var fileStream = fs.createReadStream(files[fileindex].filePath, {bufferSize : 4 * 1024});
    fileStream.pipe(req, {end: false});
    fileStream.on('end', function() {
      fileindex++;
      if(fileindex == files.length) {
        req.end(enddata);
      }
      else {
        doOneFile();
      }
    });
  }

  if(fileindex == files.length) {
    req.end(enddata);
    console.log("上传完毕！".green);
  }
  else {
    doOneFile();
  }
};

//测试用例
//http://nodejs.org/api/http.html#http_http_request_options_callback
// var files = [
//  {urlKey: "js", urlValue: "./UF_weather_beijing.js"},
//  {urlKey: "json", urlValue: "./UF_weather_beijing.json"}
// ]

function getuploadFiles(file) {
  var fileupload = {};
  fileupload["urlKey"] = file;
  fileupload["urlValue"] = file;
  return fileupload;
}

function getCurFiles(uploadPath) {
  var files = [];
  var readSubDir = fs.readdirSync(process.cwd());
  console.log("当前路径下有以下符合组件规则的文件：");

  readSubDir.forEach(function(file,index) {
    var stat = fs.statSync(file);
    if (!stat.isDirectory()) {
      if (uploadPath == '/widget') {
        if (checker.checkWidgetFile(file)) {
          console.log(index+'、'.green+file.bold.green + "  符合规则".green);
          files.push(getuploadFiles(file));
        }
        else {
          console.log(index+'、'.green+file.bold.red + "  不符合规则，将不会上传".red);
        }
      }
      else if (uploadPath == '/applications') {
        if (checker.checkAppFile(file)) {
          console.log(index+'、'.green+file.bold.green + "  符合规则".green);
          files.push(getuploadFiles(file));
        }
        else {
          console.log(index+'、'.green+file.bold.red + "  不符合规则，将不会上传".red);
        }
      }
    }
  });
  return files;
}

var options = {
  host: "localhost",
  port: "8888",
  method: "POST",
  path: "/upload"
}

module.exports = {
  postall:function(uploadPath) {
    if (uploadPath != undefined || uploadPath != null) {
      options.path = uploadPath;
    }

    var req = http.request(options, function(res) {
      res.on("data", function(chunk) {
        console.log(chunk);
      });
      res.on("end", function(chunk) {
        if (res.statusCode == 200) {
          console.log("上传成功".green.bold);
        }
        else {
          console.log("上传失败".red);
        }
      });
    });
    
    req.on('error', function(e) {
      console.log('problem with request:'.red + e.message.red);
    });

    postFile(getCurFiles(uploadPath),req);
  }
};

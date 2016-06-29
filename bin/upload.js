'use strict';

var http = require('http');
var path = require('path');
var fs = require('fs');
var colors = require('colors');
var checker = require('./check');

function postFile(fileKeyValue, req, fileDir) {
  // console.log(fileKeyValue.toString());
  if(fileKeyValue.length <= 0){
    console.log("没有文件可以上传！请检查目录".red);
    req.abort();
    return;
  }
  var boundaryKey = Math.random().toString(16);
  var enddata = '\r\n----' + boundaryKey + '--';

  var files = new Array();
  for (var i = 0; i < fileKeyValue.length; i++) {
    var name = fileDir + '/' + fileKeyValue[i].urlKey;
    var content = "\r\n----" + boundaryKey + "\r\n" + "Content-Type: application/octet-stream\r\n" + "Content-Disposition: form-data; name=\"" + name + "\"; filename=\"" + fileKeyValue[i].urlValue + "\"\r\n" + "Content-Transfer-Encoding: binary\r\n\r\n";
    var contentBinary = new Buffer(content, 'utf-8');//当编码为ascii时，中文会乱码。
    files.push({contentBinary: contentBinary, filePath: fileKeyValue[i].urlKey});
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
  console.log("开始上传>>>>>>>>>>>>>>>>>>>>>>".yellow);

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
//  {urlKey: "/UF_weather_beijing.js", urlValue: "UF_weather_beijing.js"},
//  {urlKey: "/UF_weather_beijing.json", urlValue: "UF_weather_beijing.json"}
// ]

function getuploadFiles(filePath) {
  var fileupload = {};
  fileupload["urlKey"] = filePath;
  fileupload["urlValue"] = path.basename(filePath);
  return fileupload;
}

function getApplicationFiles(filePath, fileDir)
{
  var files = new Array();
  var readDir = fs.readdirSync(filePath);
  readDir.forEach(function(fileName, index) {
    var absolutePath = filePath + '/' + fileName;
    var relativePath = fileName;
    if (fileDir != '') {
      relativePath = fileDir + '/' + fileName;
    }
    
    var stat = fs.statSync(absolutePath);
    if (stat.isDirectory()) {
      files = files.concat(getApplicationFiles(absolutePath, relativePath));
    }
    else {
      console.log(index + '、'.green + relativePath.bold.green + "符合规则".green);
      files.push(getuploadFiles(relativePath));
    }
  });

  return files;
}

function getWidgetFiles(filePath) {
  var files = [];
  var readSubDir = fs.readdirSync(filePath);
  readSubDir.forEach(function(file, index) {
    var stat = fs.statSync(file);
    if (!stat.isDirectory()) {
      if (checker.checkWidgetFile(file)) {
        console.log(index + '、'.green + file.bold.green + "  符合规则".green);
        files.push(getuploadFiles(file));
      }
      else {
        console.log(index + '、'.red + file.bold.red + "  不符合规则，将不会上传".red);
      }
    }
  });
  return files;
}

function getCurFiles(uploadPath, filePath) {
  var files = [];
  console.log("当前路径下有以下符合组件规则的文件：");

  if (uploadPath == '/applications') {
    if (checker.checkAppFile(filePath)) {
      files = getApplicationFiles(filePath, '');
    }
    else {
      console.log(filePath.bold.red + "  不符合规则，将不会上传".red);
    }
  }
  else if (uploadPath == '/widget') {
    files = getWidgetFiles(filePath);
  }
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
      res.setEncoding('utf-8');
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

    var filePath = process.cwd();
    if (uploadPath == '/applications') {
      var dirs = filePath.split('/'); 
      var fileDir = dirs.pop();
      postFile(getCurFiles(uploadPath, filePath),req, fileDir);
    }
    else {
      postFile(getCurFiles(uploadPath, filePath),req, '');
    }
  }
};

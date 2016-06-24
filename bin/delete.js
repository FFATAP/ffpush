'use strict';

var http = require('http');
var url = require('url');
var querystring = require('querystring');
var colors = require('colors');

var options = { 
 host: "localhost", 
 port: "8888", 
 method: "DELETE",
 path: "/delete",
}

module.exports = {
  deleteFile:function(filePath, fileName) {
    var posetData = querystring.stringify({
      "fileName": fileName,
      "filePath": filePath
    });
    options.path = url.parse(options.path).pathname + '?' + posetData;
    
    var req = http.request(options, function(res) {
      res.setEncoding('utf8');
      res.on("data", function(chunk){
        console.log("chunk=" + chunk);
      })
      res.on("end", function(chunk){
        console.log("删除成功".rainbow);
      })
    })

    req.on('error', function(e) {
      console.log('problem with request:'.red + e.message.red);
    })
    
    req.end();
  }
};

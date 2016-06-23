'use strict'

var arg = process.argv.splice(2);
var upload = require('./upload');
upload.postall(arg);
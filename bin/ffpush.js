#!/usr/bin/env node

'use strict';

var program = require('commander');
var colors = require('colors');

program
    .version('1.0.8');//声明版本号

program
    .command('remove <filePath> [fileNames...]')
    .description('删除服务端上的文件。参数filePath为组件的路径，参数fileNames如果不存在，则为删除目录，否则删除fileNames指定的文件'.green)
    .action(function(filePath, fileNames) {
    	var del = require('./delete');
    	del.deleteFiles(filePath, fileNames); 
    })

program
    .command('release')
    .description('发布当前路径下的文件。其中-w表示安装组件，-a表示安装应用程序'.green)
    .option('-a, --applications', '应用程序下的全部文件')
    .option('-w, --widget','当前路径下的全部文件，js文件和json配置文件')
    .action(function(options){
        if(options.widget) {
             var upload = require('./upload');
             upload.postall('/widget');
        }
        else if (options.applications) {
             var upload = require('./upload');
             upload.postall('/applications');
        }
    })

program
    .command('adduser <usermail>')
    .description('添加一个用户，分配上传需要的key'.green)
    .action(function(jspath){
        console.log('add user:'+jspath);
        // TODO上传jspath路径中的文件到飞凡的服务。
           //console.log('发布的文件为：'+ jspath);
        // TODO上传jspath路径中的文件到飞凡的服务。
        console.log('用户：'+jspath.bold.yellow + '创建成功！'.green);
        console.log('您的开发者token为：'+'ABCDEFGHIGKLMN'.red+'  请妥善保存此token,以后登录需要以此为登录密钥');
        console.log('您是否现在以：'+jspath.bold+'的身份登录，输入'+'[y/n]'.red + '来选择,输入其他任意字符结束');


        process.stdin.setEncoding('utf8');
        process.stdin.on('readable', () => {
          var chunk = process.stdin.read();
          if (chunk !== null) {
          //   process.stdout.write(`data: ${chunk}`);
          // console.log(chunk.length + chunk[0]);  
             if(chunk.length == 2 && chunk[0] == 'y' ){
                 process.stdin.end();
                 console.log('以'+jspath.red+'登录成功！')
             }else{
                 process.stdin.end();

             }
        }
        });

        process.stdin.on('end', () => {
          process.stdout.write('end');
        });

    })
program
    .command('login')
    .description('登录，获取上传权限'.green)
    .action(function(jspath){
        // console.log('TODO：用户需要用分配的key登录，才能上传组件');
        // TODO上传jspath路径中的文件到飞凡的服务。
       console.log('请输入您的用户名：');
       var name = '';
       var token = '';
       var bName = true;
        process.stdin.setEncoding('utf8');
        process.stdin.on('readable', () => {
          var chunk = process.stdin.read();
          if (chunk !== null) {
                if(bName){
                    name = chunk;
                    console.log('请输入您的token:') 
                    bName = false;
                }else{
                    token = chunk;
                    console.log('正在登录。。。') ;
                    process.stdin.end();
                    console.log('登录成功'.green);
                }
            
             }
        });

        process.stdin.on('end', () => {
          process.stdout.write('end');
        });
    })
program
    .command('logout')
    .description('登出飞凡上传帐号')
    .action(function(jspath){
        console.log('TODO：登出user');
        // TODO上传jspath路径中的文件到飞凡的服务。

    })

program.parse(process.argv);//开始解析用户输入的命令


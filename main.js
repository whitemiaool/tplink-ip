// var colors = require('colors')
//   var phantom = require('phantomjs');
 
// After this call all Node basic primitives will understand iconv-lite encodings.
// iconv.extendNodeEncodings();
var request = require('request');
var Promise = require("bluebird");
var urllib = require('urllib');




var tokenUrl = 'https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=wwd1f16e2324e8c7e4&corpsecret=';
var tongxunlu = 'bmrbuucYFoWS0uC3SAEkfCr_WfTZPKpKpFjQT7rTR_Y';
var paiban = 'Q-1ogqb8ZI3JvrL8UhelBSmKAh2IeiH0kHM89mzeBl4'; 
var getMemberUrl = 'https://qyapi.weixin.qq.com/cgi-bin/user/simplelist?access_token=';
var sendMsgUrl = 'https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=';
var oneHour = 3600000;
let msg = {
    "touser":'',
    "msgtype" : "text",
    "agentid" : 1000002,
    "text" : {
        "content" : "您好"
    },
    "safe":0
}

var oneMin = 60*1000;

var getToken = function(index) {
    let path = index?tongxunlu:paiban;
    return new Promise((rs,rej)=>{
        request(tokenUrl+path, function(err, res, data) {
            if(err) {
                rej(err)
            } else {
                let result = JSON.parse(data)
                rs(result)
            }
        })
    });
}

var getMember = function(tk,id=2,index=1) {
    let url = `${getMemberUrl}${tk}&department_id=${id}&fetch_child=${index}`
    return new Promise((rs,rj)=>{
        request(url, function(err, res, data) {
            if(err) {
                rj(err)
            } else {
                rs(JSON.parse(data))
            }
        })
    });
}

var sendMsg = function(tk,msg) {
    let url = sendMsgUrl+tk;
    return new Promise((rs,rj)=>{
        urllib.request(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            content: JSON.stringify(msg)
        },function(err, res, data) {
            if(err) {
                rj(err)
            } else {
                rs(data)
                // console.log(data)
            }
        });
    });
}

async function sendToUser(mg={}) {   
    let token = await getToken();
    // let txl = await getToken(1);
    // let member = await getMember(txl.access_token);
    var message = Object.assign({},msg,mg)
    // message.touser = member.userlist[0].userid;
    message.touser = 'DuYingXuan';
    let res = await sendMsg(token.access_token,message);
    // if(res.status == '200') {
    //     Wait.update({_id:id},{$set:{AtdStatus:2}},(err)=>{});
    // } else {     
    //     Wait.update({_id:id},{$set:{AtdStatus:3}},(err)=>{});
         
    // }
}
 
var count = 0;
var ip = '';
console.log('主进程开启');
var startTime = new Date().getTime();

function capture() {
    var exec = require('child_process').exec,
    ls = exec('phantomjs app.js');
 
 
    ls.stdout.on('data', function (data) {
        console.log(count,data);
        let res = data.replace(/[\r\n]*/g,'');
        if(ip == res) {

        } else {
            ip = res;
            var mg = {
                "text" : {
                    "content" : ip
                },
            }
            sendToUser(mg)
        }
    });
 
    ls.stderr.on('data', function (data) {
        //console.log('stderr: ' + data);
        console.log('err',data)
 
    });
 
    ls.on('close', function (code) {
        if (code == 1) {
            console.log('child process异常结束。目标：' + url);
        }
 
    });
 
}

setInterval(()=>{
    capture();
},5000)
// var colors = require('colors')
//   var phantom = require('phantomjs');

// After this call all Node basic primitives will understand iconv-lite encodings.
// iconv.extendNodeEncodings();
var request = require('request');
var Promise = require("bluebird");
var urllib = require('urllib');
var moment = require('moment')
let AliCloudClient = require("aliyun-apisign");


var ipReg = /((25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))$/g;
var tokenUrl = 'https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=wwd1f16e2324e8c7e4&corpsecret=';
var tongxunlu = 'bmrbuucYFoWS0uC3SAEkfCr_WfTZPKpKpFjQT7rTR_Y';
var paiban = 'Q-1ogqb8ZI3JvrL8UhelBSmKAh2IeiH0kHM89mzeBl4';
var getMemberUrl = 'https://qyapi.weixin.qq.com/cgi-bin/user/simplelist?access_token=';
var sendMsgUrl = 'https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=';

var oneHour = 3600000;
let msg = {
    "touser": '',
    "msgtype": "text",
    "agentid": 1000002,
    "text": {
        "content": "您好"
    },
    "safe": 0
}

var oneMin = 60 * 1000;


// let Req = require("request");
// let request = new Req();

let aliClient = new AliCloudClient({
    AccessKeyId: "LTAI8CMDv3UVx467",
    AccessKeySecret: "9Vp5NZgW9Qou7WuedE7EJ14eFspCwa",
    serverUrl: "http://alidns.aliyuncs.com"
});

let recordId = [{id:3711992705766400,rr:'@'},{id:3714651824576512,rr:'www'},{id:3712461278512128,rr:'blog'},{id:3713875673617408,rr:'share'}]; //记录ID




function upDateRecords(newIp) {
    recordId.forEach((v,i)=>{
        aliClient.get("/", {
            Action: "UpdateDomainRecord",
            RecordId: v.id,
            RR: v.rr,
            Type: "A",
            Value: newIp,
            ttl: 600
        }).then(function (data) {
            console.log(new Date() + newIp + " 修改成功");
        }).catch(function (err) {
            console.log(err)
        })
    })
}
upDateRecords('121.49.88.149')

var getToken = function (index) {
    let path = index ? tongxunlu : paiban;
    return new Promise((rs, rej) => {
        request(tokenUrl + path, function (err, res, data) {
            if (err) {
                rej(err)
            } else {
                let result = JSON.parse(data)
                rs(result)
            }
        })
    });
}

var getMember = function (tk, id = 2, index = 1) {
    let url = `${getMemberUrl}${tk}&department_id=${id}&fetch_child=${index}`
    return new Promise((rs, rj) => {
        request(url, function (err, res, data) {
            if (err) {
                rj(err)
            } else {
                rs(JSON.parse(data))
            }
        })
    });
}

var sendMsg = function (tk, msg) {
    let url = sendMsgUrl + tk;
    return new Promise((rs, rj) => {
        urllib.request(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            content: JSON.stringify(msg)
        }, function (err, res, data) {
            if (err) {
                rj(err)
            } else {
                rs(data)
                // console.log(data)
            }
        });
    });
}

async function sendToUser(mg = {}) {
    let token = await getToken();
    // let txl = await getToken(1);
    // let member = await getMember(txl.access_token);
    var message = Object.assign({}, msg, mg)
    // message.touser = member.userlist[0].userid;
    message.touser = 'DuYingXuan';
    let res = await sendMsg(token.access_token, message);
    // console.log(res)
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
var lastHour;
var timer;
function capture() {
    request.post({url:'http://192.168.100.1/cgi-bin/luci', form: {username:'useradmin',psd:'gkldz'}}, function(err,httpResponse,body){ 

        let auth = JSON.parse(JSON.stringify(httpResponse.headers))['set-cookie'][0].match(/sysauth=(.*?);/)[1];
        
        var options = {
            url: 'http://192.168.100.1/cgi-bin/luci/admin/settings/gwinfo?get=part&_=0.48743490363865694',
            headers: {
              'Cookie': `sysauth=${auth}`
            }
          };
          request(options,function(e,r,t){
            // console.log(JSON.parse(t)['WANIP']);
            let res = JSON.parse(t)['WANIP'];
            if (ip == res && new Date().getHours() == lastHour) {
                    
            } else {
                lastHour = new Date().getHours();
                ip == res ? '' : upDateRecords(res);
                ip = res;
                console.log(ip)
                var mg = {
                    "text": {
                        "content": `Your Private Server IP:${ip}`
                    },
                }
                sendToUser(mg);
            }
            })
           })
        

}

process.on('uncaughtException', function (err) {
    console.error('An uncaught error occurred!');
    console.error(err.stack);
});

capture();
// setInterval(() => {
//     capture();
// }, 10 * 60 * 1000)
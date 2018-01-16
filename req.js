var request = require('request');
var Promise = require("bluebird");
var urllib = require('urllib');
var moment = require('moment')
let AliCloudClient = require("aliyun-apisign");

moment.locale('zh-cn');


var ip = '';
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
let recordId = [{id:3716319348529152,rr:'test'},{id:3711992705766400,rr:'@'},{id:3714651824576512,rr:'www'},{id:3712461278512128,rr:'blog'},{id:3713875673617408,rr:'share'}]; //记录ID

getIpFromRouter();

setInterval(() => {
    getIpFromRouter();
}, 10 * 60 * 1000)

function getIpFromRouter(){
    request.get('http://192.168.1.1/userRpm/StatusRpm.htm', {
    'auth': {
        'user': 'admin',
        'pass': 'admin',
        'sendImmediately': true
    }
    },(err,res,body)=>{
        // console.log(err,res.statusCode)
        if(!err || (res&res.statusCode == 200)) {
            var str = body.replace(/\n/g,'');
            var li = str.match(/"8C-21-0A-16-6B-3B",([\s \S]*?)<\/script>/);
            var resip = li[1].split(',')[0].replace(/"/g,'');
            if (ipReg.test(resip)) {
                if (ip == resip && new Date().getHours() == lastHour) {
                            
                } else {
                    lastHour = new Date().getHours();
                    ip == resip ? '' : upDateRecords(resip);
                    ip = resip;
                    var mg = {
                        "text": {
                            "content": `Your Private Server IP:${ip},Update Time:${moment(new Date()).format('lll')}`
                        },
                    }
                    sendToUser(mg);
                }
            } else {
                getIpFromRouter();
            }
        } else {
            getIpFromRouter();
        }
    });
}



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

function getToken (index) {
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

function sendMsg(tk, msg) {
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

}
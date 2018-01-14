

// var webPage = require('webpage');
// var page = webPage.create();



// page.settings.userName = 'admin';
// page.settings.password = 'admin';
// page.open('http://192.168.1.1', function (status) {
//     if(status != 'success') {
//         console.log('fail')
//     } else {
//         var str = page.evaluate(function() {
//             return document.getElementsByName('mainFrame')[0].contentDocument.documentElement.innerHTML;
//         });
//         str = str.replace(/\n/g,'');
//         var li = str.match(/"8C-21-0A-16-6B-3B",([\s \S]*?)<\/script>/);
//         console.log(li[1].split(',')[0].replace(/"/g,''))

//     }
//     phantom.exit();
// });




// var webPage = require('webpage');
// var page = webPage.create();
var req = require('request');

// // console.log(phantom)
// phantom.addCookie({
//     'name'  : 'sysauth',   /* required property */
//     'value'    : '599648a5e92a889926127151bc8ff534',  /* required property */
//     'domain'   : '192.168.100.1',
//     'path'     : '/cgi-bin/luci/',                /* required property */
//     'expires'  : (new Date()).getTime() + (1000 * 60 * 60)   /* <-- expires in 1 hour */
//   });
// page.settings.userName = 'useradmin';
// page.settings.password = 'gkldz';
// page.open('http://192.168.100.1/', function (status) {
//     if(status != 'success') {
//         console.log('fail')
//     } else {
//         var str = page.evaluate(function() {
//             return document.body;
//         });
//         console.log(str.innerHTML)
//         var cookies = page.cookies;
  
//         console.log('Listing cookies:');
//         for(var i in cookies) {
//           console.log(cookies[i].name + '=' + cookies[i].value);
//         }
//         page.open('http://192.168.100.1/cgi-bin/luci',function(status){
//             console.log(status)
//             var str1 = page.evaluate(function() {
//                 return document.body;
//             });
//             console.log(str1)
//         })

//     }
//     phantom.exit();
// });





//   req(options,function(e,r,t){
//       console.log(e,t)
//   })


  req.post({url:'http://192.168.100.1/cgi-bin/luci', form: {username:'useradmin',psd:'gkldz'}}, function(err,httpResponse,body){ 

let auth = JSON.parse(JSON.stringify(httpResponse.headers))['set-cookie'][0].match(/sysauth=(.*?);/)[1];

var options = {
    url: 'http://192.168.100.1/cgi-bin/luci/admin/settings/gwinfo?get=part&_=0.48743490363865694',
    headers: {
      'Cookie': `sysauth=${auth}`
    }
  };
    req(options,function(e,r,t){
      console.log(JSON.parse(t)['WANIP'])
    })
   })






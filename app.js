

var webPage = require('webpage');
var page = webPage.create();



page.settings.userName = 'admin';
page.settings.password = 'admin';
page.open('http://192.168.1.1', function (status) {
    if(status != 'success') {
        console.log(fail)
    } else {
        var str = page.evaluate(function() {
            return document.getElementsByName('mainFrame')[0].contentDocument.documentElement.innerHTML;
        });
        str = str.replace(/\n/g,'');
        var li = str.match(/"8C-21-0A-16-6B-3B",([\s\S]*?)<\/script>/);
        console.log(li[1].split(',')[0].replace(/"/g,''))

    }
    phantom.exit();
});





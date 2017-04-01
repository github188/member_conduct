/**
 *  @Author:    Relax
 *  @Create Date:   2016-11-14
 *  @Description:   经济百纳 预付卡 平安付接口对接
 */

var util = require('util'),
    http = require('http'),
    https = require('https'),
    qs = require('querystring'),
    BufferHelper = require('bufferhelper'),
    error = require('../Exception/error'),
    crypto = require('crypto'),
    moment = require('moment'),
    fs = require('fs'),
    url = require('url'),
    request = require('request');

var urlPath = 'https://test5-oauth.stg.1qianbao.com:29443/map/oauth';

var configs = {
    stg2: {
        h5url: 'https://test2-h5.stg.1qianbao.com/commercial/estate/index.html#/index',
        merchantNo: '600000001001',
        channelId: 'J-100014',
        tokenUrl: 'https://test2-oauth.stg.1qianbao.com:26443',
        app_id: '000000',
        sign_type: 'RSA'
    },
    stg3: {
        h5url: 'https://test3-h5.stg.1qianbao.com/commercial/estate/index.html#/index',
        merchantNo: '600000000210',
        channelId: 'J-100014',
        tokenUrl: 'https://test3-oauth.stg.1qianbao.com/',
        app_id: '000000',
        sign_type: 'RSA'
    },
    stg5: {
        h5url: 'https://test5-h5.stg.1qianbao.com/commercial/estate/index.html#/index',
        merchantNo: '600000000403',
        channelId: 'J-100014',
        tokenUrl: 'https://test5-oauth.stg.1qianbao.com:29443',
        app_id: '000000',
        sign_type: 'RSA'
    },
    shengchan: {
        h5url: 'https://h5.1qianbao.com/commercial/estate/index.html#/index',
        merchantNo: '600000000221',
        channelId: 'J-100014',
        tokenUrl: 'https://oauth.1qianbao.com/map/oauth',
        app_id: '000000',
        sign_type: 'RSA'
    }
};
/**
 * 获取短Token
 * @constructor
 */
exports.GetAccessor_Token = function (callback) {
    var _config = configs.shengchan;
    var timeStamp = moment().format('YYYYMMDDHHmmss'),
        sign_data = {
            state: timeStamp,
            redirect_url: _config.tokenUrl,
            scope: '',
            app_id: _config.app_id,
            merchant_no: _config.merchantNo,
            timestamp: timeStamp,
            mid: '',
            uid: '',
            sign_type: _config.sign_type,
            sign: ''
        };
    var sign_content = sign_data.state + '&' + sign_data.redirect_url +
        '&' + sign_data.scope + '&' + sign_data.app_id + '&' + sign_data.merchant_no +
        '&' + sign_data.timestamp + '&&&RSA';
    console.log('sign_Str:', sign_content);
    sign_data.sign = signData(sign_content);
    console.log('sign:', sign_data.sign);
    var _signData = signStr(sign_data);
    console.log('post_data:', _signData);
    return callback(null, _signData);
};

function signData(stringA) {
    // var privateKey = 'MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBANdpHC3ZhXojLSCR3k1IMTlueFKu5bmdgikOawRy4C4uTE3pgjPRW3xR6iYxqY8VNdYP4YuW7c1haFvIWUQYNTgEe+uRoXDYoIckKKd2n7+XPtkxHgELMrZN16lIN0UCF8AViU1DJ9GZmqF7u8yLkxgbdjCFHj7AJgqUPoBFaGE7AgMBAAECgYEAppt8mRXSACqu368S0pFQyUvhMopl0g+6OYkWSsWTEQTsLaK6+tsluF0fDlWBANL15dA4sZ+V5DE/5yVprZpPpc3CkUH83J7oKkUinOioZ0wGl17TAWle28cE9Gm48lVWF8mihj1lfeVHT3LqqxL1BuOnxJI0WFSOPpO4/fKAQZkCQQDtRpy600zP9bB2KIdx52ssKee5NO8CFeYouGcy2/O7hi2yFbyBunLQgt3PD3K5YP3nIa0SpmlZicbmTaTBMmFPAkEA6GjIF2oas64hbJaWJq60M71ysOcA7tqoNP8zdtFPUI5iZ+yswBhkAkCVRnj/ll47y9gSAUyN0R7ctPfYB3hOVQJBAORIVJBWrQdDnTQBSFbpTK5f3ubMq8s44Ih66ib/gV8A+EPnL8csaDx+ PAN0HG+Ihp/yQX65BpCzwt5fA00xOHcCQCAqEDcdWiCv4rRSiulDmHDosSzGa5yi6lCbWRYClcWCTyAu4yGavoyJP5+HM2guFnx5pNRFMgNVEBqDioROJBkCQE6EuT577CTF/VnZOvSEVh356UHGFeS7q4mNA6S7QcLJrLQz17t6RQ5SBtBL/8oY1O1vH4E7i9vKQSFkpn77dDQ='; //stg2
    var privateKey = 'MIICeAIBADANBgkqhkiG9w0BAQEFAASCAmIwggJeAgEAAoGBAOINoL/bx/jUaQ9zTwoa252yBM5EVHoZuZU7CJyVNdXvCTAWdfN1rfyIJkGAas5GeL0hJRR7uuwO5pthz6Qn1xTqAs+kKYsSthqQefkngz3uTYXEaeqd8iDBo2/U02IwX3QrQQX5aE02XF3TnLgF7pzUuRpLVKCNHTupWXzZLWPJAgMBAAECgYAaYFq0aFGyEB7eJadAV5fuk5oJ82EkCiJkbkn381UfzE93I/fJW57ci4pjNDfCL+jgsKBh/nn2F1sDIGuZDOkEmIWBQvhgonPlXIkjeYcT8MJ0R0eXPllovhobjed7x56OepIs0Nvy6nWpYwWFg+TaY4nDn8lbj1Pyy0lHyMvWAQJBAPrFjgCxxFQpIpeRfpBG5D2Hveo3mjcaXkk4wGNlvajPYgu+Kwvc/zS6vWKgCjFEea+SDu2UZHcpFiKOuEitKUECQQDmxCSqNXil06UrNSQp8p4wtYr/7gDLhTOsT7bXVOFSFqVRZ1uDOn+SiORpH3ox63EZsr0+2iJrVkOdWmqCHlCJAkEAz1p29qAHBMgWsFk/27CinTYWlQpw28tT1xu0CPxhfKouGiOemGqeI02dt2U5yE8kh0YwTcZ75AP3J4/3VTDJgQJBAIwQjTiKT/pGpb+9939GdWGXLxD8ApuE88IoeA/mwwQyHpF0LIVQIlJsqEZuBpr6DqHMbTUS7UU9DLkbQf5MLBECQQDEW2mQQY8sE1PeK1bSVfo438X8uo21n4IbGNFQjoGPH+JWFdjpMRruJrVumBxfjgHDwc5EYwTHKvxswnetDpSU';  //生产private key
    // var privateKey = 'MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBALo0OW25zouxjSthde5Omv+5M8GmfToiP58sahlET+Q7pQOBB4ZzXAzj5A5+IYNgNyXapm/z1RdhPVHN2/SRgoSm59GwKI/iCsT/VPYP3ry/jdv2OQAv9pZH/S6/a0aDOi9j7vJzckFqepJhdn0sOqy6KNMd3P+T3G6v479donBzAgMBAAECgYAgs8daRAXIdvhqJAXIQrnqK6axXgIkUZuG4xAHO/4kAW2rvd+Kd3w1L1kASpqsLhvBZDNS+in0nzlbwqHcxCl9we6M4+O/hDYg/tNjhWbeotxFPr8RV66uz/4GOWvYo9+5XFsCxxD6lUk8rEqBH6Sn0l+ejPTgVzR4cCZKxVutAQJBAOHXW7X3M8Kjm/8pNtzu1tDOvKj4GsMmhbR+Falfe/d2HixaT3NMNt0Qoksw+4mR+2BwuLK8HNwsuodn6x4VA8ECQQDTEdJQecqeloH9cul8GmDvK9YmJVv0qdfBm1cE1F0rGJoiWpsJUUlbSRDWR1fczaAoONENl+S3qxXfphFJavEzAkAgxmdJ3ilF2wadnjaXE5ZbUVVx1CfWIHYQ/qdYIEJWZG72ktiq6+meZXaYIPCwQ15O3a0AS2qIzXj4g61MfVJBAkASBCFpkRvEcaBi294mI7JGd/1tgB7bQWwTMIk69k2FkjIF4Kn/H5sdWZ1ATRKo3DxhcogVmvOA4e+aCXjMRX6VAkEAj4QFzB1aiWiulWmxGKUI2BcrybV31bpdHoHC7fMJT2ks2lGg8L81zLtR+HbPOxglexyNOBhpsrlLrUjXGXfRzg==';//STG3
    //var privateKey = 'MIICeAIBADANBgkqhkiG9w0BAQEFAASCAmIwggJeAgEAAoGBANbpQwFjDiD6Q5fJX3ls3ZgIY7n6TsOBa6FaiKfwRyqtvPzXK9qQGpOcoFkbTgUTV2IxNcI2X0met8UmzoHXFN6x/BK3yASNmal9tBOTU2wDXX+JETKqWVxnlQwrMkLtouL0Rb5L9Wp+LjANRjg/lDwO+gv2BtyF1xIuOroeCZF1AgMBAAECgYBEn+GcjMPTNfblfhD1lhTAWlV16n7CIQ58TIt8jNY8w5OobRD8zq0d25K8QWLNbhqmKS6QYIpW2M63rqecgFCSIfyA +x29hVH2+yk+5nG6dE6+CWFDzGuixzEx1vK36OMav2P2gGdsIW6jOOo6NBIPzqeFWHzCeNdJ1nc7IDwEdQJBAPPKO99h4UXUhtpWISkoI5vkjrOFOhWbqqxqplgyhzkbExxdOuVpGSSql8f0fCOgdSDMNudOAfVVPTJUu9ifMXcCQQDhrMG/fvmptric+oQv2+ExpRK+F6hP2gYBoMau8QTHGZv4K5Nu/WShcmljHQV3g1U0IrNB893DHjXZDtgfeq9zAkEAjWhavkHKJ3UVG4QmC/dqYDx8wYifnnUC1Kuv/Syh3u/jb+psBTGnEeuZyrP3Zbrm9bU+i4BmBmYA7zbTFt2QFQJBAJcaXiwDL9WT067ACkwlNHZSKed/3aGBwO3MIdw24tUQ757ORoxVO9Dh03CamPN5y036Qf5R89VWYAWy68DAG8MCQQDtXcLyTPA98BgUa1JTO5njF+HEwSMRm/K9eMq76Y2V9elc60S9SbMj1xufvHeCf7tcPDd9yZlZBOkb4YZKtY5U';//STG5

    privateKey = chunk_split_private_key(privateKey, 64, '\n');
    var signer = crypto.createSign('RSA-SHA1');
    signer.update(new Buffer(stringA));
    var sign = signer.sign(privateKey, 'base64');
    return sign;
};

function chunk_split_private_key(key, length, end) {
    var returnStr = '-----BEGIN PRIVATE KEY-----\n';
    var strLength = Math.ceil(key.length / length);
    for (var i = 0; i < strLength; i++) {
        var temp = key.substr(length * i, length);
        returnStr += temp + end;
    }
    returnStr += '-----END PRIVATE KEY-----';
    return returnStr;
};

function signStr(attr) {
    var stringA = '';
    var keys = Object.keys(attr);
    for (var i in keys) {
        var key = keys[i];
        var val = attr[key];
        stringA += key + '=' + val + '&';
    }
    if (stringA) {
        stringA = stringA.substring(0, stringA.length - 1);
    }
    return stringA;
}
exports.Sign = signData;
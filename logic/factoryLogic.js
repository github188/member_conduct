var _default = require('./memberLogic');
var zhongzhou = require('./zhongZhouLogic'),
    ganZhouWxc = require('./ganZhouWxcLogic'),
    laoXiMen = require('./laoXiMenLogic'),
    jingJiBaiNa = require('./jingjiBaiNaLogic'),
    dgwk = require('./dgwkLogic'),
    dgwkV2 = require('./dgwkLogicV2'),
    yuanyang = require('./yuanYangLogic');

module.exports = function (bid) {
    var _m;
    switch (bid) {
        case 17: //常德老西门
            _m = new laoXiMen();
            break;
        case 18: //中州
            _m = new zhongzhou();
            break;
        case 20: //赣州万象城
            _m = new ganZhouWxc();
            break;
        case 27: //京基百纳 南山
        case 26://KKMAll
        case 28://沙井
        case 25://KKONE
        case 44://总部
            _m = new jingJiBaiNa();
            break;
        case 38://东莞万科
            //_m = new dgwk();
            _m = new dgwkV2();
            break;
        case 79:
            _m = new yuanyang();
            break;
        default:
            _m = new _default();
            break;
    }
    return _m;
};
/**
 *  @Author:    Relax
 *  @Create Date:   2016-08-03
 *  @Description:   常德老西门CRM操作业务逻辑
 */
var member = require('./memberLogic'),
    utils = require('util'),
    error = require('../Exception/error'),
    kechuan = require('../crm/laoXiMenKechuan'),
    verify = require('../Tools/verify'),
    async = require('async');

function LaoXiMen() {
};

utils.inherits(LaoXiMen, member);
/**
 * 会员注册
 * 1> 判断OpenId是已有绑定的会员卡
 * 2> 注册
 * 3> 将注册的会员卡与OpenId绑定
 * @param attribute  姓名name,手机号phone,性别sex,微信openid
 * @param callback
 * @constructor
 */
LaoXiMen.prototype.Register = function (attribute, callback) {
    var name = attribute.name,
        phone = attribute.phone,
        sex = attribute.sex,
        openId = attribute.openId,
        grade = attribute.cardGrade;
    if (!grade) {
        grade = kechuan.VipGrade;
    }
    if (!openId) {
        callback(error.ThrowError(error.ErrorCode.InfoIncomplete, 'openId不能为空'));
        return;
    }
    if (!name) {
        callback(error.ThrowError(error.ErrorCode.InfoIncomplete, 'name不能为空'));
        return;
    }
    if (!verify.Name(name)) {
        callback(error.ThrowError(error.ErrorCode.DateFormatError, 'name格式错误'));
        return;
    }
    if (!phone) {
        callback(error.ThrowError(error.ErrorCode.InfoIncomplete, 'phone不能为空'));
        return;
    }
    if (!verify.Phone(phone)) {
        callback(error.ThrowError(error.ErrorCode.DateFormatError, 'Phone格式错误'));
        return;
    }
    if (!sex) {
        callback(error.ThrowError(error.ErrorCode.InfoIncomplete, 'Sex不能为空'));
        return;
    }
    //判断当前OpenId是否已有绑定会员卡
    kechuan.GetVipInfoByMobileOpenId(openId, function (err, result) {
        console.log('step1 err:', err);
        if (!err) {
            callback(error.ThrowError(error.ErrorCode.OpenIdHasEmploy));
            return;
        }
        //注册 (判断当前手机号是否已经注册）
        kechuan.VipCreate(name, phone, sex, grade, function (err, result) {
            console.log('注册 err', err, 'result', result);
            if (err) {  //注册失败
                return callback(err);
            }
            console.log('cardNumber:', result.CardNumber);
            //注册成功，绑定OpenId
            kechuan.BindOpenID(result.CardNumber, phone, openId, function (err) {
                console.log('绑卡 err', err, 'result', result);
                if (err) {
                    return callback(err);
                }
                kechuan.GetVipInfo(result.CardNumber, function (err, result) {
                    if (err)
                        callback(err);
                    else
                        callback(error.Success(result));
                });
            });
        });
    });
    /*async.waterfall([
        function(cb){
            kechuan.GetVipInfoByMobileOpenId(openId,function(err,result){
                console.log('step 1 err:', err)
                if(!err){
                    cb(error.ThrowError(error.ErrorCode>OpenIdHasEmploy))
                    return
                }
                cb(null,result)
            })
        },
        function(result,cb){
            kechuan.VipCreate(name,phone,sex,grade,function(err,result){
                console.log('注册 err ',err,'result: ',result)
                if(err){
                    return cb(err)
                }
                console.log('cardNumber: ' , result.cardNumber)
                cb(null.result.cardNumber)
            })
        },
        function(result,cb){
            kechuan.BindOpenID(result,phone,openId,function(err){
               //console.log('绑卡 err ',err,'result: 'result)
                if(err){
                    return cb(err)
                }
                cb(null,result)
            })
        },
        function(result,cb){
            kechuan.GetVipInfo(result,function(err,result){
                if(err){
                    cb(err)
                }
                cb(null,result)
            })
        }
    ],function(err,result){
        if(err){
            callback(err)
        }
        callback(error.ThrowError(error.ErrorCode>OpenIdHasEmploy))
        return 
    })*/
};

/**
 * 会员卡绑定
 * 1> 判断OpenId是否已经绑定会员卡
 * 2> 判断会员卡是否存在
 * 3> 将会员卡与OpenId绑定
 * @param attribute
 * @param callback
 * @constructor
 */
LaoXiMen.prototype.CardBinding = function (attribute, callback) {
    var cardNumber = attribute.cardNumber,
        openId = attribute.openId,
        phone = attribute.phone;
    if (!cardNumber) {
        return callback(error.ThrowError(error.ErrorCode.InfoIncomplete, 'cardNumber不能为空'));
    }
    if (!openId) {
        return callback(error.ThrowError(error.ErrorCode.InfoIncomplete, 'openid不能为空'));
    }
    if (!phone) {
        return callback(error.ThrowError(error.ErrorCode.InfoIncomplete, 'phone不能为空'));
    }
    if (!verify.Phone(phone)) {
        return callback(error.ThrowError(error.ErrorCode.DateFormatError, 'phone格式错误'));
    }
    //查询OpenId是否已绑定
    //判断当前OpenId是否已有绑定会员卡
    kechuan.GetVipInfoByMobileOpenId(openId, function (err, result) {
        if (!err && result.CardGrade != kechuan.VipGrade) {
            return callback(error.ThrowError(error.ErrorCode.OpenIdHasEmploy));
        }
        //查询会员卡是否存在
        kechuan.GetVipInfo(cardNumber, function (err, result) {
            if (err) {
                return callback(err);
            }
            if (!(result.Phone == phone)) {
                return callback(error.ThrowError(error.ErrorCode.CardInfoError, '会员卡信息错误，手机号不正确'));

            }
            if (result.OpenId != '') {
                return callback(error.ThrowError(error.ErrorCode.CardInfoError, '该会员卡已经被其他微信号绑定'));
            }
            if (result.CardGrade == kechuan.VipGrade) {
                return callback(error.ThrowError(error.ErrorCode.CardInfoError, '会员卡类型错误，绑卡不能为虚拟卡'));
            }
            kechuan.BindOpenID(cardNumber, phone, openId, function (err) {
                if (err)
                    callback(err);
                else
                    callback(error.Success(result)); //返回会员卡信息
            });
        });
    });
    /*async.waterfall([
        function(cb){
            kechuan.GetVipInfoByMobileOpenId(openId,function(err,result){
                if(!err && result.CardGrade != kechuan.VipGrade){
                    return cb(error.ThrowError(error.ErrorCode.OpenIdHasEmploy))
                }
                cb(null,result)
            })
        },
        function(result,cb){
            kechuan.GetVipInfo(cardNumber,function(err,result){
                if(err){
                    return cb(err)
                }
                if (!(result.Phone == phone)) {
                    return cb(error.ThrowError(error.ErrorCode.CardInfoError, '会员卡信息错误，手机号不正确'));
                }
                if (result.OpenId != '') {
                    return cb(error.ThrowError(error.ErrorCode.CardInfoError, '该会员卡已经被其他微信号绑定'));
                }
                if (result.CardGrade == kechuan.VipGrade) {
                    return cb(error.ThrowError(error.ErrorCode.CardInfoError, '会员卡类型错误，绑卡不能为虚拟卡'));
                }
                cb(null,result)
            })
        },
        function(result,cb){
            kechuan.BindOpenID(cardNumber,phone,openId,function(err){
                if(err){
                    cb(err)
                }
                cb(null,result)
            })
        }
    ],function(err,result){
        if(err){
            callback(err)
        }
        callback(error.Success(result))
    })*/
};

/**
 * 查询会员卡信息
 * @param attrbute
 * @param callback
 * @constructor
 */
LaoXiMen.prototype.GetCard = function (attrrbute, callback) {
    var cardNumber = attrrbute.cardNumber;
    if (!cardNumber) {
        callback(error.ThrowError(error.ErrorCode.InfoIncomplete, 'cardNumber不能为空'));
        return;
    }
    kechuan.GetVipInfo(cardNumber, function (err, result) {
        if (err)
            callback(err);
        else
            callback(error.Success(result));
    });
};

/**
 * 修改会员资料
 * @param attribute
 * @param callback
 * @constructor
 */
LaoXiMen.prototype.CardModify = function (attribute, callback) {
    var cardNumber = attribute.cardNumber,
        address = attribute.address,
        email = attribute.email,
        idNo = attribute.idNo,
        name = attribute.name,
        sex = attribute.sex,
        birthday = attribute.birthday,
        phone = attribute.phone;
    if (!cardNumber) {
        callback(error.ThrowError(error.ErrorCode.InfoIncomplete, 'cardNumber不能为空'));
        return;
    }
    if (phone && !verify.Phone(phone)) {
        callback(error.ThrowError(error.ErrorCode.DateFormatError, 'Phone格式错误'));
        return;
    }
    if (email && !verify.CheckEmail(email)) {
        callback(error.ThrowError(error.ErrorCode.DateFormatError, 'email格式错误'));
        return;
    }
    if (idNo && !verify.IdNo(idNo)) {
        callback(error.ThrowError(error.ErrorCode.DateFormatError, 'idNo格式错误'));
        return;
    }
    if (birthday && !verify.CheckDate(birthday)) {
        callback(error.ThrowError(error.ErrorCode.DateFormatError, 'birthday格式错误'));
        return;
    }
    kechuan.GetVipInfo(cardNumber, function (err, result) {
        if (err) {
            callback(err);
            return;
        }
        if (!result) {
            callback(error.ThrowError(error.ErrorCode.CardUndefined));
            return;
        }
        //差异化信息提交  若信息没有修改，则传空值
        phone = phone == result.Phone ? '' : phone;
        email = email == result.Email ? '' : email;
        idNo = idNo == result.IdNo ? '' : idNo;
        birthday = birthday == result.birthday ? '' : birthday;
        sex = sex == result.Sex ? '' : sex;
        name = name == result.Name ? '' : name;
        kechuan.VipModify(cardNumber, name, phone, sex, birthday, idNo, address, email, function (err, result) {
            if (err) {
                callback(err);
                return;
            }
            kechuan.GetVipInfo(cardNumber, function (err, result) {
                if (err) {
                    callback(err);
                    return;
                }
                callback(error.Success(result));
            });
        });
    });
    //差异化信息提交  若信息没有修改，则传空值
       /* phone = phone == result.Phone ? '' : phone;
        email = email == result.Email ? '' : email;
        idNo = idNo == result.IdNo ? '' : idNo;
        birthday = birthday == result.birthday ? '' : birthday;
        sex = sex == result.Sex ? '' : sex;
        name = name == result.Name ? '' : name;*/
   /* async.waterfall([
        function(cb){
            kechuan.GetVipInfo(cardNumber,function(err,result){
                if(err){
                    cb(err)
                    return 
                }
                if(!result){
                    cb(error.ThrowError(error.error.ErrorCode.CardUndefined))
                    return
                }
                cb(null,result)
            })
        },
        function(result,cb){
            kechuan.VipModify(cardNumber,name,phone,sex,birthday,idNo,address,email,function(err,result){
                if(err){
                    cb(err)
                    return
                }
                cb(null,result)
            })
        },
        function(result,cb){
            kechuan.GetVipInfo(cardNumber,function(err,result){
                if(err){
                    return cb(err)
                }
                cb(null,result)
            })
        }
    ],function(err,result){
        if(err){
            callback(err)
        }
        callback(error.Success(result))
    })*/
};

/**
 * 根据OpenId 查询会员卡信息
 * @param attribute
 * @param callback
 * @constructor
 */
LaoXiMen.prototype.GetCardByOpenId = function (attribute, callback) {
    var openId = attribute.openId;
    if (!openId) {
        callback(error.ThrowError(error.ErrorCode.InfoIncomplete, 'openId不能为空'));
        return;
    }
    kechuan.GetVipInfoByMobileOpenId(openId, function (err, result) {
        if (err) {
            callback(err);
            return;
        }
        callback(error.Success(result));
    });
};

/**
 * 根据手机号查询会员卡
 * @param attribute
 * @param callback
 * @constructor
 */
LaoXiMen.prototype.GetCardByPhone = function (attribute, callback) {
    var phone = attribute.phone;
    if (!phone) {
        callback(error.ThrowError(error.ErrorCode.InfoIncomplete, 'phone不能为空'));
        return;
    }
    if (!verify.Phone(phone)) {
        callback(error.ThrowError(error.ErrorCode.DateFormatError, 'Phone格式错误'));
        return;
    }
    kechuan.GetVipInfoByMobile(phone, function (err, result) {
        if (err) {
            callback(err);
            return;
        }
        callback(error.Success(result));
    });
};

/**
 * 积分记录
 * @param attribute
 * @param callback
 * @constructor
 */
LaoXiMen.prototype.IntegralRecord = function (attribute, callback) {
    var cardNumber = attribute.cardNumber;
    if (!cardNumber) {
        callback(error.ThrowError(error.ErrorCode.InfoIncomplete, 'cardNumber不能为空'));
        return;
    }
    kechuan.GetBonusledgerRecord(cardNumber, function (err, result) {
        if (err) {
            return callback(err);
        }
        else {
            return callback(error.Success(result));
        }
    });
};

/**
 * 会员卡等级列表
 * @param attribute
 * @param callback
 * @constructor
 */
LaoXiMen.prototype.GradeList = function (attribute, callback) {
    kechuan.GetGradeList(function (err, result) {
        var str = err ? err : error.Success(result);
        callback(str);
    });
};

/**
 * 会员卡积分调整
 * @param attribute
 * @param callback
 * @constructor
 */
LaoXiMen.prototype.IntegralChange = function (attribute, callback) {
    var cardNumber = attribute.cardNumber,
        integral = attribute.integral,
        source = attribute.source,
        desc = attribute.desc;
    if (!cardNumber) {
        callback(error.ThrowError(error.ErrorCode.InfoIncomplete, 'cardNumber不能为空'));
        return;
    }
    if (!integral) {
        callback(error.ThrowError(error.ErrorCode.InfoIncomplete, 'integral不能为空'));
        return;
    }
    if (!verify.CheckNumber(integral)) {
        callback(error.ThrowError(error.ErrorCode.DateFormatError, 'integral格式错误'));
        return;
    }
    integral = parseFloat(integral);
    if (integral == 0) {
        callback(error.ThrowError(error.ErrorCode.DateFormatError, '无效的积分'));
        return;
    }
    if (!source) {
        callback(error.ThrowError(error.ErrorCode.InfoIncomplete, 'source不能为空'));
        return;
    }
    kechuan.BonusChange(cardNumber, integral, source, desc, function (err, result) {
        if (err)
            callback(err);
        else
            callback(error.Success(result));
    });
};

/**
 * 移除会员卡绑定
 * @param attribute
 * @param callback
 * @constructor
 */
LaoXiMen.prototype.CardUnbind = function (attribute, callback) {
    var cardNumber = attribute.cardNumber;
    kechuan.GetVipInfo(cardNumber, function (err, result) {
        if (err) {
            callback(err);
            return;
        }
        if (!result.CardNumber || result.CardNumber == '') {
            callback(error.ThrowError(error.ErrorCode.CardUndefined));
            return;
        }
        kechuan.BindOpenID(cardNumber, result.Phone, '', function (err) {
            if (err) {
                callback(err);
            } else {
                callback(error.Success());
            }
        });
    });
};

module.exports = LaoXiMen;

var mongoose = require('mongoose'),
    config = require('../config/sys');
var CardBindingSchema = new mongoose.Schema({
    bid: Number,
    cardNumber: {
        type: String,
        trim: true
    },
    openId: {
        type: String,
        trim: true,
    },
    cardGrade: {
        type: String,
        trim: true,
    },
    dtCreate: {
        type: Date,
        default: Date.now()
    },
    memberId_CRM: {
        type: String,
        trim: true
    },
    memberId_ERP: {
        type: String,
        trim: true
    }
});

/**
 * 根据OpenId查询会员卡绑定
 * @param cardNumber
 * @param callback
 * @constructor
 */
CardBindingSchema.statics.FindByOpenId = function (bid, openId, callback) {
    this.find({bid: bid, openId: openId}, function (err, doc) {
        if(callback){
            return callback(err, doc);
        }

        return ;
        
    });
};
/**
 * 根据会员卡查询绑定的OpenId
 * @param cardNumber
 * @param callback
 * @constructor
 */
CardBindingSchema.statics.FindByCardNumber = function (bid, cardNumber, callback) {
    var num = parseInt(cardNumber);
    this.find({bid: bid, cardNumber: {$in: [cardNumber + '', num]}}, function (err, docs) {
        return callback(err, docs);
    });
};

/**
 * 根据OpenId查询除开指定的卡类型 会员卡绑定信息
 * @param openId
 * @param callback
 * @constructor
 */
CardBindingSchema.statics.FindByOpenidInNotGrade = function (bid, openId, cardGrade, callback) {
    this.find({bid: bid, openId: openId, cardGrade: {$ne: cardGrade}}, function (err, docs) {
        return callback(err, docs);
    });
};

mongoose.model(config.cardBinding, CardBindingSchema);

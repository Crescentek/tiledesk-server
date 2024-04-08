var express = require('express');
var router = express.Router();
var winston = require('../../../config/winston');
var Project = require('../../../models/project');
var SubscriptionPayment = require('../models/subscription-payment');
var moment = require('moment');
var mongoose = require('mongoose');
var passport = require('passport');
require('../../../middleware/passport')(passport);
var validtoken = require('../../../middleware/valid-token');
const apiKey = 'pk_test_51OwkzlSB8DBo5lVznoLG6XSXwIlTtLnPhkDEZvYhGezqIUuI4gWVBDI6zUHVPWz7acMruA5HVUZL0BC93RMJ19X4008SApvz95';
winston.debug('stripe apiKey' + apiKey);
const stripe = require('stripe')(apiKey);
const endpointSecret = 'whsec_CrVezhwtmfvjSX44HoinkyTvzOTrs1YC';
winston.debug('stripe endpointSecret' + endpointSecret);
const apiSecretKey = 'sk_test_51OwkzlSB8DBo5lVzLcqllwJlQb2f6qAZ8GoNiUMiGnQzdRXebiCXCjYPjVlKhavaqYT2jyVsAmDgRy59O6wyPiaU00cttmOuTo';
winston.debug('stripe apiSecretKey' + apiSecretKey);
const bodyParser = require('body-parser');
router.post('/webhook', bodyParser.raw({
    'type': 'application/json'
}), function (_0x228c69, _0x32c0cf) {
    winston.debug('»»»» stripe endpointSecret: ' + endpointSecret);
    winston.debug('»»»» stripe apiKey: ' + apiKey);
    winston.debug('stripe apiSecretKey' + apiSecretKey);
    const _0x9f503 = _0x228c69.headers['stripe-signature'];
    winston.debug('stripe sig: ', _0x9f503);
    let _0x881450;
    try {
        _0x881450 = stripe.webhooks.constructEvent(_0x228c69.rawBody, _0x9f503, endpointSecret);
    } catch (_0xbe4dfa) {
        winston.error('**** Stripe error constructEvent: ', _0xbe4dfa.message);
        return _0x32c0cf.status(400).send('Webhook Error: ' + _0xbe4dfa.message);
    }
    if (_0x881450.type === 'checkout.session.completed') {
        winston.debug('!!!!!!!! HI !!!!!!!! checkout.session.completed');
        const _0x6bcc05 = _0x881450.data.object;
        winston.info('stripe checkout.session.completed', _0x6bcc05);
        var _0x6d6211 = _0x6bcc05.client_reference_id;
        winston.info('stripe client_reference_id', _0x6d6211);
        var _0x1f16e9 = _0x6d6211.split('_')[0];
        winston.info('stripe user_id:' + _0x1f16e9);
        var _0x16fef1 = _0x6d6211.split('_')[1];
        winston.info('stripe project_id: ' + _0x16fef1);
        var _0x4695f7 = _0x6d6211.split('_')[2];
        winston.info('stripe plan_name: ' + _0x4695f7);
        var _0x31188b = _0x6d6211.split('_')[3];
        winston.info('stripe seats_num: ' + _0x31188b + 'typeof ', typeof _0x31188b);
        var _0x1dc5aa = Number(_0x31188b);
        winston.info('stripe seats_numAsString: ' + _0x1dc5aa + ' typeof ', typeof _0x1dc5aa);
        var _0x10f817 = _0x881450.data.object.subscription;
        winston.info('*** *** !!!!!!!!!!!!!!!!!!!!!! checkout.session.completed - subscription ID: ', _0x10f817);
        getSubscritionById(_0x10f817).then(function (_0x11a9de) {
            var _0x1d1af5 = _0x11a9de.object;
            winston.info('*** *** checkout.session.completed - getSubscritionById subscr object_type: ', _0x1d1af5);
            var _0x4beb50 = moment.unix(_0x11a9de.current_period_start).format('YYYY-MM-DDTHH:mm:ss.SSS');
            winston.info('*** *** checkout.session.completed - getSubscritionById *** start *** : ', _0x4beb50);
            var _0x1cb09a = moment.unix(_0x11a9de.current_period_end).format('YYYY-MM-DDTHH:mm:ss.SSS');
            winston.info('*** *** checkout.session.completed - getSubscription *** end *** : ', _0x1cb09a);
            var _0x49714d = {
                'profile': {
                    'name': _0x4695f7,
                    'type': 'payment',
                    'subscription_creation_date': _0x4beb50,
                    'subStart': _0x4beb50,
                    'subEnd': _0x1cb09a,
                    'subscriptionId': _0x10f817,
                    'last_stripe_event': _0x881450.type,
                    'agents': _0x1dc5aa
                }
            };
            updateProjectProfile(_0x16fef1, _0x49714d, 'checkout.session.completed');
            saveOnDB(_0x10f817, _0x16fef1, _0x11a9de, _0x1f16e9, _0x881450.type, _0x4695f7, _0x1dc5aa);
        }).catch(function (_0x3a2f63) {
            winston.error('*** *** checkout.session.completed - getSubscritionById err ', _0x3a2f63);
        });
    }
    if (_0x881450.type === 'invoice.payment_succeeded') {
        winston.info(' !!!!!!!! HI !!!!!!!! invoice.payment_succeeded');
        winston.info('*** *** invoice.payment_succeeded - BILLING REASON ', _0x881450.data.object.billing_reason);
        var _0x17e0e1 = _0x881450.data.object.lines.total_count;
        winston.info('*** *** invoice.payment_succeeded - linesNum: ', _0x17e0e1);
        var _0x4139f7 = _0x17e0e1 - 1;
        winston.info('*** *** invoice.payment_succeeded - index: ', _0x4139f7);
        var _0x349d0a = moment.unix(_0x881450.data.object.lines.data[_0x4139f7].period.start).format('YYYY-MM-DDTHH:mm:ss.SSS');
        winston.info('*** *** invoice.payment_succeeded - start: ', _0x349d0a);
        var _0x2923e5 = moment.unix(_0x881450.data.object.lines.data[_0x4139f7].period.end).format('YYYY-MM-DDTHH:mm:ss.SSS');
        winston.info('*** *** invoice.payment_succeeded - end: ', _0x2923e5);
        var _0x10f817 = _0x881450.data.object.subscription;
        winston.info('*** *** invoice.payment_succeeded - subscription ID: ', _0x10f817);
        if (_0x10f817 == null) {
            _0x10f817 = _0x881450.data.object.lines.data[0].subscription;
            winston.info('*** *** invoice.payment_succeeded - subscription ID: ', _0x10f817);
        }
        if (_0x881450.data.object.billing_reason !== 'subscription_create') {
            getSubByIdAndCheckoutSessionCompletedEvnt(_0x10f817).then(function (_0x328248) {
                winston.info('*** *** getSubByIdAndCheckoutSessionCompletedEvnt subsptn_payment: ', _0x328248);
                winston.info('*** *** getSubByIdAndCheckoutSessionCompletedEvnt subsptn_payment typeof subsptn_payment: ', typeof _0x328248);
                if (_0x328248) {
                    var _0x43a0a5 = _0x328248.project_id;
                    winston.info('*** *** getSubByIdAndCheckoutSessionCompletedEvnt subsptn_payment > project_id: ', _0x43a0a5);
                    Project.findOne({
                        '_id': _0x43a0a5
                    }, function (_0x25f30e, _0x4a78cf) {
                        if (_0x25f30e) {
                            winston.info('*** *** getSubByIdAndCheckoutSessionCompletedEvnt  find Project ', _0x25f30e);
                            return _0x25f30e;
                        }
                        if (_0x4a78cf) {
                            winston.info('*** *** getSubByIdAndCheckoutSessionCompletedEvnt  project ', _0x4a78cf);
                            winston.info('*** *** getSubByIdAndCheckoutSessionCompletedEvnt  project > profile', _0x4a78cf.profile);
                            var _0x232cf9 = _0x4a78cf.profile.agents;
                            winston.info('*** *** getSubByIdAndCheckoutSessionCompletedEvnt  project > profile > agents', _0x232cf9);
                            var _0x3025d6 = _0x4a78cf.profile.name;
                            winston.info('*** *** getSubByIdAndCheckoutSessionCompletedEvnt  project > profile > agents typeof', typeof _0x232cf9);
                            var _0x34df62 = _0x328248.user_id;
                            winston.info('*** *** getSubByIdAndCheckoutSessionCompletedEvnt  project > profile > name', _0x3025d6);
                            var _0x100707 = {
                                'profile': {
                                    'name': _0x3025d6,
                                    'type': 'payment',
                                    'subStart': _0x349d0a,
                                    'subEnd': _0x2923e5,
                                    'subscriptionId': _0x10f817,
                                    'last_stripe_event': _0x881450.type,
                                    'agents': _0x232cf9
                                }
                            };
                            updateProjectProfile(_0x43a0a5, _0x100707, 'invoice.payment_succeeded');
                            saveOnDB(_0x10f817, _0x43a0a5, _0x881450, _0x34df62, _0x881450.type, _0x3025d6, _0x232cf9);
                        }
                    });
                }
            }).catch(function (_0x44b423) {
                winston.error('*** *** getSubByIdAndCheckoutSessionCompletedEvnt - err ', _0x44b423);
            });
        } else if (_0x881450.data.object.billing_reason === 'subscription_create') {
            console.log('USECASE  invoice.payment_succeeded  billing_reason subscription_create ');
            saveFirstInvoicePaymentSucceeded(_0x10f817, _0x881450, _0x881450.type);
        }
    }
    if (_0x881450.type === 'customer.subscription.deleted') {
        winston.info(' !!!!!!!! HI !!!!!!!!!!! customer.subscription.deleted');
        winston.info('customer.subscription.deleted event ', _0x881450);
        var _0x10f817 = _0x881450.data.object.id;
        winston.info('*** *** subscription ID ', _0x10f817);
        getSubByIdAndCheckoutSessionCompletedEvnt(_0x10f817).then(function (_0x2f9727) {
            winston.info('*** *** »»» »»» customer.subscription.deleted subscriptionPayment ', _0x2f9727);
            if (_0x2f9727) {
                var _0x3632b4 = _0x2f9727.project_id;
                winston.info('customer.subscription.deleted subscriptionPayment project id: ', _0x3632b4);
                var _0x1aaef2 = _0x2f9727.user_id;
                winston.info('customer.subscription.deleted subscriptionPayment user id: ', _0x1aaef2);
            }
            var _0xd9b0e8 = {
                'profile': {
                    'subscriptionId': _0x10f817,
                    'name': 'Sandbox',
                    'type': 'free',
                    'agents': 1,
                    'last_stripe_event': _0x881450.type
                }
            };
            updateProjectProfile(_0x3632b4, _0xd9b0e8, 'subscription.deleted');
            saveOnDB(_0x10f817, _0x3632b4, _0x881450.data.object, _0x1aaef2, _0x881450.type, _0x4695f7, 1);
        }).catch(function (_0x52eab3) {
            winston.error('*** *** customer.subscription.deleted ', _0x52eab3);
        });
    }
    _0x32c0cf.json({
        'received': true
    });
});
function getSubByIdAndCheckoutSessionCompletedEvnt(_0x254f0d) {
    return new Promise(function (_0x25d18a, _0xbdf96a) {
        SubscriptionPayment.findOne({
            'subscription_id': _0x254f0d,
            'stripe_event': 'checkout.session.completed'
        }, function (_0x4c2784, _0x16cb92) {
            if (_0x4c2784) _0xbdf96a(_0x4c2784);
            var _0x2c37ed = _0x16cb92;
            _0x25d18a(_0x2c37ed);
        });
    });
};
function getSubscritionById(_0x25f4e7) {
    return new Promise(function (_0x11f853, _0x289408) {
        const _0x5b4003 = require('stripe')(apiSecretKey);
        _0x5b4003.subscriptions.retrieve(_0x25f4e7, function (_0x51749c, _0x2a29af) {
            if (_0x51749c) _0x289408(_0x51749c);
            var _0x2a29af = _0x2a29af;
            _0x11f853(_0x2a29af);
        });
    });
};
function updateProjectProfile(_0x5e5793, _0x161921, _0x41ae89) {
    Project.findByIdAndUpdate(_0x5e5793, _0x161921, {
        'new': true,
        'upsert': true
    }, function (_0x5be7e3, _0x3c3cc6) {
        if (_0x5be7e3) {
            winston.error('updateProjectProfile Error ', _0x5be7e3);
        } else {
            winston.debug(_0x3c3cc6);
        }
    });
}
function saveOnDB(_0x3dbc43, _0x3b64f7, _0x468017, _0x24be8c, _0x507043, _0x64e559, _0x55c91b) {
    winston.info('saveOnDB plan_name', _0x64e559);
    winston.info('saveOnDB seats_num', _0x55c91b);
    var _0x3fbf6e = new SubscriptionPayment({
        '_id': new mongoose.Types.ObjectId(),
        'subscription_id': _0x3dbc43,
        'project_id': _0x3b64f7,
        'user_id': _0x24be8c,
        'stripe_event': _0x507043,
        'plan_name': _0x64e559,
        'agents': _0x55c91b,
        'object': _0x468017
    });
    _0x3fbf6e.save(function (_0x4b178a, _0x5857ef) {
        if (_0x4b178a) {
            winston.error('--- > ERROR ', _0x4b178a);
            return res.status(500).send({
                'success': false,
                'msg': 'Error saving object.'
            });
        }
        winston.info('savedSubscriptionPayment ', _0x5857ef);
    });
}
function saveFirstInvoicePaymentSucceeded(_0x422e68, _0x330455, _0x149369) {
    console.log('saveFirstInvoicePaymentSucceeded subscriptionid', _0x422e68);
    console.log('saveFirstInvoicePaymentSucceeded stripe_event', _0x149369);
    var _0x147e02 = new SubscriptionPayment({
        '_id': new mongoose.Types.ObjectId(),
        'subscription_id': _0x422e68,
        'stripe_event': _0x149369,
        'object': _0x330455
    });
    _0x147e02.save(function (_0x5d8b38, _0xe7648b) {
        if (_0x5d8b38) {
            winston.error('--- > ERROR ', _0x5d8b38);
            return res.status(500).send({
                'success': false,
                'msg': 'Error saving object.'
            });
        }
        console.log('savedSubscriptionPayment >> ', _0xe7648b);
    });
}
router.put('/cancelsubscription', [passport.authenticate(['basic', 'jwt'], {
    'session': false
}), validtoken], function (_0x355564, _0x23f28f) {
    var _0xf0deb1 = _0x355564.body.projectid;
    var _0xc6a178 = _0x355564.body.userid;
    winston.info('»»» »»» cancelsubscription projectid', _0xf0deb1);
    winston.info('»»» »»» cancelsubscription userid', _0xc6a178);
    Project.findOne({
        '_id': _0xf0deb1
    }, function (_0x16bcf3, _0x3188bf) {
        if (_0x16bcf3) {
            winston.error('-- > cancelsubscription Error getting project ', _0x16bcf3);
            return _0x16bcf3;
        }
        if (_0x3188bf) {
            winston.info('-- > cancelsubscription  project ', _0x3188bf);
            var _0x252950 = _0x3188bf.profile.subscriptionId;
            const _0x445966 = require('stripe')(apiSecretKey);
            _0x445966.subscriptions.del(_0x252950, function (_0x539cba, _0x31dc30) {
                if (_0x539cba) {
                    winston.error('-- > cancelsubscription  err ', _0x539cba);
                    return _0x23f28f.status(500).send({
                        'success': false,
                        'msg': _0x539cba
                    });
                }
                winston.info('-- > cancelsubscription confirmation ', _0x31dc30);
                _0x23f28f.json(_0x31dc30);
            });
        }
    });
});
router.put('/updatesubscription', [passport.authenticate(['basic', 'jwt'], {
    'session': false
}), validtoken], function (_0x568682, _0x55b15d) {
    var _0x405c9b = _0x568682.body.projectid;
    var _0x98bb63 = _0x568682.body.userid;
    var _0x560c01 = _0x568682.body.price;
    winston.info('»»» »»» updatesubscription projectid', _0x405c9b);
    winston.info('»»» »»» updatesubscription userid', _0x98bb63);
    winston.info('»»» »»» updatesubscription price', _0x560c01);
    const _0xcc0791 = require('stripe')(apiSecretKey);
    Project.findOne({
        '_id': _0x405c9b
    }, function (_0xead730, _0xdccd43) {
        if (_0xead730) {
            winston.error('-- > updatesubscription Error getting project ', _0xead730);
            return _0xead730;
        }
        if (_0xdccd43) {
            winston.info('-- > updatesubscription  project ', _0xdccd43);
            var _0x39e747 = _0xdccd43.profile.subscriptionId;
            _0xcc0791.subscriptions.update(_0x39e747);
        }
    });
});
router.get('/:subscriptionid', [passport.authenticate(['basic', 'jwt'], {
    'session': false
}), validtoken], function (_0x1e9c90, _0x523fdc) {
    SubscriptionPayment.find({
        'subscription_id': _0x1e9c90.params.subscriptionid
    }).sort({
        'object.created': 'asc'
    }).exec(function (_0x3c4003, _0x1b735a) {
        if (_0x3c4003) {
            winston.error('-- > GET SUBSCRIPTION PAYMENTS ERRORt ', project);
            return _0x523fdc.status(500).send({
                'success': false,
                'msg': _0x3c4003
            });
        }
        _0x523fdc.json(_0x1b735a);
    });
});
router.get('/stripesubs/:subscriptionid', [passport.authenticate(['basic', 'jwt'], {
    'session': false
}), validtoken], function (_0x3ff1c2, _0x56fca5) {
    winston.info('-- > subscription get by id freq.params.subscriptionid ', _0x3ff1c2.params.subscriptionid);
    var _0xa884a9 = require('stripe')(apiSecretKey);
    _0xa884a9.subscriptions.retrieve(_0x3ff1c2.params.subscriptionid, function (_0x410d5b, _0x3250c9) {
        if (_0x410d5b) {
            winston.error('-- > subscription get by id from stripe  err ', _0x410d5b);
            return _0x56fca5.status(500).send({
                'success': false,
                'msg': _0x410d5b
            });
        }
        winston.info('-- > subscription get by id from stripe ', _0x3250c9);
        _0x56fca5.json(_0x3250c9);
    });
});
router.get('/checkoutSession/:sessionid', [passport.authenticate(['basic', 'jwt'], {
    'session': false
}), validtoken], function (_0xabd064, _0x577ded) {
    winston.info('-- > checkoutSession params.sessionid ', _0xabd064.params.sessionid);
    var _0x145855 = require('stripe')(apiSecretKey);
    _0x145855.checkout.sessions.retrieve(_0xabd064.params.sessionid, function (_0x1cf4c6, _0x4aac59) {
        if (_0x1cf4c6) {
            winston.info('-- > checkoutSession get by id from stripe  err ', _0x1cf4c6);
            return _0x577ded.status(500).send({
                'success': false,
                'msg': _0x1cf4c6
            });
        }
        winston.info('-- > checkoutSession get by id from stripe ', _0x4aac59);
        _0x577ded.json(_0x4aac59);
    });
});
router.get('/customer/:projectid', [passport.authenticate(['basic', 'jwt'], {
    'session': false
}), validtoken], function (_0x2d9a83, _0xbae95c) {
    winston.debug('»»» »»» get customer from db ', _0x2d9a83.params);
    var _0xd393d2 = _0x2d9a83.params.projectid;
    winston.debug('»»» »»» get customer from db - projectid', _0xd393d2);
    SubscriptionPayment.find({
        'project_id': _0xd393d2,
        'stripe_event': 'checkout.session.completed'
    }, async function (_0x113de1, _0x536676) {
        if (_0x113de1) {
            winston.debug('-- > get customer from db - Error ', _0x113de1);
            return _0x113de1;
        }
        if (_0x536676) {
            _0x536676[0].object.customer;
            winston.debug('-- > get customer from db - subscription > customer id ', _0x536676[0].object.customer);
            const _0x1fbe94 = _0x536676[0].object.customer;
            const _0x47c7fc = require('stripe')(apiSecretKey);
            const _0x2965cc = await _0x47c7fc.customers.retrieve(_0x1fbe94);
            winston.debug('-- > get customer from db > customer from stripe API ', _0x2965cc);
            const _0x55424e = await _0x47c7fc.paymentMethods.list({
                'customer': _0x1fbe94,
                'type': 'card'
            });
            _0x2965cc.paymentMethods = _0x55424e;
            winston.debug('-- > get customer from db > customer + paymentMethods ', _0x536676);
            _0xbae95c.json(_0x2965cc);
        }
    });
});
router.post('/customers/:customerid', [passport.authenticate(['basic', 'jwt'], {
    'session': false
}), validtoken], async function (_0x15c90b, _0x4a143b) {
    var _0x26ec2b = _0x15c90b.params.customerid;
    winston.debug('»»» »»»  update customer - customerid from params ', _0x26ec2b);
    winston.debug('»»» »»»  update customer - cc from body ', _0x15c90b.body);
    const _0x58686d = require('stripe')(apiSecretKey);
    let _0x57d141;
    try {
        _0x57d141 = await _0x58686d.paymentMethods.create({
            'type': 'card',
            'card': {
                'number': _0x15c90b.body.credit_card_num,
                'exp_month': _0x15c90b.body.expiration_date_month,
                'exp_year': _0x15c90b.body.expiration_date_year,
                'cvc': _0x15c90b.body.credit_card_cvc
            }
        });
    } catch (_0x5efdaf) {
        winston.error('»»» »»»  paymentMethod create  error ', _0x5efdaf);
        return _0x4a143b.status(502).send({
            'success': false,
            'msg': _0x5efdaf
        });
    }
    winston.debug('»»» »»»  paymentMethod', _0x57d141);
    try {
        const _0x37c410 = await _0x58686d.paymentMethods.attach(_0x57d141.id, {
            'customer': _0x26ec2b
        });
        winston.debug('»»» »»»  paymentMethod attached ', _0x37c410);
    } catch (_0x33623d) {
        winston.error('»»» »»»  paymentMethod attached  error ', _0x33623d);
        return _0x4a143b.status(501).send({
            'success': false,
            'msg': _0x33623d
        });
    }
    const _0x3309d3 = await _0x58686d.customers.update(_0x26ec2b, {
        'invoice_settings': {
            'default_payment_method': _0x57d141.id
        }
    });
    _0x4a143b.json(_0x3309d3);
});
router.get('/payment_methods/:customerid', [passport.authenticate(['basic', 'jwt'], {
    'session': false
}), validtoken], async function (_0x544033, _0x19360b) {
    winston.info('get PaymentMethods list req.params', _0x544033.params);
    var _0x15bb22 = _0x544033.params.customerid;
    winston.debug('get PaymentMethods list req.params > customer_id ', _0x15bb22);
    const _0xae629b = require('stripe')(apiSecretKey);
    const _0x58d9c1 = await _0xae629b.customers.retrieve(_0x15bb22);
    const _0x36d3c3 = _0x58d9c1.invoice_settings.default_payment_method;
    let _0xf478a3;
    try {
        _0xf478a3 = await _0xae629b.paymentMethods.list({
            'customer': _0x15bb22,
            'type': 'card'
        });
        winston.debug('get PaymentMethods list > paymentMethods ', _0xf478a3);
    } catch (_0x250dca) {
        return _0x19360b.status(501).send({
            'success': false,
            'msg': _0x250dca
        });
    }
    winston.debug('get PaymentMethods list > paymentMethods > default_payment_method_id ', _0x36d3c3);
    _0xf478a3.data.forEach(_0x1eb5ef => {
        if (_0x1eb5ef.id !== _0x36d3c3) {
            winston.debug('get PaymentMethods list > paymentMethods > paymentMethods.data ', _0x1eb5ef.id);
            detachPaymentFunc(_0x1eb5ef.id, function (_0x4fcf68) {
                winston.info('detachPaymentFunc result ', _0x4fcf68);
            });
        }
    });
    _0x19360b.json(_0xf478a3);
});
async function detachPaymentFunc(_0xb34667, _0x610af0) {
    winston.debug('detachPaymentFunct > paymentMethodid ', _0xb34667);
    const _0x1baf8f = require('stripe')(apiSecretKey);
    let _0x228feb;
    try {
        _0x228feb = await _0x1baf8f.paymentMethods.detach(_0xb34667);
        _0x610af0(_0x228feb);
    } catch (_0x160e4a) {
        _0x610af0(_0x160e4a);
    }
}
module.exports = router;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBheW1lbnRzL3N0cmlwZS9pbmRleC5qcyJdLCJuYW1lcyI6WyJleHByZXNzIiwicmVxdWlyZSIsInJvdXRlciIsIndpbnN0b24iLCJQcm9qZWN0IiwiU3Vic2NyaXB0aW9uUGF5bWVudCIsIm1vbWVudCIsIm1vbmdvb3NlIiwicGFzc3BvcnQiLCJ2YWxpZHRva2VuIiwiYXBpS2V5IiwicHJvY2VzcyIsInN0cmlwZSIsImVuZHBvaW50U2VjcmV0IiwiYXBpU2VjcmV0S2V5IiwiYm9keVBhcnNlciIsIl8weDIyOGM2OSIsIl8weDMyYzBjZiIsIl8weDlmNTAzIiwiXzB4ODgxNDUwIiwiXzB4YmU0ZGZhIiwiXzB4NmJjYzA1IiwiXzB4NmQ2MjExIiwiXzB4MWYxNmU5IiwiXzB4MTZmZWYxIiwiXzB4NDY5NWY3IiwiXzB4MzExODhiIiwiXzB4MWRjNWFhIiwiTnVtYmVyIiwiXzB4MTBmODE3IiwiZ2V0U3Vic2NyaXRpb25CeUlkIiwiXzB4MTFhOWRlIiwiXzB4MWQxYWY1IiwiXzB4NGJlYjUwIiwiXzB4MWNiMDlhIiwiXzB4NDk3MTRkIiwidXBkYXRlUHJvamVjdFByb2ZpbGUiLCJzYXZlT25EQiIsIl8weDNhMmY2MyIsIl8weDE3ZTBlMSIsIl8weDQxMzlmNyIsIl8weDM0OWQwYSIsIl8weDI5MjNlNSIsImdldFN1YkJ5SWRBbmRDaGVja291dFNlc3Npb25Db21wbGV0ZWRFdm50IiwiXzB4MzI4MjQ4IiwiXzB4NDNhMGE1IiwiXzB4MjVmMzBlIiwiXzB4NGE3OGNmIiwiXzB4MjMyY2Y5IiwiXzB4MzAyNWQ2IiwiXzB4MzRkZjYyIiwiXzB4MTAwNzA3IiwiXzB4NDRiNDIzIiwiY29uc29sZSIsInNhdmVGaXJzdEludm9pY2VQYXltZW50U3VjY2VlZGVkIiwiXzB4MmY5NzI3IiwiXzB4MzYzMmI0IiwiXzB4MWFhZWYyIiwiXzB4ZDliMGU4IiwiXzB4NTJlYWIzIiwiXzB4MjU0ZjBkIiwiUHJvbWlzZSIsIl8weDI1ZDE4YSIsIl8weGJkZjk2YSIsIl8weDRjMjc4NCIsIl8weDE2Y2I5MiIsIl8weDJjMzdlZCIsIl8weDI1ZjRlNyIsIl8weDExZjg1MyIsIl8weDI4OTQwOCIsIl8weDViNDAwMyIsIl8weDUxNzQ5YyIsIl8weDJhMjlhZiIsIl8weDVlNTc5MyIsIl8weDE2MTkyMSIsIl8weDQxYWU4OSIsIl8weDViZTdlMyIsIl8weDNjM2NjNiIsIl8weDNkYmM0MyIsIl8weDNiNjRmNyIsIl8weDQ2ODAxNyIsIl8weDI0YmU4YyIsIl8weDUwNzA0MyIsIl8weDY0ZTU1OSIsIl8weDU1YzkxYiIsIl8weDNmYmY2ZSIsIl8weDRiMTc4YSIsIl8weDU4NTdlZiIsInJlcyIsIl8weDQyMmU2OCIsIl8weDMzMDQ1NSIsIl8weDE0OTM2OSIsIl8weDE0N2UwMiIsIl8weDVkOGIzOCIsIl8weGU3NjQ4YiIsIl8weDM1NTU2NCIsIl8weDIzZjI4ZiIsIl8weGYwZGViMSIsIl8weGM2YTE3OCIsIl8weDE2YmNmMyIsIl8weDMxODhiZiIsIl8weDI1Mjk1MCIsIl8weDQ0NTk2NiIsIl8weDUzOWNiYSIsIl8weDMxZGMzMCIsIl8weDU2ODY4MiIsIl8weDU1YjE1ZCIsIl8weDQwNWM5YiIsIl8weDk4YmI2MyIsIl8weDU2MGMwMSIsIl8weGNjMDc5MSIsIl8weGVhZDczMCIsIl8weGRjY2Q0MyIsIl8weDM5ZTc0NyIsIl8weDFlOWM5MCIsIl8weDUyM2ZkYyIsIl8weDNjNDAwMyIsIl8weDFiNzM1YSIsInByb2plY3QiLCJfMHgzZmYxYzIiLCJfMHg1NmZjYTUiLCJfMHhhODg0YTkiLCJfMHg0MTBkNWIiLCJfMHgzMjUwYzkiLCJfMHhhYmQwNjQiLCJfMHg1NzdkZWQiLCJfMHgxNDU4NTUiLCJfMHgxY2Y0YzYiLCJfMHg0YWFjNTkiLCJfMHgyZDlhODMiLCJfMHhiYWU5NWMiLCJfMHhkMzkzZDIiLCJfMHgxMTNkZTEiLCJfMHg1MzY2NzYiLCJfMHgxZmJlOTQiLCJfMHg0N2M3ZmMiLCJfMHgyOTY1Y2MiLCJfMHg1NTQyNGUiLCJfMHgxNWM5MGIiLCJfMHg0YTE0M2IiLCJfMHgyNmVjMmIiLCJfMHg1ODY4NmQiLCJfMHg1N2QxNDEiLCJfMHg1ZWZkYWYiLCJfMHgzN2M0MTAiLCJfMHgzMzYyM2QiLCJfMHgzMzA5ZDMiLCJfMHg1NDQwMzMiLCJfMHgxOTM2MGIiLCJfMHgxNWJiMjIiLCJfMHhhZTYyOWIiLCJfMHg1OGQ5YzEiLCJfMHgzNmQzYzMiLCJfMHhmNDc4YTMiLCJfMHgyNTBkY2EiLCJfMHgxZWI1ZWYiLCJkZXRhY2hQYXltZW50RnVuYyIsIl8weDRmY2Y2OCIsIl8weGIzNDY2NyIsIl8weDYxMGFmMCIsIl8weDFiYWY4ZiIsIl8weDIyOGZlYiIsIl8weDE2MGU0YSIsIm1vZHVsZSJdLCJtYXBwaW5ncyI6Im94S0FBQSxJQUFJQSxPQUFBLENBQVVDLE9BQUEsQyxlQUFBLENBQWQsQ0FDQSxJQUFJQyxNQUFBLENBQVNGLE9BQUEsQyxlQUFBLEdBQWIsQ0FFQSxJQUFJRyxPQUFBLENBQVVGLE9BQUEsQyxlQUFBLENBQWQsQ0FFQSxJQUFJRyxPQUFBLENBQVVILE9BQUEsQyx5QkFBQSxDQUFkLENBQ0EsSUFBSUksbUJBQUEsQ0FBc0JKLE9BQUEsQyxlQUFBLENBQTFCLENBQ0EsSUFBSUssTUFBQSxDQUFTTCxPQUFBLEMsZUFBQSxDQUFiLENBQ0EsSUFBSU0sUUFBQSxDQUFXTixPQUFBLEMsZUFBQSxDQUFmLENBQ0EsSUFBSU8sUUFBQSxDQUFXUCxPQUFBLEMsVUFBQSxDQUFmLENBRUFBLE9BQUEsQyxlQUFBLEVBQXdDTyxRQUF4QyxFQUVBLElBQUlDLFVBQUEsQ0FBYVIsT0FBQSxDLGVBQUEsQ0FBakIsQ0FHQSxNQUFNUyxNQUFBLENBQVNDLE9BQUEsQyxlQUFBLEUsdUJBQUEsQ0FBZixDQUNBUixPQUFBLEMsZUFBQSxFLGVBQWMsQ0FBa0JPLE1BQWhDLEVBRUEsTUFBTUUsTUFBQSxDQUFTWCxPQUFBLEMsUUFBQSxFQUFrQlMsTUFBbEIsQ0FBZixDQUdBLE1BQU1HLGNBQUEsQ0FBaUJGLE9BQUEsQyxLQUFBLEUsY0FBQSxDQUF2QixDQUNBUixPQUFBLEMsZUFBQSxFLDBCQUFj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LEVBQ3BCRixTQURvQixDQUF0QixDQUdBQyxTQUFBLENBQVNFLFNBQVQsRUFKRSxDQUtGLE1BQU9DLFNBQVAsQ0FBVSxDQUNWSCxTQUFBLENBQVNHLFNBQVQsRUFEVSxDQVQ4QyxDQWlENURDLE1BQUEsQyxlQUFBLEVBQWlCakssTUFBakIiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgZXhwcmVzcyA9IHJlcXVpcmUoJ2V4cHJlc3MnKTtcbnZhciByb3V0ZXIgPSBleHByZXNzLlJvdXRlcigpO1xuLy8gdmFyIHdpbnN0b24gPSByZXF1aXJlKCcuLi8uLi8uLi8uLi9jb25maWcvd2luc3RvbicpO1xudmFyIHdpbnN0b24gPSByZXF1aXJlKCcuLi8uLi8uLi9jb25maWcvd2luc3RvbicpXG4vLyB2YXIgUHJvamVjdCA9IHJlcXVpcmUoXCIuLi8uLi8uLi8uLi9tb2RlbHMvcHJvamVjdFwiKTtcbnZhciBQcm9qZWN0ID0gcmVxdWlyZShcIi4uLy4uLy4uL21vZGVscy9wcm9qZWN0XCIpO1xudmFyIFN1YnNjcmlwdGlvblBheW1lbnQgPSByZXF1aXJlKFwiLi4vbW9kZWxzL3N1YnNjcmlwdGlvbi1wYXltZW50XCIpO1xudmFyIG1vbWVudCA9IHJlcXVpcmUoJ21vbWVudCcpO1xudmFyIG1vbmdvb3NlID0gcmVxdWlyZSgnbW9uZ29vc2UnKTtcbnZhciBwYXNzcG9ydCA9IHJlcXVpcmUoJ3Bhc3Nwb3J0Jyk7XG4vLyByZXF1aXJlKCcuLi8uLi8uLi8uLi9taWRkbGV3YXJlL3Bhc3Nwb3J0JykocGFzc3BvcnQpO1xucmVxdWlyZShcIi4uLy4uLy4uL21pZGRsZXdhcmUvcGFzc3BvcnRcIikocGFzc3BvcnQpO1xuLy8gdmFyIHZhbGlkdG9rZW4gPSByZXF1aXJlKCcuLi8uLi8uLi8uLi9taWRkbGV3YXJlL3ZhbGlkLXRva2VuJylcbnZhciB2YWxpZHRva2VuID0gcmVxdWlyZSgnLi4vLi4vLi4vbWlkZGxld2FyZS92YWxpZC10b2tlbicpXG4vLyBTZXQgeW91ciBzZWNyZXQga2V5OiByZW1lbWJlciB0byBjaGFuZ2UgdGhpcyB0byB5b3VyIGxpdmUgc2VjcmV0IGtleSBpbiBwcm9kdWN0aW9uXG4vLyBTZWUgeW91ciBrZXlzIGhlcmU6IGh0dHBzOi8vZGFzaGJvYXJkLnN0cmlwZS5jb20vYWNjb3VudC9hcGlrZXlzXG5jb25zdCBhcGlLZXkgPSBwcm9jZXNzLmVudi5QQVlNRU5UX1NUUklQRV9BUElLRVk7XG53aW5zdG9uLmRlYnVnKCdzdHJpcGUgYXBpS2V5JyArIGFwaUtleSk7XG5cbmNvbnN0IHN0cmlwZSA9IHJlcXVpcmUoJ3N0cmlwZScpKGFwaUtleSk7XG5cbi8vIEZpbmQgeW91ciBlbmRwb2ludCdzIHNlY3JldCBpbiB5b3VyIERhc2hib2FyZCdzIHdlYmhvb2sgc2V0dGluZ3NcbmNvbnN0IGVuZHBvaW50U2VjcmV0ID0gcHJvY2Vzcy5lbnYuUEFZTUVOVF9TVFJJUEVfU0VDUkVUO1xud2luc3Rvbi5kZWJ1Zygnc3RyaXBlIGVuZHBvaW50U2VjcmV0JyArIGVuZHBvaW50U2VjcmV0KTtcblxuY29uc3QgYXBpU2VjcmV0S2V5ID0gcHJvY2Vzcy5lbnYuUEFZTUVOVF9TVFJJUEVfQVBJX1NFQ1JFVF9LRVk7XG53aW5zdG9uLmRlYnVnKCdzdHJpcGUgYXBpU2VjcmV0S2V5JyArIGFwaVNlY3JldEtleSk7XG5cbmNvbnN0IGJvZHlQYXJzZXIgPSByZXF1aXJlKCdib2R5LXBhcnNlcicpO1xuXG4vLyBodHRwczovL3N0cmlwZS5jb20vZG9jcy9wYXltZW50cy9jaGVja291dC9mdWxmaWxsbWVudCN3ZWJob29rc1xuLy8gY3VybCAtWCBQT1NUIC11IGFuZHJlYS5sZW9AZjIxLml0OjEyMzQ1NiAtSCAnQ29udGVudC1UeXBlOmFwcGxpY2F0aW9uL2pzb24nIC1kICd7XCJ0eXBlXCI6XCJwYXltZW50X2ludGVudC5zdWNjZWVkZWRcIn0nICBodHRwOi8vbG9jYWxob3N0OjMwMDAvbW9kdWxlcy9wYXltZW50cy9zdHJpcGUvd2ViaG9va1xucm91dGVyLnBvc3QoJy93ZWJob29rJywgYm9keVBhcnNlci5yYXcoeyB0eXBlOiAnYXBwbGljYXRpb24vanNvbicgfSksIGZ1bmN0aW9uIChyZXF1ZXN0LCByZXNwb25zZSkge1xuICBcbiAgd2luc3Rvbi5kZWJ1ZygnwrvCu8K7wrsgc3RyaXBlIGVuZHBvaW50U2VjcmV0OiAnICsgZW5kcG9pbnRTZWNyZXQpXG4gIHdpbnN0b24uZGVidWcoJ8K7wrvCu8K7IHN0cmlwZSBhcGlLZXk6ICcgKyBhcGlLZXkpO1xuICB3aW5zdG9uLmRlYnVnKCdzdHJpcGUgYXBpU2VjcmV0S2V5JyArIGFwaVNlY3JldEtleSk7XG5cbiAgY29uc3Qgc2lnID0gcmVxdWVzdC5oZWFkZXJzWydzdHJpcGUtc2lnbmF0dXJlJ107XG5cbiAgd2luc3Rvbi5kZWJ1Zygnc3RyaXBlIHNpZzogJywgc2lnKVxuXG4gIGxldCBldmVudDtcblxuICB0cnkge1xuICAgIGV2ZW50ID0gc3RyaXBlLndlYmhvb2tzLmNvbnN0cnVjdEV2ZW50KHJlcXVlc3QucmF3Qm9keSwgc2lnLCBlbmRwb2ludFNlY3JldCk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHdpbnN0b24uZXJyb3IoJyoqKiogU3RyaXBlIGVycm9yIGNvbnN0cnVjdEV2ZW50OiAnLCBlcnIubWVzc2FnZSlcbiAgICByZXR1cm4gcmVzcG9uc2Uuc3RhdHVzKDQwMCkuc2VuZChgV2ViaG9vayBFcnJvcjogJHtlcnIubWVzc2FnZX1gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiohICoqKiBIYW5kbGUgdGhlIGNoZWNrb3V0LnNlc3Npb24uY29tcGxldGVkIGV2ZW50ICoqKlxuICAgKiBOT1RFOiBUSElTIEVWRU5UIE9DQ1VSIE9OTFkgV0hFTiBJUyBDUkVBVEVEIEEgTkVXIFNVQlNDUklQVElPTlxuICAgKiAxKSBGUk9NIFRIRSBQUk9QRVJUWSBcImNsaWVudF9yZWZlcmVuY2VfaWRcIiBBUkUgT0JUQUlORUQgVEhFOlxuICAgKiAgICBBKSBVU0VSIElEXG4gICAqICAgIEIpIFBST0pFQ1QgSUQgXG4gICAqIDIpIFdJVEggVEhFIHN1YnNjcmlwdGlvbiBJRCAoTk9URSBpcyB0aGUgcHJvcGVydHkgc3Vic2NyaXB0aW9uKSBJUyBSVU5ORUQgQSBDQUxMQkFDSyBUTyBTVFJJUEVcbiAgICogICAgVE8gT0JUQUlOIFRIRSBPQkpFQ1QgXCJTVUJTQ1JJUFRJT05cIiBBTkQgVEhFTiBGUk9NIFRISVMgQVJFIE9CVEFJTkVEIFRIRTpcbiAgICogICAgQSkgc3Vic2NyaXB0aW9uU3RhcnREYXRlXG4gICAqICAgIEIpIHN1YnNjcmlwdGlvbkVuZERhdGVcbiAgICogICAgQykgcXVhbnRpdHkgKHdoaWNoIGluIHRoZSB0aWxlZGVzayBkYXNoYm9hcmQgY29ycmVzcG9uZHMgdG8gdGhlIG51bWJlciBvZiBhZ2VudHMgLyBvcGVyYXRvcnMgc2VhdHMpXG4gICAqIDMpIFdJVEggVEhFIE9CVEFJTkVEIERBVEEgSVMgVVBEQVRFRCBUSEUgUFJPSkVDVCAnUFJPRklMRScgKGlzIGFuIG9iamVjdCBuZXN0ZWQgaW4gdGhlIHByb2plY3Qgb2JqZWN0KSBcbiAgICogNCkgVEhFIE9CVEFJTkVEIE9CSkVDVCBcIlNVQlNDUklQVElPTlwiIEFORCB0aGUgXCJTVUJTQ1JJUFRJT04gSURcIiwgdGhlIFwiUFJPSkVDVCBJRFwiLCB0aGUgXCJVU0VSIElEXCIgQU5EIHN0cmlwZV9ldmVudDogXCJjaGVja291dC5zZXNzaW9uLmNvbXBsZXRlZFwiIEFSRSBTQVZFRCBPTiBPVVIgREJcbiAgICogICAgQVMgXCJTVUJTQ1JJUFRJT04tUEFZTUVOVFwiXG4gICAqL1xuXG4gIGlmIChldmVudC50eXBlID09PSAnY2hlY2tvdXQuc2Vzc2lvbi5jb21wbGV0ZWQnKSB7XG4gICAgd2luc3Rvbi5kZWJ1ZygnISEhISEhISEgSEkgISEhISEhISEgY2hlY2tvdXQuc2Vzc2lvbi5jb21wbGV0ZWQnKTtcblxuICAgIGNvbnN0IHNlc3Npb24gPSBldmVudC5kYXRhLm9iamVjdDtcbiAgICB3aW5zdG9uLmluZm8oJ3N0cmlwZSBjaGVja291dC5zZXNzaW9uLmNvbXBsZXRlZCcsIHNlc3Npb24pO1xuXG4gICAgdmFyIGNsaWVudF9yZWZlcmVuY2VfaWQgPSBzZXNzaW9uLmNsaWVudF9yZWZlcmVuY2VfaWQ7XG4gICAgd2luc3Rvbi5pbmZvKCdzdHJpcGUgY2xpZW50X3JlZmVyZW5jZV9pZCcsIGNsaWVudF9yZWZlcmVuY2VfaWQpO1xuXG4gICAgLyoqIDFBICovXG4gICAgdmFyIHVzZXJfaWQgPSBjbGllbnRfcmVmZXJlbmNlX2lkLnNwbGl0KFwiX1wiKVswXTtcbiAgICB3aW5zdG9uLmluZm8oJ3N0cmlwZSB1c2VyX2lkOicgKyB1c2VyX2lkKTtcblxuICAgIC8qKiAxQiAqL1xuICAgIHZhciBwcm9qZWN0X2lkID0gY2xpZW50X3JlZmVyZW5jZV9pZC5zcGxpdChcIl9cIilbMV07XG4gICAgd2luc3Rvbi5pbmZvKCdzdHJpcGUgcHJvamVjdF9pZDogJyArIHByb2plY3RfaWQpO1xuXG4gICAgdmFyIHBsYW5fbmFtZSA9IGNsaWVudF9yZWZlcmVuY2VfaWQuc3BsaXQoXCJfXCIpWzJdO1xuICAgIHdpbnN0b24uaW5mbygnc3RyaXBlIHBsYW5fbmFtZTogJyArIHBsYW5fbmFtZSk7XG5cbiAgICB2YXIgc2VhdHNfbnVtQXNTdHJpbmcgPSBjbGllbnRfcmVmZXJlbmNlX2lkLnNwbGl0KFwiX1wiKVszXTtcbiAgICB3aW5zdG9uLmluZm8oJ3N0cmlwZSBzZWF0c19udW06ICcgKyBzZWF0c19udW1Bc1N0cmluZyArICd0eXBlb2YgJywgdHlwZW9mIHNlYXRzX251bUFzU3RyaW5nKTtcblxuICAgIHZhciBzZWF0c19udW0gPSBOdW1iZXIoc2VhdHNfbnVtQXNTdHJpbmcpXG4gICAgd2luc3Rvbi5pbmZvKCdzdHJpcGUgc2VhdHNfbnVtQXNTdHJpbmc6ICcgKyBzZWF0c19udW0gKyAnIHR5cGVvZiAnLCB0eXBlb2Ygc2VhdHNfbnVtKTtcblxuICAgIHZhciBzdWJzY3JpcHRpb25JZCA9IGV2ZW50LmRhdGEub2JqZWN0LnN1YnNjcmlwdGlvbjtcbiAgICB3aW5zdG9uLmluZm8oJyoqKiAqKiogISEhISEhISEhISEhISEhISEhISEhISBjaGVja291dC5zZXNzaW9uLmNvbXBsZXRlZCAtIHN1YnNjcmlwdGlvbiBJRDogJywgc3Vic2NyaXB0aW9uSWQpO1xuXG4gICAgZ2V0U3Vic2NyaXRpb25CeUlkKHN1YnNjcmlwdGlvbklkKS50aGVuKGZ1bmN0aW9uIChzdWJzY3JpcHRpb25fb2JqKSB7XG5cbiAgICAgIHZhciBvYmplY3RfdHlwZSA9IHN1YnNjcmlwdGlvbl9vYmoub2JqZWN0O1xuICAgICAgd2luc3Rvbi5pbmZvKCcqKiogKioqIGNoZWNrb3V0LnNlc3Npb24uY29tcGxldGVkIC0gZ2V0U3Vic2NyaXRpb25CeUlkIHN1YnNjciBvYmplY3RfdHlwZTogJywgb2JqZWN0X3R5cGUpO1xuXG4gICAgICAvKiogMkEgKi9cbiAgICAgIHZhciBzdWJzY3JpcHRpb25TdGFydERhdGUgPSBtb21lbnQudW5peChzdWJzY3JpcHRpb25fb2JqLmN1cnJlbnRfcGVyaW9kX3N0YXJ0KS5mb3JtYXQoJ1lZWVktTU0tRERUSEg6bW06c3MuU1NTJylcbiAgICAgIHdpbnN0b24uaW5mbygnKioqICoqKiBjaGVja291dC5zZXNzaW9uLmNvbXBsZXRlZCAtIGdldFN1YnNjcml0aW9uQnlJZCAqKiogc3RhcnQgKioqIDogJywgc3Vic2NyaXB0aW9uU3RhcnREYXRlKTtcblxuICAgICAgLyoqIDJCICovXG4gICAgICB2YXIgc3Vic2NyaXB0aW9uRW5kRGF0ZSA9IG1vbWVudC51bml4KHN1YnNjcmlwdGlvbl9vYmouY3VycmVudF9wZXJpb2RfZW5kKS5mb3JtYXQoJ1lZWVktTU0tRERUSEg6bW06c3MuU1NTJylcbiAgICAgIHdpbnN0b24uaW5mbygnKioqICoqKiBjaGVja291dC5zZXNzaW9uLmNvbXBsZXRlZCAtIGdldFN1YnNjcmlwdGlvbiAqKiogZW5kICoqKiA6ICcsIHN1YnNjcmlwdGlvbkVuZERhdGUpO1xuXG4gICAgICAvKipcbiAgICAgICAqISAqKiogQk9EWSAqKipcbiAgICAgICAqL1xuICAgICAgdmFyIGJvZHkgPSB7XG4gICAgICAgIHByb2ZpbGU6IHtcbiAgICAgICAgICBuYW1lOiBwbGFuX25hbWUsXG4gICAgICAgICAgdHlwZTogJ3BheW1lbnQnLFxuICAgICAgICAgIHN1YnNjcmlwdGlvbl9jcmVhdGlvbl9kYXRlOiBzdWJzY3JpcHRpb25TdGFydERhdGUsXG4gICAgICAgICAgc3ViU3RhcnQ6IHN1YnNjcmlwdGlvblN0YXJ0RGF0ZSxcbiAgICAgICAgICBzdWJFbmQ6IHN1YnNjcmlwdGlvbkVuZERhdGUsXG4gICAgICAgICAgc3Vic2NyaXB0aW9uSWQ6IHN1YnNjcmlwdGlvbklkLFxuICAgICAgICAgIGxhc3Rfc3RyaXBlX2V2ZW50OiBldmVudC50eXBlLFxuICAgICAgICAgIGFnZW50czogc2VhdHNfbnVtXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLyoqIDMgKi9cbiAgICAgIHVwZGF0ZVByb2plY3RQcm9maWxlKHByb2plY3RfaWQsIGJvZHksICdjaGVja291dC5zZXNzaW9uLmNvbXBsZXRlZCcpO1xuXG4gICAgICAvKiogNCAqL1xuICAgICAgc2F2ZU9uREIoc3Vic2NyaXB0aW9uSWQsIHByb2plY3RfaWQsIHN1YnNjcmlwdGlvbl9vYmosIHVzZXJfaWQsIGV2ZW50LnR5cGUsIHBsYW5fbmFtZSwgc2VhdHNfbnVtKVxuXG4gICAgfSkuY2F0Y2goZnVuY3Rpb24gKGVycikge1xuICAgICAgd2luc3Rvbi5lcnJvcignKioqICoqKiBjaGVja291dC5zZXNzaW9uLmNvbXBsZXRlZCAtIGdldFN1YnNjcml0aW9uQnlJZCBlcnIgJywgZXJyKTtcbiAgICB9KTtcblxuICB9XG4gIC8vIG9iamVjdF90eXBlID0gc3Vic2NyaXB0aW9uLlxuICAvKipcbiAgICoqISAqKiogSGFuZGxlIHRoZSBpbnZvaWNlLnBheW1lbnRfc3VjY2VlZGVkIGV2ZW50ICoqKlxuICAgKiBOT1RFOiBUSElTIEVWRU5UIE9DQ1VSIFdIRU4gSVMgQ1JFQVRFRCBBIE5FVyBTVUJTQ1JJUFRJT04gQU5EIEVWRVJZIFRJTUUgVEhFIFNBTUUgSVMgUkVORVdFRFxuICAgKiAxKSBGUk9NIFRIRSBPQkpFQ1QgT0YgVEhFIEVWRU5UIEFSRSBPQlRBSU5FRCBUSEU6XG4gICAqICAgIEEpIHN1YnNjcmlwdGlvblN0YXJ0RGF0ZVxuICAgKiAgICBCKSBzdWJzY3JpcHRpb25FbmREYXRlXG4gICAqICAgIEMpIHN1YnNjcml0cHRpb25JZCAgXG4gICAqIDIpIHdoZW4gcmVmZXIgdG8gYSBSRU5FV0FMICggYmlsbGluZ19yZWFzb24gPT09IHN1YnNjcmlwdGlvbl9jeWNsZSlcbiAgICogICAgSUYgVEhFIFZBTFVFIE9GIFRIRSBQUk9QRVJUWSBcImJpbGxpbmdfcmVhc29uXCIgSVMgVU5MSUtFIE9GIFwic3Vic2NyaXB0aW9uX2NyZWF0ZVwiIChNRUFOUyBUSEFUIFRIRSBFVkVOVCBSRUZFUiBUTyBBIFJFTkVXQUwgXG4gICAqICAgIEZPUiBXSElDSCBiaWxsaW5nX3JlYXNvbjogc3Vic2NyaXB0aW9uX2N5Y2xlIEFORCBOT1QgVE8gVEhFIEZJUlNUIFNVQlNDUklQVElPTikgXG4gICAqICAgIEEpIElTIE9CVEFJTkVEIFRIRSAnU1VCU0NSSVBUSU9OLVBBWU1FTlQnICh3aXRoIHN0cmlwZV9ldmVudDogXCJjaGVja291dC5zZXNzaW9uLmNvbXBsZXRlZFwiKSBTQVZFRCBBQk9WRSBBTkQgVEhFTiBGUk9NIFRISVM6XG4gICAqICAgICAgIC0gVEhFIFwiUFJPSkVDVCBJRFwiIFxuICAgKiAgICAgICAtIFRIRSBcIlVTRVIgSURcIlxuICAgKiAgICAgICBUTyBPQlRBSU4gVEhFICdTVUJTQ1JJUFRJT04tUEFZTUVOVCdJTiBPVVIgREIgSVMgTE9PS0VEIEZPUiBUSEUgXCJTVUJTQ1JJUElPTi1QQVlNRU5UXCIgVEhBVCBIQVMgRk9SIHN1YnNjcmlwdGlvbiBpZCBUSEUgVkFMVUUgT0YgMUMgQU5EIHN0cmlwZV9ldmVudDogXCJjaGVja291dC5zZXNzaW9uLmNvbXBsZXRlZFwiXG4gICAqICAgICAgIFRIRSBDT05ESVRJT04gc3RyaXBlX2V2ZW50OiBcImNoZWNrb3V0LnNlc3Npb24uY29tcGxldGVkXCIgKE5PIE1PUkU6IG9iamVjdF90eXBlID0gc3Vic2NyaXB0aW9uKSBJVCdTIE5FQ0VTU0FSWSBUTyBGSUxURVIgVEhFIFwiU1VCU0NSSVBJT04tUEFZTUVOVFNcIiBcbiAgICogICAgICAgVEhBVCBDT05UQUlOIFRIRSAgUFJPUEVSVElFUyAgXCJwcm9qZWN0SURcIiBBTkQgXCJ1c2VySURcIlxuICAgKiAgICAgICBUSEUgRVhJU1RFTkNFIE9GIEEgXCJTVUJTQ1JJUFRJT04tUEFZTUVOVFwiIFdJVEhPVVQgXCJwcm9qZWN0SURcIiBBTkQgXCJ1c2VySURcIiBJUyBEVUUgVE8gVEhFIEZBQ1QgVEhBVCBBVCBUSEUgTU9NRU5UIE9GIFRIRSBDUkVBVElPTiBPRiBBIFNVQlNDUklQVElPTiBcbiAgICogICAgICAgSVMgU0FWRUQgSU4gT1VSIERCIEFMU08gQSBcIlNVQlNDUklQVElPTi1QQVlNRU5UXCIgQ09SUkVTUE9ORElORyBUTyBUSEUgT0JKRUNUIFJFVFVSTkVEIEJZICBUSEUgRVZFTlQgXCJpbnZvaWNlLnBheW1lbnRfc3VjY2VlZGVkXCIgVVNFRlVMIEJFQ0FVU0UgXG4gICAqICAgICAgIElUIENPTlRBSU5TIFRIRSBMSU5LUyBPRiBUSEUgSU5WT0lDRSBPRiBUSEUgRklSU1QgU1VCU0NSSVBUSU9OICh1c2VkIGJ5IHRpbGVkZXNrIGRhc2hib2FyZCBpbiB0aGUgY29tcG9uZW50cyBwYXltZW50cylcbiAgICogICAgICAgQlVUIEZST00gV0hJQ0ggSVQgSVMgTk9UIFBPU1NJQkxFIFBVU0ggQU5EIFRIRU4gVE8gVE8gT0JUQUlOIFRIRSBcInByb2plY3RJRFwiIEFORCBcInVzZXJJRFwiXG4gICAqICAgIEIpIElTIFVQREFURUQgVEhFIFBST0pFQ1QgJ1BST0ZJTEUnIFdJVEg6XG4gICAqICAgICAgIC0gREFUQSBPQlRBSU5FRCBGUk9NIFRIRSBFVkVOVCdTIE9CSkVDVDpcbiAgICogICAgICAgICAtIHN1YnNjcmlwdGlvblN0YXJ0RGF0ZVxuICAgKiAgICAgICAgIC0gc3Vic2NyaXB0aW9uRW5kRGF0ZVxuICAgKiAgICAgICAgIC0gc3Vic2NyaXB0aW9uSWQgXG4gICAqICAgICAgICAgLSBsYXN0X3N0cmlwZV9ldmVudCBcbiAgICogICAgICAgICAtIHF1YW50aXR5ICh3aGljaCBpbiB0aGUgZGFzaGJvYXJkIGNvcnJlc3BvbmRzIHRvIHRoZSBudW1iZXIgb2YgYWdlbnRzIC8gb3BlcmF0b3JzIHNlYXRzKVxuICAgKiAgICAgICAtIERBVEEgT0JUQUlORUQgRlJPTSBUSEUgJ1NVQlNDUklQVElPTi1QQVlNRU5UJyB3aXRoIHN0cmlwZV9ldmVudDogXCJjaGVja291dC5zZXNzaW9uLmNvbXBsZXRlZFwiXG4gICAqICAgICAgICAgLSBcIlBST0pFQ1QgSURcIiBhbmQgXCJVU0VSIElEXCJcbiAgICogICAgQykgVEhFIE9CSkVDVCBPRiBUSEUgRVZFTlQgaW52b2ljZS5wYXltZW50X3N1Y2NlZWRlZCBBTkQgdGhlIFwiU1VCU0NSSVBUSU9OIElEXCIsIHRoZSBcIlBST0pFQ1QgSURcIiwgdGhlIFwiVVNFUiBJRFwiIEFORCB0aGUgXCJPQkpFQ1RfVFlQRVwiIChldmVudCkgXG4gICAqICAgICAgIEFSRSBTQVZFRCBBUyBcIlNVQlNDUklQVElPTi1QQVlNRU5UXCIgT04gT1VSIERCXG4gICAqIDMpIHdoZW4gcmVmZXIgdG8gYSBDUkVBVElPTiAoYmlsbGluZ19yZWFzb24gPT09IHN1YnNjcmlwdGlvbl9jcmVhdGUpXG4gICAqICAgIEEpIFRIRSBPQkpFQ1QgT0YgVEhFIEVWRU5UIGludm9pY2UucGF5bWVudF9zdWNjZWVkZWQgQU5EIFRIRSBEQVRBIGV2ZW50LnR5cGUgPT09IGludm9pY2UucGF5bWVudF9zdWNjZWVkZWQgIEFSRSBTQVZFRCBBUyBcIlNVQlNDUklQVElPTi1QQVlNRU5UXCJcbiAgICogICAgICAgT04gT1VSIERCIChOT1RFOiBcIlBST0pFQ1QgSURcIiBBTkQgXCJVU0VSIElEXCIgQVJFIFNBVkVEIEFTIG51bGwgU0lOQ0UgSVMgTk9UIFBPU1NJQkxFIFRPIFJFVFJJRVZFIFRIRSBWQUxVRVMpIFxuICAgKiBcbiAgICovXG4gIGlmIChldmVudC50eXBlID09PSAnaW52b2ljZS5wYXltZW50X3N1Y2NlZWRlZCcpIHtcblxuICAgIHdpbnN0b24uaW5mbygnICEhISEhISEhIEhJICEhISEhISEhIGludm9pY2UucGF5bWVudF9zdWNjZWVkZWQnKTtcbiAgICB3aW5zdG9uLmluZm8oJyoqKiAqKiogaW52b2ljZS5wYXltZW50X3N1Y2NlZWRlZCAtIEJJTExJTkcgUkVBU09OICcsIGV2ZW50LmRhdGEub2JqZWN0LmJpbGxpbmdfcmVhc29uKTtcblxuICAgIHZhciBsaW5lc051bSA9IGV2ZW50LmRhdGEub2JqZWN0LmxpbmVzLnRvdGFsX2NvdW50XG4gICAgd2luc3Rvbi5pbmZvKCcqKiogKioqIGludm9pY2UucGF5bWVudF9zdWNjZWVkZWQgLSBsaW5lc051bTogJywgbGluZXNOdW0pO1xuXG4gICAgdmFyIGluZGV4ID0gbGluZXNOdW0gLSAxO1xuICAgIHdpbnN0b24uaW5mbygnKioqICoqKiBpbnZvaWNlLnBheW1lbnRfc3VjY2VlZGVkIC0gaW5kZXg6ICcsIGluZGV4KTtcblxuICAgIC8qKiAxQSAqLyAvLyBUSElTIFdPUktTXG4gICAgdmFyIHN1YnNjcmlwdGlvblN0YXJ0RGF0ZSA9IG1vbWVudC51bml4KGV2ZW50LmRhdGEub2JqZWN0LmxpbmVzLmRhdGFbaW5kZXhdLnBlcmlvZC5zdGFydCkuZm9ybWF0KCdZWVlZLU1NLUREVEhIOm1tOnNzLlNTUycpXG4gICAgd2luc3Rvbi5pbmZvKCcqKiogKioqIGludm9pY2UucGF5bWVudF9zdWNjZWVkZWQgLSBzdGFydDogJywgc3Vic2NyaXB0aW9uU3RhcnREYXRlKTtcblxuICAgIC8qKiAxQiAqLyAvLyBUSElTIFdPUktTXG4gICAgdmFyIHN1YnNjcmlwdGlvbkVuZERhdGUgPSBtb21lbnQudW5peChldmVudC5kYXRhLm9iamVjdC5saW5lcy5kYXRhW2luZGV4XS5wZXJpb2QuZW5kKS5mb3JtYXQoJ1lZWVktTU0tRERUSEg6bW06c3MuU1NTJylcbiAgICB3aW5zdG9uLmluZm8oJyoqKiAqKiogaW52b2ljZS5wYXltZW50X3N1Y2NlZWRlZCAtIGVuZDogJywgc3Vic2NyaXB0aW9uRW5kRGF0ZSk7XG5cbiAgICB2YXIgc3Vic2NyaXB0aW9uSWQgPSBldmVudC5kYXRhLm9iamVjdC5zdWJzY3JpcHRpb247XG4gICAgd2luc3Rvbi5pbmZvKCcqKiogKioqIGludm9pY2UucGF5bWVudF9zdWNjZWVkZWQgLSBzdWJzY3JpcHRpb24gSUQ6ICcsIHN1YnNjcmlwdGlvbklkKTtcblxuICAgIGlmIChzdWJzY3JpcHRpb25JZCA9PSBudWxsKSB7XG4gICAgICBzdWJzY3JpcHRpb25JZCA9IGV2ZW50LmRhdGEub2JqZWN0LmxpbmVzLmRhdGFbMF0uc3Vic2NyaXB0aW9uO1xuICAgICAgd2luc3Rvbi5pbmZvKCcqKiogKioqIGludm9pY2UucGF5bWVudF9zdWNjZWVkZWQgLSBzdWJzY3JpcHRpb24gSUQ6ICcsIHN1YnNjcmlwdGlvbklkKTtcbiAgICB9XG5cbiAgICBpZiAoZXZlbnQuZGF0YS5vYmplY3QuYmlsbGluZ19yZWFzb24gIT09ICdzdWJzY3JpcHRpb25fY3JlYXRlJykge1xuXG5cbiAgICAgIC8vIFRPIFRFU1QgVEhFIFJFTkVXQUwgVU5DT01NRU5UIFNFVCBUSU1FT1VUXG4gICAgICAvLyBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIC8qKiAyQSAqL1xuICAgICAgZ2V0U3ViQnlJZEFuZENoZWNrb3V0U2Vzc2lvbkNvbXBsZXRlZEV2bnQoc3Vic2NyaXB0aW9uSWQpLnRoZW4oZnVuY3Rpb24gKHN1YnNwdG5fcGF5bWVudCkge1xuICAgICAgICB3aW5zdG9uLmluZm8oJyoqKiAqKiogZ2V0U3ViQnlJZEFuZENoZWNrb3V0U2Vzc2lvbkNvbXBsZXRlZEV2bnQgc3Vic3B0bl9wYXltZW50OiAnLCBzdWJzcHRuX3BheW1lbnQpO1xuICAgICAgICB3aW5zdG9uLmluZm8oJyoqKiAqKiogZ2V0U3ViQnlJZEFuZENoZWNrb3V0U2Vzc2lvbkNvbXBsZXRlZEV2bnQgc3Vic3B0bl9wYXltZW50IHR5cGVvZiBzdWJzcHRuX3BheW1lbnQ6ICcsIHR5cGVvZiBzdWJzcHRuX3BheW1lbnQpO1xuICAgICAgICBpZiAoc3Vic3B0bl9wYXltZW50KSB7XG5cbiAgICAgICAgICB2YXIgcHJvamVjdElkID0gc3Vic3B0bl9wYXltZW50LnByb2plY3RfaWRcbiAgICAgICAgICB3aW5zdG9uLmluZm8oJyoqKiAqKiogZ2V0U3ViQnlJZEFuZENoZWNrb3V0U2Vzc2lvbkNvbXBsZXRlZEV2bnQgc3Vic3B0bl9wYXltZW50ID4gcHJvamVjdF9pZDogJywgcHJvamVjdElkKTtcblxuICAgICAgICAgIFByb2plY3QuZmluZE9uZSh7IF9pZDogcHJvamVjdElkIH0sIGZ1bmN0aW9uIChlcnIsIHByb2plY3QpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgd2luc3Rvbi5pbmZvKCcqKiogKioqIGdldFN1YkJ5SWRBbmRDaGVja291dFNlc3Npb25Db21wbGV0ZWRFdm50ICBmaW5kIFByb2plY3QgJywgZXJyKTtcbiAgICAgICAgICAgICAgcmV0dXJuIChlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHByb2plY3QpIHtcbiAgICAgICAgICAgICAgd2luc3Rvbi5pbmZvKCcqKiogKioqIGdldFN1YkJ5SWRBbmRDaGVja291dFNlc3Npb25Db21wbGV0ZWRFdm50ICBwcm9qZWN0ICcsIHByb2plY3QpO1xuICAgICAgICAgICAgICB3aW5zdG9uLmluZm8oJyoqKiAqKiogZ2V0U3ViQnlJZEFuZENoZWNrb3V0U2Vzc2lvbkNvbXBsZXRlZEV2bnQgIHByb2plY3QgPiBwcm9maWxlJywgcHJvamVjdC5wcm9maWxlKTtcblxuICAgICAgICAgICAgICB2YXIgc2VhdHNfbnVtID0gcHJvamVjdC5wcm9maWxlLmFnZW50cztcbiAgICAgICAgICAgICAgd2luc3Rvbi5pbmZvKCcqKiogKioqIGdldFN1YkJ5SWRBbmRDaGVja291dFNlc3Npb25Db21wbGV0ZWRFdm50ICBwcm9qZWN0ID4gcHJvZmlsZSA+IGFnZW50cycsIHNlYXRzX251bSk7XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICB2YXIgcGxhbl9uYW1lID0gcHJvamVjdC5wcm9maWxlLm5hbWU7XG4gICAgICAgICAgICAgIHdpbnN0b24uaW5mbygnKioqICoqKiBnZXRTdWJCeUlkQW5kQ2hlY2tvdXRTZXNzaW9uQ29tcGxldGVkRXZudCAgcHJvamVjdCA+IHByb2ZpbGUgPiBhZ2VudHMgdHlwZW9mJywgdHlwZW9mIHNlYXRzX251bSk7XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICB2YXIgdXNlcklkID0gc3Vic3B0bl9wYXltZW50LnVzZXJfaWRcbiAgICAgICAgICAgICAgd2luc3Rvbi5pbmZvKCcqKiogKioqIGdldFN1YkJ5SWRBbmRDaGVja291dFNlc3Npb25Db21wbGV0ZWRFdm50ICBwcm9qZWN0ID4gcHJvZmlsZSA+IG5hbWUnLCBwbGFuX25hbWUpO1xuXG4gICAgICAgICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICAgICAgIC8vICBCT0RZIFxuICAgICAgICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAgICAgICB2YXIgYm9keSA9IHtcbiAgICAgICAgICAgICAgICBwcm9maWxlOiB7XG4gICAgICAgICAgICAgICAgICBuYW1lOiBwbGFuX25hbWUsXG4gICAgICAgICAgICAgICAgICB0eXBlOiAncGF5bWVudCcsXG4gICAgICAgICAgICAgICAgICBzdWJTdGFydDogc3Vic2NyaXB0aW9uU3RhcnREYXRlLFxuICAgICAgICAgICAgICAgICAgc3ViRW5kOiBzdWJzY3JpcHRpb25FbmREYXRlLFxuICAgICAgICAgICAgICAgICAgc3Vic2NyaXB0aW9uSWQ6IHN1YnNjcmlwdGlvbklkLFxuICAgICAgICAgICAgICAgICAgbGFzdF9zdHJpcGVfZXZlbnQ6IGV2ZW50LnR5cGUsXG4gICAgICAgICAgICAgICAgICBhZ2VudHM6IHNlYXRzX251bVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIC8qKiAyQiAqL1xuICAgICAgICAgICAgICB1cGRhdGVQcm9qZWN0UHJvZmlsZShwcm9qZWN0SWQsIGJvZHksICdpbnZvaWNlLnBheW1lbnRfc3VjY2VlZGVkJyk7XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAvKiogMkMgKi9cbiAgICAgICAgICAgICAgc2F2ZU9uREIoc3Vic2NyaXB0aW9uSWQsIHByb2plY3RJZCwgZXZlbnQsIHVzZXJJZCwgZXZlbnQudHlwZSwgcGxhbl9uYW1lLCBzZWF0c19udW0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgfSkuY2F0Y2goZnVuY3Rpb24gKGVycikge1xuICAgICAgICB3aW5zdG9uLmVycm9yKCcqKiogKioqIGdldFN1YkJ5SWRBbmRDaGVja291dFNlc3Npb25Db21wbGV0ZWRFdm50IC0gZXJyICcsIGVycik7XG4gICAgICB9KTtcbiAgICAgIC8vIH0sIDUwMDApO1xuICAgIH0gXG4gICAgZWxzZSBpZiAoZXZlbnQuZGF0YS5vYmplY3QuYmlsbGluZ19yZWFzb24gPT09ICdzdWJzY3JpcHRpb25fY3JlYXRlJykge1xuICAgICAgY29uc29sZS5sb2coJ1VTRUNBU0UgIGludm9pY2UucGF5bWVudF9zdWNjZWVkZWQgIGJpbGxpbmdfcmVhc29uIHN1YnNjcmlwdGlvbl9jcmVhdGUgJykgXG4gICAgICBzYXZlRmlyc3RJbnZvaWNlUGF5bWVudFN1Y2NlZWRlZChzdWJzY3JpcHRpb25JZCwgZXZlbnQsIGV2ZW50LnR5cGUpO1xuICAgIH0gXG4gIFxuICB9XG5cbiAgLyoqXG4gICAqKiEgKioqIEhBTkRMRSBUSEUgRVZFTlQgY3VzdG9tZXIuc3Vic2NyaXB0aW9uLmRlbGV0ZWQgKioqXG4gICAqIHRoaXMgZXZlbnQgb2NjdXJzIHdoZW4gYSBzdWJzY3JpcHRpb24gaXMgY2FuY2VsbGVkXG4gICAqIC0gZnJvbSB0aGUgVElMRURFU0snIGRhc2hib2FyZCAoYnkgY2xpY2tpbmcgQ0FOQ0VMIFNVQlNDUklQVElPTiB0aGF0IGNhbGwgY2FuY2Vsc3Vic2NyaXB0aW9uKCkgLSBzZWUgYmVsb3cpXG4gICAqIC0gZnJvbSB0aGUgU1RSSVBFJyBkYXNoYm9hcmRcbiAgICovXG4gIGlmIChldmVudC50eXBlID09PSAnY3VzdG9tZXIuc3Vic2NyaXB0aW9uLmRlbGV0ZWQnKSB7XG4gICAgd2luc3Rvbi5pbmZvKCcgISEhISEhISEgSEkgISEhISEhISEhISEgY3VzdG9tZXIuc3Vic2NyaXB0aW9uLmRlbGV0ZWQnKTtcbiAgICB3aW5zdG9uLmluZm8oJ2N1c3RvbWVyLnN1YnNjcmlwdGlvbi5kZWxldGVkIGV2ZW50ICcsIGV2ZW50KTtcbiAgICB2YXIgc3Vic2NyaXB0aW9uSWQgPSBldmVudC5kYXRhLm9iamVjdC5pZFxuICAgIHdpbnN0b24uaW5mbygnKioqICoqKiBzdWJzY3JpcHRpb24gSUQgJywgc3Vic2NyaXB0aW9uSWQpO1xuXG4gICAgZ2V0U3ViQnlJZEFuZENoZWNrb3V0U2Vzc2lvbkNvbXBsZXRlZEV2bnQoc3Vic2NyaXB0aW9uSWQpLnRoZW4oZnVuY3Rpb24gKHN1YnNjcmlwdGlvblBheW1lbnQpIHtcbiAgICAgIC8vIFN1YnNjcmlwdGlvblBheW1lbnQuZmluZCh7IHN1YnNjcmlwdGlvbl9pZDogc3Vic2NyaXB0aW9uSWQsIG9iamVjdF90eXBlOiBcInN1YnNjcmlwdGlvblwiIH0sIGZ1bmN0aW9uIChlcnIsIHN1YnNjcmlwdGlvblBheW1lbnQpIHtcblxuICAgICAgLy8gaWYgKGVycikge1xuICAgICAgLy8gICB3aW5zdG9uLmluZm8oJ0Vycm9yIGdldHRpbmcgdGhlIHN1YnNjcmlwdGlvblBheW1lbnQgJywgZXJyKTtcbiAgICAgIC8vICAgcmV0dXJuIGVycjtcbiAgICAgIC8vIH1cbiAgICAgIHdpbnN0b24uaW5mbygnKioqICoqKiDCu8K7wrsgwrvCu8K7IGN1c3RvbWVyLnN1YnNjcmlwdGlvbi5kZWxldGVkIHN1YnNjcmlwdGlvblBheW1lbnQgJywgc3Vic2NyaXB0aW9uUGF5bWVudCk7XG4gICAgICBpZiAoc3Vic2NyaXB0aW9uUGF5bWVudCkgeyBcbiAgICAgICAgdmFyIHByb2plY3RJZCA9IHN1YnNjcmlwdGlvblBheW1lbnQucHJvamVjdF9pZDsgXG4gICAgICAgIHdpbnN0b24uaW5mbygnY3VzdG9tZXIuc3Vic2NyaXB0aW9uLmRlbGV0ZWQgc3Vic2NyaXB0aW9uUGF5bWVudCBwcm9qZWN0IGlkOiAnLCBwcm9qZWN0SWQpXG4gICAgICAgIFxuICAgICAgICB2YXIgdXNlcklkID0gc3Vic2NyaXB0aW9uUGF5bWVudC51c2VyX2lkO1xuICAgICAgICB3aW5zdG9uLmluZm8oJ2N1c3RvbWVyLnN1YnNjcmlwdGlvbi5kZWxldGVkIHN1YnNjcmlwdGlvblBheW1lbnQgdXNlciBpZDogJywgdXNlcklkKVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqISAqKiogQk9EWSAqKipcbiAgICAgICAqL1xuICAgICAgdmFyIGJvZHkgPSB7XG4gICAgICAgIHByb2ZpbGU6IHtcbiAgICAgICAgICBzdWJzY3JpcHRpb25JZDogc3Vic2NyaXB0aW9uSWQsXG4gICAgICAgICAgbmFtZTogJ1NhbmRib3gnLFxuICAgICAgICAgIHR5cGU6ICdmcmVlJyxcbiAgICAgICAgICBhZ2VudHM6IDEsXG4gICAgICAgICAgbGFzdF9zdHJpcGVfZXZlbnQ6IGV2ZW50LnR5cGVcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICB1cGRhdGVQcm9qZWN0UHJvZmlsZShwcm9qZWN0SWQsIGJvZHksICdzdWJzY3JpcHRpb24uZGVsZXRlZCcpO1xuICAgICAgc2F2ZU9uREIoc3Vic2NyaXB0aW9uSWQsIHByb2plY3RJZCwgZXZlbnQuZGF0YS5vYmplY3QsIHVzZXJJZCwgZXZlbnQudHlwZSwgcGxhbl9uYW1lLCAxKTtcblxuICAgIH0pLmNhdGNoKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgIHdpbnN0b24uZXJyb3IoJyoqKiAqKiogY3VzdG9tZXIuc3Vic2NyaXB0aW9uLmRlbGV0ZWQgJywgZXJyKTtcbiAgICB9KTtcblxuICB9XG4gIC8vIFJldHVybiBhIHJlc3BvbnNlIHRvIGFja25vd2xlZGdlIHJlY2VpcHQgb2YgdGhlIGV2ZW50XG4gIHJlc3BvbnNlLmpzb24oeyByZWNlaXZlZDogdHJ1ZSB9KTtcbn0pO1xuXG5cbmZ1bmN0aW9uIGdldFN1YkJ5SWRBbmRDaGVja291dFNlc3Npb25Db21wbGV0ZWRFdm50KHN1YnNjcmlwdGlvbmlkKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgU3Vic2NyaXB0aW9uUGF5bWVudC5maW5kT25lKHsgc3Vic2NyaXB0aW9uX2lkOiBzdWJzY3JpcHRpb25pZCwgc3RyaXBlX2V2ZW50OiBcImNoZWNrb3V0LnNlc3Npb24uY29tcGxldGVkXCIgfSwgZnVuY3Rpb24gKGVyciwgc3Vic2NyaXB0aW9uUGF5bWVudCkge1xuICAgICAgaWYgKGVycikgcmVqZWN0KGVycik7XG5cbiAgICAgIHZhciBzdWJzY3JpcHRpb25fcGF5bWVudCA9IHN1YnNjcmlwdGlvblBheW1lbnQ7XG4gICAgICByZXNvbHZlKHN1YnNjcmlwdGlvbl9wYXltZW50KTtcbiAgICB9KTtcbiAgfSlcbn07XG5cbmZ1bmN0aW9uIGdldFN1YnNjcml0aW9uQnlJZChzdWJzY3JpcHRpb25pZCkge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgIGNvbnN0IF9zdHJpcGUgPSByZXF1aXJlKFwic3RyaXBlXCIpKGFwaVNlY3JldEtleSk7XG4gICAgX3N0cmlwZS5zdWJzY3JpcHRpb25zLnJldHJpZXZlKHN1YnNjcmlwdGlvbmlkLCBmdW5jdGlvbiAoZXJyLCBzdWJzY3JpcHRpb24pIHtcbiAgICAgIGlmIChlcnIpIHJlamVjdChlcnIpO1xuXG4gICAgICB2YXIgc3Vic2NyaXB0aW9uID0gc3Vic2NyaXB0aW9uO1xuICAgICAgcmVzb2x2ZShzdWJzY3JpcHRpb24pO1xuICAgIH0pO1xuICB9KVxufTtcblxuLy8gU0VFIFVwZGF0aW5nIG5lc3RlZCBvYmplY3QgaW4gbW9uZ29vc2UgXG4vLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8yMzgzMjkyMS91cGRhdGluZy1uZXN0ZWQtb2JqZWN0LWluLW1vbmdvb3NlXG5mdW5jdGlvbiB1cGRhdGVQcm9qZWN0UHJvZmlsZShwcm9qZWN0X2lkLCBib2R5LCBjYWxsZWRCeSkge1xuICBQcm9qZWN0LmZpbmRCeUlkQW5kVXBkYXRlKHByb2plY3RfaWQsIGJvZHksIHsgbmV3OiB0cnVlLCB1cHNlcnQ6IHRydWUgfSwgZnVuY3Rpb24gKGVyciwgdXBkYXRlZFByb2plY3QpIHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICB3aW5zdG9uLmVycm9yKCd1cGRhdGVQcm9qZWN0UHJvZmlsZSBFcnJvciAnLCBlcnIpO1xuICAgIH0gZWxzZSB7XG4gICAgICB3aW5zdG9uLmRlYnVnKHVwZGF0ZWRQcm9qZWN0KVxuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHNhdmVPbkRCKHN1YnNjcmlwdGlvbmlkLCBwcm9qZWN0aWQsIG9iaiwgdXNlcmlkLCBzdHJpcGVfZXZlbnQsIHBsYW5fbmFtZSwgc2VhdHNfbnVtKSB7XG4gIHdpbnN0b24uaW5mbygnc2F2ZU9uREIgcGxhbl9uYW1lJywgcGxhbl9uYW1lKVxuICB3aW5zdG9uLmluZm8oJ3NhdmVPbkRCIHNlYXRzX251bScsIHNlYXRzX251bSlcblxuICB2YXIgbmV3UGF5bWVudFN1YnNjcmlwdGlvbiA9IG5ldyBTdWJzY3JpcHRpb25QYXltZW50KHtcbiAgICBfaWQ6IG5ldyBtb25nb29zZS5UeXBlcy5PYmplY3RJZCgpLFxuICAgIHN1YnNjcmlwdGlvbl9pZDogc3Vic2NyaXB0aW9uaWQsXG4gICAgcHJvamVjdF9pZDogcHJvamVjdGlkLFxuICAgIHVzZXJfaWQ6IHVzZXJpZCxcbiAgICBzdHJpcGVfZXZlbnQ6IHN0cmlwZV9ldmVudCxcbiAgICBwbGFuX25hbWU6IHBsYW5fbmFtZSxcbiAgICBhZ2VudHM6IHNlYXRzX251bSxcbiAgICBvYmplY3Q6IG9ialxuICB9KTtcblxuICBuZXdQYXltZW50U3Vic2NyaXB0aW9uLnNhdmUoZnVuY3Rpb24gKGVyciwgc2F2ZWRTdWJzY3JpcHRpb25QYXltZW50KSB7XG4gICAgaWYgKGVycikge1xuICAgICAgd2luc3Rvbi5lcnJvcignLS0tID4gRVJST1IgJywgZXJyKVxuICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5zZW5kKHsgc3VjY2VzczogZmFsc2UsIG1zZzogJ0Vycm9yIHNhdmluZyBvYmplY3QuJyB9KTtcbiAgICB9XG4gICAgd2luc3Rvbi5pbmZvKCdzYXZlZFN1YnNjcmlwdGlvblBheW1lbnQgJywgc2F2ZWRTdWJzY3JpcHRpb25QYXltZW50KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHNhdmVGaXJzdEludm9pY2VQYXltZW50U3VjY2VlZGVkKHN1YnNjcmlwdGlvbmlkLCBvYmosIHN0cmlwZV9ldmVudCkge1xuICBjb25zb2xlLmxvZygnc2F2ZUZpcnN0SW52b2ljZVBheW1lbnRTdWNjZWVkZWQgc3Vic2NyaXB0aW9uaWQnLCBzdWJzY3JpcHRpb25pZClcbiAgY29uc29sZS5sb2coJ3NhdmVGaXJzdEludm9pY2VQYXltZW50U3VjY2VlZGVkIHN0cmlwZV9ldmVudCcsIHN0cmlwZV9ldmVudClcblxuICB2YXIgbmV3UGF5bWVudFN1YnNjcmlwdGlvbiA9IG5ldyBTdWJzY3JpcHRpb25QYXltZW50KHtcbiAgICBfaWQ6IG5ldyBtb25nb29zZS5UeXBlcy5PYmplY3RJZCgpLFxuICAgIHN1YnNjcmlwdGlvbl9pZDogc3Vic2NyaXB0aW9uaWQsXG4gICAgc3RyaXBlX2V2ZW50OiBzdHJpcGVfZXZlbnQsXG4gICAgb2JqZWN0OiBvYmpcbiAgfSk7XG5cbiAgbmV3UGF5bWVudFN1YnNjcmlwdGlvbi5zYXZlKGZ1bmN0aW9uIChlcnIsIHNhdmVkU3Vic2NyaXB0aW9uUGF5bWVudCkge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIHdpbnN0b24uZXJyb3IoJy0tLSA+IEVSUk9SICcsIGVycilcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuc2VuZCh7IHN1Y2Nlc3M6IGZhbHNlLCBtc2c6ICdFcnJvciBzYXZpbmcgb2JqZWN0LicgfSk7XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKCdzYXZlZFN1YnNjcmlwdGlvblBheW1lbnQgPj4gJywgc2F2ZWRTdWJzY3JpcHRpb25QYXltZW50KTtcbiAgfSk7XG59XG5cbnJvdXRlci5wdXQoJy9jYW5jZWxzdWJzY3JpcHRpb24nLCBbcGFzc3BvcnQuYXV0aGVudGljYXRlKFsnYmFzaWMnLCAnand0J10sIHsgc2Vzc2lvbjogZmFsc2UgfSksIHZhbGlkdG9rZW5dLCBmdW5jdGlvbiAocmVxLCByZXMpIHtcbiAgdmFyIHByb2plY3RpZCA9IHJlcS5ib2R5LnByb2plY3RpZFxuICB2YXIgdXNlcmlkID0gcmVxLmJvZHkudXNlcmlkXG4gIHdpbnN0b24uaW5mbygnwrvCu8K7IMK7wrvCuyBjYW5jZWxzdWJzY3JpcHRpb24gcHJvamVjdGlkJywgcHJvamVjdGlkKTtcbiAgd2luc3Rvbi5pbmZvKCfCu8K7wrsgwrvCu8K7IGNhbmNlbHN1YnNjcmlwdGlvbiB1c2VyaWQnLCB1c2VyaWQpO1xuXG4gIFByb2plY3QuZmluZE9uZSh7IF9pZDogcHJvamVjdGlkIH0sIGZ1bmN0aW9uIChlcnIsIHByb2plY3QpIHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICB3aW5zdG9uLmVycm9yKCctLSA+IGNhbmNlbHN1YnNjcmlwdGlvbiBFcnJvciBnZXR0aW5nIHByb2plY3QgJywgZXJyKVxuICAgICAgcmV0dXJuIChlcnIpO1xuICAgIH1cbiAgICBpZiAocHJvamVjdCkge1xuICAgICAgd2luc3Rvbi5pbmZvKCctLSA+IGNhbmNlbHN1YnNjcmlwdGlvbiAgcHJvamVjdCAnLCBwcm9qZWN0KTtcblxuICAgICAgdmFyIHN1YnNjcmlwdGlvbmlkID0gcHJvamVjdC5wcm9maWxlLnN1YnNjcmlwdGlvbklkO1xuXG4gICAgICBjb25zdCBzdHJpcGUgPSByZXF1aXJlKFwic3RyaXBlXCIpKGFwaVNlY3JldEtleSk7XG5cbiAgICAgIHN0cmlwZS5zdWJzY3JpcHRpb25zLmRlbChzdWJzY3JpcHRpb25pZCwgZnVuY3Rpb24gKGVyciwgY29uZmlybWF0aW9uKSB7XG4gICAgICAgIC8vIGFzeW5jaHJvbm91c2x5IGNhbGxlZFxuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgd2luc3Rvbi5lcnJvcignLS0gPiBjYW5jZWxzdWJzY3JpcHRpb24gIGVyciAnLCBlcnIpO1xuICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuc2VuZCh7IHN1Y2Nlc3M6IGZhbHNlLCBtc2c6IGVyciB9KVxuICAgICAgICB9XG4gICAgICAgIHdpbnN0b24uaW5mbygnLS0gPiBjYW5jZWxzdWJzY3JpcHRpb24gY29uZmlybWF0aW9uICcsIGNvbmZpcm1hdGlvbilcbiAgICAgICAgcmVzLmpzb24oY29uZmlybWF0aW9uKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSlcbn0pO1xuXG5yb3V0ZXIucHV0KCcvdXBkYXRlc3Vic2NyaXB0aW9uJywgW3Bhc3Nwb3J0LmF1dGhlbnRpY2F0ZShbJ2Jhc2ljJywgJ2p3dCddLCB7IHNlc3Npb246IGZhbHNlIH0pLCB2YWxpZHRva2VuXSwgZnVuY3Rpb24gKHJlcSwgcmVzKSB7XG5cbiAgdmFyIHByb2plY3RpZCA9IHJlcS5ib2R5LnByb2plY3RpZFxuICB2YXIgdXNlcmlkID0gcmVxLmJvZHkudXNlcmlkXG4gIHZhciBwcmljZSA9IHJlcS5ib2R5LnByaWNlXG4gIHdpbnN0b24uaW5mbygnwrvCu8K7IMK7wrvCuyB1cGRhdGVzdWJzY3JpcHRpb24gcHJvamVjdGlkJywgcHJvamVjdGlkKTtcbiAgd2luc3Rvbi5pbmZvKCfCu8K7wrsgwrvCu8K7IHVwZGF0ZXN1YnNjcmlwdGlvbiB1c2VyaWQnLCB1c2VyaWQpO1xuICB3aW5zdG9uLmluZm8oJ8K7wrvCuyDCu8K7wrsgdXBkYXRlc3Vic2NyaXB0aW9uIHByaWNlJywgcHJpY2UpO1xuICBjb25zdCBzdHJpcGUgPSByZXF1aXJlKFwic3RyaXBlXCIpKGFwaVNlY3JldEtleSk7XG5cbiAgUHJvamVjdC5maW5kT25lKHsgX2lkOiBwcm9qZWN0aWQgfSwgZnVuY3Rpb24gKGVyciwgcHJvamVjdCkge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIHdpbnN0b24uZXJyb3IoJy0tID4gdXBkYXRlc3Vic2NyaXB0aW9uIEVycm9yIGdldHRpbmcgcHJvamVjdCAnLCBlcnIpXG4gICAgICByZXR1cm4gKGVycik7XG4gICAgfVxuICAgIGlmIChwcm9qZWN0KSB7XG4gICAgICB3aW5zdG9uLmluZm8oJy0tID4gdXBkYXRlc3Vic2NyaXB0aW9uICBwcm9qZWN0ICcsIHByb2plY3QpO1xuXG4gICAgICB2YXIgc3Vic2NyaXB0aW9uaWQgPSBwcm9qZWN0LnByb2ZpbGUuc3Vic2NyaXB0aW9uSWQ7XG5cbiAgICAgIC8vIHN1YnNjcmlwdGlvbmlkXG4gICAgICBzdHJpcGUuc3Vic2NyaXB0aW9ucy51cGRhdGUoXG4gICAgICAgIHN1YnNjcmlwdGlvbmlkLFxuICAgICAgICAvLyB7IHRyaWFsX2VuZDogMTU2ODIxMDY1NSB9LFxuICAgICAgICAvLyBmdW5jdGlvbiAoZXJyLCBzdWJzY3JpcHRpb24pIHtcbiAgICAgICAgLy8gICAvLyBhc3luY2hyb25vdXNseSBjYWxsZWRcbiAgICAgICAgLy8gICBpZiAoZXJyKSB7XG4gICAgICAgIC8vICAgICB3aW5zdG9uLmVycm9yKCd1cGRhdGVzdWJzY3JpcHRpb24gc3Vic2NyaXB0aW9uIGVyciAnLCBlcnIpXG4gICAgICAgIC8vICAgICByZXR1cm5cbiAgICAgICAgLy8gICB9XG4gICAgICAgIC8vICAgd2luc3Rvbi5pbmZvKCd1cGRhdGVzdWJzY3JpcHRpb24gc3Vic2NyaXB0aW9uICcsIHN1YnNjcmlwdGlvbilcbiAgICAgICAgLy8gfVxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBzdHJpcGUuc3Vic2NyaXB0aW9ucy5yZXRyaWV2ZShzdWJzY3JpcHRpb25pZCwgZnVuY3Rpb24gKGVyciwgc3Vic2NyaXB0aW9uKSB7XG4gICAgLy8gICAvLyBhc3luY2hyb25vdXNseSBjYWxsZWRcbiAgICAvLyAgIGlmIChlcnIpIHtcbiAgICAvLyAgICAgd2luc3Rvbi5pbmZvKCdyZXRyaWV2ZSB1cGRhdGVkIHN1YnNjcmlwdGlvbiBlcnIgJywgZXJyKVxuICAgIC8vICAgfSBlbHNlIHtcbiAgICAvLyAgICAgd2luc3Rvbi5pbmZvKCfCu8K7wrvCu8K7wrvCu8K7wrsgZ3JldHJpZXZlIHVwZGF0ZWQgc3Vic2NyaXB0aW9uOiAnLCBzdWJzY3JpcHRpb24pO1xuXG4gICAgLy8gICB9XG4gICAgLy8gfSlcbiAgfSlcblxufSlcblxucm91dGVyLmdldCgnLzpzdWJzY3JpcHRpb25pZCcsIFtwYXNzcG9ydC5hdXRoZW50aWNhdGUoWydiYXNpYycsICdqd3QnXSwgeyBzZXNzaW9uOiBmYWxzZSB9KSwgdmFsaWR0b2tlbl0sIGZ1bmN0aW9uIChyZXEsIHJlcykge1xuXG4gIFN1YnNjcmlwdGlvblBheW1lbnQuZmluZCh7IHN1YnNjcmlwdGlvbl9pZDogcmVxLnBhcmFtcy5zdWJzY3JpcHRpb25pZCB9KS5zb3J0KHsgJ29iamVjdC5jcmVhdGVkJzogXCJhc2NcIiB9KS5leGVjKGZ1bmN0aW9uIChlcnIsIHN1YnNjcmlwdGlvblBheW1lbnRzKSB7XG4gICAgaWYgKGVycikge1xuICAgICAgd2luc3Rvbi5lcnJvcignLS0gPiBHRVQgU1VCU0NSSVBUSU9OIFBBWU1FTlRTIEVSUk9SdCAnLCBwcm9qZWN0KTtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuc2VuZCh7IHN1Y2Nlc3M6IGZhbHNlLCBtc2c6IGVyciB9KVxuICAgIH1cbiAgICByZXMuanNvbihzdWJzY3JpcHRpb25QYXltZW50cyk7XG4gIH0pO1xuXG59KTtcblxuLy8gIFJFVFJJRVZFIFRIRSBDVVJSRU5UIFNVQlNDUklQVElPTiBGUk9NIFNUUklQRVxucm91dGVyLmdldCgnL3N0cmlwZXN1YnMvOnN1YnNjcmlwdGlvbmlkJywgW3Bhc3Nwb3J0LmF1dGhlbnRpY2F0ZShbJ2Jhc2ljJywgJ2p3dCddLCB7IHNlc3Npb246IGZhbHNlIH0pLCB2YWxpZHRva2VuXSwgZnVuY3Rpb24gKHJlcSwgcmVzKSB7XG5cbiAgd2luc3Rvbi5pbmZvKCctLSA+IHN1YnNjcmlwdGlvbiBnZXQgYnkgaWQgZnJlcS5wYXJhbXMuc3Vic2NyaXB0aW9uaWQgJywgcmVxLnBhcmFtcy5zdWJzY3JpcHRpb25pZCk7XG4gIHZhciBzdHJpcGUgPSByZXF1aXJlKCdzdHJpcGUnKShhcGlTZWNyZXRLZXkpO1xuXG4gIHN0cmlwZS5zdWJzY3JpcHRpb25zLnJldHJpZXZlKFxuICAgIHJlcS5wYXJhbXMuc3Vic2NyaXB0aW9uaWQsXG4gICAgZnVuY3Rpb24gKGVyciwgc3Vic2NyaXB0aW9uKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIHdpbnN0b24uZXJyb3IoJy0tID4gc3Vic2NyaXB0aW9uIGdldCBieSBpZCBmcm9tIHN0cmlwZSAgZXJyICcsIGVycik7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuc2VuZCh7IHN1Y2Nlc3M6IGZhbHNlLCBtc2c6IGVyciB9KVxuICAgICAgfVxuICAgICAgd2luc3Rvbi5pbmZvKCctLSA+IHN1YnNjcmlwdGlvbiBnZXQgYnkgaWQgZnJvbSBzdHJpcGUgJywgc3Vic2NyaXB0aW9uKVxuICAgICAgcmVzLmpzb24oc3Vic2NyaXB0aW9uKTtcbiAgICB9XG4gICk7XG59KTtcblxuLy8gIFJFVFJJRVZFIFRIRSBDSEVDS09VVCBTRVNTSU9OXG5yb3V0ZXIuZ2V0KCcvY2hlY2tvdXRTZXNzaW9uLzpzZXNzaW9uaWQnLCBbcGFzc3BvcnQuYXV0aGVudGljYXRlKFsnYmFzaWMnLCAnand0J10sIHsgc2Vzc2lvbjogZmFsc2UgfSksIHZhbGlkdG9rZW5dLCBmdW5jdGlvbiAocmVxLCByZXMpIHtcblxuICB3aW5zdG9uLmluZm8oJy0tID4gY2hlY2tvdXRTZXNzaW9uIHBhcmFtcy5zZXNzaW9uaWQgJywgcmVxLnBhcmFtcy5zZXNzaW9uaWQpO1xuICB2YXIgc3RyaXBlID0gcmVxdWlyZSgnc3RyaXBlJykoYXBpU2VjcmV0S2V5KTtcblxuICBzdHJpcGUuY2hlY2tvdXQuc2Vzc2lvbnMucmV0cmlldmUoXG4gICAgcmVxLnBhcmFtcy5zZXNzaW9uaWQsXG4gICAgZnVuY3Rpb24gKGVyciwgc2Vzc2lvbikge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICB3aW5zdG9uLmluZm8oJy0tID4gY2hlY2tvdXRTZXNzaW9uIGdldCBieSBpZCBmcm9tIHN0cmlwZSAgZXJyICcsIGVycik7XG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuc2VuZCh7IHN1Y2Nlc3M6IGZhbHNlLCBtc2c6IGVyciB9KVxuICAgICAgfVxuICAgICAgd2luc3Rvbi5pbmZvKCctLSA+IGNoZWNrb3V0U2Vzc2lvbiBnZXQgYnkgaWQgZnJvbSBzdHJpcGUgJywgc2Vzc2lvbilcbiAgICAgIHJlcy5qc29uKHNlc3Npb24pO1xuICAgIH1cbiAgKTtcbn0pO1xuXG4vL25ldyBjb2RlXG5yb3V0ZXIuZ2V0KCcvY3VzdG9tZXIvOnByb2plY3RpZCcsIFtwYXNzcG9ydC5hdXRoZW50aWNhdGUoWydiYXNpYycsICdqd3QnXSwgeyBzZXNzaW9uOiBmYWxzZSB9KSwgdmFsaWR0b2tlbl0sIGZ1bmN0aW9uIChyZXEsIHJlcykge1xuICB3aW5zdG9uLmRlYnVnKCfCu8K7wrsgwrvCu8K7IGdldCBjdXN0b21lciBmcm9tIGRiICcsIHJlcS5wYXJhbXMpXG4gIHZhciBwcm9qZWN0aWQgPSByZXEucGFyYW1zLnByb2plY3RpZFxuXG4gIHdpbnN0b24uZGVidWcoJ8K7wrvCuyDCu8K7wrsgZ2V0IGN1c3RvbWVyIGZyb20gZGIgLSBwcm9qZWN0aWQnLCBwcm9qZWN0aWQpO1xuXG4gIFN1YnNjcmlwdGlvblBheW1lbnQuZmluZCh7IHByb2plY3RfaWQ6IHByb2plY3RpZCwgc3RyaXBlX2V2ZW50OiBcImNoZWNrb3V0LnNlc3Npb24uY29tcGxldGVkXCIgfSwgYXN5bmMgZnVuY3Rpb24gKGVyciwgc3Vic2NyaXB0aW9uKSB7XG4gICAgaWYgKGVycikge1xuICAgICAgd2luc3Rvbi5kZWJ1ZygnLS0gPiBnZXQgY3VzdG9tZXIgZnJvbSBkYiAtIEVycm9yICcsIGVycilcbiAgICAgIHJldHVybiAoZXJyKTtcbiAgICB9XG4gICAgaWYgKHN1YnNjcmlwdGlvbikge1xuXG4gICAgICBzdWJzY3JpcHRpb25bMF0ub2JqZWN0LmN1c3RvbWVyXG4gICAgICB3aW5zdG9uLmRlYnVnKCctLSA+IGdldCBjdXN0b21lciBmcm9tIGRiIC0gc3Vic2NyaXB0aW9uID4gY3VzdG9tZXIgaWQgJywgc3Vic2NyaXB0aW9uWzBdLm9iamVjdC5jdXN0b21lcik7XG4gICAgICBjb25zdCBjdXN0b21lcmlkID0gc3Vic2NyaXB0aW9uWzBdLm9iamVjdC5jdXN0b21lclxuICAgICAgY29uc3Qgc3RyaXBlID0gcmVxdWlyZShcInN0cmlwZVwiKShhcGlTZWNyZXRLZXkpO1xuXG4gICAgICBjb25zdCBjdXN0b21lciA9IGF3YWl0IHN0cmlwZS5jdXN0b21lcnMucmV0cmlldmUoXG4gICAgICAgIGN1c3RvbWVyaWRcbiAgICAgICk7XG4gICAgICB3aW5zdG9uLmRlYnVnKCctLSA+IGdldCBjdXN0b21lciBmcm9tIGRiID4gY3VzdG9tZXIgZnJvbSBzdHJpcGUgQVBJICcsIGN1c3RvbWVyKVxuXG4gICAgICBjb25zdCBwYXltZW50TWV0aG9kcyA9IGF3YWl0IHN0cmlwZS5wYXltZW50TWV0aG9kcy5saXN0KHtcbiAgICAgICAgY3VzdG9tZXI6IGN1c3RvbWVyaWQsXG4gICAgICAgIHR5cGU6ICdjYXJkJyxcbiAgICAgIH0pO1xuICAgICAgY3VzdG9tZXJbJ3BheW1lbnRNZXRob2RzJ10gPSBwYXltZW50TWV0aG9kcztcbiAgICAgIHdpbnN0b24uZGVidWcoJy0tID4gZ2V0IGN1c3RvbWVyIGZyb20gZGIgPiBjdXN0b21lciArIHBheW1lbnRNZXRob2RzICcsIHN1YnNjcmlwdGlvbilcbiAgICAgIHJlcy5qc29uKGN1c3RvbWVyKVxuICAgIH1cbiAgfSlcbn0pO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBVcGRhdGVkIGN1c3RvbWVyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5yb3V0ZXIucG9zdCgnL2N1c3RvbWVycy86Y3VzdG9tZXJpZCcsIFtwYXNzcG9ydC5hdXRoZW50aWNhdGUoWydiYXNpYycsICdqd3QnXSwgeyBzZXNzaW9uOiBmYWxzZSB9KSwgdmFsaWR0b2tlbl0sIGFzeW5jIGZ1bmN0aW9uIChyZXEsIHJlcykge1xuICB2YXIgY3VzdG9tZXJpZCA9IHJlcS5wYXJhbXMuY3VzdG9tZXJpZDtcbiAgd2luc3Rvbi5kZWJ1ZygnwrvCu8K7IMK7wrvCuyAgdXBkYXRlIGN1c3RvbWVyIC0gY3VzdG9tZXJpZCBmcm9tIHBhcmFtcyAnLCBjdXN0b21lcmlkKTtcbiAgd2luc3Rvbi5kZWJ1ZygnwrvCu8K7IMK7wrvCuyAgdXBkYXRlIGN1c3RvbWVyIC0gY2MgZnJvbSBib2R5ICcsIHJlcS5ib2R5KTtcblxuICBjb25zdCBzdHJpcGUgPSByZXF1aXJlKFwic3RyaXBlXCIpKGFwaVNlY3JldEtleSk7XG5cbiAgbGV0IHBheW1lbnRNZXRob2Q7XG4gIHRyeSB7XG4gICAgcGF5bWVudE1ldGhvZCA9IGF3YWl0IHN0cmlwZS5wYXltZW50TWV0aG9kcy5jcmVhdGUoe1xuICAgICAgdHlwZTogJ2NhcmQnLFxuICAgICAgY2FyZDoge1xuICAgICAgICBudW1iZXI6IHJlcS5ib2R5LmNyZWRpdF9jYXJkX251bSxcbiAgICAgICAgZXhwX21vbnRoOiByZXEuYm9keS5leHBpcmF0aW9uX2RhdGVfbW9udGgsXG4gICAgICAgIGV4cF95ZWFyOiByZXEuYm9keS5leHBpcmF0aW9uX2RhdGVfeWVhcixcbiAgICAgICAgY3ZjOiByZXEuYm9keS5jcmVkaXRfY2FyZF9jdmMsXG4gICAgICB9LFxuICAgIH0pO1xuICB9IGNhdGNoIChlKSB7XG4gICAgd2luc3Rvbi5lcnJvcignwrvCu8K7IMK7wrvCuyAgcGF5bWVudE1ldGhvZCBjcmVhdGUgIGVycm9yICcsIGUpXG4gICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAyKS5zZW5kKHsgc3VjY2VzczogZmFsc2UsIG1zZzogZSB9KVxuXG4gIH1cbiAgd2luc3Rvbi5kZWJ1ZygnwrvCu8K7IMK7wrvCuyAgcGF5bWVudE1ldGhvZCcsIHBheW1lbnRNZXRob2QpXG5cbiAgdHJ5IHtcbiAgICBjb25zdCBfcGF5bWVudE1ldGhvZCA9IGF3YWl0IHN0cmlwZS5wYXltZW50TWV0aG9kcy5hdHRhY2goXG4gICAgICBwYXltZW50TWV0aG9kLmlkLFxuICAgICAgeyBjdXN0b21lcjogY3VzdG9tZXJpZCB9XG4gICAgKTtcblxuICAgIHdpbnN0b24uZGVidWcoJ8K7wrvCuyDCu8K7wrsgIHBheW1lbnRNZXRob2QgYXR0YWNoZWQgJywgX3BheW1lbnRNZXRob2QpXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICB3aW5zdG9uLmVycm9yKCfCu8K7wrsgwrvCu8K7ICBwYXltZW50TWV0aG9kIGF0dGFjaGVkICBlcnJvciAnLCBlKVxuICAgIHJldHVybiByZXMuc3RhdHVzKDUwMSkuc2VuZCh7IHN1Y2Nlc3M6IGZhbHNlLCBtc2c6IGUgfSlcbiAgfVxuXG4gIGNvbnN0IF9jdXN0b21lciA9IGF3YWl0IHN0cmlwZS5jdXN0b21lcnMudXBkYXRlKFxuICAgIGN1c3RvbWVyaWQsXG4gICAge1xuICAgICAgaW52b2ljZV9zZXR0aW5nczogeyBkZWZhdWx0X3BheW1lbnRfbWV0aG9kOiBwYXltZW50TWV0aG9kLmlkIH1cbiAgICB9KTtcbiAgcmVzLmpzb24oX2N1c3RvbWVyKTtcbn0pO1xuXG5cbnJvdXRlci5nZXQoJy9wYXltZW50X21ldGhvZHMvOmN1c3RvbWVyaWQnLCBbcGFzc3BvcnQuYXV0aGVudGljYXRlKFsnYmFzaWMnLCAnand0J10sIHsgc2Vzc2lvbjogZmFsc2UgfSksIHZhbGlkdG9rZW5dLCBhc3luYyBmdW5jdGlvbiAocmVxLCByZXMpIHtcbiAgd2luc3Rvbi5pbmZvKCdnZXQgUGF5bWVudE1ldGhvZHMgbGlzdCByZXEucGFyYW1zJywgcmVxLnBhcmFtcylcbiAgdmFyIGN1c3RvbWVyX2lkID0gcmVxLnBhcmFtcy5jdXN0b21lcmlkO1xuICB3aW5zdG9uLmRlYnVnKCdnZXQgUGF5bWVudE1ldGhvZHMgbGlzdCByZXEucGFyYW1zID4gY3VzdG9tZXJfaWQgJywgY3VzdG9tZXJfaWQpXG4gIGNvbnN0IHN0cmlwZSA9IHJlcXVpcmUoXCJzdHJpcGVcIikoYXBpU2VjcmV0S2V5KTtcblxuICBjb25zdCBjdXN0b21lciA9IGF3YWl0IHN0cmlwZS5jdXN0b21lcnMucmV0cmlldmUoXG4gICAgY3VzdG9tZXJfaWRcbiAgKTtcblxuICBjb25zdCBkZWZhdWx0X3BheW1lbnRfbWV0aG9kX2lkID0gY3VzdG9tZXIuaW52b2ljZV9zZXR0aW5ncy5kZWZhdWx0X3BheW1lbnRfbWV0aG9kXG4gIGxldCBwYXltZW50TWV0aG9kcztcbiAgdHJ5IHtcbiAgICBwYXltZW50TWV0aG9kcyA9IGF3YWl0IHN0cmlwZS5wYXltZW50TWV0aG9kcy5saXN0KHtcbiAgICAgIGN1c3RvbWVyOiBjdXN0b21lcl9pZCxcbiAgICAgIHR5cGU6ICdjYXJkJyxcbiAgICB9KTtcbiAgICB3aW5zdG9uLmRlYnVnKCdnZXQgUGF5bWVudE1ldGhvZHMgbGlzdCA+IHBheW1lbnRNZXRob2RzICcsIHBheW1lbnRNZXRob2RzKVxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAxKS5zZW5kKHsgc3VjY2VzczogZmFsc2UsIG1zZzogZSB9KVxuICB9XG5cbiAgd2luc3Rvbi5kZWJ1ZygnZ2V0IFBheW1lbnRNZXRob2RzIGxpc3QgPiBwYXltZW50TWV0aG9kcyA+IGRlZmF1bHRfcGF5bWVudF9tZXRob2RfaWQgJywgZGVmYXVsdF9wYXltZW50X21ldGhvZF9pZClcbiAgcGF5bWVudE1ldGhvZHMuZGF0YS5mb3JFYWNoKHBheW1lbnRNZXRob2QgPT4ge1xuICAgIGlmIChwYXltZW50TWV0aG9kLmlkICE9PSBkZWZhdWx0X3BheW1lbnRfbWV0aG9kX2lkKSB7XG4gICAgICB3aW5zdG9uLmRlYnVnKCdnZXQgUGF5bWVudE1ldGhvZHMgbGlzdCA+IHBheW1lbnRNZXRob2RzID4gcGF5bWVudE1ldGhvZHMuZGF0YSAnLCBwYXltZW50TWV0aG9kLmlkKVxuICAgICAgZGV0YWNoUGF5bWVudEZ1bmMocGF5bWVudE1ldGhvZC5pZCwgZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICB3aW5zdG9uLmluZm8oJ2RldGFjaFBheW1lbnRGdW5jIHJlc3VsdCAnLCByZXN1bHQpXG4gICAgICB9KVxuICAgIH1cbiAgfSk7XG4gIHJlcy5qc29uKHBheW1lbnRNZXRob2RzKVxufSlcblxuYXN5bmMgZnVuY3Rpb24gZGV0YWNoUGF5bWVudEZ1bmMocGF5bWVudE1ldGhvZGlkLCBjYWxsYmFjaykge1xuICB3aW5zdG9uLmRlYnVnKCdkZXRhY2hQYXltZW50RnVuY3QgPiBwYXltZW50TWV0aG9kaWQgJywgcGF5bWVudE1ldGhvZGlkKVxuICBjb25zdCBzdHJpcGUgPSByZXF1aXJlKFwic3RyaXBlXCIpKGFwaVNlY3JldEtleSk7XG4gIGxldCBwYXltZW50TWV0aG9kO1xuICB0cnkge1xuICAgIHBheW1lbnRNZXRob2QgPSBhd2FpdCBzdHJpcGUucGF5bWVudE1ldGhvZHMuZGV0YWNoKFxuICAgICAgcGF5bWVudE1ldGhvZGlkXG4gICAgKTtcbiAgICBjYWxsYmFjayhwYXltZW50TWV0aG9kKVxuICB9IGNhdGNoIChlKSB7XG4gICAgY2FsbGJhY2soZSlcbiAgfVxufVxuXG5cblxuLy8gY3VybCAtWCBQT1NUIC11IGFuZHJlYS5sZW9AZjIxLml0OjEyMzQ1NiAtSCAnQ29udGVudC1UeXBlOmFwcGxpY2F0aW9uL2pzb24nIC1kICd7XCJ0eXBlXCI6XCJwYXltZW50X2ludGVudC5zdWNjZWVkZWRcIn0nICBodHRwOi8vbG9jYWxob3N0OjMwMDAvbW9kdWxlcy9wYXltZW50cy9zdHJpcGUvd2ViaG9va1xuXG4vLyByb3V0ZXIucG9zdCgnL3dlYmhvb2snLCBmdW5jdGlvbihyZXF1ZXN0LCByZXNwb25zZSkge1xuLy8gICB3aW5zdG9uLmluZm8oJ3N0cmlwZSB3ZWJob29rJyk7XG5cbi8vIC8vIE1hdGNoIHRoZSByYXcgYm9keSB0byBjb250ZW50IHR5cGUgYXBwbGljYXRpb24vanNvblxuLy8gLy8gYXBwLnBvc3QoJycsIGJvZHlQYXJzZXIucmF3KHt0eXBlOiAnYXBwbGljYXRpb24vanNvbid9KSwgKHJlcXVlc3QsIHJlc3BvbnNlKSA9PiB7XG4vLyAgICAgbGV0IGV2ZW50ID0gcmVxdWVzdC5ib2R5O1xuLy8gICAgIHdpbnN0b24uaW5mbygnZXZlbnQnLGV2ZW50KTsgIFxuXG4vLyAgICAgLy8gSGFuZGxlIHRoZSBldmVudFxuLy8gICAgIHN3aXRjaCAoZXZlbnQudHlwZSkge1xuLy8gICAgICAgY2FzZSAncGF5bWVudF9pbnRlbnQuc3VjY2VlZGVkJzpcbi8vICAgICAgICAgY29uc3QgcGF5bWVudEludGVudCA9IGV2ZW50LmRhdGEub2JqZWN0O1xuLy8gICAgICAgICBoYW5kbGVQYXltZW50SW50ZW50U3VjY2VlZGVkKHBheW1lbnRJbnRlbnQpO1xuLy8gICAgICAgICBicmVhaztcbi8vICAgICAgIGNhc2UgJ3BheW1lbnRfbWV0aG9kLmF0dGFjaGVkJzpcbi8vICAgICAgICAgY29uc3QgcGF5bWVudE1ldGhvZCA9IGV2ZW50LmRhdGEub2JqZWN0O1xuLy8gICAgICAgICBoYW5kbGVQYXltZW50TWV0aG9kQXR0YWNoZWQocGF5bWVudE1ldGhvZCk7XG4vLyAgICAgICAgIGJyZWFrO1xuLy8gICAgICAgLy8gLi4uIGhhbmRsZSBvdGhlciBldmVudCB0eXBlc1xuLy8gICAgICAgZGVmYXVsdDpcbi8vICAgICAgICAgLy8gVW5leHBlY3RlZCBldmVudCB0eXBlXG4vLyAgICAgICAgIHJldHVybiByZXNwb25zZS5zdGF0dXMoNDAwKS5lbmQoKTtcbi8vICAgICB9XG5cbi8vICAgICAvLyBSZXR1cm4gYSByZXNwb25zZSB0byBhY2tub3dsZWRnZSByZWNlaXB0IG9mIHRoZSBldmVudFxuLy8gICAgIHJlc3BvbnNlLmpzb24oe3JlY2VpdmVkOiB0cnVlfSk7XG4vLyB9KTtcblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSByb3V0ZXI7Il0sImZpbGUiOiJwYXltZW50cy9zdHJpcGUvaW5kZXguanMifQ==
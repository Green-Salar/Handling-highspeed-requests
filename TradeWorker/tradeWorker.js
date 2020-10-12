var tradeQueue = 'newTransaction';
var reqQ = 'tradeQueue';
var amqp = require('amqplib/callback_api');

const Binance = require('node-binance-api');
const binance = new Binance().options({
    APIKEY: 'asdfsdveravaeferer2r23d3dc3c3ccc',
    APISECRET: '23ccdsacasdfavcasdfasdfasdfsdcdsadsaf'
});

class mainClass {
    constructor(userDetails) {
        this.detailJSON = JSON.parse(userDetails);
        this.amount = this.detailJSON.amount;
        this.pair = this.detailJSON.pair;
        this.contract = this.detailJSON.contract;
        this.trade_type = this.detailJSON.trade_type;
        this.side = this.detailJSON.side;
        this.apiKey = this.detailJSON.Apikey;
        this.apisecret = this.detailJSON.Apisecret;
        this.binance = new Binance().options({
            APIKEY: this.detailJSON.Apikey,
            APISECRET: this.detailJSON.Apisecret
        });
    }
    validation() {
        return new Promise((resolved, reject) => {
            console.log('checking amount and validation of API key...');
            this.binance.balance()
                .then((res) => {
                    console.log('API key valid');
                    console.log('amount:' + this.amount);
                    console.log("available usd" + res.USDT.available);
                    var aa = Number(res.USDT.available);
                    if (0.001 < aa) {
                        resolved("ok amount and IP");
                    } else {
                        console.log('not enough eth available');
                    }
                })
                .catch((err) => {
                    console.log('error may API KEY!!!');
                    reject(err.body);
                });

        });

    }

    buy() {
        return new Promise((resolved, reject) => {
            if (this.trade_type == "market") {
                console.log("going to trade pair" + this.pair + "and amount" + this.amount);
                    binance.marketSell(this.pair, this.amount)
                        .then((res) => {
                            resolved(res);
                            console.log("this in result" + res);
                        })
                        .catch((err) => {
                          console.log(err.body);
                            reject(err.body);
                        });
            }
        });
    }
}

var recievedobj;
var amqp = require('amqplib/callback_api');
var details;

amqp.connect('amqp://localhost', function (error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function (error1, channel) {
        if (error1) {
            throw error1;
        }
        var queue = reqQ;
        channel.assertQueue(queue, {
            durable: false
        });
        channel.prefetch(1);
        console.log(' [x] Awaiting  requests');
        channel.consume(queue, function reply(msg) {
            console.log(" [x] Received %s", msg.content.toString());
            var recievedobj = JSON.parse(msg.content.toString());
            console.log(recievedobj);
            let binanceInstance = new mainClass(msg.content.toString());
            console.log('msg class created');
            binanceInstance.validation()
                .then((res) => {
                    console.log('ipvalidated go to next')
                    binanceInstance.buy()
                        .then((resu) => {
                            sendBack(resu);
                        }).catch((err) => {
                        sendBack(String(err));
                    });
                }).catch((err) => {
                sendBack(String(err));
            });

            function sendBack(r) {
                console.log("finished and sending back "+String(r));
                channel.sendToQueue(msg.properties.replyTo,
                    Buffer.from(String(r)), {
                        correlationId: msg.properties.correlationId
                    });
            }
            channel.ack(msg);
        });
    });

});


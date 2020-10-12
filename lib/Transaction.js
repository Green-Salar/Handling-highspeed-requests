import Util from "./Util";

var amqp = require('amqplib/callback_api');
var connection;
var channel;
var reqQ = 'tradeQueue';
var reqQ2 = 'answerQueue';
var sender_channel_name = "TransactionRequestChannel";
var connection;
var channel;
var name;


export default class Transaction {


    static connect() {
        return new Promise((resolve, reject) => {
            amqp.connect('amqp://localhost', function (error0, _connection) {
                connection = _connection;
                if (error0) {
                    throw error0;
                }
                connection.createChannel(function (error1, _channel) {
                    if (error1) {
                        throw error1;
                    }
                    channel = _channel;
                    resolve();
                });

            })

        });
    }


    static send(contractJson) {

        if (channel) {
            channel.assertQueue('', {
                exclusive: true
            }, (err, q) => {
                //  requestQ = q;
                var correlationId = Util.generateUuid();
                console.log('x requesting');
                channel.consume(q.queue, function reply(msg) {
                    if (msg.properties.correlationId === correlationId) {
                        console.log(' [.] Got %s', msg.content.toString());
                        setTimeout(function () {
                            connection.close();
                            //  process.exit(0);
                        }, 500);
                    }
                }, {
                    noAck: true
                });

                channel.sendToQueue(reqQ,
                    Buffer.from(contractJson), {
                        correlationId: correlationId,
                        replyTo: q.queue
                    });

            });
        } else {
            this.connect().then((res) => {
                this.send(contractJson);
            });
        }

    }
}
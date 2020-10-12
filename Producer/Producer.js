import Transaction from "../lib/Transaction";

var amqp = require('amqplib/callback_api');
var connection;
var channel;
var name;

var msgJSON = {
    'Apikey': "Of0dcnTSfDKSsQn5nOipdggYVqHs9KOb1234W0GzHDKcaLcYH9azGNPZRIZNwmiWXtJcNj",
    'Apisecret': "p9WFn7nulQtqd1234hmA2dUSLtbppGeLP1234MWFNfC0BaBMdjYcoJjx3GABzEiWLwZjJv4h6",
    'exchange': 'binance',
    'pair': 'BTCUSDT',
    'contract': 'spot',
    'trade_type': 'market',
    'side': 'buy',
    'amount': 0.001
};

var msg = JSON.stringify(msgJSON);

Transaction.send(msg);



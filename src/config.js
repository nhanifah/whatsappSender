// config.js
const { LocalAuth } = require('whatsapp-web.js');
require('dotenv').config({ path: __dirname + '/.env' });

module.exports = {
    rabbitmq: {
        url: process.env.RABBITMQ_URL,
        consumerOptions: {
            queue: process.env.RABBITMQ_QUEUE,
            queueOptions: { durable: true },
            qos: { prefetchCount: 1 },
            exchanges: [{ exchange: 'send', type: 'topic' }],
            queueBindings: [{ exchange: 'send', routingKey: 'users.*' }],
        },
        publisherOptions: {
            confirm: true,
            maxAttempts: 2,
            exchanges: [{ exchange: process.env.RABBITMQ_QUEUE, type: 'topic' }]
        }
    },
    whatsapp: {
        authStrategy: new LocalAuth(),
        webVersion: '2.2409.2',
        webVersionCache: {
            type: 'remote',
            remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2409.2.html',
        },
        puppeteer: {
            headless: false
        }
    },
    db: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    }
};

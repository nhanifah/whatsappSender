const { Connection } = require('rabbitmq-client');
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const config = require('./config');

// Initialize RabbitMQ client
const rabbit = new Connection(config.rabbitmq.url);

// Initialize WhatsApp client
const whatsappClient = new Client(config.whatsapp);

// Handle QR code
whatsappClient.on('qr', (qr) => {
    // Show QR code in terminal
    qrcode.generate(qr, { small: true });
});

// Event listener for incoming messages
whatsappClient.on('message', handleWhatsAppMessage);

// Handle error
whatsappClient.on('auth_failure', handleWhatsAppAuthFailure);

whatsappClient.on('ready', () => {
    console.log('[WhatsApp] Siap menggunakan WhatsApp Web');
});

rabbit.on('error', (err) => {
    console.log('[RabbitMQ] connection error', err)
});
rabbit.on('connection', () => {
    console.log('[RabbitMQ] Connection successfully (re)established')
});

const sub = rabbit.createConsumer(config.rabbitmq.consumerOptions, handleMessageFromQueue);

sub.on('error', (err) => {
    console.log('consumer error (user-events)', err)
});

// pub
const pub = rabbit.createPublisher(config.rabbitmq.publisherOptions);

async function onShutdown() {
    await pub.close();
    await sub.close();
    await rabbit.close();
}

process.on('SIGINT', onShutdown);
process.on('SIGTERM', onShutdown);

// Connect to WhatsApp
whatsappClient.initialize();

// Function to handle incoming WhatsApp messages
async function handleWhatsAppMessage(message) {
    console.log('[WhatsApp] Pesan baru diterima:', message.body);
    console.log('[WhatsApp] Dari:', message.from);

    if (message.from === '6287816661906@c.us') {
        console.log('[WhatsApp] Memproses pesan...');
        await sendWhatsAppMessage('6287816661906@c.us', 'Halo, alif!');
        await publishToRabbitMQ('whatsapp', {
            to: '6283832352467@c.us',
            body: 'Halo, cuk!'
        });
        console.log('[WhatsApp] Pesan terkirim!');
    }
}

// Function to handle WhatsApp authentication failure
function handleWhatsAppAuthFailure(message) {
    console.error('[WhatsApp] Autentikasi WhatsApp gagal:', message);
}

// Function to handle incoming messages from RabbitMQ
async function handleMessageFromQueue(msg) {
    console.log('[RabbitMQ] received message (user-events)', msg);
    const message = JSON.parse(msg.body.toString());
    try {
        await sendWhatsAppMessage(message.to, message.body);
        console.log('message sent to WhatsApp');
    } catch (err) {
        console.log('error sending message to WhatsApp', err);
        // Nack RabbitMQ message if needed
    }
}

// Function to send message via WhatsApp
async function sendWhatsAppMessage(to, body) {
    await whatsappClient.sendMessage(to, body);
}

// Function to publish message to RabbitMQ
async function publishToRabbitMQ(exchange, message) {
    await pub.send(exchange, JSON.stringify(message));
}

const mariadb = require('mariadb');
const {Client} = require('whatsapp-web.js');
const {Buttons, List} = require('whatsapp-web.js/src/structures');
const {createCanvas, loadImage} = require("canvas");
// const qrcode = require('qrcode-terminal');
const axios = require('axios');
const express = require('express');
const cors = require('cors');
const qr = require('qrcode');
const config = require('./config');
const Pusher = require("pusher");

const pusher = new Pusher({
    appId: "1100525",
    key: "0fc2df629377cfaa1278",
    secret: "50ad0bd6553761799adc",
    cluster: "ap1",
    useTLS: true
});


// TODO: Membuat cast ke client
// pusher.trigger("whatsapp", "status", {
//     message: "active"
//     // message: "inactive"
// });
//
// pusher.trigger("whatsapp", "qr_refresh", {
//     message: "reload"
// });
//
// pusher.trigger("whatsapp", "loading", {
//     message: "1" // range 1 to 100
// });

// Initialize WhatsApp client
const whatsappClient = new Client(config.whatsapp);
const app = express();
app.use(cors());

let qrCode = null;
let authenticated = false;
let clientActive = false;
const qrCodeCenterImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAMAAACahl6sAAADAFBMVEVHcEzSDxDUHB3RCQrYMDDQBgfVIiPaOjvQBQbSEBHQBAXWJyjTFRbjaGjSEhLRCgvQBgfdR0fSDw/TFBXQBwjSDQ7TFRbSDQ7VHyDQBAXXKCnVHyDQBwjSDxDPAQL////8xYnGsZkAAADPAACWg3KYhXXRAgPPAwT9x4t0Zln9/Pz2mJ3//v7QBwcJCQkODg3SAgP4+PgCAgLIspoUEhH/yIseHRz87u4FBQUYGBfRDA375ub/+vjr6cgbCAf9yY/9z5zY2NjKAQP9zJXf398jIR9DQkIjAgK/v7+SkpJJSUnWIyQrKirZMzPSERLz8/Pk5OQeGRX29vbFxcV6eno8PDvXKyygoJ/+06VQUFCAgIBPRj1WVlYmJiX+2K65ubj+9fTxr7A6NzRcXFyzsrIsIx3qk5TPz891dXTDAQLoiYqGhoZiYmIyKSGzn4osAQFFPTWtraxubm5nZ2e1AQKbiXjKyspZT0XAq5TU1NT2y8vhXF2np6afj32sAgLyt7c3AQDiZWank3/52tr64eHaPD01LykmHBafAAHx8fHzwMDJtJvDrpf+3rljWU3ZNziZmpqAc2P+48W8AQLsl5jt7e3UFxhWAABiAADv7++5pY6SAAGNjYwvLi7o6Oj+6dKsmYWRgHDnfX5LAAD4wodTOjI0NDPkbm4LHBJ7bF6Me2s9LSbvqKjcQUJHNyn2TTrruYJaRzVBAACHAABlUjrcRkf30tHGsJfzvoVtYFR+AABxW0CGdmf1xcX/793ktH51AADfVFXPpXbRtZfuo6SFakvr6+sOLh5qAADtnJyriGDu68reTU7brXnEnG67qZTun6DldXX/9OjylpqVdlMaUjVvAACnZ2p1SUqggFoVRCzDeHy6k2c7tHUoek/v7cv3X0nj3MGPXV0ymmUgZkLXy7c5r3Ish1jPxa2jnIvVh4nwxZb6kWrpzKsvkV/Fu6X7onU2pmyEgW/u7Mv4ely8jYTw2Lz7sX88tnefhmo9uXmYf2M9uHjjAAsACwpHcEwPeJ9eAAABAHRSTlMArkzkIuw6Fve++y+IBpLL2wygd897VtyA8mxe1mz///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8Af6x94gAAIABJREFUeNrMWctPGm8ULSqK72dt+2vLl9xZTEJgCITgoG5MgAAiJcgjGIgPiBhhAyQkCAkxlgVsZKEmJsDCBWzqUncuTBoTExftf/S7wwwPlVax9PElLTjAfHPmnnPuY1696v4anezrn/04NjU4M9ErlihomlYMScS9E+OiqZGPPf19k6/+/TU6MDz7empwQiwZoqWPFiWlEdGHwanXs/0Do/8uiL6e16IZMSKgpD9Z+DFFD4lnRK97+v5BMAP906IJCS2lpc9etGRCNN0/8C+h6Jsdm3nXEYgGmHczY7N9/0gsesY+DD2WQ21JacU8vxQKmhKOPfym5MNUz1+Py2j/yIzkEQSpwrZ8eLf/fffo62Ymn7+6yuczX75tn1VTFyvLNsUjOLRkZqT/b+pl4L1ITN8HIZ1fvqhub+59nlskLUsuvGzMHVx92d3PLs9L74OhxaL3fyssfdPjQy26wAuzHe5v5z9vkKeWfOMgs5tasd0HMzQz/TfUMjzyhm4Nxbw7dbQ3JyfPXrKFq+3rZUUrFnpibPhPwxjrbY3F/Eo1syAjnS754sGXfXcrFrr3j0LpG2mFoXB/z8wROXnZki9s7i/TVPOm/DkoA2+bpKKok+svC+RXllwuOzi6sDXDQk+8/hNamXw/rmjAoN1ne4ttBcC/2D3mojMW5A6sF9ZV3Gt7Am7kq8vNyoaeef/bC8t+kaTJqcPtz+2u6lNwzcO/KwC3nPgupIXSMSEqp89ZMB23C8zB7oqiAUUi6v/NrGqIg1Kcf517eDFEljCnSZph0/yBokarATDjux0A6w0hSR0CYyz6tmFZODpsQhGP/Ma00jOoaMDIfn0ocHsh7DjeAkvOC5Uyf6gc0q8Bi9RKankgBWBdfh6aqlBMyB5BWanrnqbHe0Z/VzjEDW2sHD2MBlEFYCuXc4HRpIFw87ATlKvc/zUgMh/49VEW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';

// Endpoint to check if WhatsApp is authenticated
app.get('/api/authenticated', (req, res) => {
    res.status(403).json({status: authenticated});
});

// Endpoint to generate QR code
app.get('/qr', (req, res) => {
    if (authenticated) {
        res.status(200).json({status: 200, message:"Whatsapp is connected"});
    } else if (!qrCode) {
        clientActive = true;
        deactivatedClient().then(() => {
            console.log("Firing function");
        })
        res.status(404).json({error: 'QR code has not been generated yet, please refresh the page within 15 seconds.'});
    } else {
        res.setHeader('Content-Type', 'image/png');
        generateQRWithLogo(qrCode,
            qrCodeCenterImage,
            252,
            80
        ).then((qrWithLogo) => {
            res.send(qrWithLogo);
        });
    }
});

whatsappClient.initialize();


whatsappClient.on('qr', qrData => {
    console.log('[WHATSAPP] QR code generated');
    console.log('[WHATSAPP] please refresh the page contain qr code');
    qrCode = qrData;
    if (clientActive) {
        pusher.trigger("whatsapp", "qr_refresh", {
            message: "reload"
        });
    }
});
whatsappClient.on('authenticated', () => {
    console.log('[WHATSAPP] User is authenticated');
    authenticated = true;
    if (clientActive) {
        pusher.trigger("whatsapp", "status", {
            message: "active"
        });
    }
});
whatsappClient.on('auth_failure', () => {
    console.log('[WHATSAPP] Authentication failed');
    authenticated = false;
    if (clientActive) {
        pusher.trigger("whatsapp", "status", {
            message: "failedLogin"
        });
    }
});

whatsappClient.on('loading_screen', (percent, message) => {
    console.log('[WHATSAPP] LOADING SCREEN', percent, message);
    if (clientActive) {
        pusher.trigger("whatsapp", "loading", {
            message: percent // range 1 to 100
        });
    }
});

// emit when whatsapp is on ready state
whatsappClient.on('ready', async () => {
    console.log('[WHATSAPP] WhatsApp is ready');
    if (clientActive) {
        pusher.trigger("whatsapp", "status", {
            message: "ready"
        });
    }
    qrCode = null;
    authenticated = true;
    clientActive = false;
    let loopTime = await generateRandomNumber();

    // Handle sending message service
    setInterval(async () => {
        console.log(`[DATABASE] Get new message in ${loopTime} milisecond`);
        const rows = await asyncFunction();

        if (rows.length > 0) {
            // console.log(rows[0].id);
            // decode JSON payload
            const payload = JSON.parse(rows[0].payload.replace(/\n/g, '\\n'));
            // decode message from base64 to utf-8
            payload.message = Buffer.from(payload.message, 'base64').toString('utf-8');
            try {
                await whatsappClient.sendMessage(
                    payload.whatsapp + "@c.us",
                    payload.message
                );
                await asyncUpdate(rows[0].id, 'success');
                console.log('[DATABASE] send message to', payload.whatsapp);
                console.log('[DATABASE] message:', payload.message);
            } catch (e) {
                console.log("[DATABASE]", e);
                await asyncUpdate(rows[0].id, 'failed');
            }
        }
        loopTime = await generateRandomNumber();
    }, loopTime);
});

whatsappClient.on('message', async (message) => {
    // console.log(message);
    if (message.body === '!affiliate') {
        // get data from api
        await getDataFromApi(message.from);
    }
    // if message.body contains '!reCreateInv'
    if (message.body.includes('!reCreateInv')) {
        // parse message body with white space as delimiter
        const messageBody = message.body.split(' ');
        // get the second element of the array
        const whatsappNumber = messageBody[1];
        // get the third element of the array
        const pembayaranKe = messageBody[2];

        console.log('Re-creating invoice for : ', whatsappNumber);
        console.log('Pembayaran ke : ', pembayaranKe);

        // send a to function reCreateInvoiceFromApi
        await reCreateInvoiceFromApi(message.from, whatsappNumber, pembayaranKe);
    }

    if (message.body.includes('!status')) {
        // parse message body with white space as delimiter
        const messageBody = message.body.split(' ');
        // get the second element of the array
        const whatsappNumber = messageBody[1];

        console.log('Info for : ', whatsappNumber);

        // send a to function reCreateInvoiceFromApi
        await studentInfoFromApi(message.from, whatsappNumber);
    }

    if (message.body === '!ping') {
        whatsappClient.sendMessage(message.from, 'pong');
    }

    if (message.body === '!getGroups') {
        const groups = await whatsappClient.getChats();
        const groupData = groups
            .filter((chat) => chat.isGroup)
            .map((chat) => {
                return {
                    name: chat.name,
                    id: chat.id._serialized
                };
            });

        console.log('Groups:', groupData);
        const reply = `Here are the groups you are a member of:\n\n${groupData.map(group => `Name: ${group.name}\nID: ${group.id}`).join('\n\n')}`;
        message.reply(reply);
    }
});

// emit when whatsapp is logged out
whatsappClient.on('disconnected', () => {
    console.log('[WHATSAPP] WhatsApp is disconnected');
    qrCode = null;
    authenticated = false;
    // reinitialize whatsapp
    whatsappClient.initialize();
});
app.listen(3000, () => {
    console.log('[SERVER] Server is running on http://localhost:3000');
});

// create function add logo in qr code
async function generateQRWithLogo(dataForQRcode, center_image, width, cwidth) {
    const canvas = createCanvas(width, width);
    qr.toCanvas(
        canvas,
        dataForQRcode,
        {
            errorCorrectionLevel: "M",
            margin: 1,
            color: {
                dark: "#CF1101",
                light: "#ffffff",
            },
        }
    );

    const ctx = canvas.getContext("2d");
    const img = await loadImage(center_image);
    const center = (width - cwidth) / 2;
    ctx.drawImage(img, center, center, cwidth, cwidth);

    // inject fingerprint image
    let fingerprint = canvas.toBuffer();
    // convert string to buffer
    let tail = "Application created by alif firdi <alif@harehare-corp.com>";
    let buf = Buffer.from(tail);

    // concat buffer
    fingerprint = Buffer.concat([fingerprint, buf]);
    // return canvas.toDataURL("image/png");
    return fingerprint;
}

async function asyncFunction() {
    const conn = await mariadb.createConnection({
        host: config.db.host,
        user: config.db.user,
        password: config.db.password,
        database: config.db.database
    });
    try {
        return await conn.query(`SELECT * from job WHERE status = 'pending' AND job_type = 'whatsapp' ORDER BY created_at ASC LIMIT 1`);

    } finally {
        conn.end();
    }
}

async function asyncUpdate(id, status) {
    const conn = await mariadb.createConnection({
        host: config.db.host,
        user: config.db.user,
        password: config.db.password,
        database: config.db.database
    });
    try {
        return await conn.query(`UPDATE job SET status = '${status}' WHERE id = '${id}'`);

    } finally {
        conn.end();
    }
}

async function generateRandomNumber() {
    return Math.floor(Math.random() * (10000 - 2000 + 1)) + 2000;
}

async function getDataFromApi(whatsappSend) {
    const token = 'NQPa0BigahHJrUzrjx29yfj97WXkJPcoB0JPEcVXGPIWKNql'; // Replace 'your_auth_token' with the actual token value

    axios.get('https://course.wkwk-japanese.com/webhook/affiliateList', {
        headers: {
            'X-CALLBACK-TOKEN': token
        }
    })
        .then(response => {
            const data = response.data;

            var pesan = '';

            // Loop through the data and display the desired information
            data.forEach(item => {
                const {refferal_name, total_join, total_affiliate_unpaided} = item;
                const total_payment = total_affiliate_unpaided > 0 ? `Rp. ${Number(total_affiliate_unpaided * 100000).toLocaleString()}` : 'N/A';

                //   console.log(`Nama: ${refferal_name}`);
                //   console.log(`Total Join: ${total_join}`);
                //   console.log(`Total affiliate unpaid: ${total_affiliate_unpaided}`);
                //   console.log(`Total yang harus dibayarkan: ${total_payment}`);
                //   console.log('\n');

                pesan += `Nama: ${refferal_name}\n`;
                pesan += `Total Join: ${total_join}\n`;
                pesan += `Total affiliate unpaid: ${total_affiliate_unpaided}\n`;
                pesan += `Total yang harus dibayarkan: ${total_payment}\n\n`;

            });

            // send message to WhatsApp
            whatsappClient.sendMessage(whatsappSend, pesan) // Replace 'phone' with the phone number to send the message to, including the country code
        })
        .catch(error => {
            // Handle the error
            console.error(error);
            return null;
        });
}

async function reCreateInvoiceFromApi(from, whatsappSend, pembayaranKe) {
    const token = 'NQPa0BigahHJrUzrjx29yfj97WXkJPcoB0JPEcVXGPIWKNql'; // Replace 'your_auth_token' with the actual token value

    axios.get('https://course.wkwk-japanese.com/register/reCreateInvByWa/' + whatsappSend + '/' + pembayaranKe, {
        headers: {
            'X-CALLBACK-TOKEN': token
        }
    })
        .then(response => {
            const data = response.data;

            var pesan = '';

            // check if data.message is exist
            if (data.message) {
                pesan = data.message;
            } else {
                // check if data.invoice_url is exist
                if (data.invoice_url) {
                    pesan = 'Invoice berhasil dibuat, silahkan klik link berikut untuk melakukan pembayaran: ' + data.invoice_url;
                }

                // convert error message to string
                if (data.error) {
                    pesan = data.error.toString();
                }
            }

            // send message to WhatsApp
            whatsappClient.sendMessage(from, pesan) // Replace 'phone' with the phone number to send the message to, including the country code
        })
        .catch(error => {
            // Handle the error
            console.error(error);
            return null;
        });
}

async function studentInfoFromApi(from, whatsappSend) {
    const token = 'NQPa0BigahHJrUzrjx29yfj97WXkJPcoB0JPEcVXGPIWKNql'; // Replace 'your_auth_token' with the actual token value

    axios.get('https://course.wkwk-japanese.com/webhook/studentDetailByWa/' + whatsappSend, {
        headers: {
            'X-CALLBACK-TOKEN': token
        }
    })
        .then(response => {
            const data = response.data;
            console.log(data);

            // if data.error is exist
            if (data.error) {
                // send message to WhatsApp
                whatsappClient.sendMessage(from, data.message)
                return null;
            }
            // console.log(data);

            var pesan = '';

            // Loop through the data and display the desired information
            const {
                student_fullname,
                student_email,
                student_age,
                student_address_province,
                student_profession,
                student_qualification,
                student_reff,
                installment
            } = data;
            const referral = student_reff != null ? data.referral.refferal_name : 'N/A';

            //   console.log(`Nama: ${refferal_name}`);
            //   console.log(`Total Join: ${total_join}`);
            //   console.log(`Total affiliate unpaid: ${total_affiliate_unpaided}`);
            //   console.log(`Total yang harus dibayarkan: ${total_payment}`);
            //   console.log('\n');

            pesan += `Nama Peserta : ${student_fullname}\n`;
            pesan += `Email : ${student_email}\n`;
            pesan += `Umur : ${student_age}\n`;
            pesan += `Provinsi : ${student_address_province}\n`;
            pesan += `Profesi : ${student_profession}\n`;
            pesan += `Kualifikasi : ${student_qualification}\n`;
            pesan += `Refferal dari : ${referral}\n`;

            pesan += `\n\n=============\n`;
            pesan += `=============\n`;
            pesan += `*Pembayaran & Kelas*\n`;
            pesan += `=============\n`;

            installment.forEach(item => {
                const {installment_period, installment_status} = item;

                pesan += `Pembayaran ke : ${installment_period}\n`;
                pesan += `Status : ${installment_status}\n`;
                pesan += `Kelas : ${item.batch_registration.batch_desc}\n`;
                pesan += `============\n`;
            });

            // send message to WhatsApp
            whatsappClient.sendMessage(from, pesan)
        })
        .catch(error => {
            // Handle the error
            console.error(error);
            return null;
        });
}

async function deactivatedClient() {
    setTimeout(() => {
        if (clientActive) {
            console.log('deactivated client');
            clientActive = false;
        }
    }, 60000 * 10);
}
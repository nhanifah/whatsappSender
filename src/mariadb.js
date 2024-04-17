const mariadb = require('mariadb');
const config = require('./config');
require('dotenv').config();
// const pool = mariadb.createPool({host: config.db.host, user: config.db.user, password: config.db.password, connectionLimit: 5});

console.log("inisialisasi");
async function asyncFunction() {
    console.log("asyncFunction fired");
    const conn = await mariadb.createConnection({host: '127.0.0.1', user: 'root', password: ''});
    try {
        return await conn.query(`SELECT * from whatsapp.job WHERE status = 'pending' AND job_type = 'whatsapp' ORDER BY created_at ASC LIMIT 1`);

    } finally {
        conn.end();
    }
}

async function asyncUpdate(id,status) {
    console.log("asyncUpdate fired");
    const conn = await mariadb.createConnection({host: '127.0.0.1', user: 'root', password: ''});
    try {
        return await conn.query(`UPDATE whatsapp.job SET status = '${status}' WHERE id = '${id}'`);

    }
    finally {
        conn.end();
    }
}

// module.exports = asyncFunction;

// loop refresh every 5 seconds
setInterval(async () => {
    console.log("looping every 5 seconds");
    const rows = await asyncFunction();
    // update the data
    if (rows.length > 0) {
        console.log(rows[0].id);
        await asyncUpdate(rows[0].id,'success');
    }
    console.log(rows);
}, 5000);
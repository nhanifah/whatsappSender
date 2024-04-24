
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
// pusher.trigger("whatsapp", "status", {
//     message: 'failedLogin' // range 1 to 100
// });

pusher.trigger("whatsapp", "loading", {
    message: 50 // range 1 to 100
});
console.log("pusher triggered");
// delay 2 second
setTimeout(() => {
    // pusher.trigger("whatsapp", "loading", {
    //     message: 100 // range 1 to 100
    // });
    setTimeout(() => {
        pusher.trigger("whatsapp", "status", {
            message: "failedLogin"
            // message: "inactive"
        });
    }, 1000);
}, 10000);


console.log("pusher triggered 2");
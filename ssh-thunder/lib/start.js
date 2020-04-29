const debug = require('debug')("ssh-thunder:bvssh");

const {
    startBvSsh
} = require('../lib/bvssh');


const start = async (port, timeOutMs) => {
    // debug(global.BvSsh[port]);
    const sshObj = global.BvSsh[port]["data"]

    global.BvSsh[port].rp = await startBvSsh(sshObj.ip, sshObj.user, sshObj.pwd, port, global.BvSsh[port].lastCallPid, timeOutMs);

    if (global.BvSsh[port]["rp"]["success"]) {
        global.BvSsh[port].lastCallPid = global.BvSsh[port].rp.exe.pid
    }

    debug(port, global.BvSsh[port]["rp"]["success"], global.BvSsh[port]["rp"]["message"]);

    const portListIndex = global["portList"].findIndex(x => x.port === parseInt(port, 10));

    console.log(portListIndex);

    global["portList"][portListIndex]["status"] = global.BvSsh[port]["rp"]["success"] === true ? "Running" : "Failed";
};

module.exports = {
    start
};
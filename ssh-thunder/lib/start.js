const debug = require('debug')("ssh-thunder:lib:start");

const {
    startBvSsh
} = require('../lib/bvssh');


const start = async (port, timeOutMs) => {
    // debug(global.BvSsh[port]);
    const sshObj = global.BvSsh[port]["data"]

    global.BvSsh[port].rp = await startBvSsh(sshObj.ip, sshObj.user, sshObj.pwd, port, global.BvSsh[port].lastCallPid, timeOutMs);

    const portListIndex = global["portList"].findIndex(x => x.port === parseInt(port, 10));
    // console.log(portListIndex);
    global["portList"][portListIndex]["status"] = global.BvSsh[port]["rp"]["success"] === true ? "Running" : "Failed";

    if (global.BvSsh[port]["rp"]["success"]) {
        global.BvSsh[port].lastCallPid = global.BvSsh[port].rp.exe.pid
        global.BvSsh[port].rp.exe.once('close', (code) => {
            debug(`BvSsh.exe exited with code ${code}`);

            if (code === 1) {
                global["portList"][portListIndex]["status"] = `Renewing`;
            } else {
                global["portList"][portListIndex]["status"] = `exited[${code}]`;
            }
        });
    }

    debug(port, global.BvSsh[port]["rp"]["success"], global.BvSsh[port]["rp"]["message"]);
};

module.exports = {
    start
};
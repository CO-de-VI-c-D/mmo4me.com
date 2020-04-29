const {
    startBvSsh
} = require('../lib/bvssh');

const debug = require("debug")("ssh-thunder:test");
const lineByLine = require('n-readlines');
const config = require('../config.json');

const liner = new lineByLine(`./data/${config.file}`);


// setInterval(() => {
//     console.log('.')
// }, 1000);

const test = async (obj, port, timeOutMs) => {
    debug(obj[port], timeOutMs);

    obj[port].rp = await startBvSsh(obj[port].ip, obj[port].user, obj[port].pwd, port, obj[port].lastCallPid, timeOutMs);

    debug(port, obj[port].rp.success, obj[port].rp.message);

    if (obj[port].rp.success) {
        obj[port].lastCallPid = obj[port].rp.exe.pid
    }

    return obj[port]?.rp?.success;
};

(async () => {
    // const start = new Date()
    // const hrstart = process.hrtime()
    await new Promise((resolve) => setTimeout(resolve, 5000));

    gSSHObj = {};

    const Promises = [];

    for (let index = 0; index < 10; index++) {
        const line = liner.next();
        if (line == false) {
            debug("OEF");
            break;
        }
        
        const sshParser = line.toString('ascii').split(config.delim);
        if (sshParser.length < 3) {
            debug(sshParser);
            debug("line split not match delim ${config.delim}");
            break;
        }

        
        const port = config.startPort + index
        gSSHObj[port] = {ip: sshParser[0], user: sshParser[1], pwd: sshParser[2]};


        
        // console.log(sshParser);
        // console.log(gSSHObj);

        Promises.push(test(gSSHObj, port, 30000 + index * 1000));
    }

    await Promise.all(Promises);



    // ls.on('close', (code) => {
    //     console.log(`child process exited with code ${code}`);

    //     // 10

    //     const end = new Date() - start,
    //         hrend = process.hrtime(hrstart)

    //     console.info('Execution time: %dms', end)
    //     console.info('Execution time (hr): %ds %dms', hrend[0], hrend[1] / 1000000)
    // });
})();

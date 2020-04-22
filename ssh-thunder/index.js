const {
    startBvSsh
} = require('./lib/bvssh');

// setInterval(() => {
//     console.log('.')
// }, 1000);

const test = async (obj, i) => {
    obj[obj.listenPort] = {};

    obj[obj.listenPort].rp = await startBvSsh('127.0.0.1', 'hashtafak', '1', obj.listenPort + i, obj[obj.listenPort].lastCallPid);
    
    console.log(obj[obj.listenPort].rp.success, obj[obj.listenPort].rp.message);

    if (obj[obj.listenPort].rp.success) {
        obj[obj.listenPort].lastCallPid = obj[obj.listenPort].rp.exe.pid
    }
};

(async () => {
    // const start = new Date()
    // const hrstart = process.hrtime()
    const obj = {listenPort:1080};
    const arr = [];

    for (let index = 0; index < 5; index++) {
        arr.push(test(obj, index));
    }

    await Promise.all(arr);
    // ls.on('close', (code) => {
    //     console.log(`child process exited with code ${code}`);

    //     // 10

    //     const end = new Date() - start,
    //         hrend = process.hrtime(hrstart)

    //     console.info('Execution time: %dms', end)
    //     console.info('Execution time (hr): %ds %dms', hrend[0], hrend[1] / 1000000)
    // });
})();
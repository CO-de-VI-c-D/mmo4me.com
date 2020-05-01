const tcp = require('tcp-port-used');
const {
    execFile,
    execFileSync
} = require('child_process');
const debug = require("debug")("ssh-thunder:lib:bvssh");

execFile('./3rd/AutoBvSsh.exe').unref();

const checkPort = (exe, timeOutMs, listenPort) => new Promise((resolve) => {
    debug(listenPort, "checkPort");

    let timeout, interval;
    exe.unref();

    exe.once('close', (code) => {
        clearTimeout(timeout);
        clearInterval(interval);

        debug(`BvSsh.exe exited with code ${code}`);

        resolve({
            success: false,
            message: `BvSsh.exe exited with code ${code}`,
            errCode: 2
        });
    });

    timeout = setTimeout(() => {
        clearInterval(interval);

        try {
            exe.removeAllListeners("close");
        } catch (error) {
            debug(`exe.removeAllListeners("close") : ${error.message}`);
        }

        resolve({
            success: false,
            message: `checkPort time out`,
            errCode: 3,
            kill: exe.kill(9)
        });
    }, timeOutMs);

    interval = setInterval(() => tcp.waitUntilUsed(parseInt(listenPort, 10), 100, 1000)
        .then(() => {
            clearTimeout(timeout);
            clearInterval(interval);

            try {
                exe.removeAllListeners("close");
            } catch (error) {
                debug(`exe.removeAllListeners("close") : ${error.message}`);
            }

            resolve({
                success: true,
                exe
            });
        }, (e) => e), 1000);
});

const runCmd = ({
    sshHost,
    sshUser,
    sshPassword,
    sshPort = 22,
    listenPort,
    hideAll = true
}) => {
    debug(listenPort, "runCmd");
    const args = [`-host=${sshHost}`, `-port=${sshPort}`, `-user=${sshUser}`, `-password=${sshPassword}`, "-loginOnStartup", "-exitOnLogout", `-baseRegistry=HKEY_CURRENT_USER\\Software\\SshThunder\\Bitvise\\${listenPort}`]

    if (hideAll) {
        args.concat(["-menu=small", "-hide=popups,trayLog,trayPopups,trayIcon"])
    }

    return execFile("./3rd/BvSsh.exe", args);
}

const createProfile = (listenPort, listenAddress) => {
    return execFileSync(`./3rd/BvSshProfileWrite.exe`, [listenPort, listenAddress])
}

const startBvSsh = async (sshHost, sshUser, sshPassword, listenPort = 1271, lastCallPid = null, timeOutMs = 10000, listenAddress = "0.0.0.0") => {
    // debug(sshHost, sshUser, sshPassword, listenPort, lastCallPid);

    if (lastCallPid) {
        try {
            process.kill(lastCallPid, 9);
        } catch (error) {
            debug(error);
        }

        await new Promise((resolve) => setTimeout(resolve, 500));
    }

    try {
        await createProfile(listenPort, listenAddress)
    } catch (e) {
        debug(`createProfile err: ${e.message}`)
    }

    const listenPortInUsed = await tcp.check(parseInt(listenPort, 10), '127.0.0.1') //.then(r => console.log);
    if (!listenPortInUsed) {
        const exe = await runCmd({
            sshHost,
            sshUser,
            sshPassword,
            listenPort
        });

        return checkPort(exe, timeOutMs, listenPort);
    } else {
        return {
            success: false,
            message: `Port ${listenPort} in use.`,
            errCode: 1
        }
    }
}

module.exports = {
    startBvSsh
}
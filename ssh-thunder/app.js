process.env.DEBUG = "ssh-thunder:*"

const express = require("express");
const path = require("path");

const debug = require('debug')("ssh-thunder:api");

const multer = require('multer');
const upload = multer({
    dest: 'uploads/' // this saves your file into a directory called "uploads"
});

const bodyParser = require('body-parser')

const tcp = require('tcp-port-used');

const fileRm = require('./lib/remove');
const saveConfig = require('./lib/savecf');
const {
    start
} = require('./lib/start');

const app = express();
const port = process.env.PORT || "8000";

const config = require('./config.json');

const lineByLine = require('n-readlines');
const liner = new lineByLine(`${config.file.path}`);

global.portList = [];
global.BvSsh = {};

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get("/", (req, res) => {
    res.render("index", {
        title: "SSH Thunder | YoloTEAM | CoderMMO fb group | MMO4ME.COM 4rum",
        sshFileName: config.file.name,
        portList: global.portList
    });
});

// It's very crucial that the file name matches the name attribute in your html
app.post('/', upload.single('file-to-upload'), (req, res) => {
    if (req.file) {
        fileRm(req.file.filename);
        config.file.name = req.file.originalname;
        config.file.path = req.file.path;
        saveConfig(config);
    }

    res.redirect('/');
});

app.post('/create', (req, res) => {
    if (req.body.number && req.body.number < 300) {
        const lastIndex = global.portList[global.portList.length - 1]
        // console.log(lastIndex)

        const startPort = lastIndex ? lastIndex.port + 1 : config.startPort;

        for (let index = 0; index < req.body.number; index++) {
            global.portList.push({
                ssh: "",
                status: "",
                port: startPort + index
            });
        }
    }

    res.redirect('/');
});

app.post('/start', async (req, res) => {
    if (req.body.port) {
        const port = req.body.port

        // console.log(port);

        const line = liner.next();
        if (line == false) {
            debug("OEF");

            return res.status(401).send({
                success: false,
                message: null
            });
        }

        const sshParser = line.toString('ascii').split(config.delim);
        if (sshParser.length < 3) {
            debug(sshParser);
            debug("line split not match delim ${config.delim}");

            return res.status(401).send({
                success: false,
                message: null
            });
        }

        if (!global.BvSsh[port]) {
            global.BvSsh[port] = {
                data: {
                    ip: sshParser[0],
                    user: sshParser[1],
                    pwd: sshParser[2]
                }
            };
        } else {
            global.BvSsh[port].data = {
                ip: sshParser[0],
                user: sshParser[1],
                pwd: sshParser[2]
            };
        };

        const portListIndex = global.portList.findIndex(x => x.port === parseInt(port, 10));
        debug(portListIndex);

        global.portList[portListIndex].ssh = `${sshParser[0]}|${sshParser[1]}|${sshParser[2]}`
        global.portList[portListIndex].status = "Starting"

        // debug(global.BvSsh[port]);

        start(port, 30000);

        return res.send({
            success: true,
            data: global.BvSsh[port].data
        });
    }
});

app.post('/stopall', (req,res)=>{
    Object.keys(global.BvSsh).forEach(port => {
        if (global.BvSsh[port]["lastCallPid"]) 
        {
            try {
                process.kill(global.BvSsh[port]["lastCallPid"], 9);
            } catch (error) {
                debug(error);
            }

            global.BvSsh[port] = {};

            const portListIndex = global.portList.findIndex(x => x.port === parseInt(port, 10));
            debug(portListIndex);

            global.portList[portListIndex].status = "Stopped"
        }
    });

    res.redirect('/');
})

app.listen(8000, "0.0.0.0", () => {
    console.log(`Listening to requests on http://localhost:${port}`);
});
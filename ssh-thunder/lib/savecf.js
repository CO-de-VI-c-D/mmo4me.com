const fs = require('fs');

const saveConfig = config =>{
    fs.writeFileSync("./config.json", JSON.stringify(config, null, 4));
}

module.exports = saveConfig;
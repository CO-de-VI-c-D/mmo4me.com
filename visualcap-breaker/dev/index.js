
const fs = require('fs');

const fileList = fs.readdirSync('./images', { withFileTypes: true });

const data=[];

fileList.forEach(file => {
    const base64 = new Buffer.from(fs.readFileSync(`./images/${file.name}`)).toString('base64');
    // console.log(file.name);
    data.push({name: file.name, data: base64})
});

fs.writeFileSync('./data.json', JSON.stringify(data, null, 4));

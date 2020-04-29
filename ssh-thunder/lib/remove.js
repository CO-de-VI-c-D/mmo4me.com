const fs = require('fs');
const path = require('path');

const fileRm = (name) => {
    fs.readdir('uploads/', (err, files) => {
        if (err) {
            console.log(err);
        }

        files.forEach(file => {
            const fileDir = path.join('uploads', file);

            if (file !== name) {
                fs.unlinkSync(fileDir);
                console.log(fileDir);
            }
        });
    });
}

module.exports = fileRm;
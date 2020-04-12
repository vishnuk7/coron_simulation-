const path = require('path');
module.exports = {
    entry: "./app.js",
    output: {
        filename: "output.js",
        path: path.resolve(__dirname, '')
    }
};
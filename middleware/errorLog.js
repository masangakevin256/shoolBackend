const {logEvents} = require("./logEvents")

const errorLog = (err, req, res, next) => {
    // ensure logging errors don't crash the app
    logEvents(`${err.name}: ${err.message}`, "errorEvents.txt").catch(e => console.error('Failed to write error log', e));
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
}

module.exports = errorLog
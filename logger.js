module.exports = {
    log: function log(...args) {
        console.log((new Date()).toLocaleString(), ...args);
    },
    error: function log(...args) {
        console.log((new Date()).toLocaleString(), ' ERR! ', ...args);
    },
};
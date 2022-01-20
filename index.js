const fs = require('fs')
let file;
let backupfilename;
let backuplocation;
class Database {
    constructor(filePath, options) {
        file = filePath || "./db.json";
        this.options = options || {};

        if (!fs.existsSync(file)) {
            fs.writeFileSync(file, "{}", "utf-8");
        }
        if (this.options.backup && this.options.backup.enabled) {
            backupfilename = this.options.backup.name || 'Backup.json';
            if (!backupfilename.includes('.')) return console.error(backupfilename, "must contain the file extension")
            backuplocation = this.options.backup.path || './backups/';
            if (!fs.existsSync(backuplocation)) {
                fs.mkdirSync(backuplocation);
            }
            if (!backuplocation.endsWith('/')) {
                backuplocation = backuplocation + '/'
            }
            setInterval(() => {
                fs.writeFileSync(backuplocation + `${backupfilename}`, fs.readFileSync(file, {encoding: 'utf-8'}))
            }, (this.options.backup.interval || 86400000));
        }
    }
    set(key, value) {
        if (!key) return console.log('No key provided');
        if (!value) return console.log("No value provided")
        let object = JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' }))
        object[key] = value
        fs.writeFileSync(file, JSON.stringify(object, null, 2), 'utf-8')
    }
    get(key) {
        if (!key) return console.log('No key provided');
        let object = JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' }))
        return object[key];
    }
    push(key, value) {
        if (!key) return console.log('No key provided');
        if (!value) return console.log("No value provided")
        let object = JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' }))

        if (!object[key]) object[key] = [];
        if (!Array.isArray(object[key])) object[key] = [];
        object[key].push(value)
        fs.writeFileSync(file, JSON.stringify(object, null, 2), 'utf-8')
    }
    has(key) {
        if (!key) return console.log('No key provided');
        let object = JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' }))
        return Boolean(object[key]);
    }
    add(key, count) {
        if (!key) return console.log('No key provided');
        if (!value) return console.log("No value provided")
        let object = JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' }))
        if (!object[key]) object[key] = 0
        object[key] += count
        fs.writeFileSync(file, JSON.stringify(object, null, 2), 'utf-8')
    }
    subtract(key, count) {
        if (!key) return console.log('No key provided');
        if (!value) return console.log("No value provided")
        let object = JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' }))
        if (!object[key]) object[key] = 0
        object[key] -= count
        fs.writeFileSync(file, JSON.stringify(object, null, 2), 'utf-8')
    }
    remove(key, value) {
        if (!key) return console.log('No key provided');
        let object = JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' }))
        if (!Array.isArray(object[key])) return console.log(`Given key is not an array`)
        if (object[key].indexOf(value) == -1) return
        object[key].splice(object[key].indexOf(value), 1)
    }
    delete(key) {
        if (!key) return console.log('No key provided');
        let object = JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' }))
        delete object[key]
        fs.writeFileSync(file, JSON.stringify(object, null, 2), 'utf-8')
    }
}
module.exports = { Database }
const fs = require('fs-extra')
let file;
module.exports = class Database {
    constructor(filePath, options) {
        file = filePath || "./db.json";
        this.options = options || {};

        if (this.options.snapshots && this.options.snapshots.enabled) {
            const path = this.options.snapshots.path || './db-backups/';
            if (!fs.existsSync(path)) {
                fs.mkdirSync(path);
            }
            console.log(this.options.snapshots.path)
            return
            setInterval(() => {
                fs.copyFileSync(file, path)
            }, (this.options.snapshots.interval || 86400000));
        }
        if (!fs.existsSync(file)) {
            fs.writeFileSync(file, "{}", "utf-8");
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
    has(key) {
        if (!key) return console.log('No key provided');
        let object = JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' }))
        return Boolean(object[key]);
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
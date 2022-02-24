const fs = require('fs');
const http = require('http');
const events = require('events');

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
                fs.writeFileSync(backuplocation + `${backupfilename}`, fs.readFileSync(file, { encoding: 'utf-8' }))
            }, (this.options.backup.interval || 86400000));
        }
    }
    set(key, value) {
        new Promise((resolve, reject) => {
            if (!key) throw new Error('No key provided');
            if (!value) throw new Error("No value provided")
            let object = JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' }))
            object[key] = value
            fs.writeFileSync(file, JSON.stringify(object, null, 2), 'utf-8')
            resolve()
        })
    }
    get(key) {
        return new Promise((resolve, reject) => {
            if (!key) throw new Error('No key provided');
            let object = JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' }))
            resolve(object[key]);
        })
    }
    push(key, value) {
        new Promise((resolve, reject) => {
            if (!key) throw new Error('No key provided');
            if (!value) throw new Error("No value provided")
            let object = JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' }))
            if (!object[key]) object[key] = [];
            if (!Array.isArray(object[key])) object[key] = [];
            object[key].push(value)
            fs.writeFileSync(file, JSON.stringify(object, null, 2), 'utf-8')
            resolve()
        })
    }
    has(key) {
        return new Promise((resolve, reject) => {
            if (!key) throw new Error('No key provided');
            let object = JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' }))
            resolve(Boolean(object[key]));
        })
    }
    add(key, count) {
        new Promise((resolve, reject) => {
            if (!key) throw new Error('No key provided');
            if (!count) throw new Error("No count provided")
            let object = JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' }))
            if (!object[key]) object[key] = 0
            object[key] += count
            fs.writeFileSync(file, JSON.stringify(object, null, 2), 'utf-8')
            resolve()
        })
    }
    subtract(key, count) {
        new Promise((resolve, reject) => {
            if (!key) throw new Error('No key provided');
            if (!count) throw new Error("No count provided")
            let object = JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' }))
            if (!object[key]) object[key] = 0
            object[key] -= count
            fs.writeFileSync(file, JSON.stringify(object, null, 2), 'utf-8')
            resolve()
        })
    }
    type(key) {
        return new Promise((resolve, reject) => {
            if (!key) throw new Error('No key provided');
            let object = JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' }))
            resolve(typeof object[key])
        })
    }
    keys() {
        return new Promise((resolve, reject) => {
            let object = JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' }))
            resolve(Object.keys(object))
        })
    }
    values() {
        return new Promise((resolve, reject) => {
            let object = JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' }))
            resolve(Object.values(object))
        })
    }
    remove(key, value) {
        new Promise((resolve, reject) => {
            if (!key) throw new Error('No key provided');
            let object = JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' }))
            if (!Array.isArray(object[key])) throw new Error(`Given key is not an array`)
            if (object[key].indexOf(value) == -1) return
            object[key].splice(object[key].indexOf(value), 1)
            fs.writeFileSync(file, JSON.stringify(object, null, 2), 'utf-8')
            resolve()
        })
    }
    delete(key) {
        new Promise((resolve, reject) => {
            if (!key) throw new Error('No key provided');
            let object = JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' }))
            delete object[key]
            fs.writeFileSync(file, JSON.stringify(object, null, 2), 'utf-8')
            resolve()
        })
    }
    clear() {
        new Promise((resolve, reject) => {
            fs.writeFileSync(file, "{}", "utf-8")
            resolve()
        })
    }
}
class Server {
    constructor(path, options) {
        this.path = path || './Server-Database/';
        this.options = options || {};
        if (this.options == null || this.options == undefined) this.options = {};
        this.port = this.options.port || 8000;
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true })
        }
        if (!this.path.endsWith('/')) this.path = this.path + '/'
        if (this.options.port == null || !this.options.port) console.log(`Port is not specified in options. Using port ${this.port}`)
        if (this.port > 65535 || this.port < 1) throw new Error("Port must be less than 65535 and greater than 1")
        if (this.options.servertype == null || !this.options.servertype) throw new Error("Please Specify servertype")

        http.createServer((req, res) => {
            let data = req.headers;
            let file = this.path + data.username + '/' + data.password + '/' + data.dbname + '.json';
            if (!fs.existsSync(file)) {
                fs.mkdirSync(path + data.username + '/' + data.password + '/', { recursive: true })
                fs.writeFileSync(file, "{}", 'utf-8')
            }
            console.log(data);
            let key = data.key;
            let value = data.value;
            let serverreply;
            let object = JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' }));
            switch (data.command) {
                case 'set':
                    if (!key) return console.log('No key provided');
                    if (!value) return console.log("No value provided");
                    object[key] = value;
                    fs.writeFileSync(file, JSON.stringify(object, null, 2), 'utf-8');
                    res.writeHead(200);
                    res.end();
                    break;
                case 'get':
                    if (!fs.existsSync(path)) return console.log('File not found');
                    if (!key) return console.log('No key provided');
                    serverreply = { "Data": object[key] };
                    res.writeHead(200);
                    res.write(JSON.stringify(serverreply));
                    res.end();
                    break;
                case 'push':
                    if (!key) return console.log('No key provided');
                    if (!value) return console.log("No value provided");
                    if (!object[key]) object[key] = [];
                    if (!Array.isArray(object[key])) object[key] = [];
                    object[key].push(value);
                    fs.writeFileSync(file, JSON.stringify(object, null, 2), 'utf-8');
                    res.writeHead(200).end();
                    break;
                case 'has':
                    if (!fs.existsSync(path)) return console.log('File not found');
                    if (!key) return console.log('No key provided');
                    serverreply = { "Data": Boolean(object[key]) };
                    res.writeHead(200);
                    res.write(JSON.stringify(serverreply));
                    res.end();
                    break;
                case 'add':
                    if (!key) return console.log('No key provided');
                    if (!value) return console.log("No value provided");
                    if (!object[key]) object[key] = 0;
                    object[key] += value;
                    fs.writeFileSync(file, JSON.stringify(object, null, 2), 'utf-8');
                    res.writeHead(200).end();
                    break;
                case 'subtract':
                    if (!key) return console.log('No key provided');
                    if (!value) return console.log("No count provided");
                    if (!object[key]) object[key] = 0;
                    object[key] -= value;
                    fs.writeFileSync(file, JSON.stringify(object, null, 2), 'utf-8');
                    res.writeHead(200).end();
                    break;
                case 'type':
                    if (!key) return console.log('No key provided');
                    serverreply = { "Data": typeof object[key] };
                    res.writeHead(200);
                    res.write(JSON.stringify(serverreply));
                    res.end();
                    break;
                case 'keys':
                    serverreply = { "Data": Object.keys(object) };
                    res.writeHead(200);
                    res.write(JSON.stringify(serverreply));
                    res.end();
                    break;
                case 'values':
                    serverreply = { "Data": Object.values(object) };
                    res.writeHead(200);
                    res.write(JSON.stringify(serverreply));
                    res.end();
                    break;
                case 'remove':
                    if (!key) return console.log('No key provided');
                    if (!Array.isArray(object[key])) return console.log(`Given key is not an array`);
                    if (object[key].indexOf(value) == -1) return;
                    object[key].splice(object[key].indexOf(value), 1);
                    fs.writeFileSync(file, JSON.stringify(object, null, 2), 'utf-8');
                    res.writeHead(200).end();
                    break;
                case 'delete':
                    if (!key) return console.log('No key provided');
                    delete object[key];
                    fs.writeFileSync(file, JSON.stringify(object, null, 2), 'utf-8');
                    res.writeHead(200).end();
                    break;
                case 'clear':
                    fs.writeFileSync(file, "{}", 'utf-8');
                    res.writeHead(200).end();
                    break;
            }
        }).listen(this.port);
    }
}
class Client {
    constructor(address, options) {
        this.options = options || {};
        this.address = address;
        this.port = this.options.port;
        if (!address) throw new Error("Give Valid Address or address");
        if (this.port == null || !this.port) throw new Error(`Port is not specified in options.`);
        if (this.port > 65535 || this.port < 1) throw new Error("Port must be less than 65535 and greater than 1");
        if (!this.options.dbname) throw new Error("Please specify dbname. Just throm in a random dbname, Will be used in future");
        if (!this.options.username) throw new Error("Please specify username. Just throw in a random name, Will be used in future");
        if (!this.options.password) throw new Error("Please specify password. Just throw in a random password, Will be used in future");
    }

    async set(key, value) {
        await new Promise((resolve, reject) => {
            if (!key) throw new Error('No key provided');
            if (!value) throw new Error('No value provided');

            http.request({
                hostname: this.address,
                port: this.port,
                method: 'POST',
                headers: {
                    'command': 'set',
                    'username': this.options.username,
                    'password': this.options.password,
                    'dbname': this.options.dbname,
                    'key': key,
                    'value': value
                }
            }, (res) => {
                let data = ''
                res.on('data', (chunk) => {
                    data += chunk;
                })
                res.on('end', () => {
                    resolve(data);
                })
            }).once('error', (err) => {
                reject("Error");
                console.log(err);
            }).end();
        });
    }
    async get(key) {
        return await new Promise((resolve, reject) => {
            if (!key) throw new Error('No key provided');
            http.request({
                hostname: this.address,
                port: this.port,
                method: 'GET',
                headers: {
                    'command': 'get',
                    'username': this.options.username,
                    'password': this.options.password,
                    'dbname': this.options.dbname,
                    'key': key
                }
            }, (res) => {
                let data = ''
                res.on('data', (chunk) => {
                    data += chunk;
                })
                res.on('end', () => {
                    data = JSON.parse(data);
                    data = data.Data
                    resolve(data);
                })
            }).once('error', (err) => {
                reject("Error");
                console.log(err);
            }).end();
        });
    }
    async push(key, element) {
        await new Promise((resolve, reject) => {
            if (!key) throw new Error('No key provided');
            if (!value) throw new Error('No value provided');

            http.request({
                hostname: this.address,
                port: this.port,
                method: 'POST',
                headers: {
                    'command': 'set',
                    'username': this.options.username,
                    'password': this.options.password,
                    'dbname': this.options.dbname,
                    'key': key,
                    'value': element
                }
            }, (res) => {
                let data = ''
                res.on('data', (chunk) => {
                    data += chunk;
                })
                res.on('end', () => {
                    resolve(data);
                })
            }).once('error', (err) => {
                reject("Error");
                console.log(err);
            }).end();
        });
    }
    async has(key) {
        return Boolean(await new Promise((resolve, reject) => {
            if (!key) throw new Error('No key provided');
            http.request({
                hostname: this.address,
                port: this.port,
                method: 'GET',
                headers: {
                    'command': 'get',
                    'username': this.options.username,
                    'password': this.options.password,
                    'dbname': this.options.dbname,
                    'key': key
                }
            }, (res) => {
                let data = ''
                res.on('data', (chunk) => {
                    data += chunk;
                })
                res.on('end', () => {
                    data = JSON.parse(data);
                    data = data.Data
                    resolve(data);
                })
            }).once('error', (err) => {
                reject("Error");
                console.log(err);
            }).end();
        }));
    };
    async add(key, count) {
        await new Promise((resolve, reject) => {
            if (!key) throw new Error('No key provided');
            if (!value) throw new Error('No value provided');

            http.request({
                hostname: this.address,
                port: this.port,
                method: 'POST',
                headers: {
                    'command': 'set',
                    'username': this.options.username,
                    'password': this.options.password,
                    'dbname': this.options.dbname,
                    'key': key,
                    'value': count
                }
            }, (res) => {
                let data = ''
                res.on('data', (chunk) => {
                    data += chunk;
                })
                res.on('end', () => {
                    resolve(data);
                })
            }).once('error', (err) => {
                reject("Error");
                console.log(err);
            }).end();
        });
    }
    async subtract(key, count) {
        await new Promise((resolve, reject) => {
            if (!key) throw new Error('No key provided');
            if (!value) throw new Error('No value provided');

            http.request({
                hostname: this.address,
                port: this.port,
                method: 'POST',
                headers: {
                    'command': 'set',
                    'username': this.options.username,
                    'password': this.options.password,
                    'dbname': this.options.dbname,
                    'key': key,
                    'value': count
                }
            }, (res) => {
                let data = ''
                res.on('data', (chunk) => {
                    data += chunk;
                })
                res.on('end', () => {
                    resolve(data);
                })
            }).once('error', (err) => {
                reject("Error");
                console.log(err);
            }).end();
        });
    }
    async type(key) {
        return await new Promise((resolve, reject) => {
            if (!key) throw new Error('No key provided');
            http.request({
                hostname: this.address,
                port: this.port,
                method: 'GET',
                headers: {
                    'command': 'type',
                    'username': this.options.username,
                    'password': this.options.password,
                    'dbname': this.options.dbname,
                    'key': key
                }
            }, (res) => {
                let data = ''
                res.on('data', (chunk) => {
                    data += chunk;
                })
                res.on('end', () => {
                    data = JSON.parse(data);
                    data = data.Data
                    resolve(data);
                })
            }).once('error', (err) => {
                reject("Error");
                console.log(err);
            }).end();
        });
    }
    async keys() {
        return await new Promise((resolve, reject) => {
            http.request({
                hostname: this.address,
                port: this.port,
                method: 'GET',
                headers: {
                    'command': 'keys',
                    'username': this.options.username,
                    'password': this.options.password,
                    'dbname': this.options.dbname
                }
            }, (res) => {
                let data = ''
                res.on('data', (chunk) => {
                    data += chunk;
                })
                res.on('end', () => {
                    data = JSON.parse(data);
                    data = data.Data
                    resolve(data);
                })
            }).once('error', (err) => {
                reject("Error");
                console.log(err);
            }).end();
        });
    }
    async values() {
        return await new Promise((resolve, reject) => {
            http.request({
                hostname: this.address,
                port: this.port,
                method: 'GET',
                headers: {
                    'command': 'values',
                    'username': this.options.username,
                    'password': this.options.password,
                    'dbname': this.options.dbname
                }
            }, (res) => {
                let data = ''
                res.on('data', (chunk) => {
                    data += chunk;
                })
                res.on('end', () => {
                    data = JSON.parse(data);
                    data = data.Data
                    resolve(data);
                })
            }).once('error', (err) => {
                reject("Error");
                console.log(err);
            }).end();
        });
    }
    async remove(key, value) {
        await new Promise((resolve, reject) => {
            if (!key) throw new Error('No key provided');
            if (!value) throw new Error('No value provided');

            http.request({
                hostname: this.address,
                port: this.port,
                method: 'POST',
                headers: {
                    'command': 'set',
                    'username': this.options.username,
                    'password': this.options.password,
                    'dbname': this.options.dbname,
                    'key': key,
                    'value': value
                }
            }, (res) => {
                let data = ''
                res.on('data', (chunk) => {
                    data += chunk;
                })
                res.on('end', () => {
                    resolve(data);
                })
            }).once('error', (err) => {
                reject("Error");
                console.log(err);
            }).end();
        });
    }
    async delete(key) {
        await new Promise((resolve, reject) => {
            if (!key) throw new Error('No key provided');
            if (!value) throw new Error('No value provided');

            http.request({
                hostname: this.address,
                port: this.port,
                method: 'POST',
                headers: {
                    'command': 'set',
                    'username': this.options.username,
                    'password': this.options.password,
                    'dbname': this.options.dbname,
                    'key': key
                }
            }, (res) => {
                let data = ''
                res.on('data', (chunk) => {
                    data += chunk;
                })
                res.on('end', () => {
                    resolve(data);
                })
            }).once('error', (err) => {
                reject("Error");
                console.log(err);
            }).end();
        });
    }
    async clear() {
        await new Promise((resolve, reject) => {
            http.request({
                hostname: this.address,
                port: this.port,
                method: 'POST',
                headers: {
                    'command': 'clear',
                    'username': this.options.username,
                    'password': this.options.password,
                    'dbname': this.options.dbname,
                }
            }, (res) => {
                let data = ''
                res.on('data', (chunk) => {
                    data += chunk;
                })
                res.on('end', () => {
                    resolve(data);
                })
            }).once('error', (err) => {
                reject("Error");
                console.log(err);
            }).end();
        });
    }
}
Database.Database = Database
Database.Server = Server
Database.Client = Client
// throw new Error('The server is operating in "noServer" mode');
module.exports = Database 
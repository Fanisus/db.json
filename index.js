const fs = require('fs');
const http = require('http');

// let file;

class Database {
    constructor(folderPath, options) {
        if (!folderPath) throw new Error('No folder path provided');
        if (!folderPath.endsWith('/')) {
            folderPath += '/'
        }
        this.options = options || {};
        let file = folderPath + this.options?.file || "./db.json";
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true })
        }
        if (!fs.existsSync(file)) {
            fs.writeFileSync(file, "{}", "utf-8");
        }
        this.object = JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' }))
        if (this.options?.memory?.enabled) {
            if (!this.options?.memory?.saveinterval || isNaN(this.options?.memory?.saveinterval)) throw new Error("No saveinterval provided or save interval is not a number");
            setInterval(() => {
                fs.writeFileSync(file, JSON.stringify(this.object, null, 2), { encoding: 'utf-8' })
            }, this.options?.memory?.saveinterval)
        }
        if (this.options?.backup?.enabled) {
            let backupfilename = this.options?.backup?.name || `${new Date().toUTCString()}_Backup.json}`;
            if (!backupfilename.includes('.')) throw new Error(backupfilename, "must contain the file extension")
            let backuplocation = this.options?.backup?.path || './Database-Backups/';
            if (!fs.existsSync(backuplocation)) {
                fs.mkdirSync(backuplocation);
            }
            if (!backuplocation.endsWith('/')) {
                backuplocation = backuplocation + '/'
            }
            setInterval(() => {
                fs.writeFileSync(backuplocation + `${backupfilename}`, fs.readFileSync(file, { encoding: 'utf-8' }))
            }, (this.options?.backup?.interval || 86400000));
        }
        if (this.options?.cli) {
            const readline = require('readline').createInterface({
                input: process.stdin,
                output: process.stdout,
                historySize: 1000,
                removeHistoryDuplicates: true
            })
            let cli = true;
            console.log(`CLI for ${file} is Enabled. Use ${file} <command> <key> <value> to interact with the database.`)
            readline.on('line', async (line) => {
                let args = line.split(' ');
                if (args[0].toLowerCase() == 'help') {
                    console.log('-------------------------------------')
                    console.log("Commands:")
                    console.log('---------- -_- ----------')
                    console.log("<file> set <key> <value>")
                    console.log("<file> get <key>")
                    console.log("<file> push <key> <value>")
                    console.log("<file> has <key>")
                    console.log("<file> add <key> <value>")
                    console.log("<file> subtract <key> <value>")
                    console.log("<file> type <key>")
                    console.log("<file> keys <key>")
                    console.log("<file> values <key>")
                    console.log("<file> clear")
                    console.log("<file> save")
                    console.log("<file> size")
                    console.log("<file> reload")
                    console.log("<file> data")
                    console.log("cli")
                    console.log('-------------------------------------')
                }
                else if (args[0].toLowerCase() == 'dbprocesses' || args[0].toLowerCase() == 'cli') {
                    console.log(`CLI for ${file} is ${cli ? 'Enabled' : 'Disabled'}`)
                }
                else if (args[0] == '-_-') {
                    console.log('-_-')
                }
                else if (args[0] == file) {
                    if (cli == true) {
                        if (args[1].toLowerCase() == 'set') {
                            this.set(args[2], args[3])
                        }
                        else if (args[1].toLowerCase() == 'get') {
                            console.log(await this.get(args[2]))
                        }
                        else if (args[1].toLowerCase() == 'push') {
                            this.push(args[2], args[3])
                        }
                        else if (args[1].toLowerCase() == 'has') {
                            console.log(await this.has(args[2]))
                        }
                        else if (args[1].toLowerCase() == 'add') {
                            this.add(args[2], args[3])
                        }
                        else if (args[1].toLowerCase() == 'subtract') {
                            this.subtract(args[2], args[3])
                        }
                        else if (args[1].toLowerCase() == 'type') {
                            console.log(await this.type(args[2]))
                        }
                        else if (args[1].toLowerCase() == 'keys') {
                            console.log(await this.keys(args[2]))
                        }
                        else if (args[1].toLowerCase() == 'values') {
                            console.log(await this.values(args[2]))
                        }
                        else if (args[1].toLowerCase() == 'remove') {
                            this.remove(args[2], args[3])
                        }
                        else if (args[1].toLowerCase() == 'delete') {
                            this.delete(args[2])
                        }
                        else if (args[1].toLowerCase() == 'clear') {
                            this.clear()
                        }
                        else if (args[1].toLowerCase() == 'save') {
                            fs.writeFileSync(file, JSON.stringify(this.object, null, 2), { encoding: 'utf-8' })
                        }
                        else if (args[1].toLowerCase() == 'size') {
                            console.log(await this.size())
                        }
                        else if (args[1].toLowerCase() == 'reload') {
                            this.reload()
                        }
                        else if (args[1].toLowerCase() == 'data') {
                            console.log(this.object)
                        }
                        else if (args[1].toLowerCase() == 'disable') {
                            cli = false;
                            console.log(`CLI for ${file} is Disabled`)
                        }
                    }
                    else {
                        if (args[1].toLowerCase() == 'enable') {
                            cli = true;
                            console.log(`CLI for ${file} is Enabled`)
                        }
                    }
                }
            }).once("close", () => {
                console.log("CLI for " + file + " has been Ended")
            })
        }
    }

    async set(key, value) {
        await new Promise((resolve, reject) => {
            if (!key) throw new Error('No key provided');
            if (value == undefined) throw new Error("No value provided")
            if (!this.options?.memory?.enabled) this.object = JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' }))
            if (this.options?.deep) {
                const properties = key.split('.');
                let index = 0
                let dot;
                dot = this.object
                for (; index < properties.length - 1; ++index) {
                    if (properties.length - 1 == index) {
                        dot = dot[properties[index]] = value
                    }
                    if (typeof dot[properties[index]] != typeof Object()) {
                        dot = dot[properties[index]] = {}
                    }
                    else {
                        dot = dot[properties[index]]
                    }
                }
                dot[properties[index]] = value
            }
            else {
                this.object[key] = value
            }
            if (!this.options?.memory?.enabled) fs.writeFileSync(file, JSON.stringify(this.object, null, 2), { encoding: 'utf-8' })
            resolve()
        })
    }
    async get(key) {
        return await new Promise((resolve, reject) => {
            if (!key) throw new Error('No key provided');
            if (!this.options?.memory?.enabled) this.object = JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' }))
            if (this.options?.deep) {
                const properties = key.split('.');
                let index = 0
                let dot;
                dot = this.object
                for (; index < properties.length; ++index) {
                    try {
                        dot = dot[properties[index]]
                    }
                    catch (e) {
                        return resolve(undefined)
                    }
                }
                resolve(dot)
            }
            else {
                resolve(this.object[key]);
            }
        })
    }
    async push(key, value) {
        await new Promise((resolve, reject) => {
            if (!key) throw new Error('No key provided');
            if (value == undefined) throw new Error("No value provided")
            if (!this.options?.memory?.enabled) this.object = JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' }))
            if (this.options?.deep) {
                const properties = key.split('.');
                let index = 0
                let dot;
                dot = this.object
                for (; index < properties.length - 1; ++index) {
                    if (properties.length - 1 == index) {
                        dot = dot[properties[index]] = value
                    }
                    if (typeof dot[properties[index]] != typeof Object()) {
                        dot = dot[properties[index]] = {}
                    }
                    else {
                        dot = dot[properties[index]]
                    }
                }
                if (Array.isArray(dot[properties[index]])) {
                    dot[properties[index]].push(value)
                }
                else {
                    dot[properties[index]] = []
                    dot[properties[index]].push(value)
                }
            }
            else {
                if (!this.object[key]) this.object[key] = [];
                if (!Array.isArray(this.object[key])) this.object[key] = [];
                this.object[key].push(value)
            }
            if (!this.options?.memory?.enabled) fs.writeFileSync(file, JSON.stringify(this.object, null, 2), { encoding: 'utf-8' })
            resolve()
        })
    }
    async has(key) {
        return await new Promise((resolve, reject) => {
            if (!key) throw new Error('No key provided');
            if (!this.options?.memory?.enabled) this.object = JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' }))
            if (this.options?.deep) {
                const properties = key.split('.');
                let index = 0
                let dot;
                dot = this.object
                for (; index < properties.length; ++index) {
                    try {
                        dot = dot[properties[index]]
                    }
                    catch (e) {
                        return resolve(false)
                    }
                }
                resolve(Boolean(dot))
            }
            else {
                resolve(Boolean(this.object[key]));
            }
        })
    }
    async add(key, value) {
        await new Promise((resolve, reject) => {
            if (!key) throw new Error('No key provided');
            if (value == undefined) throw new Error("No value provided")
            if (!this.options?.memory?.enabled) this.object = JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' }))
            if (this.options?.deep) {
                const properties = key.split('.');
                let index = 0
                let dot;
                dot = this.object
                for (; index < properties.length - 1; ++index) {
                    if (typeof dot[properties[index]] != typeof Object()) {
                        dot = dot[properties[index]] = {}
                    }
                    else {
                        if (isNaN(dot[properties[index]])) {
                            dot = dot[properties[index]]
                        }
                        else dot[properties[index]] = 0
                    }
                }
                if (isNaN(dot[properties[index]])) dot[properties[index]] = 0
                dot[properties[index]] += value
            }
            else {
                this.object[key] += value
            }
            if (!this.options?.memory?.enabled) fs.writeFileSync(file, JSON.stringify(this.object, null, 2), { encoding: 'utf-8' })

            resolve()
        })
    }
    async subtract(key, count) {
        await new Promise((resolve, reject) => {
            if (!key) throw new Error('No key provided');
            if (value == undefined) throw new Error("No value provided")
            if (!this.options?.memory?.enabled) this.object = JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' }))
            if (this.options?.deep) {
                const properties = key.split('.');
                let index = 0
                let dot;
                dot = this.object
                for (; index < properties.length - 1; ++index) {
                    if (typeof dot[properties[index]] != typeof Object()) {
                        dot = dot[properties[index]] = {}
                    }
                    else {
                        if (isNaN(dot[properties[index]])) {
                            dot = dot[properties[index]]
                        }
                        else dot[properties[index]] = 0
                    }
                }
                if (isNaN(dot[properties[index]])) dot[properties[index]] = 0
                dot[properties[index]] -= value
            }
            else {
                this.object[key] -= value
            }
            if (!this.options?.memory?.enabled) fs.writeFileSync(file, JSON.stringify(this.object, null, 2), { encoding: 'utf-8' })

            resolve()
        })
    }
    async type(key) {
        return await new Promise((resolve, reject) => {
            if (!key) throw new Error('No key provided');
            if (!this.options?.memory?.enabled) this.object = JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' }))
            if (this.options?.deep) {
                const properties = key.split('.');
                let index = 0
                let dot;
                dot = this.object
                for (; index < properties.length; ++index) {
                    dot = dot[properties[index]]
                }
                resolve(typeof dot)
            }
            else {
                resolve(typeof this.object[key]);
            }
        })
    }
    async keys() {
        return await new Promise((resolve, reject) => {
            if (!this.options?.memory?.enabled) this.object = JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' }))
            resolve(Object.keys(this.object))
        })
    }
    async values() {
        return await new Promise((resolve, reject) => {
            if (!this.options?.memory?.enabled) this.object = JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' }))
            resolve(Object.values(this.object))
        })
    }
    async remove(key, value) {
        await new Promise((resolve, reject) => {
            if (!key) throw new Error('No key provided');
            if (value == undefined) throw new Error("No value provided")
            if (!this.options?.memory?.enabled) this.object = JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' }))
            if (this.options?.deep) {
                const properties = key.split('.');
                let index = 0
                let dot;
                dot = this.object
                for (; index < properties.length - 1; ++index) {
                    if (properties.length - 1 == index) {
                        dot = dot[properties[index]] = value
                    }
                    if (typeof dot[properties[index]] != typeof Object()) {
                        dot = dot[properties[index]] = {}
                    }
                    else {
                        dot = dot[properties[index]]
                    }
                }
                if (!Array.isArray(dot[properties[index]])) throw new Error(`Given key is not an array`)
                if (dot[properties[index]].indexOf(value) == -1) throw new Error(`Value ${value} not found in array`)
                dot[properties[index]].splice(dot[properties[index]].indexOf(value), 1)
            }
            else {
                if (!Array.isArray(this.object[key])) throw new Error(`Given key is not an array`)
                if (this.object[key].indexOf(value) == -1) throw new Error(`Value ${value} not found in array`)
                this.object[key].splice(this.object[key].indexOf(value), 1)
            }
            if (!this.options?.memory?.enabled) fs.writeFileSync(file, JSON.stringify(this.object, null, 2), { encoding: 'utf-8' })
            resolve()
        })
    }
    async delete(key) {
        await new Promise((resolve, reject) => {
            if (!key) throw new Error('No key provided');
            if (!this.options?.memory?.enabled) this.object = JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' }))
            if (this.options?.deep) {
                const properties = key.split('.');
                let index = 0
                let dot;
                dot = this.object
                for (; index < properties.length - 1; ++index) {
                    if (typeof dot[properties[index]] != typeof Object()) {
                        dot = dot[properties[index]] = {}
                        if (!this.options?.memory?.enabled) fs.writeFileSync(file, JSON.stringify(this.object, null, 2), { encoding: 'utf-8' })
                    }
                    else {
                        dot = dot[properties[index]]
                    }
                }
                delete dot[properties[index]]
            }
            else {
                delete this.object[key]
            }
            if (!this.options?.memory?.enabled) fs.writeFileSync(file, JSON.stringify(this.object, null, 2), { encoding: 'utf-8' })
            resolve()
        })
    }
    async clear() {
        await new Promise((resolve, reject) => {
            this.object = {}
            if (!this.options?.memory?.enabled) fs.writeFileSync(file, JSON.stringify(this.object, null, 2), { encoding: 'utf-8' })
            resolve()
        })
    }
    async save() {
        await new Promise((resolve, reject) => {
            fs.writeFileSync(file, JSON.stringify(this.object, null, 2), { encoding: 'utf-8' })
            resolve()
        })
    }
    async size() {
        return await new Promise((resolve, reject) => {
            resolve(fs.statSync(file).size)
        })
    }
    async reload() {
        await new Promise((resolve, reject) => {
            this.object = JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' }))
            resolve()
        })
    }
    async data() {
        return await new Promise((resolve, reject) => {
            if (!this.options?.memory?.enabled) this.object = JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' }))
            resolve(this.object)
        })
    }
}

class Server {
    constructor(FolderPath, options) {
        this.path = FolderPath || './Server-Database/';
        this.options = options || {};
        if (this.options == null || this.options == undefined) this.options = {};
        this.port = this.options?.port || 8000;
        if (!fs.existsSync(this.path)) {
            fs.mkdirSync(this.path, { recursive: true })
        }
        if (!this.path.endsWith('/')) this.path = this.path + '/'
        if (this.options?.port == null || !this.options?.port) console.log(`Port is not specified in options. Using port ${this.port}`)
        if (this.port > 65535 || this.port < 1) throw new Error("Port must be less than 65535 and greater than 1")
        if (this.options?.servertype == null || !this.options?.servertype) throw new Error("Please Specify servertype")

        http.createServer((req, res) => {
            let data = req.headers;
            let file = this.path + data.username + '/' + data.password + '/' + data.dbname + '.json';
            if (!fs.existsSync(file)) {
                fs.mkdirSync(this.path + data.username + '/' + data.password + '/', { recursive: true })
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
                    if (value == undefined) return console.log("No value provided");
                    object[key] = value;
                    fs.writeFileSync(file, JSON.stringify(object, null, 2), 'utf-8');
                    res.writeHead(200);
                    res.end();
                    break;
                case 'get':
                    if (!fs.existsSync(file)) return console.log('File not found');
                    if (!key) return console.log('No key provided');
                    serverreply = { "Data": object[key] };
                    res.writeHead(200);
                    res.write(JSON.stringify(serverreply));
                    res.end();
                    break;
                case 'push':
                    if (!key) return console.log('No key provided');
                    if (value == undefined) return console.log("No value provided");
                    if (!object[key]) object[key] = [];
                    if (!Array.isArray(object[key])) object[key] = [];
                    object[key].push(value);
                    fs.writeFileSync(file, JSON.stringify(object, null, 2), 'utf-8');
                    res.writeHead(200).end();
                    break;
                case 'has':
                    if (!fs.existsSync(file)) return console.log('File not found');
                    if (!key) return console.log('No key provided');
                    serverreply = { "Data": Boolean(object[key]) };
                    res.writeHead(200);
                    res.write(JSON.stringify(serverreply));
                    res.end();
                    break;
                case 'add':
                    if (!key) return console.log('No key provided');
                    if (value == undefined) return console.log("No value provided");
                    if (!object[key]) object[key] = 0;
                    object[key] += value;
                    fs.writeFileSync(file, JSON.stringify(object, null, 2), 'utf-8');
                    res.writeHead(200).end();
                    break;
                case 'subtract':
                    if (!key) return console.log('No key provided');
                    if (value == undefined) return console.log("No count provided");
                    if (!object[key]) object[key] = 0;
                    object[key] -= value;
                    fs.writeFileSync(file, JSON.stringify(object, null, 2), 'utf-8');
                    res.writeHead(200).end();
                    break;
                case 'type':
                    if (!fs.existsSync(file)) return console.log('File not found');
                    if (!key) return console.log('No key provided');
                    serverreply = { "Data": typeof object[key] };
                    res.writeHead(200);
                    res.write(JSON.stringify(serverreply));
                    res.end();
                    break;
                case 'keys':
                    if (!fs.existsSync(file)) return console.log('File not found');
                    serverreply = { "Data": Object.keys(object) };
                    res.writeHead(200);
                    res.write(JSON.stringify(serverreply));
                    res.end();
                    break;
                case 'values':
                    if (!fs.existsSync(file)) return console.log('File not found');
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
        this.port = this.options?.port;
        if (!address) throw new Error("Give Valid Address or address");
        if (this.port == null || !this.port) throw new Error(`Port is not specified in options.`);
        if (this.port > 65535 || this.port < 1) throw new Error("Port must be less than 65535 and greater than 1");
        if (!this.options?.dbname) throw new Error("Please specify dbname. Just throm in a random dbname, Will be used in future");
        if (!this.options?.username) throw new Error("Please specify username. Just throw in a random name, Will be used in future");
        if (!this.options?.password) throw new Error("Please specify password. Just throw in a random password, Will be used in future");
    }

    async set(key, value) {
        await new Promise((resolve, reject) => {
            if (!key) throw new Error('No key provided');
            if (value == undefined) throw new Error('No value provided');

            http.request({
                hostname: this.address,
                port: this.port,
                method: 'POST',
                headers: {
                    'command': 'set',
                    'username': this.options?.username,
                    'password': this.options?.password,
                    'dbname': this.options?.dbname,
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
                    'username': this.options?.username,
                    'password': this.options?.password,
                    'dbname': this.options?.dbname,
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
            if (value == undefined) throw new Error('No value provided');

            http.request({
                hostname: this.address,
                port: this.port,
                method: 'POST',
                headers: {
                    'command': 'set',
                    'username': this.options?.username,
                    'password': this.options?.password,
                    'dbname': this.options?.dbname,
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
                    'username': this.options?.username,
                    'password': this.options?.password,
                    'dbname': this.options?.dbname,
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
            if (value == undefined) throw new Error('No value provided');

            http.request({
                hostname: this.address,
                port: this.port,
                method: 'POST',
                headers: {
                    'command': 'set',
                    'username': this.options?.username,
                    'password': this.options?.password,
                    'dbname': this.options?.dbname,
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
            if (value == undefined) throw new Error('No value provided');

            http.request({
                hostname: this.address,
                port: this.port,
                method: 'POST',
                headers: {
                    'command': 'set',
                    'username': this.options?.username,
                    'password': this.options?.password,
                    'dbname': this.options?.dbname,
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
                    'username': this.options?.username,
                    'password': this.options?.password,
                    'dbname': this.options?.dbname,
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
                    'username': this.options?.username,
                    'password': this.options?.password,
                    'dbname': this.options?.dbname
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
                    'username': this.options?.username,
                    'password': this.options?.password,
                    'dbname': this.options?.dbname
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
            if (value == undefined) throw new Error('No value provided');

            http.request({
                hostname: this.address,
                port: this.port,
                method: 'POST',
                headers: {
                    'command': 'set',
                    'username': this.options?.username,
                    'password': this.options?.password,
                    'dbname': this.options?.dbname,
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
            if (value == undefined) throw new Error('No value provided');

            http.request({
                hostname: this.address,
                port: this.port,
                method: 'POST',
                headers: {
                    'command': 'set',
                    'username': this.options?.username,
                    'password': this.options?.password,
                    'dbname': this.options?.dbname,
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
                    'username': this.options?.username,
                    'password': this.options?.password,
                    'dbname': this.options?.dbname,
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

module.exports = Database 
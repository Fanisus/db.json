
# odb.json

A Database made with JSON

```bash
npm i odb.json
```

SMALL CHANGES MADE TO IMPORT
## Database Examples

```javascript
const Database = require('odb.json')
const db = new Database.Database('./Data.json', {
    backup: {
        enabled: true,
        name: 'backupfile.json',
        interval: 600000,
        path: './backupfolder'
    }
})

db.set("Data", "World");

// Get data
db.get("Data"); // World

// Delete data
db.delete("Data");

db.get("Data"); // undefined
db.has("Data"); // false

db.set("Just_a_number", 10); // 10

db.add("Just_a_number", 2); // 12

db.subtract("Just_a_number", 6); // 6

db.set("array", [ "apple" ]);

// db.push() creates an array if it doesn't exist
db.push("array", "orange"); // [ "apple", "orange" ]

// Remove element from array
db.remove("array", "apple"); // [ "orange" ]

db.type("array"); // Array

db.keys(); // ["Just_a_number", "array"]

db.values(); // 6, ["orange"]

db.clear(); // {} 
```

## Server-side Database setup
```javascript
const Database = require('odb.json');
//                                          Folder
const db-server = new Database.Server('./Database-folder-name', {
    servertype: 'master' // Choose Master
    port: 5555 // Port
})
```

## Client-side Database

```javascript
const Database = require('odb.json');

//                              IP Address
const db = new Database.Client('localhost', {
    dbname: 'filename', // Database Name
    username: "username", // Username
    password: 'password', // Password
    port: 5555 // Port
})

db.set("Data", "World");

// Get data
await db.get("Data"); // World

// Delete data
db.delete("Data");

await db.get("Data"); // undefined
await db.has("Data"); // false

db.set("Just_a_number", 10); // 10

db.add("Just_a_number", 2); // 12

db.subtract("Just_a_number", 6); // 6

db.set("array", [ "apple" ]);

// db.push() creates an array if it doesn't exist
db.push("array", "orange"); // [ "apple", "orange" ]

// Remove element from array
db.remove("array", "apple"); // [ "orange" ]

await db.type("array"); // Array

await db.keys(); // ["Just_a_number", "array"]

await db.values(); // 6, ["orange"]

db.clear(); // {} 

```

## Change Log

```
+ Promisified Full Database Class
+ Added Server class
+ Added Client class
+ Added New functions to Database class 
    + type
    + keys
    + values
    + clear
+ Fixed a bug where remove command doesn't save the changes
+ Changed imports
```

## Support

If you have any doubts join my [Discord](https://discord.gg/UUyKfuCVDx) => [odb.json](https://discord.gg/UUyKfuCVDx)

## Authors

- [Fanisus](https://github.com/Fanisus)

# odb.json

Uses JSON to store data.

```bash
npm i odb.json@latest
```

## Database Examples

```javascript
const Database = require('odb.json')
//                                      Folder
const db = new Database.Database('./Local-Database-Folder', {
    backup: {
        enabled: true,
        name: 'backup.json',
        path: './Backup-Local-Database-Folder',
        interval: 900000,
    },
    memory: {
        enabled: true,
        saveinterval: 30000,
    },
    cli: true, // When true type help in console for help
    deep: true, // The dot notation that the world needs is here
    file: 'Data.json' // The File to store Database
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

db.save(); // Saves the database

db.size(); // Returns Database size

db.reload(); // Reloads the Database from disk

db.data(); // Returns the whole Database
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
+ Please check Database class. Changed where to give file and folder locations for it
+ Added in-Memory Database to Database class
+ Added CLI (Command Line Interface) to Database class
+ Added New functions to Database class 
    + save()
    + reload()
    + data()
    + size()
+ Added Typings
+ Bug Fixes (Fixed my mistake while setting data as 0, false, null throws error), (Fixed the ability to type in console even while the cli is disabled), (Fixed saving to same file when using 2 instances of local database)
- Removed my ugly console.logs from push
- Fixed issue when using get or has throws an error when the value is not found
```

## Upcoming Features

```
+ Ability to use a different separator for deep (currently ".")
+ Ability to make use of deep in the keys and values commands
```

## Support

If you have any doubts join my [Discord](https://discord.gg/bRbCTEHmyT) => [odb.json](https://discord.gg/bRbCTEHmyT)

## Authors

- [Fanisus](https://github.com/Fanisus)

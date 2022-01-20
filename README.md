
# odb.json

A Database made with JSON

```bash
npm i odb.json
```

## Examples

```javascript
const { Database } = require('odb.json')
const db = new Database('./Data.json', {
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
db.delete("Hello");

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

```
## Support

If you have any doubts join my [Discord](https://discord.gg/UUyKfuCVDx) => [odb.json](https://discord.gg/UUyKfuCVDx)

## Authors

- [Fanisus](https://github.com/Fanisus)
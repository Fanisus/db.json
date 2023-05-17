declare module 'flaster-db' {
    export type ServerType = 'master'
    interface BackupOptions {
        /**
         * Sets whether the backup is enabled or not.
         */
        enabled: boolean;
        /**
         * The Backup name.
         */
        name?: string;
        /**
         * Path to the backup folder.
         */
        path?: string;
        /**
         * Sets the backup interval in milliseconds.
         */
        interval?: number;
    }
    interface MemoryOptions {
        /**
         * Sets whether the memory is enabled or not.
         */
        enabled: boolean;
        /**
         * The interval in milliseconds.
         * @example
         * ```javascript
         * {
         *  saveinterval: 1000
         * }
         * ```
         */
        saveinterval?: number;
    }
    interface DatabaseOptions {
        /**
         * Sets the database name.
         */
        file?: string;
        /**
         * Setting deep to true enables to create objects inside objects
         * @example
         * ```javascript
         *  deep: true
         * ```
         * 
         * ```javascript
         *  db.set('my.object.path', 'value')
         *  {my: {object: {path: 'value'}}}
         * ```
         */
        deep?: boolean;
        /**
         * Setting cli to true enables to edit the database using console commands
         * @example
         * ```javascript
         *  cli: true
         * ```
         */
        cli?: boolean;
        /**
         * Enabling this option will automate backups of the database.
         * @example
         * ```javascript
         *  backup: {
         *      enabled: true,
         *      name: "My_Backup.json",
         *      interval: 3600000
         *  }
         * ```
         */
        backup?: BackupOptions;
        /**
         * Enabling this option will automatically save the database to memory and saves it to disk after specified interval.
         */
        memory?: MemoryOptions;
    }

    interface ServerOptions {
        servertype?: ServerType;
        port?: number;
    }

    interface ClientOptions {
        username?: string;
        password?: string;
        dbname?: string;
        port?: string;
    }

    export class Database {
        /**
         * Creates a new database instance
         * @param {string} folderPath The path to the database file
         * @param {DatabaseOptions} options Options for database
         * @example
         * ```javascript
         *  const db = new Database('db.json', {
         *      backup: {
         *          enabled: true,
         *          name: "My_Backup.json",
         *          interval: 3600000
         *      },
         *      deep: true,
         *      cli: true,
         *      memory: {
         *          enabled: true,
         *          saveinterval: 3600000
         *      }
         *  })
         * ```
         */
        constructor(folderPath?: string, options?: DatabaseOptions);

        public file: string;
        /**
         * Updates the value of a key
         * @param {string} key The key to update
         * @param {any} value The value to update the key to
         * @returns {Promise<void>} A promise that resolves when the key is updated
         * @example
         * db.set('key', 'value') // If deep is set true
         * db.set('key.subkey', 'value') // If deep is set true
         * db.set('key.subkey.subsubkey', 'value') // If deep is set true
         */
        public set(key: string, value: any): Promise<void>;
        /**
         * Gets the value of a key
         * @param {string} key The key to get
         * @returns {Promise<any>} A promise that resolves with the value of the key
         * @example
         * db.get('key')
         * db.get('key.subkey') // If deep is set true
         * db.get('key.subkey.subsubkey') // If deep is set true
         */
        public get(key: string): any;
        /**
         * Pushes a value to an array
         * @param {string} key The key to push to
         * @param {any} value The value to push
         * @returns {Promise<void>} A promise that resolves when the value is pushed
         * @example
         * db.push('key', 'value')
         * db.push('key.subkey', 'value') // If deep is set true
         * db.push('key.subkey.subsubkey', 'value') // If deep is set true
         */
        public push(key: string, element: any): Promise<void>;
        /**
         * Checks if a key exists
         * @param {string} key The key to check
         * @returns {Promise<boolean>} A promise that resolves with a boolean of whether the key exists
         * @example
         * db.has('key')
         * db.has('key.subkey') // If deep is set true
         * db.has('key.subkey.subsubkey') // If deep is set true
         */
        public has(key: string): Promise<boolean>;
        /**
         * Adds the valu to the key
         * @param {string} key The key to add to
         * @param {number} value The value to add
         * @returns {Promise<void>} A promise that resolves when the value is added
         * @example
         * db.add('key', 1)
         * db.add('key.subkey', 1) // If deep is set true
         * db.add('key.subkey.subsubkey', 1) // If deep is set true
         */
        public add(key: string, count: number): Promise<void>;
        /**
         * Subtracts the value from the key
         * @param {string} key The key to subtract from
         * @param {number} value The value to subtract
         * @returns {Promise<void>} A promise that resolves when the value is subtracted
         * @example
         * db.subtract('key', 1)
         * db.subtract('key.subkey', 1) // If deep is set true
         * db.subtract('key.subkey.subsubkey', 1) // If deep is set true
         */
        public subtract(key: string, count: number): Promise<void>;
        /**
         * Gets the type of the key
         * @param {string} key The key to get the type of
         * @returns {Promise<any>} A promise that resolves with the type of the key
         * @example
         * db.type('key')
         * db.type('key.subkey') // If deep is set true
         * db.type('key.subkey.subsubkey') // If deep is set true
         */
        public type(key: string): Promise<any>;
        /**
         * Gets all the keys in the database
         * @returns {Promise<string[]>} A promise that resolves with an array of all the keys
         * @example
         * db.keys()
         */
        public keys(): Promise<string[]>;
        /**
         * Gets all the values in the database
         * @returns {Promise<any[]>} A promise that resolves with an array of all the values
         * @example
         * db.values()
         */
        public values(): Promise<any[]>;
        /**
         * Removes a value in an array from the database
         * @param {string} key The key to remove from
         * @param {any} value The value to remove
         * @returns {Promise<void>} A promise that resolves when the value is removed
         * @example
         * db.remove('key', 'value')
         * db.remove('key.subkey', 'value') // If deep is set true
         * db.remove('key.subkey.subsubkey', 'value') // If deep is set true
         */
        public remove(key: string, value: any): Promise<void>;
        /**
         * Removes a key from the database
         * @param {string} key The key to remove
         * @returns {Promise<void>} A promise that resolves when the key is removed
         * @example
         * db.delete('key')
         * db.delete('key.subkey') // If deep is set true
         * db.delete('key.subkey.subsubkey') // If deep is set true
         */
        public delete(key: string): Promise<void>;
        /**
         * Removes all data from the database
         * @returns {Promise<void>} A promise that resolves when the database is cleared
         * @example
         * db.clear()
         */
        public clear(): Promise<void>;
        /**
         * Saves the database to the file
         * @returns {Promise<void>} A promise that resolves when the database is saved
         * @example
         * db.save()
         */
        public save(): Promise<void>;
        /**
         * Gets the size of the database
         * @returns {Promise<number>} A promise that resolves with the size of the database
         * @example
         * db.size()
         */
        public size(): Promise<number>;
    }

    export class Server {
        constructor(path: string, options?: ServerOptions);
    }

    export class Client {
        constructor(address?: string, options?: ClientOptions);
        public address: string;
        public set(key: string, value: any): Promise<void>;
        public get(key: string): Promise<any>;
        public push(key: string, element: any): Promise<void>;
        public has(key: string): Promise<boolean>;
        public add(key: string, count: number): Promise<void>;
        public subtract(key: string, count: number): Promise<void>;
        public type(key: string): Promise<any>;
        public keys(): Promise<string[]>;
        public values(): Promise<any[]>;
        public remove(key: string, value: any): Promise<void>;
        public delete(key: string): Promise<void>;
        public clear(): Promise<void>;
    }
}
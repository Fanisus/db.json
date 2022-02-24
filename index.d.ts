declare module 'odb.json' {
    export type ServerType = 'master'
    interface BackupOptions {
        enabled: boolean;
        name?: string;
        path?: string;
        interval?: number;
    }

    interface DatabaseOptions {
        backup?: BackupOptions;
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
        constructor(file?: string, options?: DatabaseOptions);

        public file: string;
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
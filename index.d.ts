declare module 'odb.json' {
    
    interface BackupOptions {
        enabled: boolean;
        name?: string;
        path?: string;
        interval?: number;
    };

    interface DatabaseOptions {
        backup?: BackupOptions;
    };

    export class Database {
        constructor (file?: string, options?: DatabaseOptions);

        public file: string;
        public get (key: string): unknown;
        public set (key: string, value: any): void;
        public push (key: string, element: any): void;
        public has (key: string): boolean;
        public add (key: string, count: number): void;
        public subtract (key: string, count: number): void;
        public remove (key: string, value: any): void;
        public delete (key: string): void;
    }
}
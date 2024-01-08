import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const Database = class {

    constructor() {
        this.databaseConnection = null;
        this.prepareString = null;
        this.response = null;
        this.host = process.env.DB_HOST;
        this.user = process.env.DB_USERNAME;
        this.password = process.env.DB_PASSWORD;
        this.database = process.env.DB_DATABASE;
        this.charset = process.env.DB_CHARSET;
    }

    async prepare(prepareString){
        this.response = null;
        this.prepareString = prepareString;
        return this;
    }

    async execute(executeArray){
        if(this.prepareString === null){
            throw 'invalid prepare string';
        }
        await this._connect();

        this.response = await this.databaseConnection.execute(this.prepareString, executeArray ?? []);
        if(this.response.length === 2){
            this.response = this.response[0];
        }

        await this._disconnect();
        
        return true;
    }

    async fetchAll(){
        if(this.response !== null){
            return this.response;
        }
        return [];
    }

    async fetch(){
        return this.response;
    }

    async _disconnect(){
        await this.databaseConnection.end();
        this.databaseConnection = null;
    }

    async _connect(){
        if(this.databaseConnection === null){
            
            this.databaseConnection = await mysql.createConnection({
                host : this.host,
                user : this.user,
                password : this.password,
                database : this.database,
                charset : this.charset
            });
            
            this.databaseConnection.on('error', async (error) => {
                if(error.fatal){
                    this.databaseConnection = null;
                    this._connect();
                }
            });

            await this.databaseConnection.connect();

        }
    }

    async disconnect(){
        if(this.databaseConnection !== null){
            await this.databaseConnection.end();
        }

    }

}

export default Database;
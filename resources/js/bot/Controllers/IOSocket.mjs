/**
 * Require General Modules
*/
import mysql from 'mysql2/promise';
import dotenv from 'dotenv'; dotenv.config();
import { readFileSync } from "fs";
import { createServer } from "https";
import { Server } from "socket.io";
import crypto from 'crypto';

const IOSocket = class {

    constructor(){
        this.httpServer = createServer({
            key: readFileSync(`${process.env.SSL_PATH}key.pem`),
            cert: readFileSync(`${process.env.SSL_PATH}certificate.pem`),
            // ca: readFileSync(`${process.env.SSL_PATH}chain.pem`)
        });
        this.IO = new Server(this.httpServer, {
            path: process.env.SOCKET_SERVER_PATH 
        });
        this.events = [];
        
        // middleware
        this.IO.use(async (socket, next) => {
            if(await this.middleware(socket) !== true){
                const error = new Error('not authorized');
                next(error);
            }else{
                next();
            }
        });

        this.IO.on('connection', async (client) => {
            this.manageClient(client);
        });

        this.IO.on('error', (error) => {
            console.error(error);
        });

    }

    listen(){
        return new Promise((resolve, reject) => {
            try{
                this.httpServer.listen(process.env.SOCKET_SERVER_PORT, () => {
                    console.log(`listening on port ${process.env.SOCKET_SERVER_PORT}`);
                    resolve();
                });
            } catch (error) {
                reject(error);
            }
        })
    }

    // middleware validations
    async middleware(socket){
        console.log('middleware');
        return true;

    }

    // manage client
    async manageClient(client){
        console.log('client connected');
        client.onAny((event, data) => {
            this.events.push({
                event: event,
                data: data
            });
        });

    }

    // wait for all client responses
    waitForAllClientResponses({
        transactionId,
        event = null,
        timeout = 5000
    }){
        return new Promise(async (resolve, reject) => {
            try{
                this.events = [];
                const connectedClients = (await this.IO.fetchSockets()).length;
                if(connectedClients === 0){
                    return resolve([]);
                }
                const timeoutId = setTimeout(() => {
                    // filter by transactionId
                    let clientResponses = this.events.filter(event => event.data.transactionId === transactionId);
                    // filter by event if event is not null
                    if(event !== null){
                        clientResponses = clientResponses.filter(event => event.event === event);
                    }
                    resolve(clientResponses);
                }, timeout);

                const intervalId = setInterval(() => {
                    // check if all requests has been received
                    if(clientResponses.length !== connectedClients){
                        return;
                    }
                    clearInterval(intervalId);
                    clearTimeout(timeoutId);
                    // filter by transactionId
                    let clientResponses = this.events.filter(event => event.data.transactionId === transactionId);
                    // filter by event if event is not null
                    if(event !== null){
                        clientResponses = clientResponses.filter(event => event.event === event);
                    }
                    resolve(clientResponses);

                }, 250);

            }catch(error){
                reject(error);
            }
        });
    }

    // emit event to get task list from scrapers
    async requestTaskList(){
        const transactionId = crypto.randomUUID();

        this.IO.emit('getTaskList', {
            transactionId: transactionId
        });

        const clientResponses = await this.waitForAllClientResponses({
            transactionId: transactionId,
            event: 'getTaskList'
        });

        return clientResponses;

    }

}

export default IOSocket;
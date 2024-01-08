/**
 * Require General Modules
*/
// Dotenv
import dotenv from 'dotenv'; dotenv.config();
// Socket
import IOSocket from './Controllers/IOSocket.mjs';
// Crypto
import crypto from 'crypto';
// Tools
import Tools from './tools.mjs';



(async () => {
    const IOController = new IOSocket();
    await IOController.listen();

    new App(IOController);




})();

const App = class {

    constructor(IOController){
        this.IO = IOController.IO;
        this.IOController = IOController;
        this.loop();
    }

    async loop(){
        do{
            try{
                let startTime = new Date();
                let taskListFromScrapers = await this.getTaskListFromScrapers();


                let elapsedTime = new Date() - startTime;
                // report to db

                // wait time (on developing)
                await Tools.wait(200);

            }catch(error){
                console.log(error);
                // report to db

                // wait time


            }
        }while(true);



    }

    async getTaskListFromScrapers(){
        console.log('getTaskListFromScrapers: started');

        const clientResponses = await this.IOController.requestTaskList();
        console.log('getTaskListFromScrapers:', clientResponses);

        // merge list

        return clientResponses;

    }


    report(){




    }








}
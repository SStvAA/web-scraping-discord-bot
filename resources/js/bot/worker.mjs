/**
 * Require General Modules
*/
import Database from "./Controllers/Database.mjs";
import Puppeteer from "./Controllers/Puppeteer.mjs";
import Tools from "./tools.mjs";


(async () => {
    // get accounts from db
    const accounts = await Tools.getAccounts(process.env.NAME);
    if(accounts.length === 0){
        throw 'no accounts found';
    }

    const worker = new Worker(accounts);


})();

const Worker = class {

    constructor(accounts){
        this.name = process.env.NAME;
        this.proxy_location = process.env.PROXY_LOCATION;
        this.location = process.env.LOCATION;
        this.accounts = accounts;
        this.database = new Database();
        this.puppeteer = new Puppeteer(accounts);



    }

    async getTaskListUnified(){
        const promiseArray = [];
        for(let account of this.accounts){
            promiseArray.push(this.getTaskList(account));
        }
        const responses = await Promise.all(promiseArray);

        console.log(responses);





    }

    async getTaskList(account){
        const puppeteer = await this.puppeteer.getNavigator(account);
        const taskList = await puppeteer.getTaskList();
        return taskList;



    }

}


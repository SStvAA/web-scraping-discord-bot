/**
 * Require General Modules
*/
import puppeteer from 'puppeteer';


const Puppeteer = class {

    /**
     * 
     * @param {array} accounts 
     * 
     */
    constructor(accounts){
        this.configuration = {
            headless: true,
        }
        this.accounts = accounts;
        this.navigators = [];
    }

    async getNavigator(account){
        // find navigator of the account
        let navigator = this.navigators.find(navigator => navigator.account.email === account.email);
        if(navigator){
            // check that proxy is still valid

            return navigator;
        }
        // create new navigator
        navigator = await this.createNavigator(account);
        return navigator;
    }

    async createNavigator(account){
        // get proxy configuration
        let proxy = await this.getProxy();
        // create new navigator
        const navigator = {
            account: account,
            instance: await puppeteer.launch({
                headless: this.configuration.headless,
                slowMo: 1,
                args: account.location === 'none' && proxy !== null ? `--proxy-server=http://${proxy.ip_address}:${proxy.port}` : [],
            }),
            page: {
                login: null,
                taskList: null,
            },
            proxy: proxy
        }

        this.navigators.push(navigator);
        return navigator;
    }

    async closeNavigator(navigator){


        return true;
    }

    async getProxy(location){


        return null;
    }

    async getTaskList(navigator){



    }

    async _login(navigator){




    }








}

export default Puppeteer;
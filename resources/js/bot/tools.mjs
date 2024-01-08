import Database from "./Controllers/Database.mjs";

const Tools = class {

    static async getAccounts(workerName){
        const DB = new Database();
        let request = await DB.prepare('SELECT * FROM worker_account_associations WHERE worker_name = ?');
        await request.execute([
            workerName
        ]);
        const associations = await request.fetchAll();
        const accounts = [];
        for(let association of associations){
            let request = await DB.prepare('SELECT * FROM accounts WHERE id = ?');
            await request.execute([association.account_email]);
            let account = request.fetch();
            accounts.push(account);
        }

        return accounts;
    }

    static wait(ms){
        return new Promise(function(resolve){
            setTimeout(() => {
                resolve();
            }, ms);
        })
    }

}

export default Tools;
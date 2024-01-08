// Modulo que hace el scrapping a la pagina de task
//Librerias
require('dotenv').config();
const puppeteer = require('puppeteer');
const mysql = require('mysql');
const { Socket } = require('socket.io');
// Constantes
const SYSTEMCONFIG = JSON.parse(process.env.SYSTEMCONFIG);
console.log('scraper: Iniciando con configuracion de proxy',process.env.PROXYSERVER);
if(process.env.PROXYSERVER == 'false'){
    var PROXYSERVER = null;
}else{
    var PROXYSERVER = JSON.parse(process.env.PROXYSERVER);
}
var CPACCOUNTS = JSON.parse(process.env.CPACCOUNTS);
var PAGEACTIONS = JSON.parse(process.env.PAGEACTIONS);
var BROWSEROBJECT = [];
var ARRAYOBJECTTASK = [];
var SYSTEMACTIONS = {"configurePuppeteer" : false, "already_start" : false};
var CURRENTPROXY = -1;
// Libreria socket.io-client
const io = require("socket.io-client");
var ioClient;

// ioClient.on("seq-num", (msg) => console.info(msg));

/* ===== INICIO DEL SCRAPER ===== */
(async function(){
    console.log('Scraper: Iniciado');
    //Configura un array de objetos para cada cuenta
    CPACCOUNTS.forEach(element => {
        BROWSEROBJECT.push({"instance" : null, "page_login" : null, "page_list" : null, "email" : element.email, "password" : element.password});
    });
    //Inicializa puppeteer
    await configurePuppeteer(true);
    // Inicializa conexion a servidor mediante websockets
    ioClient = io.connect(`${SYSTEMCONFIG.socketURL}:${SYSTEMCONFIG.socketPORT}`,{
        auth : {
            id : SYSTEMCONFIG.id_scraper,
            password : SYSTEMCONFIG.password_scraper
        }
    });
    /* ======== Eventos Socket.io ======== */
    ioClient.on('connect',async function(){
        console.log('socket.io-client: Conexion establecida');
    });
    ioClient.on('connect_error',async function(reason){
        console.error(`socket.io-client: Error estableciendo conexión => ${reason}`);
        setTimeout(function(){
            ioClient.connect()
        },1000);
    });
    ioClient.on('get_list', async function(data){
        console.log(`socket.io-client: Petición get_list del servidor =>`,data);
        ARRAYOBJECTTASK = await doMainProcess();
        // Valida valor devuelto
        if(Array.isArray(ARRAYOBJECTTASK)){
            ioClient.emit('get_list',{
                id_scraper : SYSTEMCONFIG.id_scraper,
                transaction_id : data.transaction_id,
                values : ARRAYOBJECTTASK 
            });
        }else{
            if(ARRAYOBJECTTASK == -1){
                console.error(`socket.io-client: Petición get_list del servidor rechazada debido a que aun se sigue ejecutando la anterior orden`);
            }else{
                // Ocurrio un error
                console.error(`socket.io-client: Petición get_list del servidor (respuesta) => No se pudo obtener la lista`,ARRAYOBJECTTASK);
            }
        }
    });
    ioClient.on('received_list',async function(data){
        // Lista recibida
        console.log(`socket.io-client: Petición get_list respondida al servidor => transaction id : ${data.transaction_id}`);
    })
})();


/* ===== EVENTOS ==== */
//Errores no manejados
process.on('unhandledRejection', (reason, promise) => { 
    console.error('Error no manejado en:', reason.stack || reason);
});

/* ===== FUNCIONES DE UTILIDADES ===== */

// Controla el proceso de hacer el scrapping en la lista de tareas
async function doMainProcess(){
    return new Promise(async function(resolve,reject){
        if(SYSTEMACTIONS.already_start !== false){
            console.log('doMainProcess: Petición rechazada');
            return resolve(-1);
        }
        SYSTEMACTIONS.already_start = true;
        console.log('doMainProcess: Iniciado');
        //Marca de tiempo
        var timeStartLoop = new Date();
        //Configura Puppeteer (en caso de que sea necesario) con el nuevo proxy
        await configurePuppeteer();
        //genera array de tasks revisando la pagina de tareas
        ARRAYOBJECTTASK = await searchInPage();
        //Marca de tiempo
        var timeEndLoop = new Date();
        console.log('doMainProcess: Tiempo de ejecución =>',round((timeEndLoop-timeStartLoop) / 1000),'segundos');
        // Verifica el valor dado por searchInPage
        if(!Array.isArray(ARRAYOBJECTTASK) || ARRAYOBJECTTASK.length == 0){
            console.error('doMainProcess: searchInPage retorno un valor inválido =>',ARRAYOBJECTTASK);
            SYSTEMACTIONS.already_start = false;
            return resolve(`doMainProcess: searchInPage retorno un valor inválido => ${ARRAYOBJECTTASK}`);
        }else{
            // Retorna array de tasks
            SYSTEMACTIONS.already_start = false;
            return resolve(ARRAYOBJECTTASK);
        }
    });
}

//Envia array de tasks al servidor
async function sendArrayObjects(arrayTasks){
    return new Promise(async function(resolve,reject){
        console.log(`sendArrayObjects: Iniciado (elementos a enviar: ${arrayTasks.length})`);
        var stringToSend = JSON.stringify(arrayTasks);
        var dateToday = new Date();
        var stringDateToday = `${dateToday.getFullYear()}-${dateToday.getMonth()+1}-${dateToday.getDate()} ${dateToday.getHours()}:${dateToday.getMinutes()}:${dateToday.getSeconds()}:${dateToday.getMilliseconds()}`;
        // Realiza peticion a la base de datos
        do{
            var query = await query_mysql(`INSERT INTO scraper (content,proxy,date_create,purpose) VALUES ('${stringToSend}','${CURRENTPROXY.location}','${stringDateToday}','${SYSTEMCONFIG.purpose}')`);
            if(typeof query == 'string'){
                console.error(`sendArrayObjects: Ha ocurrido un error (reintentando en ${round(SYSTEMCONFIG.ms_wait_error/1000)} segundos) => ${query}`);
                await waitMs(SYSTEMCONFIG.ms_wait_error);
            }
        }while(typeof query == 'string');
        resolve();
    });
}

//Controlador de busca en la pagina de Appen los tasks actuales
async function searchInPage(){
    return new Promise(async function(resolve,reject){
        //Cadena de ejecucion
        var stringArray = '[';
            BROWSEROBJECT.forEach(function(element,key){
                if(stringArray == '['){
                    stringArray += `doScrapping(${key})`;
                }else{
                    stringArray += `,doScrapping(${key})`;
                }
            });
        stringArray += ']';
        Promise.all(eval(stringArray)).then(async function(values){
            // Cadena de ejecucion
            var stringIf = '';
            values.forEach(function(element,key){
                if(stringIf == ''){
                    stringIf = `values[${key}] == null`;
                }else{
                    stringIf += ` && values[${key}] == null`;
                }
            });
            // Valida si todos los doScrapping dieron error
            if(eval(stringIf)){
                console.error('searchInPage: Abortando ejecución (Todos los doScrapping fallaron)');
                return resolve(null);
            }else{
                // Une los array en uno solo
                var ArrayUnion = Array();
                values.forEach(async function(currentArray,key){
                    if(Array.isArray(currentArray)){
                        currentArray.forEach(function(currentTask){
                            if(ArrayUnion.filter(function(element){return element.id == currentTask.id;}).length == 0){
                                // No está la id en el array
                                ArrayUnion.push(currentTask);
                            }
                        });
                    }else{
                        // Reinicia el navegador especifico
                        await configurePuppeteerSpecific(key);
                    }
                });
               return resolve(ArrayUnion);
            }
        });
    });
}
//Realiza el scrapping directamente
async function doScrapping(key){
    return new Promise(async function(resolve,reject){
        console.log('doScrapping: Iniciado con key =>',key);
        try{
            //Asigna una pestaña a page_list (si aplica)
            if(BROWSEROBJECT[key].page_list === null){
                BROWSEROBJECT[key].page_list = await BROWSEROBJECT[key].instance.newPage();
                if(CURRENTPROXY !== null){
                    //Asigna credenciales de Proxy
                    await BROWSEROBJECT[key].page_list.authenticate({'username' : CURRENTPROXY.username, 'password' : CURRENTPROXY.password});
                }
                //Asigna reglas de bloqueo de img y css
                await BROWSEROBJECT[key].page_list.setRequestInterception(true);
                await BROWSEROBJECT[key].page_list.on('request', (req) => {
                    if(req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image' || req.resourceType() == 'script'){
                        req.abort();
                    }
                    else {
                        req.continue();
                    }
                });
            }
            //Busca el link de la lista dentro del iframe
            await BROWSEROBJECT[key].page_list.goto(PAGEACTIONS.iframe,{waitUntil:'networkidle0'});
            //Evalua respuesta del iframe
            var responseIframe = await BROWSEROBJECT[key].page_list.evaluate(() => {
                return document.querySelector("body").innerText;
            });
            if(isJson(responseIframe)){
                responseIframe = JSON.parse(responseIframe);
                if(responseIframe.error){
                    if(responseIframe.error == 'Not Authenticated' || responseIframe.error == 'Invalid Token'){
                        // No autenticado en CP, inicia autenticador
                        if(await loginScrapping(key) !== null){
                            //Busca el link de la lista dentro del iframe
                            await BROWSEROBJECT[key].page_list.goto(PAGEACTIONS.iframe,{waitUntil:'networkidle0'});
                            //Evalua respuesta del iframe
                            responseIframe = await BROWSEROBJECT[key].page_list.evaluate(() => {
                                return document.querySelector("body").innerText;
                            });
                            // Valida respuesta de iframe
                            if(!isJson(responseIframe) || JSON.parse(responseIframe).error || JSON.parse(responseIframe).url === undefined){
                                console.error('doScrapping: Abortando ejecución (fallo al obtener link de iframe) =>',responseIframe);
                                return resolve(null);
                            }else{
                                responseIframe = JSON.parse(responseIframe);
                            }
                        }else{
                            // Ocurrio un error iniciando sesion
                            console.error('doScrapping: Abortando ejecución (fallo al iniciar sesión)');
                            return resolve(null);
                        }
                    }else{
                        // Error no especificado
                        console.error('doScrapping: Abortando ejecución (error no manejado) =>',responseIframe.error);
                        return resolve(null);
                    }
                }
                // Valida que haya url
                if(responseIframe.url){
                    // Abre la url para hacer el scrapping en la lista de tareas
                    await BROWSEROBJECT[key].page_list.goto(responseIframe.url,{waitUntil:'networkidle0'});
                    var responseJsonTask = await BROWSEROBJECT[key].page_list.evaluate(() => {
                        // Contexto de console de devTools
                        try{
                            var dataAllTask = JSON.parse(document.querySelector('#task-listing-datatable').getAttribute('data-tasks'));
                            var dataJustTask = Array();
                            dataAllTask.forEach(function(element,key){
                                // Inserta objeto al array con solo la informacion necesaria
                                dataJustTask.push({
                                    "id" : element[0],
                                    "name" : encode(element[1]),
                                    "level" : element[2],
                                    "payment" : element[3],
                                    "tasks" : element[5],
                                    "token" : element[12]                                
                                });
                            });
                            return dataJustTask;
                        }catch(e){
                            // Ha ocurrido un error
                            return e;
                        }
                        // Funcion que codifica cadenas
                        function encode(str){
                            return encodeURIComponent(str)
                            .replace(/\-/g, '%2D')
                            .replace(/\_/g, '%5F')
                            .replace(/\./g, '%2E')
                            .replace(/\!/g, '%21')
                            .replace(/\~/g, '%7E')
                            .replace(/\*/g, '%2A')
                            .replace(/\'/g, '%27')
                            .replace(/\(/g, '%28')
                            .replace(/\)/g, '%29');
                        }
                    });
                    // Valida respuesta
                    if(Array.isArray(responseJsonTask)){
                        return resolve(responseJsonTask);
                    }else{
                        console.error('doScrapping: Abortando ejecución (Ocurrio un error analizando página) =>',responseJsonTask);
                        return resolve(null);
                    }
                }else{
                    // No existe el campo de url
                    console.error('doScrapping: Abortando ejecución (No se encontro el campo url) =>',responseIframe);
                    return resolve(null);
                }
            }else{
                //Respuesta no JSON
                console.error('doScrapping: Ha ocurrido un error =>',responseIframe);
                return resolve(null);
            }
        }catch(e){
            console.error('doScrapping:',e);
            resolve(null);
        }
    });
}


// Funcion actualizada que inicia sesión en CP
async function loginScrapping(key){
    return new Promise(async function(resolve, reject){
        console.log('loginScrapping: Iniciado con credenciales =>',BROWSEROBJECT[key].email);
        try{
            // Asigna pestaña a la pagina de login (si aplica)
            if(BROWSEROBJECT[key].page_login == null){
                BROWSEROBJECT[key].page_login = await BROWSEROBJECT[key].instance.newPage();
            }
            // Abre la pagina de inicio de sesión de CP
            await BROWSEROBJECT[key].page_login.goto(PAGEACTIONS.login);
            // Espera hasta que el selector del input sea visible
            await BROWSEROBJECT[key].page_login.waitForSelector('input[name="username"]');
            // Verifica si no está iniciada la sesión
            if(await BROWSEROBJECT[key].page_login.url().includes('auth')){
                // Inserta datos de autenticación en inputs
                await BROWSEROBJECT[key].page_login.type('input[name="username"]',BROWSEROBJECT[key].email,{delay:25});
                await BROWSEROBJECT[key].page_login.type('input[name="password"]',BROWSEROBJECT[key].password,{delay:25});
                // Marca el checkbox de "Recuerdame"
                await BROWSEROBJECT[key].page_login.click('input[name="rememberMe"]');
                // CLick y esperar hasta que inicie
                await BROWSEROBJECT[key].page_login.click('input[name="login"]');
                await BROWSEROBJECT[key].page_login.waitForNavigation({ waitUntil: 'networkidle0' });
                console.log('Espera al iframe');
                // Espera 30 segundos a que aparezca selector de iframe
                try{
                    await BROWSEROBJECT[key].page_login.waitForSelector('iframe',{timeout : 20000});
                }catch(e){
                    console.warn('loginScrapping: Tiempo de espera excedido para el selector iframe');
                }
                // Verifica que se haya iniciado sesión correctamente
                if(await BROWSEROBJECT[key].page_login.url().includes('login')){
                    console.error('loginScrapping: No se pudo iniciar sesión');
                    return resolve(null);
                }else{
                    return resolve(true);
                }
            }else{
                // Ya está iniciada la sesión
                return resolve(true);
            }
        }catch(e){
            console.error('loginScrapping: Ha ocurrido un error =>',e);
            resolve(null);
        }
    });
}


//Configura e inicializa puppeteer
async function configurePuppeteer(init){
    return new Promise(async function(resolve,reject){
        // Verifica si no se está ejecutando otra instancia
        if(SYSTEMACTIONS.configurePuppeteer !== false){
            return resolve();
        }else{
            SYSTEMACTIONS.configurePuppeteer = true;
        }
        console.log('configurePuppeteer: Iniciado');
        if(init || selectProxy() !== CURRENTPROXY){
            console.log('configurePuppeteer: Configurando');
            CURRENTPROXY = selectProxy();
            //Cierra navegadores (si aplica)
            for(var key=0;BROWSEROBJECT.length>key;key++){
                try{
                    if(BROWSEROBJECT[key].instance !== null){
                        await BROWSEROBJECT[key].instance.close();
                        BROWSEROBJECT[key].instance = null;
                        BROWSEROBJECT[key].page_login = null;
                        BROWSEROBJECT[key].page_list = null;
                    }
                }catch(e){
                    console.log('configurePuppeteer: Advertencia =>',e);
                }
            }
            //Inicia navegadores
            for(var key=0;BROWSEROBJECT.length>key;key++){
                if(CURRENTPROXY !== null){
                    BROWSEROBJECT[key].instance = await puppeteer.launch({
						args : [`--proxy-server=http://${CURRENTPROXY.ip}:${CURRENTPROXY.port}`],
						headless: SYSTEMCONFIG.headless,
						slowMo: 5
					});
                }else{
                    // Ejecucion sin proxy
                    BROWSEROBJECT[key].instance = await puppeteer.launch({
						headless: SYSTEMCONFIG.headless,
						slowMo: 5
					});
                }
            }
        }else{
            console.log('configurePuppeteer: Sin acciones');
        }
        SYSTEMACTIONS.configurePuppeteer = false;
        return resolve();
    });
}
//Inicializa una instancia especifica
async function configurePuppeteerSpecific(key){
    return new Promise(async function(resolve,reject){
        try{
            console.log('configurePuppeteerSpecific: Iniciado');
            // Cierra instancia
            await BROWSEROBJECT[key].instance.close();
            BROWSEROBJECT[key].instance = null;
            BROWSEROBJECT[key].page_login = null;
            BROWSEROBJECT[key].page_list = null;
            // Inicia navegador
            if(CURRENTPROXY !== null){
                BROWSEROBJECT[key].instance = await puppeteer.launch({
                    args : [`--proxy-server=http://${CURRENTPROXY.ip}:${CURRENTPROXY.port}`],
                    headless: SYSTEMCONFIG.headless,
                    slowMo: 5
                });
            }else{
                // Ejecucion sin proxy
                BROWSEROBJECT[key].instance = await puppeteer.launch({
                    headless: SYSTEMCONFIG.headless,
                    slowMo: 5
                });
            }
            resolve(true);
        }catch(e){
            console.error('configurePuppeteerSpecific: Ha ocurrido un error =>',e);
            resolve(null);
        }
    });
}
//Selecciona el proxy de acuerdo al tiempo
function selectProxy(){
    var proxySelected = null;
    PROXYSERVER.forEach(element => {
        var dateToday = new Date();
        var stringDateToday =  dateToday.getMonth()+1+'-'+dateToday.getDate()+'-'+dateToday.getFullYear();
        if(new Date() >= new Date (stringDateToday+' '+element.time_init) && new Date() <= new Date (stringDateToday+' '+element.time_end) && SYSTEMCONFIG.location_scraper == element.location){
            console.log('selectProxy: Proxy activo =>',element);
            if(proxySelected === null){
                proxySelected = element;
            }
        }
    });
    return proxySelected;
}

//Espera el tiempo en ms
function waitMs(tim){
	function waiting(resolve,reject){
		setTimeout(finish, tim);
		function finish(){
			resolve();
		}
	}
	return new Promise(waiting);
}

//Funcion que verifica si una variable es JSON
function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

//Funcion que redondea numeros
function round(num, decimales = 2) {
    var signo = (num >= 0 ? 1 : -1);
    num = num * signo;
    if (decimales === 0) //con 0 decimales
        return signo * Math.round(num);
    // round(x * 10 ^ decimales)
    num = num.toString().split('e');
    num = Math.round(+(num[0] + 'e' + (num[1] ? (+num[1] + decimales) : decimales)));
    // x * 10 ^ (-decimales)
    num = num.toString().split('e');
    return signo * (num[0] + 'e' + (num[1] ? (+num[1] - decimales) : -decimales));
}

// Funcion que codifica cadenas
function encode(str){
    return encodeURIComponent(str)
    .replace(/\-/g, '%2D')
    .replace(/\_/g, '%5F')
    .replace(/\./g, '%2E')
    .replace(/\!/g, '%21')
    .replace(/\~/g, '%7E')
    .replace(/\*/g, '%2A')
    .replace(/\'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29');
}

// Funcion que decodifica cadenas
function decode(str){
    return decodeURIComponent(
        str
        .replace(/\%2D/g, '-')
        .replace(/\%5F/g, '_')
        .replace(/\%2E/g, '.')
        .replace(/\%21/g, '!')
        .replace(/\%7E/g, '~')
        .replace(/\%2A/g, '*')
        .replace(/\%27/g, "'")
        .replace(/\%28/g, '(')
        .replace(/\%29/g, ')')
    );
}
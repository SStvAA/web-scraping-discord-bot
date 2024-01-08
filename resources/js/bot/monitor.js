// Modulo que analiza las inserciones del scraper
// Librerias
require('dotenv').config();
const mysql = require('mysql');
const { Socket } = require('socket.io');
// Constantes
const SYSTEMCONFIG = JSON.parse(process.env.SYSTEMCONFIG);
const MONITORCONFIG = JSON.parse(process.env.MONITORCONFIG);
var SYSTEMACTIONS = {first_connect_to_db : true}
// Globales
var TASKLISTSCRAPER, TASKLISTARRAYTEMP = [],TASKSTONOTIFY = [], httpServer, io;
// Inicio del monitor
(async function(){
    //Inicializa conexion a base de datos
    await startDBConnection();
    // Inicializa el modulo websocket
    httpServer = require("http").createServer();
    io = require("socket.io")(httpServer,{
        cors: {
            origin: false,
            methods: ["GET", "POST"],
            credentials: true
        }
    });
    // Asigna metodo de autenticación
    io.use(async function(socket, next){
        if(socket.handshake.auth){
            // Realiza consulta
            do{
                var query = await query_mysql(`SELECT COUNT(id) as totalScrap FROM scraper WHERE id = '${socket.handshake.auth.id}' AND password = '${socket.handshake.auth.password}'`);
                if(typeof query == 'string'){
                    console.error('Monitor (socket.io): Ha ocurrido un validando la información de autenticación =>',query);
                    await waitMs(SYSTEMCONFIG.ms_wait_error);
                }
            }while(typeof query == 'string');
            if(query[0]['totalScrap']>0){
                // conexion aceptada
                next();
            }else{
                // conexion rechazada
                console.log('Monitor: Conexión de scraper rechazada => invalid id or password')
                next(new Error("invalid id or password"));
            }
        }else{
            console.log('Monitor: Conexión de scraper rechazada => empty credentials')
            next(new Error("empty credentials"));
        }
    });
    /* ======== Eventos Socket.io ======== */
    io.on("connection", (socket) => {
        console.log(`Monitor (socket.io): scraper conectado con id ${socket.id}, clientes conectados: ${Object.entries(io.engine.clients).length}`);
        // Evento de desconexion
        socket.on('disconnect', () => {
            console.log(`Monitor (socket.io): scraper desconectado con id ${socket.id}, clientes conectados: ${Object.entries(io.engine.clients).length}`);
        });
        // Evento de registro de tareas
        socket.on('get_list', (message)=>{
            console.log(`Monitor (socket.io): lista recibida de scraper => id: ${message.id_scraper}, transaction id: ${message.transaction_id}`);
            socket.emit('received_list',{transaction_id : message.transaction_id});
            // Valida los datos recibidos
            if(Array.isArray(message.values)){
                // Agrega la lista al array de tasklist
                TASKLISTARRAYTEMP.push(message);
            }else{
                console.error(`Monitor (socket.io): lista recibida es invalida, de scraper => id: ${message.id_scraper}, transaction id: ${message.transaction_id}`)
            }
        })
    });
    // Inicia el puerto escucha de socket.io
    httpServer.listen(SYSTEMCONFIG.socketPORT,function(){
        console.log(`Monitor (socket.io): iniciado en puerto ${SYSTEMCONFIG.socketPORT}`);
        //Inicio de funcion de bucle principal
        initLoopMain();
    });
})();

/* ======== EVENTOS ======== */
//Errores no manejados
process.on('unhandledRejection', (reason, promise) => { 
    console.error('Error no manejado en:', reason.stack || reason);
});

/* ======== FUNCIONES DE UTILIDADES ======== */

// Funcion de loop encargada de la logica de las notificaciones
async function initLoopMain(){
    console.log('initLoopMain: Iniciado');
    do{
        //Marca de tiempo
        var timeStartLoop = new Date();
        // Limpia el array de escucha de scraper
        TASKLISTARRAYTEMP = [];
        // Obtiene tasklist de los scraper
        TASKLISTSCRAPER = await getListFromScraper();
        if(Array.isArray(TASKLISTSCRAPER)){
            // Obtiene lista de tasks a notificar
            TASKSTONOTIFY = await getTaskToNofify();
            // Actualiza valores de la tabla de history tasks y envia las notificaciones a la base de datos
            await Promise.all([sendNotifyToDb(TASKSTONOTIFY.notify),updateHistoryOfTaskList(TASKSTONOTIFY.notify,TASKSTONOTIFY.scraper,TASKSTONOTIFY.history)]);
        }else{
            if(TASKLISTSCRAPER == -1){
                // No hay scrappers conectados
                await waitMs(SYSTEMCONFIG.ms_wait_error);
            }
        }
        //Marca de tiempo
        var timeEndLoopFirst = new Date();
        // Calcula el tiempo de espera necesario para que siempre sea el tiempo establecido de retraso
        if(timeEndLoopFirst-timeStartLoop < SYSTEMCONFIG.ms_wait_loop_monitor){
            // Tiempo de espera
            var msWaitNew = SYSTEMCONFIG.ms_wait_loop_monitor - (timeEndLoopFirst-timeStartLoop);
            console.log('initLoopMain: Tiempo de espera personalizado:',msWaitNew);
            await waitMs(msWaitNew);
        }
        //Marca de tiempo
        var timeEndLoopSecond = new Date();
        console.log('initLoopMain: Tiempo de ejecución =>',round((timeEndLoopSecond-timeStartLoop) / 1000),'segundos');
    }while(true);
}

// Funcion que actualiza el task_list_history de la base de datos
async function updateHistoryOfTaskList(NOTIFY,SCRAPER,HISTORY){
    return new Promise(async function(resolve,reject){
        console.log('updateHistoryOfTaskList: Iniciado');
        // Recorre el array de la task list unificada del scraper, para agregar los tasks faltantes al array de historia
        SCRAPER.forEach(function(element_scraper){
            if(HISTORY.map(function(rx){return rx.id}).indexOf(element_scraper.id) == -1){
                HISTORY.push({
                    id: element_scraper.id,
                    name: element_scraper.name,
                    level: element_scraper.level,
                    payment: element_scraper.payment,
                    tasks: element_scraper.tasks,
                    tasks_repeat : 0,
                    tasks_maximum : element_scraper.tasks,
                    already_seen : false,
                    already_reload : false,
                    already_increase : false,
                    already_decrease : false,
                    last_view : new Date().toISOString().slice(0, 19).replace('T', ' '),
                    on_list : true,
                    last_notification : new Date().toISOString().slice(0, 19).replace('T', ' '),
                    id_proxy_category : element_scraper.id_proxy_category
                })
            }
        });
        // Recorre el array de historia para crear string de query
        var string_query = '';
        HISTORY.forEach(function(element_history){
            var position_scraper = SCRAPER.map(function(rx){return rx.id}).indexOf(element_history.id);
            if(position_scraper !== -1){
                // Si el task del historial aun está en lista
                var id = SCRAPER[position_scraper].id;
                var name = SCRAPER[position_scraper].name;
                var level = SCRAPER[position_scraper].level;
                var payment = SCRAPER[position_scraper].payment;
                var tasks = SCRAPER[position_scraper].tasks;
                // tasks_repeat
                if(element_history.tasks == SCRAPER[position_scraper].tasks){
                    var tasks_repeat = element_history.tasks_repeat ++;
                }else{
                    var tasks_repeat = 0;
                }
                // tasks_maximum y already_reload
                if(SCRAPER[position_scraper].tasks < element_history.tasks_maximum && tasks_repeat >= 20){
                    var tasks_maximum = SCRAPER[position_scraper].tasks;
                    var already_reload = true;
                }else if(SCRAPER[position_scraper].tasks > element_history.tasks_maximum){
                    var tasks_maximum = SCRAPER[position_scraper].tasks;
                    var already_reload = element_history.already_reload;
                }else{
                    var tasks_maximum = element_history.tasks_maximum;
                    var already_reload = element_history.already_reload;
                }
                var already_seen = element_history.already_seen;
                var already_increase = element_history.already_increase;
                var already_decrease = element_history.already_decrease;
                var last_view = new Date().toISOString().slice(0, 19).replace('T', ' ');
                var on_list = true;
                // last_notification
                if(NOTIFY.map(function(rx){return rx.id}).indexOf(id) !== -1){
                    var last_notification = new Date().toISOString().slice(0, 19).replace('T', ' ');
                }else{
                    // Para volver a poner la fecha es necesario que le agregues una Z al final para que new Date no sume la zona horaria +4
                    var last_notification = new Date(element_history.last_notification+'Z').toISOString().slice(0, 19).replace('T', ' ');
                }
                var id_proxy_category = element_history.id_proxy_category;
            }else{
                // Si el task del historial ya no está en lista
                if(element_history.on_list == false){
                    // Si el task ya habia estado fuera de lista antes no es necesario volver a poner que no está
                    return;
                }
                var id = element_history.id;
                var name = element_history.name; 
                var level = element_history.level;
                var payment = element_history.payment;
                var tasks = 0;
                var tasks_repeat = 0;
                var tasks_maximum = element_history.tasks_maximum;
                var already_seen = element_history.already_seen;
                var already_reload = element_history.already_reload;
                var already_increase = element_history.already_increase;
                var already_decrease = element_history.already_decrease;
                // Para volver a poner la fecha es necesario que le agregues una Z al final para que new Date no sume la zona horaria +4
                var last_view = new Date(element_history.last_view+'Z').toISOString().slice(0, 19).replace('T', ' ');
                var on_list = false;
                // Para volver a poner la fecha es necesario que le agregues una Z al final para que new Date no sume la zona horaria +4
                var last_notification = new Date(element_history.last_notification+'Z').toISOString().slice(0, 19).replace('T', ' ');
                var id_proxy_category = element_history.id_proxy_category;
            }
            // Crear cadena
            if(string_query == ''){
                string_query = `INSERT INTO history_of_task_list VALUES (
                    ${id},
                    '${name}',
                    ${level},
                    '${payment}',
                    ${tasks},
                    ${tasks_repeat},
                    ${tasks_maximum},
                    ${already_seen},
                    ${already_reload},
                    ${already_increase},
                    ${already_decrease},
                    '${last_view}',
                    ${on_list},
                    '${last_notification}',
                    ${id_proxy_category}) ON DUPLICATE KEY UPDATE
                    id = ${id},
                    name = '${name}',
                    level = ${level},
                    payment = '${payment}',
                    tasks = ${tasks},
                    tasks_repeat = ${tasks_repeat},
                    tasks_maximum = ${tasks_maximum},
                    already_seen = ${already_seen},
                    already_reload = ${already_reload},
                    already_increase = ${already_increase},
                    already_decrease = ${already_decrease},
                    last_view = '${last_view}',
                    on_list = ${on_list},
                    last_notification = '${last_notification}',
                    id_proxy_category = ${id_proxy_category};`;
            }else{
                string_query += `INSERT INTO history_of_task_list VALUES (
                    ${id},
                    '${name}',
                    ${level},
                    '${payment}',
                    ${tasks},
                    ${tasks_repeat},
                    ${tasks_maximum},
                    ${already_seen},
                    ${already_reload},
                    ${already_increase},
                    ${already_decrease},
                    '${last_view}',
                    ${on_list},
                    '${last_notification}',
                    ${id_proxy_category}) ON DUPLICATE KEY UPDATE
                    id = ${id},
                    name = '${name}',
                    level = ${level},
                    payment = '${payment}',
                    tasks = ${tasks},
                    tasks_repeat = ${tasks_repeat},
                    tasks_maximum = ${tasks_maximum},
                    already_seen = ${already_seen},
                    already_reload = ${already_reload},
                    already_increase = ${already_increase},
                    already_decrease = ${already_decrease},
                    last_view = '${last_view}',
                    on_list = ${on_list},
                    last_notification = '${last_notification}',
                    id_proxy_category = ${id_proxy_category};`;
            }
        });
        // Envia peticion mysql
        do{
            var start_query = new Date();
            var query = await query_mysql(string_query);
            console.log('updateHistoryOfTaskList: Tiempo realizando petición ',(new Date() - start_query) / 1000,'segundos');
            if(typeof query == 'string'){
                console.error(`updateHistoryOfTaskList: Ha ocurrido un error => ${query}`);
                await waitMs(SYSTEMCONFIG.ms_wait_error);
            }
        }while(typeof query == 'string');
        console.log('updateHistoryOfTaskList: Finalizado');
        return resolve(true);
    });
}

// Funcion que envia las notificaciones a la base de datos
async function sendNotifyToDb(to_notify){
    return new Promise(async function(resolve,reject){
        console.log('sendNotifyToDb: Iniciado');
        if(to_notify.length>0){
            await (async function(){
                return new Promise(async function(resolve,reject){
                    to_notify.forEach(async function(element,i,array){
                        // Notificaciones Discord
                        do{
                            console.log('sendNotifyToDb: Hace consulta a base de datos');
                            var query = await query_mysql(`INSERT INTO discord_notification (id,name,level,payment,tasks,token,id_proxy_category,id_channel_category) VALUES (
                                ${element.id},
                                '${element.name}',
                                ${element.level},
                                '${element.payment}',
                                ${element.tasks},
                                '${element.token}',
                                ${element.id_proxy_category},
                                ${element.id_channel_category}
                            )`);
                            console.log('sendNotifyToDb: Finaliza consulta a base de datos');
                            if(typeof query == 'string'){
                                console.error(`sendNotifyToDb: Ha ocurrido un error => ${query}`);
                                await waitMs(SYSTEMCONFIG.ms_wait_error);
                            }
                        }while(typeof query == 'string');
                        // Notificaciones Telegram
                        do{
                            console.log('sendNotifyToDb: Hace consulta a base de datos');
                            var query = await query_mysql(`INSERT INTO telegram_notification (id,name,level,payment,tasks,token,id_proxy_category,id_channel_category) VALUES (
                                ${element.id},
                                '${element.name}',
                                ${element.level},
                                '${element.payment}',
                                ${element.tasks},
                                '${element.token}',
                                ${element.id_proxy_category},
                                ${element.id_channel_category}
                            )`);
                            console.log('sendNotifyToDb: Finaliza consulta a base de datos');
                            if(typeof query == 'string'){
                                console.error(`sendNotifyToDb: Ha ocurrido un error => ${query}`);
                                await waitMs(SYSTEMCONFIG.ms_wait_error);
                            }
                        }while(typeof query == 'string');
                        // Verifica si es el fin del array para resolver la promesa
                        if(array.length-1 == i){
                            console.log(`sendNotifyToDb: Resuelve promesa forEach`);
                            resolve();
                        }else{
                            console.log(`sendNotifyToDb: Aun no resuelve promesa forEach => array.length: ${array.length} -1 = ${array.length-1} , i = ${i}`);
                        }
                    });
                });
            })();
        }
        console.log('sendNotifyToDb: Finalizado');
        resolve();
    });
}

// Funcion que contiene la logica para notificar un task
async function getTaskToNofify(){
    return new Promise(async function(resolve,reject){
        var ARRAYTEMPTONOTIFY = [];
        // Pide la lista de historia de tasks
        var stringId = ''
        TASKLISTSCRAPER.forEach(element => {
            if(stringId == ''){
                stringId = String(element.id);
            }else{
                stringId += `,${element.id}`;
            }
        })
        do{
            var query = await query_mysql(`SELECT * FROM history_of_task_list`);
            if(typeof query == 'string'){
                console.error(`getTaskToNofify: Ha ocurrido un error => ${query}`);
                await waitMs(SYSTEMCONFIG.ms_wait_error);
            }
        }while(typeof query == 'string');
        var TASKLISTHISTORY = query;
        // Revisa cada tasks de la lista de los scrapers
        TASKLISTSCRAPER.forEach(function(task){
            // Silencio temporal para el spam de priority y transcribe data
            if(task.id == 974846 || task.id == 886261 || task.id == 886252){ return; }
            var position_tasklisthistory = TASKLISTHISTORY.map(function(rx){return rx.id}).indexOf(task.id);
            if(position_tasklisthistory !== -1){
                var id_category = null;
                // Aparecio en la lista (generalmente con 0 tasks)
                if((new Date() - new Date(TASKLISTHISTORY[position_tasklisthistory]['last_view'])) >= 3600000){
                    // Si el trabajo se vio por ultima vez hace mas de 1 hora
                    id_category = MONITORCONFIG.id_just_seen;
                }else if(((100 / TASKLISTHISTORY[position_tasklisthistory]['tasks_maximum']) * task.tasks) >= 90 && TASKLISTHISTORY[position_tasklisthistory]['tasks_maximum'] != 0 && TASKLISTHISTORY[position_tasklisthistory]['already_reload'] == false){
                    // Recargo task 
                    // Si tasks actuales es >=90% task maximo
                    // Si task maximo != 0
                    // Si antes no se ha notificado que ha recargado tareas
                    id_category = MONITORCONFIG.id_reload_number_of_tasks;
                    TASKLISTHISTORY[position_tasklisthistory]['already_reload'] = true;
                    TASKLISTHISTORY[position_tasklisthistory]['already_decrease'] = false;
                    TASKLISTHISTORY[position_tasklisthistory]['already_increase'] = false;
                }else if(task.tasks < TASKLISTHISTORY[position_tasklisthistory]['tasks'] && TASKLISTHISTORY[position_tasklisthistory]['already_decrease'] == false){
                    // Esta bajando tasks
                    // Si el numero de tasks actual es menor al anterior numero de tasks (en la anterior revisada de lista)
                    // Si antes no se ha notificado que ha bajado tasks
                    id_category = MONITORCONFIG.id_decreasing_number_of_tasks;
                    TASKLISTHISTORY[position_tasklisthistory]['already_decrease'] = true;
                    TASKLISTHISTORY[position_tasklisthistory]['already_increase'] = false;
                    // Evita el spam de "recargo tasks" cuando disminuye el numero maximo de tareas
                    if(((100 / TASKLISTHISTORY[position_tasklisthistory]['tasks_maximum']) * task.tasks) < 90){
                        TASKLISTHISTORY[position_tasklisthistory]['already_reload'] = false;
                    }
                }else if(task.tasks > TASKLISTHISTORY[position_tasklisthistory]['tasks'] && TASKLISTHISTORY[position_tasklisthistory]['already_increase'] == false){
                    // Esta subiendo tasks
                    // Si el numero de tasks actual es mayor al anterior numero de tasks (en la anterior revisada de lista)
                    id_category = MONITORCONFIG.id_increasing_number_of_tasks;
                    TASKLISTHISTORY[position_tasklisthistory]['already_increase'] = true;
                    TASKLISTHISTORY[position_tasklisthistory]['already_decrease'] = false;
                    // Evita el spam de "recargo tasks" cuando sube el numero maximo de tareas
                    if(((100 / TASKLISTHISTORY[position_tasklisthistory]['tasks_maximum']) * task.tasks) < 90){
                        TASKLISTHISTORY[position_tasklisthistory]['already_reload'] = false;
                    }
                }
                if(id_category !== null){
                    ARRAYTEMPTONOTIFY.push({
                        id_channel_category : id_category,
                        id_proxy_category : task.id_proxy_category,
                        id: task.id,
                        name: task.name,
                        level: task.level,
                        payment: task.payment,
                        tasks: task.tasks,
                        token: task.token
                    });
                }
            }else{
                // Envia notificacion de una vez, ya que no está en el historial de tasks => just_seen
                ARRAYTEMPTONOTIFY.push({
                    id_channel_category : MONITORCONFIG.id_just_seen,
                    id_proxy_category : task.id_proxy_category,
                    id: task.id,
                    name: task.name,
                    level: task.level,
                    payment: task.payment,
                    tasks: task.tasks,
                    token: task.token
                });
            }
        });
        return resolve({
            notify : ARRAYTEMPTONOTIFY,
            scraper : TASKLISTSCRAPER,
            history : TASKLISTHISTORY
        })
    });
}

// Funcion que obtiene la lista de tareas de los scraper
async function getListFromScraper(){
    return new Promise(async function(resolve,reject){
        console.log('getListFromScraper: Iniciado');
        // Obtiene la lista de scrapers conectados
        var scraperConnected = Object.entries(io.engine.clients);
        if(scraperConnected.length>0){
            console.log(`getListFromScraper: Enviando petición a ${scraperConnected.length} scrapers conectados`);
            // Genera y envia solicitud con id de transaccion 
            var transaction_id = generate_token();
            io.sockets.emit('get_list', {"transaction_id" : transaction_id});
            // Espera las listas generadas por los scrapers
            var TEMPTASKLIST = await waitResponseFromScraper(transaction_id,scraperConnected);
            if(TEMPTASKLIST.length>0){
                // Obtiene informacion de los scrapers que dieron las listas
                var stringId = '';
                TEMPTASKLIST.forEach(element => {
                    if(stringId == ''){
                        stringId = String(element.id_scraper);
                    }else{
                        stringId += `,${element.id_scraper}`;
                    }
                });
                do{
                    var query = await query_mysql(`SELECT scraper.id, scraper.id_proxy_category, proxy_category.name FROM scraper JOIN proxy_category ON proxy_category.id = scraper.id_proxy_category WHERE scraper.id IN (${stringId})`);
                    if(typeof query == 'string'){
                        console.error(`getListFromScraper: Ha ocurrido un error => ${query}`);
                        await waitMs(SYSTEMCONFIG.ms_wait_error);
                    }
                }while(typeof query == 'string');
                var scraper_information = query;
                // Une las listas generadas por los scrapers
                var UNIFYTASKLIST = [];
                TEMPTASKLIST.forEach(function(list_scraper){
                    list_scraper.values.forEach(function(task){
                        // Obtiene el proxy del scraper
                        var proxy_id;
                        var position_scraper_information = scraper_information.map(function(ry){ return ry.id}).indexOf(parseInt(list_scraper.id_scraper));
                        if(position_scraper_information == -1){
                            proxy_id = null
                        }else{
                            proxy_id = scraper_information[position_scraper_information]['id_proxy_category'];
                        }
                        var position_unifytasklist = UNIFYTASKLIST.map(function(rx){return rx.id}).indexOf(task.id);
                        if(position_unifytasklist == -1){
                            UNIFYTASKLIST.push({
                                id : task.id,
                                name : task.name,
                                level : task.level,
                                payment : task.payment,
                                tasks : task.tasks,
                                token : task.token,
                                id_proxy_category : proxy_id
                            });
                        }else{
                            // El task ya estaba, verifica que categoria de proxy aplica (por defecto la categoria menor tiene prioridad sobre las mayores)
                            if(UNIFYTASKLIST[position_unifytasklist].id_proxy_category > proxy_id){
                                UNIFYTASKLIST[position_unifytasklist].id_proxy_category = proxy_id;
                            }
                        }
                    });
                });
                // Devuelve la task list unificada
                return resolve(UNIFYTASKLIST);
            }else{
                console.error('getListFromScraper: No se pudo obtener la lista de los scrapers');
                return resolve(-1);
            }
        }else{
            // No hay scrapers conectados
            console.error('getListFromScraper: No hay scrapers conectados');
            return resolve(-1);
        }
    });
}

// Funcion que espera las respuestas de los scrapers y une las listas
async function waitResponseFromScraper(transaction_id,scraperConnected){
    return new Promise(async function(resolve,reject){
        console.log('waitResponseFromScraper: Iniciado');
        //Marca de tiempo
        var timeStartLoop = new Date();
        console.log(`waitResponseFromScraper: A la espera de al menos ${SYSTEMCONFIG.percentage_min_scraper_monitor}% de los scraper, tiempo limite: ${SYSTEMCONFIG.ms_wait_scraper_data_monitor/1000} segundos`);
        // Establece intervalo para revisar si ya se recibieron los datos de los scrapers
        var intervalRunning = false;
        var intervalWaitScraper = setInterval(function(){
            if(!intervalRunning){
                intervalRunning = true;
            }else{
                return;
            }
            // Verifica si al menos el porcentaje establecido de scrapers dio su lista
            var scraper_reported = [];
            TASKLISTARRAYTEMP.forEach(element => {
                if(element.transaction_id == transaction_id && scraper_reported.map(function(rx){return rx.id_scraper}).indexOf(element.id_scraper) == -1){
                    scraper_reported.push({
                        id_scraper : element.id_scraper,
                        transaction_id : element.transaction_id,
                        values : element.values
                    });
                }
            });
            console.log(`waitResponseFromScraper: Scrapers que enviaron datos: ${scraper_reported.length} , faltan: ${scraperConnected.length - scraper_reported.length} scrapers`);
            //Marca de tiempo
            var timeEndLoopSecond = new Date();
            if((100 / scraperConnected.length) * scraper_reported.length >= 100){
                // Todos los scraper han enviado sus datos a tiempo
                clearInterval(intervalWaitScraper);
                console.log(`waitResponseFromScraper: Obtenidos todos los datos de scrapers en menos de ${SYSTEMCONFIG.ms_wait_scraper_data_monitor/1000} segundos (${round((timeEndLoopSecond-timeStartLoop) / 1000)} segundos)`)
                resolve(scraper_reported);
            }else if((100 / scraperConnected.length) * scraper_reported.length >= 60){
                // Minimo de datos de scrapers requeridos ha sido alcanzado
                clearInterval(intervalWaitScraper);
                console.log(`waitResponseFromScraper: Minimo de datos de scrapers requeridos ha sido alcanzado (${round((100 / scraperConnected.length) * scraper_reported.length)}%), estableciendo timeout maximo de espera para los scrapers faltantes de ${SYSTEMCONFIG.ms_wait_timeout_scraper_data_monitor / 1000} segundos`);
                setTimeout(function(){
                    var scraper_reported = [];
                    TASKLISTARRAYTEMP.forEach(element => {
                        if(element.transaction_id == transaction_id && scraper_reported.map(function(rx){return rx.id_scraper}).indexOf(element.id_scraper) == -1){
                            scraper_reported.push({
                                id_scraper : element.id_scraper,
                                transaction_id : element.transaction_id,
                                values : element.values
                            });
                        }
                    });
                    console.log(`waitResponseFromScraper (timeOut): Scrapers que enviaron datos: ${scraper_reported.length} , faltan: ${scraperConnected.length - scraper_reported.length} scrapers`);
                    resolve(scraper_reported);
                },SYSTEMCONFIG.ms_wait_timeout_scraper_data_monitor);
            }else if((timeEndLoopSecond-timeStartLoop) >= SYSTEMCONFIG.ms_wait_scraper_data_monitor){
                // Vencio el tiempo de espera y no se consiguio el porcentaje minimo de datos de scraper
                clearInterval(intervalWaitScraper);
                console.log(`waitResponseFromScraper: Vencio el tiempo de espera y no se consiguio el porcentaje minimo de datos de scraper`);
                resolve(scraper_reported);
            }
            intervalRunning = false;
        },200)
    });
}

// Funcion que realiza consulta a la base de datos
async function query_mysql(request,multi_query){
	async function query_mysqling(resolve,reject){
		connection.query(request, function(error,results,fields){
			if(error){
				//Si ocurre un error devolvemos string de error, podemos evaluar si es error utilizando typeof y viendo si es string el dato devuelto
				resolve(error.code);
			}else{
				resolve(results);
			}
		})
	}
	return new Promise(query_mysqling)
}

//Funcion que inicia y mantiene la conexion con la base de datos
async function startDBConnection(){
    return new Promise(function(resolve,reject){
        console.log('startDBConnection: Iniciando conexión a base de datos...');
        connection = mysql.createConnection({
            host : process.env.HOST,
            user : process.env.USER,
            password : process.env.PASSWORD,
            database : process.env.DATABASE,
            charset : process.env.CHARSET,
            multipleStatements: true
        });
        //Manejador de eventos de error mysql cuando cae la conexion
        connection.connect(function(err) {
            if (err) {
                console.error('startDBConnection: Conexion Fallida', err.code);
                if(SYSTEMACTIONS.first_connect_to_db === true){
                    console.error('startDBConnection: Error fatal, reinicie el modulo con la conexión a la base de datos correctamente');
                    return;
                }
                startDBConnection();
            }
            else{
                console.log('startDBConnection: Conectado');
                SYSTEMACTIONS.firt_connect_to_db = false;
                try{
                    resolve();
                }catch(e){
                    // Solo por seguridad hacemos esto
                }
            }
        });
        connection.on('error', function(err) {
            try{
                resolve();
            }catch(e){
                // Solo por seguridad hacemos esto
            }
            if (err.fatal){
               
                startDBConnection();
            }
        });
    });
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

//Funcion que genera un token
function generate_token(){
	function random() {
	    return Math.random().toString(36).substr(2);
	};
	return random() + random() + random() + random() + random() + random() + random();
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

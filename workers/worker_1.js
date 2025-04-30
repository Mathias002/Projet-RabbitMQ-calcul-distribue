const ampqlib = require('amqplib');
const askPassword = require('../security');
require('dotenv').config();

const serverCredentials = process.env.SERVER_CREDENTIALS;

const rabbitmq_url = 'amqp://' + serverCredentials;

// Récupération de l'op dans la comande du terminal 
// "add", "sub", "mul", "div"
const op = process.argv[2];

const exchange = '002_calc_ops';

const result_queue = '002_calc_results';

// Initialisation d'une queue selon l'opération reçu
// const queue = `002_calc_${op}`;

// Initialisation d'une variable channel global
let channel;

// Vérification de l'opération dans les paramètres de la commande
if(!["add", "sub", "div", "mul"].includes(op)){
    console.log("Type d'opération non valide. Veuillez utiliser : add, sub, div, mul");
    process.exit(1);
}

const topicKey = `calc.${op}`;

const topicKeyAll = `calc.all`;

const queue = `002_queue_${op}`;

async function playWorker(){

    // Connexion à rabbitmq
    const connection = await ampqlib.connect(rabbitmq_url);

    // Création du channel
    channel = await connection.createChannel();

    // Assertion de l'exchange
    await channel.assertExchange(exchange, 'topic', {
        durable: false
    })

    // Assertion de la queue de requête
    await channel.assertQueue(queue, {
        durable: false
    });

    // Bind entre la queue et l'exchange
    await channel.bindQueue(queue, exchange, topicKey);

    // Bind entre le queue et l'exchange pour all 
    await channel.bindQueue(queue, exchange, topicKeyAll);
    
    // Assertion de la queue de résultat
    await channel.assertQueue(result_queue, {
        durable: false
    })

    console.log(`Worker prêt pour l'opération ${op}`);
    
    // Reception du message 
    channel.consume(queue, consume);
}

async function consume(message){
    if(message != null){
        
        // Récupération des opérands et du type d'opération
        const { index, n1, n2, op: operation } = JSON.parse(message.content.toString());

        // Mise en place du délai de calcul entre 5-15 secondes
        const delay = Math.floor(Math.random() * 11) + 5;
        console.log(`[${op}] Calcul numéro [${index}] en cours de traitement : (${n1} ${operation} ${n2}) | Attente: ${delay}s`);
        console.log('');
        await new Promise(res=> setTimeout(res, delay * 1000));

        // Switch case sur l'opération et calcul en fonction 
        let result;
        switch (op) {
            case 'add' : result = n1 + n2; break;
            case 'sub' : result = n1 - n2; break;
            case 'mul' : result = n1 * n2; break;
            case 'div' : result = n1 / n2; break;
        }

        // Initialisation du résultat 
        const resultJSON = { index, n1, n2, op, result };

        // Envoie du resultat à la queue sous forme de JSON
        channel.sendToQueue(result_queue, Buffer.from(JSON.stringify(resultJSON)));
        
        // On display le resultat en console puis on envoie un accusé de reception à la queue
        console.log(`[${op}] Résultat du calcul [${index}] envoyé: `, resultJSON);
        console.log('');
        channel.ack(message);
    }
}

askPassword(() => playWorker().catch(console.error));


















// const { fork } = require('child_process');

// const numWorkers = parseInt(process.argv[2]) || 4; // default: 4 workers

// for (let i = 0; i < numWorkers; i++) {
//     const worker = fork('./worker.js');
//     console.log(`Started worker #${i + 1} (PID: ${worker.pid})`);
// }
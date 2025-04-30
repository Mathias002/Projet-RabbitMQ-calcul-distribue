const ampqlib = require('amqplib');
const askPassword = require('../security');
require('dotenv').config();


const serverCredentials = process.env.SERVER_CREDENTIALS;

const rabbitmq_url = 'amqp://' + serverCredentials;
const result_queue = '002_calc_results';


let channel;

async function receiveResults() {

    // Connexion au serveur distant
    const connection = await ampqlib.connect(rabbitmq_url);
    
    // Creation du channel
    channel = await connection.createChannel();

    // Assertion sur l'existence de la queue
    await channel.assertQueue(result_queue, { 
        durable: false
    });

    // Reception du message 
    channel.consume(result_queue, consume);

    console.log('En attente de résultats...');
    console.log('');
}

function consume(message){
    if (message !== null) {
        const result = JSON.parse(message.content.toString());
        console.log(`Résultat du calcul [${result.index}] reçu :`, result.result);
        console.log('');
        channel.ack(message);
    }
}

askPassword(() => receiveResults().catch(console.error));
require('dotenv').config();

const ampqlib = require('amqplib');

const serverCredentials = process.env.SERVER_CREDENTIALS;

const rabbitmq_url = 'amqp://' + serverCredentials;
const queue = 'calc_results';


let channel;

async function receiveResults() {
    // Connection au serveur distant
    const connection = await ampqlib.connect(rabbitmq_url);
    
    // Creation du channel
    channel = await connection.createChannel();

    // Assertion sur l'existence de la queue
    await channel.assertQueue(queue, { durable: false });

    // Reception du message 
    channel.consume(queue, consume);

    console.log('En attente de résultats...');
}

function consume(message){
    if (message !== null) {
        const result = JSON.parse(message.content.toString());
        console.log('Résultat reçu :', result.result);
        channel.ack(message);
    }
}

receiveResults().catch(console.error);
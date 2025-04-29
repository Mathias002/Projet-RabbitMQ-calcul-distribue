const ampqlib = require('amqplib');
require('dotenv').config();


const serverCredentials = process.env.SERVER_CREDENTIALS;

const rabbitmq_url = 'amqp://' + serverCredentials;
const queue = '002_calc_results';


let channel;

async function receiveResults() {

    // Connexion au serveur distant
    const connection = await ampqlib.connect(rabbitmq_url);
    
    // Creation du channel
    channel = await connection.createChannel();

    // Assertion sur l'existence de la queue
    await channel.assertQueue(queue, { 
        durable: false
    });

    process.on('SIGINT', async () => {
        await channel.cancel(queue)
        await channel.deleteQueue(queue);
        console.log(`Le consumer a arrêter la lecture des résultats`);
        process.exit(0);
    })

    // Reception du message 
    channel.consume(queue, consume);

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

receiveResults().catch(console.error);
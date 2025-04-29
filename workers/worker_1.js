const amqlib = require('amqplib');

const rabbitmq_url = 'amqp://user:password@infoexpertise.hopto.org:5679'

// Récupération de l'op dans la comande du terminal 
// "add", "sub", "mul", "div"
const op = process.argv[2];

// Initialisation d'une queue selon l'opération reçu
const queue = `calc_${op}`;

// Vérification de l'opération dans les paramètres de la commande
if(!["add", "sub", "div", "mul"].includes(op)){
    console.log("Type d'opération non valide. Veuillez utiliser : add, sub, div, mul");
    process.exit(1);
}

async function playWorker(){

    // Connexion à rabbitmq
    const connection = await amqlib.connect(rabbitmq_url);

    // Création du channel
    const channel = await connection.createChannel();

    // Assertion de la queue requestQueue
    channel.assertQueue(queue, {
        durable: false
    });

    // Assertion de la queue resultQueue
    channel.assertQueue(resultQueue, {
        durable: false
    });

    console.log(`Worker prêt pour l'opération ${op}`);
    
    // Reception du message 
    channel.consume(requestQueue, consume);
}

async function consume(message){
    if(message != null){
        
        // Récupération des opérands et du type d'opération
        const { n1, n2, op: operation } = JSON.parse(message.content.toString());

        // Mise en place du délai de calcul entre 5-15 secondes
        const delay = Math.floor(Math.random() * 11) + 5;
        console.log(`[${op}] Calcul en cours de traitement : (${n1} ${operation} ${n2}) | Attente: ${delay}s`);
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
        const resultJSON = { n1, n2, op, result };

        // Envoie du resultat à la queue sous forme de JSON
        channel.sendToQueue('cals_results', Buffer.from(JSON.stringify(resultJSON)));
        
        // 
        console.log(`[${op}] Résultat envoyé: `, resultJSON);
        channel.ack(message);
    }
}

playWorker().catch(console.error);


















// const { fork } = require('child_process');

// const numWorkers = parseInt(process.argv[2]) || 4; // default: 4 workers

// for (let i = 0; i < numWorkers; i++) {
//     const worker = fork('./worker.js');
//     console.log(`Started worker #${i + 1} (PID: ${worker.pid})`);
// }
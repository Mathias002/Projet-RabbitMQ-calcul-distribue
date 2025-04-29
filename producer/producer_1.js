const ampqlib = require('amqplib');
require('dotenv').config();

// Amélioration possible 
// Permettre à un utilisateur d’envoyer une opération de son choix au système
// condition si process.argv != null ensuite check si op valable si oui en lance 

const serverCredentials = process.env.SERVER_CREDENTIALS;

const rabbitmq_url = 'amqp://' + serverCredentials;
const operations = ['add', 'sub', 'mul', 'div', 'all'];

// Ajout d'un index pour identifier l'opération
let index = 1;

async function send() {

  // Connexion à rabbitmq
  const connection = await ampqlib.connect(rabbitmq_url);

  // Création du channel
  const channel = await connection.createChannel();

  // Assertion sur l'existence de la queue
  for (const op of ['add', 'sub', 'mul', 'div']) {
    await channel.assertQueue(`002_calc_${op}`, { 
      durable: false,
      // expires: 10000,
      
      // Demander au prof pourquoi erreur ??
      // arguments: {
      //   "x-max-length": 1
      // }
    });
  }

  // Envoie un message toutes les 1 à 3 secondes(délai aléatoire)
  setInterval(async () => {

    // Génère deux nombres aléatoires
    const n1 = Math.floor(Math.random() * 100) + 1;
    const n2 = Math.floor(Math.random() * 100) + 1;

    // Sélectionne une opération au hasard
    const op = operations[Math.floor(Math.random() * operations.length)];

    console.log('Opération tirée au sort : ' + op);

    const msg = JSON.stringify({ index, n1, n2, op });

    // On incrémente l'index
    index ++;

    // Si l'opération est "all", envoie à toutes les queues
    if (op === 'all') {
      for (const target of ['add', 'sub', 'mul', 'div']) {
        channel.sendToQueue(`002_calc_${ target }`, Buffer.from(msg));
        console.log(`[ALL] Envoyé à ${ target }: ${ msg }`);
        console.log('');
      }
    } 
    // Sinon, envoie à la queue correspondant à l'opération déterminé aléatoirement
    else 
    {
      channel.sendToQueue(`002_calc_${ op }`, Buffer.from(msg));
      console.log(`[${ op.toUpperCase() }] Envoyé: ${ msg }`);
      console.log('');
    }
    // déjà console.log dans le if else
    // console.log('Envoyé:', msg); 
  }, Math.floor(Math.random() * 2000) + 1000);
}

send().catch(console.error);
const ampqlib = require('amqplib');
require('dotenv').config();

// Amélioration possible 
// Permettre à un utilisateur d’envoyer une opération de son choix au système
// condition si process.argv != null ensuite check si op valable si oui en lance 

const serverCredentials = process.env.SERVER_CREDENTIALS;

const rabbitmq_url = 'amqp://' + serverCredentials;
const operations = ['add', 'sub', 'mul', 'div', 'all'];
const exchange = '002_calc_ops';

// Ajout d'un index pour identifier l'opération
let index = 1;

async function send() {

  // Connexion à rabbitmq
  const connection = await ampqlib.connect(rabbitmq_url);

  // Création du channel
  const channel = await connection.createChannel();

  // Assertion de l'exchange
  await channel.assertExchange(exchange, 'topic', {
    durable: false
  })

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
    const topicKey = `calc.${op}`;
    channel.publish(exchange, topicKey, Buffer.from(msg))
    console.log(`[${ topicKey }] Envoyé: ${ msg }`);
    console.log('');


  }, Math.floor(Math.random() * 2000) + 1000);
}

send().catch(console.error);
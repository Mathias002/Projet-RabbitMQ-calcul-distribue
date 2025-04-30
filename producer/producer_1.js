const ampqlib = require('amqplib');
const askPassword = require('../security');
require('dotenv').config();

// Amélioration possible 
// Permettre à un utilisateur d’envoyer une opération de son choix au système
// condition si process.argv != null ensuite check si op valable si oui en lance 

const serverCredentials = process.env.SERVER_CREDENTIALS;
const password = process.env.PASSWORD;

const rabbitmq_url = 'amqp://' + serverCredentials;
const operations = ['add', 'sub', 'mul', 'div', 'all'];
const exchange = '002_calc_ops';

// Récupération de l'op dans la comande du terminal 
// "add", "sub", "mul", "div"
const op_arg = process.argv[2];

let n1_arg = null;
let n2_arg = null;

if (op_arg != null){
  if (process.argv[3] != null && process.argv[4] != null){
    n1_arg = process.argv[3];
    n2_arg = process.argv[4];
  }

}

// // Vérification de l'opération dans les paramètres de la commande
if (op_arg != null){
  if(!["add", "sub", "div", "mul", "all"].includes(op_arg)){
    console.log("Type d'opération non valide. Veuillez utiliser : add, sub, div, mul, all");
    process.exit(1);
  }
}

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

    let n1 = '';
    let n2 = '';

    if (n1_arg != null && n2_arg != null){
      n1 = n1_arg
      n2 = n2_arg
    }else{
      // Génère deux nombres aléatoires
      n1 = Math.floor(Math.random() * 100) + 1;
      n2 = Math.floor(Math.random() * 100) + 1;
    }
    

    let op = '';

    if (op_arg == null){
      // Sélectionne une opération au hasard
      op = operations[Math.floor(Math.random() * operations.length)];
    }else{
      op = op_arg;
    }


    console.log('Opération tirée au sort : ' + op);

    const msg = JSON.stringify({ index, n1, n2, op });

    // On incrémente l'index
    index ++;

    // Envoyer l'opération à l'exchange
    const topicKey = `calc.${op}`;
    channel.publish(exchange, topicKey, Buffer.from(msg))
    console.log(`[${ topicKey }] Envoyé: ${ msg }`);
    console.log('');


  }, Math.floor(Math.random() * 2000) + 1000);
}

askPassword(() => send().catch(console.error));
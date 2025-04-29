const ampqlib = require('amqplib');
require('dotenv').config();

const serverCredentials = process.env.SERVER_CREDENTIALS;

const rabbitmq_url = 'amqp://' + serverCredentials;
const queue = 'calc_requests';
const operations = ['add', 'sub', 'mul', 'div', 'all'];

async function send() {

  // Connect to rabbitmq
  const connection = await ampqlib.connect(rabbitmq_url);

  // Create channel
  const channel = await connection.createChannel();

  // Assertion sur l'existence de la queue
  for (const op of ['add', 'sub', 'mul', 'div']) {
    await channel.assertQueue(`calc_${op}`, { durable: false });
  }

  // Envoie un message toutes les 1 à 3 secondes(délai aléatoire)
  setInterval(async () => {
    // Génère deux nombres aléatoires
    const n1 = Math.floor(Math.random() * 100) + 1;
    const n2 = Math.floor(Math.random() * 100) + 1;

    // Sélectionne une opération au hasard
    const op = operations[Math.floor(Math.random() * operations.length)];

    const msg = JSON.stringify({ n1, n2, op });

    // Si l'opération est "all", envoie à toutes les queues
    if (op === 'all') {
      for (const target of ['add', 'sub', 'mul', 'div']) {
        channel.sendToQueue(`calc_${ target }`, Buffer.from(msg));
        console.log(`[ALL] Envoyé à ${ target }: ${ msg }`);
      }
    } else {
      // Sinon, envoie à la queue correspondant à l'opération choisie
      channel.sendToQueue(`calc_${ op }`, Buffer.from(msg));
      console.log(`[${ op.toUpperCase() }] Envoyé: ${ msg }`);
    }
    console.log('Envoyé:', msg);
  }, Math.floor(Math.random() * 2000) + 1000);
}

send().catch(console.error);
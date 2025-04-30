const readline = require('readline');
require('dotenv').config();

function askPassword(callback) {
  // Crée une interface readline pour lire l'entrée utilisateur
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  // Masque l'affichage du mot de passe
  rl.stdoutMuted = true;

  rl.question('Entrez le mot de passe : ', function (input) {
    rl.close();
    // Vérifie que le mot de passe saisi correspond à celui dans le fichier .env
    if (input === process.env.PASSWORD) {
      console.log('\n Accès autorisé.');
      callback(); // Lance le script si le mdp est correct
    } else {
      console.log('\n Mot de passe incorrect');
      process.exit(1); // Sinon arrête le programme
    }
  });

  // Masque l'affichage du mot de passe dans la console
  rl._writeToOutput = function (stringToWrite) {
    if (rl.stdoutMuted) rl.output.write('*');
    else rl.output.write(stringToWrite);
  };
}
module.exports = askPassword;
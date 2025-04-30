# Projet-RabbitMQ-calcul-distribue

# Système de Calcul Distribué avec RabbitMQ

## 📋 Sommaire
- [Présentation du projet](#présentation-du-projet)
- [Architecture du système](#architecture-du-système)
- [Prérequis](#prérequis)
- [Mise en place](#mise-en-place)
- [Utilisation](#utilisation)
- [Fonctionnalités implémentées](#fonctionnalités-implémentées)
- [Explication du code](#explication-du-code)
- [Améliorations possibles](#améliorations-possibles)

## 📝 Présentation du projet

Ce projet répond à une demande de l'institut de physique nucléaire NGI qui souhaite mettre en place un système de calcul distribué pour effectuer des opérations mathématiques complexes. Notre solution utilise RabbitMQ comme middleware de messagerie pour distribuer les tâches de calcul entre différents workers spécialisés.

Le système permet :
- L'envoi de requêtes de calcul automatisées
- La distribution des tâches à des workers spécialisés via des exchanges
- L'exécution des calculs (addition, soustraction, multiplication, division)
- La récupération et l'affichage des résultats

## 🏗️ Architecture du système

Schéma de notre architecture RabbitMQ disponible à cette adresse : 
[Schéma gitmind](https://gitmind.com/app/docs/feycer5d)

Notre système est composé de trois types de composants principaux :

1. **Producer** : Génère des requêtes de calcul aléatoires et les envoie à RabbitMQ
2. **Workers** : Effectuent les calculs demandés selon leur spécialité (add, sub, mul, div)
3. **Consumer** : Récupère les résultats des calculs et les affiche

Le tout orchestré par un serveur RabbitMQ qui gère les files d'attente et la distribution des messages.

## 🔧 Prérequis

- Node.js (v14 ou supérieur)
- Accès à un serveur RabbitMQ (local, Docker ou distant)
- Les dépendances Node.js suivantes :
  - amqplib
  - dotenv

## 🚀 Mise en place

### 1. Cloner le dépôt

```bash
git clone Mathias002/Projet-RabbitMQ-calcul-distribue
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration

Créez un fichier `.env` à la racine du projet avec vos informations de connexion à RabbitMQ :

```
SERVER_CREDENTIALS=username:password@hostname:port/vhost
PASSWORD=monmotdepasse
```

### 4. Lancer les composants

Ouvrez plusieurs terminaux pour lancer chaque composant :

**Consumer (réception des résultats)**
```bash
node consumer/consumer_1.js
```

**Workers (un terminal par worker)**
```bash
# Worker pour l'addition
node workers/worker_1.js add

# Worker pour la soustraction
node workers/worker_1.js sub

# Worker pour la multiplication
node workers/worker_1.js mul

# Worker pour la division
node workers/worker_1.js div
```

**Producer (génération des calculs)**
```bash
# Provider avec calcul et valeurs aléatoires
node producer/producer_1.js

# Provider avec valeurs aléatoires (le calcul peut être 'div', 'sub', 'add', 'mul' ou 'all')
node producer/producer_1.js add

# Provider avec calcul et valeurs prédéfinis
node producer/producer_1.js add 2 4
```


## 💡 Utilisation

Une fois le système en place et tous les composants démarrés :

1. Le producer va automatiquement générer des requêtes de calcul et les envoyer aux workers appropriés.
2. Les workers vont traiter les calculs (avec un délai aléatoire de 5 à 15 secondes pour simuler un calcul complexe).
3. Le consumer va afficher les résultats des calculs au fur et à mesure qu'ils sont disponibles.

Pour arrêter chaque composant, utilisez `Ctrl+C` dans le terminal correspondant.

## ✨ Fonctionnalités implémentées

### Fonctionnalités de base
- ✅ Génération automatique d'opérandes et envoi de requêtes
- ✅ Traitement des calculs par les workers avec simulation de délai
- ✅ Affichage des résultats par le consumer

### Améliorations du projet 1
- ✅ Spécialisation des workers par type d'opération (add, sub, mul, div)
- ✅ Génération aléatoire du type d'opération

### Améliorations du projet 2
- ✅ Support de l'opération "all" envoyant la même requête à tous les workers
- ✅ Génération aléatoire incluant l'opération "all"

### Autres améliorations
- ✅ Indexation des opérations pour un suivi plus facile
- ✅ Délai aléatoire entre les envois de requêtes (1-3 secondes)
- ✅ Authentification par mot de passe pour accéder au producer, aux workers et au consumer

### Choix de calcul et des valeurs
- ✅ Choix du type de calcul (add, mul, div, sub, all)
- ✅ Choix des deux valeurs pour l'opération  
Ces deux choix sont à faire dans les arguments du provider (voir lancement des composants ci-dessus)

## 📚 Explication du code

### producer_1.js

Le producer est responsable de la génération des requêtes de calcul :

- Il se connecte au serveur RabbitMQ
- Il crée un exchange de type "topic" nommé '002_calc_ops'
- Il génère des requêtes à intervalles aléatoires (1-3 secondes)
- Il sélectionne aléatoirement une opération (add, sub, mul, div, all)
- Il publie la requête sur l'exchange avec une clé de routage appropriée (calc.add, calc.sub, etc.)

Points clés :
- L'utilisation d'un exchange de type "topic" permet un routage plus flexible des messages
- Chaque requête contient un index unique pour faciliter le suivi
- Le format des messages est JSON pour une manipulation plus simple
- Les clés de routage suivent le format `calc.{opération}` 
- L'opération "all" utilise la clé de routage `calc.all`

### worker_1.js

Les workers sont spécialisés par type d'opération :

- Un worker est lancé avec un paramètre indiquant son type (add, sub, mul, div)

- Il se connecte au serveur RabbitMQ et configure :
  - L'exchange de type "topic" 
  - Une queue spécifique pour son type d'opération
  - Des liaisons (bindings) entre sa queue et l'exchange pour:
    - Sa propre opération (calc.add, calc.sub, etc.)
    - L'opération "all" (calc.all)

- Quand il reçoit une requête, il :
  - Simule un temps de calcul (5-15 secondes)
  - Effectue l'opération demandée
  - Envoie le résultat dans la queue des résultats
  - Acquitte le message pour informer RabbitMQ que le traitement est terminé

Points clés :

- L'architecture topic permet au worker de s'abonner à plusieurs types de messages
- Chaque worker crée sa propre queue avec un nom basé sur son type d'opération
- Les workers écoutent à la fois les messages spécifiques à leur opération et les messages "all"
- Le délai de calcul aléatoire simule des opérations complexes
- Les résultats conservent toutes les informations de la requête originale

### consumer_1.js

Le consumer est chargé de récupérer et d'afficher les résultats :

- Il se connecte au serveur RabbitMQ
- Il s'assure de l'existence de la queue des résultats ('002_calc_results')
- Il écoute sur cette queue pour recevoir les résultats des calculs
- Quand il reçoit un résultat, il l'affiche dans la console
- Il acquitte le message pour informer RabbitMQ que le résultat a été traité

Points clés :
- Objectif simple, il se contente d'afficher les résultats
- L'index permet de suivre facilement la correspondance avec les requêtes
- Toutes les opérations envoient leurs résultats à la même queue, centralisant ainsi la collecte des résultats

### security.js

Ce module gère l’authentification par mot de passe avant d’exécuter un composant (producer, worker ou consumer) :

- Utilise le module readline pour lire l'entrée utilisateur de manière sécurisée
- Masque le mot de passe saisi dans la console
- Vérifie si le mot de passe correspond à celui défini dans .env (PASSWORD)
- Si la validation est réussie, la fonction callback est appelée (lancement du script)
- Sinon, le processus est arrêté

Exemple de variable à ajouter dans le fichier .env:
```
PASSWORD=monmotdepasse
```

## 🔍 Améliorations possibles

Voici quelques pistes d'amélioration pour le projet :

1. **Interface utilisateur** : Développer une interface web pour visualiser les requêtes et résultats
2. **Persistance des données** : Stocker les résultats dans une base de données
3. **Équilibrage de charge** : Optimiser la distribution des tâches en fonction de la charge des workers
4. **Calculs complexes** : Ajouter des opérations mathématiques plus sophistiquées (puissance, racine, etc.)
5. **Interface d'administration** : Mettre en place un tableau de bord pour surveiller l'état du système
6. **Tolérance aux pannes** : Implémenter des mécanismes de récupération en cas de défaillance d'un worker
7. **Tests automatisés** : Mettre en place des tests unitaires et d'intégration

## 👥 Contributeurs

- [Ludovic Marie]
- [Valérie Song]
- [Mathias Mousset]


Nous vous souhaitons une bonne correction

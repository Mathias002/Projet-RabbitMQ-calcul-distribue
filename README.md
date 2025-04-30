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
- La distribution des tâches à des workers spécialisés
- L'exécution des calculs (addition, soustraction, multiplication, division)
- La récupération et l'affichage des résultats

[IMAGE: Schéma général présentant l'objectif du projet - une architecture distribuée avec des clients envoyant des requêtes et recevant des résultats via RabbitMQ]

## 🏗️ Architecture du système

Notre système est composé de trois types de composants principaux :

1. **Producer** : Génère des requêtes de calcul aléatoires et les envoie à RabbitMQ
2. **Workers** : Effectuent les calculs demandés selon leur spécialité (add, sub, mul, div)
3. **Consumer** : Récupère les résultats des calculs et les affiche

Le tout orchestré par un serveur RabbitMQ qui gère les files d'attente et la distribution des messages.

```
┌─────────────┐     ┌───────────────────────────────────────┐     ┌─────────────┐
│             │     │              RabbitMQ                 │     │             │
│  Producer   ├────►│                                       │◄────┤  Consumer   │
│             │     │  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐   │     │             │
└─────────────┘     │  │ add │  │ sub │  │ mul │  │ div │   │     └─────────────┘
                    │  └──┬──┘  └──┬──┘  └──┬──┘  └──┬──┘   │
                    │     │        │        │        │      │
                    └─────┼────────┼────────┼────────┼──────┘
                          ▼        ▼        ▼        ▼
                    ┌─────┴──┐  ┌──┴────┐  ┌┴─────┐  ┌┴─────┐
                    │ Worker │  │Worker │  │Worker│  │Worker│
                    │ (add)  │  │(sub)  │  │(mul) │  │(div) │
                    └────────┘  └───────┘  └──────┘  └──────┘
```

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
```

Exemple avec un serveur local :
```
SERVER_CREDENTIALS=guest:guest@localhost:5672
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
node producer/producer_1.js
```

## 💡 Utilisation

Une fois le système en place et tous les composants démarrés :

1. Le producer va automatiquement générer des requêtes de calcul et les envoyer aux workers appropriés.
2. Les workers vont traiter les calculs (avec un délai aléatoire de 5 à 15 secondes pour simuler un calcul complexe).
3. Le consumer va afficher les résultats des calculs au fur et à mesure qu'ils sont disponibles.

Pour arrêter proprement chaque composant, utilisez `Ctrl+C` dans le terminal correspondant.

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
- ✅ Gestion propre de l'arrêt des composants (nettoyage des queues)

## 📚 Explication du code

### producer_1.js

Le producer est responsable de la génération des requêtes de calcul :

- Il se connecte au serveur RabbitMQ
- Il vérifie l'existence des queues pour chaque type d'opération
- Il génère des requêtes à intervalles aléatoires (1-3 secondes)
- Il sélectionne aléatoirement une opération (add, sub, mul, div, all)
- Il envoie la requête à la queue appropriée, ou à toutes les queues dans le cas de l'opération "all"

Points clés :
- Chaque requête contient un index unique pour faciliter le suivi
- Le format des messages est JSON pour une manipulation facile
- Les opérations "all" sont distribuées à tous les workers simultanément

### worker_1.js

Les workers sont spécialisés par type d'opération :

- Un worker est lancé avec un paramètre indiquant son type (add, sub, mul, div)
- Il se connecte au serveur RabbitMQ et écoute sur la queue correspondant à son type
- Quand il reçoit une requête, il :
  - Simule un temps de calcul (5-15 secondes)
  - Effectue l'opération demandée
  - Envoie le résultat dans la queue des résultats
  - Acquitte le message pour informer RabbitMQ que le traitement est terminé

Points clés :
- Chaque worker ne traite que les messages de sa spécialité
- Le délai de calcul aléatoire simule des opérations complexes
- Les résultats conservent toutes les informations de la requête originale

### consumer_1.js

Le consumer est chargé de récupérer et d'afficher les résultats :

- Il se connecte au serveur RabbitMQ
- Il écoute sur la queue des résultats
- Quand il reçoit un résultat, il l'affiche dans la console
- Il acquitte le message pour informer RabbitMQ que le résultat a été traité

Points clés :
- Simple et efficace, il se contente d'afficher les résultats
- L'index permet de suivre facilement la correspondance avec les requêtes

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

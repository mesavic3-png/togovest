# TOGOVEST — Pré-production

## 1. Base de données
- Créer PostgreSQL de production.
- Définir `DATABASE_URL` dans l'hébergeur, jamais dans Git.
- Exécuter `prisma generate` puis la migration/synchronisation validée du schéma.
- Créer un compte ADMIN explicitement et changer tout mot de passe temporaire.

## 2. Authentification
- Définir `NEXTAUTH_URL=https://togovest.com`.
- Générer un `NEXTAUTH_SECRET` long et aléatoire.
- Tester inscription, connexion, déconnexion et contrôle des rôles.

## 3. Médias
- Créer le bucket S3/R2 de production.
- Définir les variables `S3_*`.
- Restreindre CORS à `https://togovest.com` et aux domaines de preview réellement nécessaires.
- Tester upload, affichage et suppression/expiration des médias.

## 4. Paiements
### Stripe
- Commencer en mode test.
- Configurer produits/prix PRO et AGENCY.
- Configurer le webhook production vers `/api/billing/webhook`.
- Tester succès, échec, annulation et renouvellement.

### Mobile Money
- Obtenir les identifiants marchands de production uniquement après validation sandbox.
- Configurer le callback vers `/api/billing/mobile/webhook`.
- Tester MIXX/Moov disponibles dans le compte marchand.
- Vérifier que l'activation n'arrive qu'après revalidation serveur du paiement.

## 5. Sécurité
- Aucun secret réel dans le dépôt.
- HTTPS obligatoire.
- Vérifier toutes les routes admin et propriétaires avec un compte non privilégié.
- Ajouter rate limiting/WAF au niveau de l'hébergeur pour login, inscription, uploads et paiements.
- Vérifier les limites de taille/type des uploads et la politique du bucket.
- Journaliser les événements de paiement sans stocker de données carte ou secrets.

## 6. Qualité
- CI GitHub verte : install, Prisma generate, TypeScript, Next build.
- Tester mobile et desktop.
- Tester publication → modération → publication → contact → favori → paiement.
- Remplacer toutes les statistiques et annonces de démonstration non vérifiées.

## 7. Déploiement
- Déployer d'abord un environnement preview/staging.
- Connecter le domaine seulement après validation staging.
- Activer sauvegardes PostgreSQL et monitoring.
- Prévoir rollback et export régulier des données.

## Critère GO
Ne passer en production que lorsque CI/build, base, auth, médias et paiements sandbox sont tous validés, sans secret exposé et avec un parcours utilisateur complet testé.

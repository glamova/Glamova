# Glamova — boutique prête à publier

Le site comprend une page d’accueil responsive, les catégories, le catalogue, la recherche, les fiches produits, le panier, le seuil de livraison offerte à 80 €, WhatsApp, Instagram, TikTok et un paiement Stripe sécurisé.

## Mise en ligne (Netlify)

1. Créer gratuitement un compte GitHub et y déposer ce dossier dans un dépôt privé.
2. Créer un compte Netlify, puis choisir **Add new site → Import an existing project** et sélectionner le dépôt.
3. Dans Netlify, activer **Identity**, puis **Git Gateway**. Inviter uniquement votre propre adresse e-mail.
4. Le Studio est ensuite accessible à l’adresse `https://votre-site.netlify.app/admin/`. Il permet d’ajouter photos, produits, prix, tailles et liens sociaux depuis le téléphone ou l’ordinateur.
5. Dans Stripe, créer un produit et son prix. Copier l’identifiant commençant par `price_` dans le produit correspondant du Studio Glamova.
6. Dans Netlify, ouvrir **Site configuration → Environment variables** et ajouter :
   - `STRIPE_SECRET_KEY` : la clé secrète Stripe (commence par `sk_`)
   - `PUBLIC_SITE_URL` : l’adresse finale du site, sans slash final
7. Remplacer le numéro WhatsApp et les liens sociaux dans le Studio.

## Important avant d’encaisser

- Compléter les CGV, mentions légales, politique de confidentialité et procédure de retour avec les informations réelles de l’entreprise.
- Configurer dans Stripe les moyens de paiement souhaités et tester une commande en mode test.
- Le port standard est fixé à 4,90 € et devient automatiquement gratuit dès 80 € de produits dans le panier. Vous pouvez modifier ces montants dans `netlify/functions/create-checkout.js`.

## Test local rapide

Lancer un serveur statique dans le dossier (`python3 -m http.server 4173`) puis ouvrir `http://localhost:4173`. Le catalogue et le panier fonctionnent ; le paiement nécessite Netlify et Stripe.

# 💎 Laky Accessoires — Boutique e-commerce

Plateforme e-commerce full-stack pour **Laky Accessoires**, une marque algérienne de bijoux et d'accessoires.
Les clients commandent en **paiement à la livraison**, sans créer de compte, et suivent leur commande avec leur numéro de téléphone.

## ✨ Fonctionnalités

**Boutique**
- Accueil, catégories, fiches produit et recherche
- Panier et commande en paiement à la livraison (nom, téléphone, wilaya, adresse)
- Suivi de commande par numéro de téléphone
- Prix en dinars algériens (DA)

**Back-office (`/admin`)**
- Tableau de bord : chiffre d'affaires, commandes, statistiques
- Gestion des produits (photos multiples), des catégories et des commandes
- Statuts : En attente → Confirmée → Expédiée → Livrée / Annulée / Retournée
- Clients, analytique, notifications de nouvelles commandes, paramètres de la boutique
- Connexion admin protégée par session

## 🛠️ Stack

Next.js (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Prisma · PostgreSQL (Supabase) · Supabase Storage · iron-session

## 🚀 Lancer le projet

```bash
npm install
cp .env.example .env      # renseigner la base Supabase et les identifiants admin
npx prisma migrate deploy
npm run dev               # http://localhost:3000
```

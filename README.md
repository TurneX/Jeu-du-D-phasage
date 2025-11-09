# 🌌 Déphasage

Un jeu d'adresse minimaliste et frénétique sur le thème de l'espace, développé en HTML, CSS et JavaScript pur.

<img width="1919" height="911" alt="déphasage" src="https://github.com/user-attachments/assets/2abe520d-c545-4632-86e1-4b6293af3608" />

> Vous ne contrôlez pas le vaisseau. Vous contrôlez sa **phase**.
> Changez la couleur de votre vaisseau (Bleu 🔵 ou Violet 🟣) pour correspondre aux murs d'énergie qui foncent sur vous. Touchez la mauvaise couleur, et c'est la fin du voyage !

Vous pouvez allez le tester sur mon site : https://portfolio-turnex.gamer.gd/
---

## ✨ Fonctionnalités

* **Gameplay Addictif :** Simple à apprendre, difficile à maîtriser.
* **Difficulté Progressive :** La vitesse du jeu augmente constamment, rendant chaque partie plus intense.
* **Classement Local :** Entrez votre pseudo et enregistrez vos meilleurs scores ! Le jeu sauvegarde votre record personnel et l'affiche dans un classement global (sauvegardé dans le navigateur).
* **Ambiance Sci-Fi Néon :** Arrière-plan spatial animé (nébuleuse), interface holographique et effets de particules.
* **Audio Immersif :** Inclut un son d'ambiance de vaisseau, des effets sonores pour le changement de phase, le score et le game over.
* **Bouton Mute :** Un bouton pour couper et réactiver tous les sons du jeu.

---

## 🎮 Comment Jouer

1.  **Entrez votre pseudo :** Saisissez un pseudo dans le champ de texte.
2.  **Démarrer :** Appuyez sur **[Espace]** ou **Cliquez** pour démarrer la partie.
3.  **Jouer :** Appuyez sur **[Espace]** ou **Cliquez** à nouveau pour changer de phase (de bleu à violet et vice-versa).
4.  **Survivre :** Assurez-vous que votre vaisseau a la même couleur que le mur d'énergie que vous allez traverser.

---

## 💻 Technologies Utilisées

* **HTML5**
    * Structure sémantique
    * Élément `<canvas>` pour le rendu du jeu
* **CSS3**
    * Mise en page (Flexbox)
    * Styling de l'interface (thème néon/hologramme)
    * Animations (`@keyframes` pour le fond, les pulsations, etc.)
* **JavaScript (ES6+)**
    * Logique du jeu (boucle `requestAnimationFrame`, détection de collisions)
    * Rendu sur le `<canvas>`
    * API Web Audio (pour les sons générés en direct)
    * `localStorage` (pour la sauvegarde du classement et du highscore)

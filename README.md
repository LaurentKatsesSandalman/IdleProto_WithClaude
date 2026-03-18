# IdleProto — bac à sable Claude Code

Ce projet sert à deux choses en parallèle :

1. **Apprendre à utiliser Claude Code** — explorer la collaboration humain/IA sur un vrai projet, tester les workflows, affiner la façon de formuler les prompts.
2. **Prototyper des formules d'idle game** — avoir un terrain de jeu fonctionnel pour tester des mécaniques (formules de prestige, courbes de prix, équilibre) sans que l'équilibrage soit un objectif en soi.

## L'application

Un idle game minimaliste :
- On achète des générateurs qui produisent de la currency automatiquement
- Les générateurs sont organisés par rangs, chaque rang débloquant le suivant
- Un système de prestige (reset) applique un multiplicateur de production permanent
- Plusieurs formules de prestige coexistent dans le code et sont interchangeables via une constante

Le jeu **n'est pas équilibré** — c'est intentionnel. Les constantes (`INFLATION`, `USURE`, `RANK_MULTIPLIER`…) sont exposées dans `src/game/constants.ts` pour être modifiées facilement.

## Stack

- Vite + React 19 + TypeScript
- [break_infinity.js](https://github.com/Patashu/break_infinity.js) pour les grands nombres

## Branches

- `dev` — branche de travail
- `main` — déploiement automatique vers GitHub Pages à chaque merge

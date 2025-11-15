# Configuration i18n pour les articles de blog

## Structure

Chaque fichier markdown doit inclure dans son frontmatter :
- `locale: 'fr'` ou `locale: 'en'` pour spécifier la langue
- `slug: 'mon-article'` (optionnel) pour un slug personnalisé indépendant du nom de fichier

## Exemple

```markdown
---
title: Mon article
description: Description de mon article
date: 2025-01-28
image: https://example.com/image.jpg
minRead: 5
locale: 'fr'
slug: 'mon-article-francais'
author:
  name: Nom Auteur
  avatar:
    src: https://example.com/avatar.jpg
    alt: Nom Auteur
---
```

## Notes

- Les articles sont filtrés automatiquement selon la locale active
- Les slugs sont construits selon la locale : `/blog/mon-article` (fr) ou `/en/blog/mon-article` (en)
- Le formatDate utilise automatiquement la locale (`fr-FR` ou `en-US`)


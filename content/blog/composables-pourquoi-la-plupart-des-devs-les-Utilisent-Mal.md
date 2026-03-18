---
title: "Composables : Pourquoi la Plupart des Devs les Utilisent Mal (Et Comment les Maîtriser Réellement)"
author:
  name: Massimo Russo
date: 2026-01-20T00:00:00.000Z
locale: fr
minRead: 5
audience: dev
navigation:
  title: "Composables: Pourquoi la Plupart des Devs les Utilisent Mal"
seo:
  title: "Composables: Pourquoi la Plupart des Devs les Utilisent Mal"
  description: ""
slug: composables-pourquoi-la-plupart-des-devs-les-Utilisent-Mal
---

## Le Piège Invisible

Tu as appris les Composition API. Tu as lu la doc. Tu as même migré quelques composants. Et pourtant, tu utilises les composables comme tu utilisais les mixins il y a 5 ans : sans vraiment comprendre pourquoi.

Le résultat ? Des composables que tu partages entre 2 fichiers, mais qui restent pleins d'effets de bord. Des partages de données qui se cachent sous une couche d'abstraction. De la prop drilling déguisée en composable.

Voilà le truc : **les composables ne sont pas juste une syntaxe plus propre pour partager du code. C'est une philosophie architecturale qui force à penser différemment.**

Et 90% des devs la ratent.

---

## Le Problème Réel : Pas de Modèle Mental

Avant les Composition API, tu avais un choix binaire : props ou state global.

Props ? Ça scalait mal. Prop drilling jusqu'à l'infini.

State global ? Tu mettais tout dans Vuex et tu créais un monolithe impossible à déboguer.

Les composables, eux, offrent une troisième voie. Mais seulement si tu comprends ce qu'ils sont **réellement**.

Un composable, c'est pas :

- Une fonction magique qui partage du state
- Un helper pour éviter d'écrire des props
- Une meilleure syntaxe pour du code partagé

**Un composable, c'est une capsule de logique métier réutilisable, isolée, testable.**

La différence ? Énorme.

---

## Les 3 Erreurs Qui Te Tuent

### Erreur #1 : Mettre N'Importe Quoi Dans un Composable

Tu vois ce pattern constamment :

```javascript
// ❌ Ceci n'est PAS un composable
const useFetchWithCaching = () => {
  const cache = ref({});
  const data = ref(null);
  const loading = ref(false);

  const fetchData = async (url) => {
    if (cache.value[url]) {
      data.value = cache.value[url];
      return;
    }
    loading.value = true;
    const res = await fetch(url);
    data.value = await res.json();
    cache.value[url] = data.value;
    loading.value = false;
  };

  return { data, loading, fetchData };
};
```

C'est du code partagé. C'est pas un composable. Pourquoi ?

**Effets de bord cachés** : Le cache est global à ce composable. Si tu utilises ce composable dans 2 composants différents, ils partagent le même cache. C'est une bombe à retardement.

**Responsabilités mélangées** : Fetch, caching, state... c'est 3 trucs distincts. Mais tu les as fusionnés.

**Pas testable en isolation** : Comment tu testes le caching sans monter un composant ? Comment tu testes le fetch sans le cache ?

### Comment Corriger

Sépare les responsabilités :

```javascript
// ✅ Composables isolés, chacun avec une responsabilité
const useCache = () => {
  const cache = ref({});

  return {
    get: (key) => cache.value[key],
    set: (key, value) => { cache.value[key] = value; },
    has: (key) => key in cache.value
  };
};

const useFetch = (url) => {
  const data = ref(null);
  const loading = ref(false);
  const error = ref(null);

  const fetch = async () => {
    loading.value = true;
    try {
      const res = await fetch(url);
      data.value = await res.json();
    } catch (e) {
      error.value = e;
    } finally {
      loading.value = false;
    }
  };

  onMounted(fetch);

  return { data, loading, error, fetch };
};

// Dans le composant, tu composes les deux
const useSmartFetch = (url) => {
  const cache = useCache();
  const fetch = useFetch(url);

  if (cache.has(url)) {
    fetch.data.value = cache.get(url);
  } else {
    watch(() => fetch.data.value, (newData) => {
      if (newData) cache.set(url, newData);
    });
  }

  return { ...fetch };
};
```

Maintenant, tu peux :

- Tester `useCache` indépendamment
- Tester `useFetch` indépendamment
- Comprendre exactement quels effets de bord il y a
- Réutiliser `useCache` ailleurs sans crainte

C'est ça, la vraie composition.

### Erreur #2 : Garder de la Logique Métier dans les Composants

Voilà un anti-pattern qu'on voit BEAUCOUP :

```javascript
// ❌ Logique métier dans le composant
<template>
  <div>
    <input v-model="email" />
    <input v-model="password" />
    <button @click="handleLogin">Login</button>
  </div>
</template>

<script setup>
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref(null);

const handleLogin = async () => {
  if (!email.value.includes('@')) {
    error.value = 'Invalid email';
    return;
  }

  if (password.value.length < 8) {
    error.value = 'Password too short';
    return;
  }

  loading.value = true;
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email: email.value, password: password.value })
    });
    if (!res.ok) throw new Error('Login failed');
    // redirect ou update store
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
};
</script>
```

C'est un cauchemar à tester. Tu veux tester la validation ? Tu dois monter le composant. Tu veux tester le fetch ? Encore le composant. Tu veux réutiliser la logique ailleurs ? Copie-colle.

### Comment Corriger

Extrais TOUTE la logique métier :

```javascript
// ✅ Logique métier dans un composable
const useLogin = () => {
  const email = ref('');
  const password = ref('');
  const loading = ref(false);
  const error = ref(null);

  const validateEmail = () => email.value.includes('@');
  const validatePassword = () => password.value.length >= 8;

  const login = async () => {
    error.value = null;

    if (!validateEmail()) {
      error.value = 'Invalid email';
      return false;
    }

    if (!validatePassword()) {
      error.value = 'Password too short';
      return false;
    }

    loading.value = true;
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.value, password: password.value })
      });
      if (!res.ok) throw new Error('Login failed');
      return true;
    } catch (e) {
      error.value = e.message;
      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    email,
    password,
    loading,
    error,
    validateEmail,
    validatePassword,
    login
  };
};

// Le composant devient JUSTE une UI
<template>
  <div>
    <input v-model="email" />
    <input v-model="password" />
    <p v-if="error" class="error">{{ error }}</p>
    <button @click="login" :disabled="loading">
      {{ loading ? 'Logging in...' : 'Login' }}
    </button>
  </div>
</template>

<script setup>
const { email, password, loading, error, login } = useLogin();
</script>
```

Maintenant :

- Tu testes `useLogin` sans composant
- Tu peux réutiliser `useLogin` dans un formulaire, un dialog, un API client
- Le composant devient simple et évident
- Les bugs sont plus faciles à localiser

### Erreur #3 : Croire Que les Composables Remplacent le State Management

Voilà une croyance dangereuse : "Avec les composables, j'ai plus besoin de Pinia!"

Faux.

Les composables et Pinia font deux choses différentes.

**Composables** : Logique réutilisable, comportement, logique métier. Scope : local au composant ou à quelques composants.

**Pinia** : Source unique de vérité pour l'état applicatif. Scope : global, persistable, observable across the app.

Exemple :

```javascript
// ✅ Bon séparation des préoccupations

// useLogin c'est de la logique métier locale
const useLogin = () => {
  const email = ref('');
  const password = ref('');
  // ... validation, fetch
  return { email, password, login };
};

// useAuth c'est l'état global
const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const isAuthenticated = computed(() => !!user.value);

  const setUser = (newUser) => { user.value = newUser; };

  return { user, isAuthenticated, setUser };
});

// Dans le composant, tu utilises les deux
const LoginComponent = {
  setup() {
    const { email, password, login } = useLogin();
    const authStore = useAuthStore();

    const handleLogin = async () => {
      if (await login()) {
        // Fetch successful, maintenant update le state global
        const userData = await fetchUserProfile();
        authStore.setUser(userData);
      }
    };

    return { email, password, handleLogin };
  }
};
```

Le composable c'est "comment on se login". Le store c'est "qui est logué".

---

## Le Modèle Mental Correct

Pour maîtriser les composables, tu dois intégrer ce modèle :

### 1. **Un Composable = Une Responsabilité Unique**

```javascript
// ✅ Bon : chaque composable fait une chose
const useFormValidation = () => { /* ... */ };
const useFetch = (url) => { /* ... */ };
const useDebounce = (value, delay) => { /* ... */ };
const useLocalStorage = (key) => { /* ... */ };
```

### 2. **Zéro Effet de Bord Surpris**

```javascript
// ❌ Mauvais : effet de bord caché
const useUser = () => {
  const user = ref(null);

  // Ce fetch s'exécute à chaque call du composable
  // Et tu ne le vois pas
  fetch('/api/user').then(r => r.json()).then(u => user.value = u);

  return { user };
};

// ✅ Bon : effet de bord explicite
const useUser = () => {
  const user = ref(null);

  const fetchUser = async () => {
    const res = await fetch('/api/user');
    user.value = await res.json();
  };

  // C'est au composant de décider quand fetchUser s'exécute
  onMounted(fetchUser);

  return { user, fetchUser };
};
```

### 3. **Composition Over Inheritance**

```javascript
// ❌ Pas de "super composable"
const useSuperComposable = () => {
  const { data, loading } = useFetch(url);
  const { cache } = useCache();
  const { validation } = useValidation();
  // ... 20 autres trucs
  return { data, loading, cache, validation, ... };
};

// ✅ Bon : compose les petits trucs dans le composant
const MyComponent = {
  setup() {
    const fetch = useFetch(url);
    const cache = useCache();
    const validation = useValidation();

    // Logique pour combiner les trois
    if (cache.has(url)) {
      fetch.data.value = cache.get(url);
    }

    return { fetch, cache, validation };
  }
};
```

---

## Trade-offs Réels des Composables

Avant de conclure, soyons honnêtes sur les arbitrages :

### Avantages

✅ Modularité réelle
✅ Réutilisabilité sans copie-colle
✅ Testabilité en isolation
✅ Composition flexible
✅ Tree-shakeable (meilleur bundle)

### Inconvénients

❌ Plus de "boilerplate" mental (tu dois bien structurer)
❌ Debugging plus complexe (plus de couches)
❌ Courbe d'apprentissage (besoin de comprendre la composition)
❌ Peut devenir trop abstrait si mal utilisé

---

## Ton Checklist : Est-Ce Que Ton Composable Est Bon ?

Avant de partager un composable, pose-toi :

1. **Une seule responsabilité ?** Si tu peux décrire le composable en une phrase sans "et", c'est bon.
2. **Testable sans composant ?** Peux-tu appeler le composable et tester ses retours sans monter un composant ?
3. **Zéro effet de bord caché ?** Tous les side effects (fetch, mutation externe, etc.) sont explicites ?
4. **Réellement réutilisable ?** Vas-tu l'utiliser dans au moins 2 endroits différents ? Ou c'est juste du refactoring pour le style ?
5. **Meilleur que les alternatives ?** Est-ce que c'est mieux qu'une prop, qu'un store global, ou qu'une fonction simple ?

Si tu réponds "oui" aux 5, c'est un bon composable.

---

## Et Maintenant ?

Les composables sont la fondation de l'architecture Vue moderne. Mais seulement si tu comprends qu'ils ne sont pas une solution magique.

C'est un outil qui force la clarté si tu l'utilises bien.

La prochaine fois que tu écris un composable, demande-toi : "Est-ce que je crée vraiment une capsule de logique réutilisable et testable ? Ou est-ce que je juste partage du code pour éviter la prop drilling ?"

Si c'est la deuxième réponse, tu fais pas des composables. Tu fais du refactoring cosmétique.

---

*Les vraies architectes ne maîtrisent pas les composables. Ils comprennent pourquoi les composables existent.*

---

---

---
title: "Composables: Why Most Devs Use Them Wrong (And How to Actually Master Them)"
author:
  name: Massimo Russo
date: 2026-01-20T00:00:00.000Z
locale: en
minRead: 5
audience: dev
seo:
  title:
    Composables: Why Most Devs Use Them Wrong (And How to Actually Master Them)
    author:
      name: Massimo Russo
      to: ""
    date: 2026-01-20T00:00:00.000Z
    image: /blog/blog-1.webp
    locale: fr
    minRead: 5
    navigation:
      title:
        Composables: Why Most Devs Use Them Wrong (And How to Actually Master Them)
    slug:
      composables-why-most-devs-use-them-wrong
  description: ""
---

## The Invisible Trap

You learned Composition API. You read the docs. You even migrated a few components. And yet, you're using composables the way you used mixins 5 years ago: without really understanding why.

The result? Composables you share between 2 files, but still full of side effects. Data sharing hidden under a layer of abstraction. Prop drilling disguised as a composable.

Here's the thing: **composables aren't just cleaner syntax for sharing code. They're an architectural philosophy that forces you to think differently.**

And 90% of devs miss it.

---

## The Real Problem: No Mental Model

Before Composition API, you had a binary choice: props or global state.

Props? Didn't scale. Prop drilling forever.

Global state? Everything went into Vuex and you created an unmaintainable monolith.

Composables offer a third way. But only if you understand what they **actually are**.

A composable is not:

- Magic function to share state
- Helper to avoid writing props
- Better syntax for shared code

**A composable is a reusable, isolated, testable capsule of business logic.**

The difference? Huge.

---

## The 3 Mistakes That Kill You

### Mistake #1: Putting Everything Into a Composable

You see this pattern constantly:

```javascript
// ❌ This is NOT a composable
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

It's shared code. Not a composable. Why?

**Hidden side effects**: The cache is global to this composable. If you use it in 2 different components, they share the same cache. Time bomb.

**Mixed responsibilities**: Fetch, caching, state... that's 3 distinct things. But you merged them.

**Not testable in isolation**: How do you test caching without mounting a component? How do you test fetch without cache?

### How to Fix It

Separate concerns:

```javascript
// ✅ Isolated composables, each with one job
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

// In the component, you compose the two
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

Now you can:

- Test `useCache` independently
- Test `useFetch` independently
- Understand exactly what side effects exist
- Reuse `useCache` elsewhere without fear

That's real composition.

### Mistake #2: Keeping Business Logic in Components

Here's an anti-pattern we see A LOT:

```javascript
// ❌ Business logic in the component
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
    // redirect or update store
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
};
</script>
```

It's a nightmare to test. Want to test validation? Mount the component. Want to test fetch? Mount it again. Want to reuse the logic? Copy-paste.

### How to Fix It

Extract ALL business logic:

```javascript
// ✅ Business logic in a composable
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

// The component is JUST UI
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

Now:

- You test `useLogin` without a component
- You can reuse `useLogin` in a form, dialog, API client
- The component is simple and obvious
- Bugs are easier to locate

### Mistake #3: Thinking Composables Replace State Management

Here's a dangerous belief: "With composables, I don't need Pinia anymore!"

Wrong.

Composables and Pinia do different things.

**Composables**: Reusable logic, behavior, business logic. Scope: local to a component or few components.

**Pinia**: Single source of truth for application state. Scope: global, persistent, observable across the app.

Example:

```javascript
// ✅ Good separation of concerns

// useLogin is local business logic
const useLogin = () => {
  const email = ref('');
  const password = ref('');
  // ... validation, fetch
  return { email, password, login };
};

// useAuthStore is global state
const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const isAuthenticated = computed(() => !!user.value);

  const setUser = (newUser) => { user.value = newUser; };

  return { user, isAuthenticated, setUser };
});

// In the component, you use both
const LoginComponent = {
  setup() {
    const { email, password, login } = useLogin();
    const authStore = useAuthStore();

    const handleLogin = async () => {
      if (await login()) {
        // Fetch successful, now update global state
        const userData = await fetchUserProfile();
        authStore.setUser(userData);
      }
    };

    return { email, password, handleLogin };
  }
};
```

The composable is "how we login". The store is "who is logged in".

---

## The Correct Mental Model

To master composables, integrate this model:

### 1. **One Composable = One Responsibility**

```javascript
// ✅ Good: each composable does one thing
const useFormValidation = () => { /* ... */ };
const useFetch = (url) => { /* ... */ };
const useDebounce = (value, delay) => { /* ... */ };
const useLocalStorage = (key) => { /* ... */ };
```

### 2. **Zero Surprising Side Effects**

```javascript
// ❌ Bad: hidden side effect
const useUser = () => {
  const user = ref(null);

  // This fetch executes every time the composable is called
  // And you don't see it
  fetch('/api/user').then(r => r.json()).then(u => user.value = u);

  return { user };
};

// ✅ Good: explicit side effect
const useUser = () => {
  const user = ref(null);

  const fetchUser = async () => {
    const res = await fetch('/api/user');
    user.value = await res.json();
  };

  // It's up to the component when fetchUser executes
  onMounted(fetchUser);

  return { user, fetchUser };
};
```

### 3. **Composition Over Inheritance**

```javascript
// ❌ No "super composable"
const useSuperComposable = () => {
  const { data, loading } = useFetch(url);
  const { cache } = useCache();
  const { validation } = useValidation();
  // ... 20 other things
  return { data, loading, cache, validation, ... };
};

// ✅ Good: compose small things in the component
const MyComponent = {
  setup() {
    const fetch = useFetch(url);
    const cache = useCache();
    const validation = useValidation();

    // Logic to combine the three
    if (cache.has(url)) {
      fetch.data.value = cache.get(url);
    }

    return { fetch, cache, validation };
  }
};
```

---

## Real Trade-offs of Composables

Before we wrap up, let's be honest about the arbitrages:

### Advantages

✅ Real modularity
✅ Reusability without copy-paste
✅ Testability in isolation
✅ Flexible composition
✅ Tree-shakeable (better bundle)

### Disadvantages

❌ More mental "boilerplate" (you have to structure well)
❌ More complex debugging (more layers)
❌ Learning curve (need to understand composition)
❌ Can become over-abstracted if misused

---

## Your Checklist: Is Your Composable Good?

Before sharing a composable, ask yourself:

1. **Single responsibility?** If you can describe the composable in one sentence without "and", you're good.
2. **Testable without a component?** Can you call the composable and test its returns without mounting a component?
3. **Zero hidden side effects?** All side effects (fetch, external mutation, etc.) are explicit?
4. **Actually reusable?** Will you use it in at least 2 different places? Or is it just refactoring for style?
5. **Better than alternatives?** Is it better than a prop, global store, or simple function?

If you answer "yes" to all 5, it's a good composable.

---

## And Now?

Composables are the foundation of modern Vue architecture. But only if you understand they're not magic.

It's a tool that forces clarity if you use it right.

Next time you write a composable, ask yourself: "Am I really creating a reusable, testable capsule of logic? Or am I just sharing code to avoid prop drilling?"

If it's the second answer, you're not making composables. You're doing cosmetic refactoring.

---

*Real architects don't master composables. They understand why composables exist.*

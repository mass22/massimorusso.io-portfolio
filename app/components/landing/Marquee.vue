<script setup lang="ts">
export type MarqueeItem = {
  name: string
  src: string
  url?: string
}

withDefaults(defineProps<{
  items: MarqueeItem[]
  /**
   * Durée en secondes pour un cycle complet du défilement.
   * Plus la valeur est élevée, plus le défilement est lent.
   */
  speed?: number
}>(), {
  speed: 35
})
</script>

<template>
  <div
    v-if="items && items.length > 0"
    class="marquee-wrapper"
    role="region"
    aria-label="Logos clients"
  >
    <div
      class="marquee-track"
      :style="`--speed: ${speed}s`"
    >
      <!-- Groupe original : accessible aux lecteurs d'écran -->
      <ul class="marquee-group">
        <li
          v-for="item in items"
          :key="item.name"
          class="marquee-item"
        >
          <ULink
            v-if="item.url"
            :to="item.url"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="item.name"
            class="marquee-link"
          >
            <NuxtImg
              :src="item.src"
              :alt="item.name"
              height="40"
              format="webp"
              quality="80"
              loading="lazy"
              class="marquee-logo"
            />
          </ULink>

          <span
            v-else
            class="marquee-link"
          >
            <NuxtImg
              :src="item.src"
              :alt="item.name"
              height="40"
              format="webp"
              quality="80"
              loading="lazy"
              class="marquee-logo"
            />
          </span>
        </li>
      </ul>

      <!-- Groupe dupliqué : invisible aux technologies d'assistance -->
      <ul
        class="marquee-group"
        aria-hidden="true"
      >
        <li
          v-for="item in items"
          :key="`dup-${item.name}`"
          class="marquee-item"
        >
          <ULink
            v-if="item.url"
            :to="item.url"
            target="_blank"
            rel="noopener noreferrer"
            tabindex="-1"
            class="marquee-link"
          >
            <NuxtImg
              :src="item.src"
              alt=""
              height="40"
              format="webp"
              quality="80"
              loading="lazy"
              class="marquee-logo"
            />
          </ULink>

          <span
            v-else
            class="marquee-link"
          >
            <NuxtImg
              :src="item.src"
              alt=""
              height="40"
              format="webp"
              quality="80"
              loading="lazy"
              class="marquee-logo"
            />
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
/* ─── Wrapper ─── */
/* Overflow caché + fondu sur les bords via mask-image */
.marquee-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
  padding-block: 0.75rem;
  mask-image: linear-gradient(
    to right,
    transparent,
    black 8%,
    black 92%,
    transparent
  );
  -webkit-mask-image: linear-gradient(
    to right,
    transparent,
    black 8%,
    black 92%,
    transparent
  );
}

/* ─── Track animé ─── */
/* Les deux groupes sont côte à côte ; on anime de 0 → -50% */
.marquee-track {
  display: flex;
  width: max-content;
  will-change: transform;
  animation: marquee var(--speed, 35s) linear infinite;
}

/* Pause au survol de la zone entière */
.marquee-track:hover {
  animation-play-state: paused;
}

/* ─── Groupe d'items ─── */
.marquee-group {
  display: flex;
  align-items: center;
  gap: 3.5rem;
  padding-inline: 1.75rem;
  list-style: none;
  margin: 0;
  padding-block: 0;
  flex-shrink: 0;
}

/* ─── Item individuel ─── */
.marquee-item {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

/* ─── Lien/wrapper ─── */
.marquee-link {
  display: flex;
  align-items: center;
  outline-offset: 4px;
}

/* ─── Logo ─── */
/* Noir et blanc + légère opacité par défaut */
.marquee-logo {
  height: 2.25rem;
  width: auto;
  object-fit: contain;
  filter: grayscale(100%) opacity(50%);
  transition: filter 0.35s ease-out;
  display: block;
}

/* Couleur restaurée au survol de l'item parent */
.marquee-item:hover .marquee-logo {
  filter: grayscale(0%) opacity(100%);
}

/* ─── Keyframe ─── */
/* Défilement de 0 à -50% = exactement un groupe */
@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

/* ─── Accessibilité : prefers-reduced-motion ─── */
/* Si l'utilisateur préfère moins de mouvement : grille statique */
@media (prefers-reduced-motion: reduce) {
  .marquee-track {
    animation: none;
    flex-wrap: wrap;
    width: 100%;
    justify-content: center;
  }

  /* Masquer le doublon qui n'a plus de raison d'être */
  .marquee-group:last-child {
    display: none;
  }

  .marquee-group {
    flex-wrap: wrap;
    justify-content: center;
    gap: 2rem;
  }
}

/* ─── Mobile ─── */
@media (max-width: 640px) {
  .marquee-group {
    gap: 2.5rem;
    padding-inline: 1.25rem;
  }

  .marquee-logo {
    height: 1.75rem;
  }
}
</style>

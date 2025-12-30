export type Locale = 'fr' | 'en'

/**
 * Détecte la locale à partir du navigateur (SSR-safe)
 */
export function detectLocale(): Locale {
  if (typeof window === 'undefined' || !navigator?.language) {
    return 'en'
  }
  return navigator.language.startsWith('fr') ? 'fr' : 'en'
}

/**
 * Récupère la locale stockée dans localStorage (SSR-safe)
 */
export function getStoredLocale(): Locale | null {
  if (typeof window === 'undefined' || !localStorage) {
    return null
  }
  try {
    const stored = localStorage.getItem('chatbot-locale')
    if (stored === 'fr' || stored === 'en') {
      return stored
    }
  } catch (error) {
    // localStorage peut être indisponible (mode privé, etc.)
    console.warn('[i18n] Impossible d\'accéder à localStorage:', error)
  }
  return null
}

/**
 * Stocke la locale dans localStorage (SSR-safe)
 */
export function setStoredLocale(locale: Locale): void {
  if (typeof window === 'undefined' || !localStorage) {
    return
  }
  try {
    localStorage.setItem('chatbot-locale', locale)
  } catch (error) {
    // localStorage peut être indisponible (mode privé, etc.)
    console.warn('[i18n] Impossible d\'écrire dans localStorage:', error)
  }
}

/**
 * Obtient la locale initiale : stockée si présente, sinon détectée
 */
export function getInitialLocale(): Locale {
  const stored = getStoredLocale()
  return stored || detectLocale()
}

/**
 * Obtient la locale du site web depuis @nuxtjs/i18n ou la route
 * Cette fonction doit être appelée dans le contexte d'un composant Vue
 * @returns 'fr' si la locale est 'fr', sinon 'en'
 */
export function getWebsiteLocale(): Locale {
  // Essayer d'utiliser useI18n() si disponible
  if (typeof useI18n === 'function') {
    try {
      const { locale } = useI18n()
      if (locale && locale.value) {
        return locale.value === 'fr' ? 'fr' : 'en'
      }
    } catch {
      // useI18n n'est pas disponible, continuer avec la détection de route
    }
  }

  // Fallback : détecter depuis le préfixe de route
  if (typeof useRoute === 'function') {
    try {
      const route = useRoute()
      if (route && route.path) {
        // Si la route commence par /fr, c'est français
        if (route.path.startsWith('/fr')) {
          return 'fr'
        }
      }
    } catch {
      // useRoute n'est pas disponible
    }
  }

  // Par défaut, anglais
  return 'en'
}

/**
 * Dictionnaires de traduction
 */
const translations: Record<Locale, Record<string, string>> = {
  fr: {
    // Widget header
    'widget.title': 'Besoin d\'aide ?',
    'widget.subtitle': 'Posez vos questions et je vous guiderai',
    'widget.openChat': 'Ouvrir le chat',
    'widget.restart': 'Recommencer',
    'widget.close': 'Fermer',
    'widget.chatAssistance': 'Chat d\'assistance',

    // Success message
    'success.title': 'Merci !',
    'success.message': 'Votre demande a été envoyée avec succès. Je vous contacterai très bientôt.',

    // Form labels
    'form.name.label': 'Nom (optionnel)',
    'form.name.placeholder': 'Votre nom',
    'form.email.label': 'Email',
    'form.email.placeholder': 'votre@email.com',
    'form.email.required': 'L\'email est requis',
    'form.email.invalid': 'Veuillez entrer un email valide',
    'form.consent.label': 'J\'accepte que mes données soient utilisées pour me contacter concernant ma demande.',
    'form.consent.error': 'Vous devez accepter le consentement pour continuer',
    'form.submit': 'Envoyer',
    'form.submitting': 'Envoi en cours...',
    'form.error.generic': 'Une erreur est survenue. Veuillez réessayer.',

    // Qualification badges
    'qualification.level.high': 'Match élevé',
    'qualification.level.medium': 'Match moyen',
    'qualification.level.low': 'Match faible',
    'qualification.recommendation': 'Recommandation :',
    'qualification.offer.audit': 'Audit',
    'qualification.offer.coaching': 'Coaching',
    'qualification.offer.mission': 'Mission',

    // Form summary
    'form.summary.title': 'Résumé de votre demande'
  },
  en: {
    // Widget header
    'widget.title': 'Need help?',
    'widget.subtitle': 'Ask your questions and I\'ll guide you',
    'widget.openChat': 'Open chat',
    'widget.restart': 'Restart',
    'widget.close': 'Close',
    'widget.chatAssistance': 'Chat assistance',

    // Success message
    'success.title': 'Thank you!',
    'success.message': 'Your request has been sent successfully. I\'ll contact you very soon.',

    // Form labels
    'form.name.label': 'Name (optional)',
    'form.name.placeholder': 'Your name',
    'form.email.label': 'Email',
    'form.email.placeholder': 'your@email.com',
    'form.email.required': 'Email is required',
    'form.email.invalid': 'Please enter a valid email',
    'form.consent.label': 'I accept that my data will be used to contact me regarding my request.',
    'form.consent.error': 'You must accept the consent to continue',
    'form.submit': 'Send',
    'form.submitting': 'Sending...',
    'form.error.generic': 'An error occurred. Please try again.',

    // Qualification badges
    'qualification.level.high': 'High match',
    'qualification.level.medium': 'Medium match',
    'qualification.level.low': 'Low match',
    'qualification.recommendation': 'Recommendation:',
    'qualification.offer.audit': 'Audit',
    'qualification.offer.coaching': 'Coaching',
    'qualification.offer.mission': 'Mission',

    // Form summary
    'form.summary.title': 'Summary of your request'
  }
}

/**
 * Fonction de traduction avec interpolation de paramètres
 * @param locale La locale à utiliser
 * @param key La clé de traduction
 * @param params Paramètres optionnels pour l'interpolation (ex: { name: "John" } pour remplacer {{name}})
 * @returns La chaîne traduite avec les paramètres interpolés
 */
export function t(locale: Locale, key: string, params?: Record<string, string | number>): string {
  const dict = translations[locale] || translations.en
  let text = dict[key] || key

  // Interpolation de paramètres : {{param}}
  if (params) {
    for (const [paramKey, paramValue] of Object.entries(params)) {
      const placeholder = `{{${paramKey}}}`
      text = text.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), String(paramValue))
    }
  }

  return text
}

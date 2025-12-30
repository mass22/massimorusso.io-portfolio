import type { LeadContext } from '~/types/content'

/**
 * Formate une valeur pour l'affichage dans le résumé
 */
function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return 'Non renseigné'
  }

  if (typeof value === 'boolean') {
    return value ? 'Oui' : 'Non'
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return 'Aucune sélection'
    }
    return value.map((v) => formatValue(v)).join(', ')
  }

  if (typeof value === 'string' && value.trim() === '') {
    return 'Non renseigné'
  }

  return String(value)
}

/**
 * Formate une date ISO en format français lisible
 */
function formatDate(dateString: string | undefined): string {
  if (!dateString) {
    return 'Date non disponible'
  }

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return 'Date invalide'
    }

    return date.toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Montreal'
    })
  } catch {
    return 'Date invalide'
  }
}

/**
 * Formate les métadonnées pour l'affichage
 */
function formatMetadata(metadata: LeadContext['metadata']): string[] {
  const lines: string[] = []

  if (!metadata) {
    return lines
  }

  if (metadata.timestamp) {
    lines.push(`Timestamp: ${formatDate(metadata.timestamp)}`)
  }

  if (metadata.referrer) {
    lines.push(`Référent: ${metadata.referrer}`)
  }

  if (metadata.userAgent) {
    // Simplifier le user agent pour l'affichage
    const ua = metadata.userAgent
    const browserMatch = ua.match(/(Chrome|Firefox|Safari|Edge|Opera)\/[\d.]+/)
    const osMatch = ua.match(/(Windows|Mac|Linux|iOS|Android)/)

    if (browserMatch || osMatch) {
      const parts: string[] = []
      if (browserMatch) parts.push(browserMatch[0])
      if (osMatch) parts.push(osMatch[1])
      lines.push(`Navigateur/Système: ${parts.join(' - ')}`)
    } else {
      lines.push(`User Agent: ${ua.substring(0, 100)}${ua.length > 100 ? '...' : ''}`)
    }
  }

  return lines
}

/**
 * Convertit un LeadContext en un résumé multi-lignes lisible en français
 * Gère gracieusement les champs manquants
 */
export function leadSummary(context: LeadContext): string {
  const lines: string[] = []

  // En-tête
  lines.push('='.repeat(60))
  lines.push('RÉSUMÉ DU LEAD')
  lines.push('='.repeat(60))
  lines.push('')

  // Informations générales
  lines.push('📋 INFORMATIONS GÉNÉRALES')
  lines.push('-'.repeat(60))
  lines.push(`Date de complétion: ${formatDate(context.completedAt)}`)
  lines.push(`Nombre d'étapes complétées: ${context.stepCount || 0}`)
  lines.push('')

  // Réponses du formulaire
  const answers = context.answers || {}
  const answerKeys = Object.keys(answers)

  if (answerKeys.length > 0) {
    lines.push('📝 RÉPONSES DU FORMULAIRE')
    lines.push('-'.repeat(60))

    answerKeys.forEach((key) => {
      const value = answers[key]
      const formattedValue = formatValue(value)

      // Formater la clé pour l'affichage (remplacer les underscores par des espaces, capitaliser)
      const formattedKey = key
        .split(/[-_]/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')

      lines.push(`${formattedKey}: ${formattedValue}`)
    })

    lines.push('')
  } else {
    lines.push('📝 RÉPONSES DU FORMULAIRE')
    lines.push('-'.repeat(60))
    lines.push('Aucune réponse enregistrée')
    lines.push('')
  }

  // Métadonnées
  if (context.metadata) {
    const metadataLines = formatMetadata(context.metadata)
    if (metadataLines.length > 0) {
      lines.push('🔍 MÉTADONNÉES')
      lines.push('-'.repeat(60))
      metadataLines.forEach((line) => lines.push(line))
      lines.push('')
    }
  }

  // Pied de page
  lines.push('='.repeat(60))
  lines.push(`Généré le ${formatDate(new Date().toISOString())}`)
  lines.push('='.repeat(60))

  return lines.join('\n')
}

/**
 * Convertit un LeadContext en un résumé HTML formaté
 */
export function leadSummaryHtml(context: LeadContext): string {
  const lines: string[] = []

  lines.push('<div class="lead-summary">')
  lines.push('<h2>Résumé du Lead</h2>')

  // Informations générales
  lines.push('<section class="lead-section">')
  lines.push('<h3>📋 Informations générales</h3>')
  lines.push('<ul>')
  lines.push(`<li><strong>Date de complétion:</strong> ${formatDate(context.completedAt)}</li>`)
  lines.push(`<li><strong>Nombre d'étapes complétées:</strong> ${context.stepCount || 0}</li>`)
  lines.push('</ul>')
  lines.push('</section>')

  // Réponses
  const answers = context.answers || {}
  const answerKeys = Object.keys(answers)

  if (answerKeys.length > 0) {
    lines.push('<section class="lead-section">')
    lines.push('<h3>📝 Réponses du formulaire</h3>')
    lines.push('<ul>')

    answerKeys.forEach((key) => {
      const value = answers[key]
      const formattedValue = formatValue(value)
      const formattedKey = key
        .split(/[-_]/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')

      lines.push(`<li><strong>${formattedKey}:</strong> ${formattedValue}</li>`)
    })

    lines.push('</ul>')
    lines.push('</section>')
  }

  // Métadonnées
  if (context.metadata) {
    const metadataLines = formatMetadata(context.metadata)
    if (metadataLines.length > 0) {
      lines.push('<section class="lead-section">')
      lines.push('<h3>🔍 Métadonnées</h3>')
      lines.push('<ul>')
      metadataLines.forEach((line) => {
        const [label, ...valueParts] = line.split(': ')
        const value = valueParts.join(': ')
        lines.push(`<li><strong>${label}:</strong> ${value}</li>`)
      })
      lines.push('</ul>')
      lines.push('</section>')
    }
  }

  lines.push('</div>')

  return lines.join('\n')
}


import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import LeadCaptureForm from '~/app/components/chatbot/LeadCaptureForm.vue'
import type { LeadContext } from '~/types/content'
import type { QualificationResult } from '~/app/components/chatbot/qualification'

const mockFetch = vi.fn()
;(globalThis as any).$fetch = mockFetch

vi.mock('~/app/components/chatbot/i18n', () => ({
  t: (locale: string, key: string) => `[${locale}]${key}`
}))

const defaultQualification: QualificationResult = {
  score: 75,
  level: 'high',
  reasons: ['service_architecture_frontend', 'goal_performance'],
  recommendedOffer: 'audit'
}

const defaultContext: LeadContext = {
  answers: {
    service: 'architecture-frontend',
    goal: 'performances',
    teamSize: '4-10'
  },
  completedAt: '2024-01-15T10:00:00.000Z',
  stepCount: 5
}

describe('LeadCaptureForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createWrapper = (props = {}) => {
    return mount(LeadCaptureForm, {
      props: {
        qualification: defaultQualification,
        context: defaultContext,
        locale: 'fr',
        ...props
      },
      global: {
        stubs: {
          UInput: {
            template: '<input :type="type || \'text\'" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" data-test="input" />',
            props: ['modelValue', 'type', 'placeholder', 'error']
          },
          UCheckbox: {
            template: '<label><input type="checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" data-test="checkbox" /><slot /></label>',
            props: ['modelValue']
          },
          UButton: {
            template: '<button type="submit" :disabled="disabled" @click="$emit(\'click\')" data-test="submit"><slot /></button>',
            props: ['disabled', 'loading', 'color', 'block']
          }
        }
      }
    })
  }

  it('devrait afficher le badge de niveau de qualification', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('[fr]qualification.level.high')
  })

  it('devrait avoir le bouton submit désactivé sans email et consentement', async () => {
    const wrapper = createWrapper()
    const submitBtn = wrapper.find('[data-test="submit"]')
    expect(submitBtn.attributes('disabled')).toBeDefined()
  })

  it('devrait activer le bouton submit avec email valide et consentement', async () => {
    const wrapper = createWrapper()
    const emailInput = wrapper.find('input[type="email"], input[id="email"], [data-test="input"]')
    const consentInput = wrapper.find('[data-test="checkbox"]')

    await emailInput.setValue('test@example.com')
    await consentInput.setValue(true)

    const submitBtn = wrapper.find('[data-test="submit"]')
    expect(submitBtn.attributes('disabled')).toBeFalsy()
  })

  it('devrait appeler l\'API et émettre success à la soumission réussie', async () => {
    mockFetch.mockResolvedValue({ id: 1 })

    const wrapper = createWrapper()
    await wrapper.find('input[type="email"]').setValue('valid@test.com')
    await wrapper.find('[data-test="checkbox"]').setValue(true)
    await wrapper.find('form').trigger('submit')

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(mockFetch).toHaveBeenCalledWith('/api/leads', {
      method: 'POST',
      body: expect.objectContaining({
        email: 'valid@test.com',
        consent: true,
        qualification: defaultQualification,
        context: defaultContext,
        locale: 'fr'
      })
    })
    expect(wrapper.emitted('success')).toBeTruthy()
  })

  it('devrait afficher une erreur si l\'email est invalide', async () => {
    const wrapper = createWrapper()
    await wrapper.find('input[type="email"]').setValue('invalid-email')
    await wrapper.find('[data-test="checkbox"]').setValue(true)
    await wrapper.find('form').trigger('submit')

    await wrapper.vm.$nextTick()

    expect(mockFetch).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('[fr]form.email.invalid')
  })

  it('devrait afficher une erreur si le consentement est manquant', async () => {
    const wrapper = createWrapper()
    await wrapper.find('input[type="email"]').setValue('valid@test.com')
    // consent reste false
    await wrapper.find('form').trigger('submit')

    await wrapper.vm.$nextTick()

    expect(mockFetch).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('[fr]form.consent.error')
  })

  it('devrait afficher une erreur lors d\'un échec de l\'API', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockFetch.mockRejectedValue({ data: { message: 'Erreur serveur' } })

    const wrapper = createWrapper()
    await wrapper.find('input[type="email"]').setValue('valid@test.com')
    await wrapper.find('[data-test="checkbox"]').setValue(true)
    await wrapper.find('form').trigger('submit')

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(wrapper.text()).toContain('Erreur serveur')
    consoleSpy.mockRestore()
  })
})

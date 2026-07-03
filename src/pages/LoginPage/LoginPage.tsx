import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type AnimationEvent, type FormEvent, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import backHeaderIcon from '../../assets/iconsDraftaco/backHeader.svg'
import iconApple from '../../assets/iconsDraftaco/iconApple.svg'
import iconBiometria from '../../assets/iconsDraftaco/iconBiometria.svg'
import iconCPF from '../../assets/iconsDraftaco/iconCPF.svg'
import iconEmail from '../../assets/iconsDraftaco/iconEmail.svg'
import iconError from '../../assets/iconsDraftaco/iconError.svg'
import iconEye from '../../assets/iconsDraftaco/iconEye.svg'
import iconEyeHide from '../../assets/iconsDraftaco/iconEyeHide.svg'
import iconGoogle from '../../assets/iconsDraftaco/iconGoogle.svg'
import iconClock from '../../assets/iconsDraftaco/iconClock.svg'
import iconLimiteJogoDiario from '../../assets/iconsDraftaco/iconLimiteJogoDiario.svg'
import iconLimitePerdaDiario from '../../assets/iconsDraftaco/iconLimitePerdaDiario.svg'
import iconPass from '../../assets/iconsDraftaco/iconPass.svg'
import iconSuporte from '../../assets/iconsDraftaco/iconSuporte.svg'
import glowGarantidaCadastro01 from '../../assets/iconsDraftaco/glowGarantidaCadastro01.png'
import glowGarantidaCadastro02 from '../../assets/iconsDraftaco/glowGarantidaCadastro02.png'
import imgLewandowskiPromo from '../../assets/iconsDraftaco/imgLewandowskiPromo.png'
import imgVerificaIdentidadeBorda from '../../assets/iconsDraftaco/imgVerificaIdentidadeBorda.png'
import imgVerificaIdentidadeLogo from '../../assets/iconsDraftaco/imgVerificaIdentidadeLogo.png'
import logoUnico from '../../assets/iconsDraftaco/logoUnico.png'
import flagBrasil from '../../assets/iconPaises/brasil.png'
import { BottomSheet } from '../../components/BottomSheet'
import {
  PROMO_COUNTDOWN_TICK_MS,
  formatPromoCountdownSegment,
  getGarantidaPromoDeadline,
  getPromoCountdownParts,
  type PromoCountdownParts,
} from '../../utils/garantidaPromoCountdown'
import './LoginPage.css'

type AuthMode = 'login' | 'signup'
type LoginMotionState = 'entering' | 'open' | 'exiting'
type LoginSubmitMethod = 'email' | 'google' | 'apple'
type SignupStep = 'account' | 'personal' | 'address' | 'verification'
type SignupStepMotionPhase = 'idle' | 'entering' | 'exiting'
type SignupLoadingAction = 'personal' | 'phone-validation' | 'address' | 'verification-start' | 'limits-save' | 'custom-limit'
type AddressLookupStatus = 'idle' | 'loading' | 'success' | 'error'
type VerificationStage = 'intro' | 'document-front' | 'document-back' | 'face' | 'loading' | 'limits'
type VerificationCaptureStage = Extract<VerificationStage, 'document-front' | 'document-back' | 'face'>
type VerificationCameraStatus = 'idle' | 'loading' | 'ready' | 'unavailable'
type LimitCustomSheetType = 'time' | 'loss'

interface LoginPageProps {
  mode?: AuthMode
  motionState?: LoginMotionState
  onBack?: () => void
  onCreateAccountClick?: () => void
  onDepositOpen?: () => void
  onEnterComplete?: () => void
  onLoginClick?: () => void
  onLoginSuccess?: () => void
  showSignupGarantidaBanner?: boolean
}

interface LoginInputProps {
  id: string
  label: string
  icon?: string
  placeholder: string
  value: string
  type?: 'email' | 'text' | 'password' | 'tel'
  autoComplete?: string
  errorMessage?: string
  inputMode?: 'email' | 'numeric' | 'tel' | 'text'
  isInvalid?: boolean
  maxLength?: number
  readOnly?: boolean
  trailingAction?: ReactNode
  onBlur?: () => void
  onChange: (value: string) => void
  onFocus?: () => void
}

interface RegionSelectProps {
  id: string
  label: string
  placeholder: string
  value: string
  isOpen: boolean
  onOpen: () => void
}

interface PrimaryButtonProps {
  children: ReactNode
  disabled?: boolean
  isLoading?: boolean
  onClick?: () => void
  type?: 'button' | 'submit'
}

interface ViaCepResponse {
  erro?: boolean
  bairro?: string
  localidade?: string
  logradouro?: string
  uf?: string
}

const loginEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const loginEmailErrorMessage = 'E-mail inválido'
const cpfIncompleteErrorMessage = 'CPF incompleto'
const phoneIncompleteErrorMessage = 'Celular incompleto'
const signupSteps: SignupStep[] = ['account', 'personal', 'address']
const phoneValidationCodeLength = 6
const phoneValidationCountdownStart = 30
const primaryButtonLoadingDurationMs = 1500
const authSubmitLoadingDurationMs = primaryButtonLoadingDurationMs
const loginPageMotionDurationMs = 320
const signupStepExitDurationMs = 140
const signupStepEnterDurationMs = 220
const verificationLoadingDurationMs = 1500
const verificationFadeDurationMs = 180
const mobileCameraMediaQuery = '(hover: none) and (pointer: coarse)'
const verificationCaptureScreens: Record<VerificationCaptureStage, {
  title: string
  eyebrow: string
  cameraFacingMode: 'environment' | 'user'
  ariaLabel: string
}> = {
  'document-front': {
    title: 'Frente do documento',
    eyebrow: 'Centralize seu documento na moldura',
    cameraFacingMode: 'environment',
    ariaLabel: 'Capturar frente do documento',
  },
  'document-back': {
    title: 'Verso do documento',
    eyebrow: 'Centralize seu documento na moldura',
    cameraFacingMode: 'environment',
    ariaLabel: 'Capturar verso do documento',
  },
  face: {
    title: 'Verificação facial',
    eyebrow: 'Centralize seu rosto na moldura',
    cameraFacingMode: 'user',
    ariaLabel: 'Validar rosto',
  },
}
const verificationNextStageByCapture: Record<VerificationCaptureStage, VerificationStage> = {
  'document-front': 'document-back',
  'document-back': 'face',
  face: 'limits',
}
const verificationCameraErrorMessageByName: Record<string, string> = {
  NotAllowedError: 'Libere a câmera nas configurações do navegador.',
  NotFoundError: 'Não foi possível encontrar uma câmera compatível neste dispositivo.',
  OverconstrainedError: 'Não foi possível encontrar uma câmera compatível neste dispositivo.',
  SecurityError: 'Abra o app em HTTPS para ativar a câmera no celular.',
}
const gameTimeLimitOptions = ['1 hora', '2 horas', '5 horas', '12 horas', '24 horas', 'Outro']
const lossLimitOptions = ['R$ 1.000', 'R$ 10.000', 'R$ 100.000', 'R$ 1.000.000', 'Outro']
const customLimitOption = 'Outro'
const brazilRegionOptions = [
  'Acre',
  'Alagoas',
  'Amapa',
  'Amazonas',
  'Bahía',
  'Ceara',
  'Distrito Federal',
  'Espirito Santo',
  'Goias',
  'Maranhao',
  'Mato Grosso',
  'Mato Grosso do Sul',
  'Minas Gerais',
  'Para',
  'Paraiba',
  'Paraná',
  'Pernambuco',
  'Piaui',
  'Río de Janeiro',
  'Río Grande do Norte',
  'Río Grande do Sul',
  'Rondonia',
  'Roraima',
  'Santa Catarina',
  'São Paulo',
  'Sergipe',
  'Tocantins',
]
const brazilRegionByUf: Record<string, string> = {
  AC: 'Acre',
  AL: 'Alagoas',
  AP: 'Amapa',
  AM: 'Amazonas',
  BA: 'Bahía',
  CE: 'Ceara',
  DF: 'Distrito Federal',
  ES: 'Espirito Santo',
  GO: 'Goias',
  MA: 'Maranhao',
  MT: 'Mato Grosso',
  MS: 'Mato Grosso do Sul',
  MG: 'Minas Gerais',
  PA: 'Para',
  PB: 'Paraiba',
  PR: 'Paraná',
  PE: 'Pernambuco',
  PI: 'Piaui',
  RJ: 'Río de Janeiro',
  RN: 'Río Grande do Norte',
  RS: 'Río Grande do Sul',
  RO: 'Rondonia',
  RR: 'Roraima',
  SC: 'Santa Catarina',
  SP: 'São Paulo',
  SE: 'Sergipe',
  TO: 'Tocantins',
}

const onlyDigits = (value: string) => value.replace(/\D/g, '')

const formatCurrencyLimitInput = (value: string) => {
  const digits = onlyDigits(value).slice(0, 12)

  if (!digits) return ''

  return (Number(digits) / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const parseCurrencyLimitCents = (value: string) => Number(onlyDigits(value))

const normalizeTimeLimitHoursInput = (value: string) => {
  const digits = onlyDigits(value)

  if (!digits) return ''

  const numericValue = Number(digits)

  return String(Math.min(numericValue, 24))
}

const normalizeTimeLimitMinutesInput = (value: string) => {
  const digits = onlyDigits(value)

  if (!digits) return ''

  const numericValue = Number(digits)

  return String(Math.min(numericValue, 60))
}

const getTimeLimitTotalMinutes = (hours: string, minutes: string) => {
  const hoursValue = Number(hours || 0)
  const minutesValue = hoursValue >= 24 ? 0 : Number(minutes || 0)

  return (hoursValue * 60) + minutesValue
}

const isCustomTimeLimitValid = (hours: string, minutes: string) => {
  const hoursValue = Number(hours || 0)
  const minutesValue = Number(minutes || 0)
  const totalMinutes = getTimeLimitTotalMinutes(hours, minutes)

  return hoursValue >= 0
    && hoursValue <= 24
    && minutesValue >= 0
    && minutesValue <= 60
    && totalMinutes > 0
    && totalMinutes <= 24 * 60
}

const getBrazilRegionByUf = (uf?: string) => {
  if (!uf) return ''

  return brazilRegionByUf[uf.toUpperCase()] ?? ''
}

const getCountdownAriaLabel = ({ hours, minutes }: PromoCountdownParts) => (
  `Promoção termina em ${hours} ${hours === 1 ? 'hora' : 'horas'} e ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`
)

const getEmailErrorMessage = (value: string) => {
  const normalizedValue = value.trim()

  if (!normalizedValue) return null

  return loginEmailPattern.test(normalizedValue) ? null : loginEmailErrorMessage
}

const getCpfErrorMessage = (value: string) => {
  const digits = onlyDigits(value)

  if (!digits || digits.length === 11) return null

  return cpfIncompleteErrorMessage
}

const getPhoneErrorMessage = (value: string) => {
  const digits = normalizeBrazilPhone(value)

  if (!digits || digits.length === 11) return null

  return phoneIncompleteErrorMessage
}

const formatCpf = (value: string) => {
  const digits = onlyDigits(value).slice(0, 11)
  const firstGroup = digits.slice(0, 3)
  const secondGroup = digits.slice(3, 6)
  const thirdGroup = digits.slice(6, 9)
  const verifier = digits.slice(9, 11)

  return [
    firstGroup,
    secondGroup,
    thirdGroup,
  ].filter(Boolean).join('.').concat(verifier ? `-${verifier}` : '')
}

const formatCep = (value: string) => {
  const digits = onlyDigits(value).slice(0, 8)
  const firstGroup = digits.slice(0, 5)
  const secondGroup = digits.slice(5, 8)

  return secondGroup ? `${firstGroup}-${secondGroup}` : firstGroup
}

const normalizeBrazilPhone = (value: string) => {
  const digits = onlyDigits(value)

  if (digits.startsWith('55') && digits.length > 11) {
    return digits.slice(2, 13)
  }

  return digits.slice(0, 11)
}

const formatBrazilPhone = (value: string) => {
  const digits = normalizeBrazilPhone(value)
  const areaCode = digits.slice(0, 2)
  const firstGroup = digits.slice(2, 7)
  const secondGroup = digits.slice(7, 11)

  if (digits.length === 0) return ''
  if (digits.length <= 2) return `(${areaCode}`
  if (digits.length <= 7) return `(${areaCode}) ${firstGroup}`

  return `(${areaCode}) ${firstGroup}-${secondGroup}`
}

const formatBrazilPhoneForValidation = (value: string) => {
  const digits = normalizeBrazilPhone(value)
  const areaCode = digits.slice(0, 2)
  const firstGroup = digits.slice(2, 7)
  const secondGroup = digits.slice(7, 11)

  return `+55 ${areaCode} ${firstGroup}-${secondGroup}`
}

const focusPhoneValidationInput = () => {
  const input = document.getElementById('signup-phone-validation-code')

  input?.focus({ preventScroll: true })

  if (input instanceof HTMLInputElement) {
    input.setSelectionRange(input.value.length, input.value.length)
  }
}

function LoginInput({
  id,
  label,
  icon,
  placeholder,
  value,
  type = 'text',
  autoComplete,
  errorMessage,
  inputMode,
  isInvalid = false,
  maxLength,
  readOnly = false,
  trailingAction,
  onBlur,
  onChange,
  onFocus,
}: LoginInputProps) {
  const isFilled = value.length > 0
  const errorId = `${id}-error`

  return (
    <label
      className={[
        'login-input',
        isFilled ? 'login-input--filled' : '',
        isInvalid ? 'login-input--error' : '',
        readOnly ? 'login-input--readonly' : '',
      ].filter(Boolean).join(' ')}
      htmlFor={id}
    >
      <span className="login-input__label">{label}</span>
      <span className="login-input__container">
        <span className="login-input__content">
          {icon ? <img src={icon} alt="" className="login-input__icon" aria-hidden="true" /> : null}
          <input
            id={id}
            className="login-input__field"
            type={type}
            value={value}
            placeholder={placeholder}
            autoComplete={autoComplete}
            inputMode={inputMode}
            maxLength={maxLength}
            readOnly={readOnly}
            aria-describedby={isInvalid && errorMessage ? errorId : undefined}
            aria-invalid={isInvalid || undefined}
            onBlur={onBlur}
            onChange={(event) => onChange(event.target.value)}
            onFocus={onFocus}
          />
        </span>
        {isInvalid ? (
          <img src={iconError} alt="" className="login-input__error-icon" aria-hidden="true" />
        ) : trailingAction}
      </span>
      {isInvalid && errorMessage ? (
        <span className="login-input__error-message" id={errorId}>{errorMessage}</span>
      ) : null}
    </label>
  )
}

function RegionSelect({
  id,
  label,
  placeholder,
  value,
  isOpen,
  onOpen,
}: RegionSelectProps) {
  const labelId = `${id}-label`
  const isFilled = value.length > 0

  return (
    <div
      className={[
        'login-input',
        'login-input--select',
        isFilled ? 'login-input--filled' : '',
      ].filter(Boolean).join(' ')}
    >
      <span className="login-input__label" id={labelId}>{label}</span>
      <button
        id={id}
        type="button"
        className="login-input__container login-input__select-button"
        aria-labelledby={labelId}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={onOpen}
      >
        <span className="login-input__content">
          <span
            className={[
              'login-input__field',
              'login-input__select-value',
              !isFilled ? 'login-input__select-value--placeholder' : '',
            ].filter(Boolean).join(' ')}
          >
            {isFilled ? value : placeholder}
          </span>
        </span>
        <span className="login-input__select-icon" aria-hidden="true" />
      </button>
    </div>
  )
}

function PrimaryButton({
  children,
  disabled = false,
  isLoading = false,
  onClick,
  type = 'button',
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      className={[
        'login-page__submit',
        !disabled || isLoading ? 'login-page__submit--active' : '',
        isLoading ? 'login-page__submit--loading' : '',
      ].filter(Boolean).join(' ')}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      onClick={onClick}
    >
      {isLoading ? <span className="login-page__spinner" aria-hidden="true" /> : children}
    </button>
  )
}

function AuthHeader({
  activeStep,
  onBack,
}: {
  activeStep?: SignupStep
  onBack?: () => void
}) {
  const activeStepIndex = activeStep ? signupSteps.indexOf(activeStep) : -1

  return (
    <header
      className={['login-page__header', activeStep ? 'login-page__header--steps' : ''].filter(Boolean).join(' ')}
      aria-label={activeStep ? 'Cabeçalho de cadastro' : 'Cabeçalho de login'}
    >
      <button
        type="button"
        className="login-page__back"
        aria-label="Voltar"
        onClick={onBack}
      >
        <img src={backHeaderIcon} alt="" className="login-page__back-icon" aria-hidden="true" />
      </button>
      {activeStep ? (
        <div className="login-page__progress" aria-label={`Etapa ${activeStepIndex + 1} de ${signupSteps.length}`}>
          {signupSteps.map((step, index) => (
            <span
              key={step}
              className={[
                'login-page__progress-step',
                index <= activeStepIndex ? 'login-page__progress-step--active' : '',
              ].filter(Boolean).join(' ')}
            />
          ))}
        </div>
      ) : null}
    </header>
  )
}

function SocialButtons({
  disabled,
  submittingMethod,
  onGoogleClick,
  onAppleClick,
}: {
  disabled?: boolean
  submittingMethod?: LoginSubmitMethod | null
  onGoogleClick: () => void
  onAppleClick: () => void
}) {
  return (
    <>
      <button
        type="button"
        className={[
          'login-page__social-button',
          submittingMethod === 'google' ? 'login-page__social-button--loading' : '',
        ].filter(Boolean).join(' ')}
        disabled={disabled}
        aria-busy={submittingMethod === 'google'}
        onClick={onGoogleClick}
      >
        {submittingMethod === 'google' ? (
          <span className="login-page__spinner" aria-hidden="true" />
        ) : (
          <>
            <img src={iconGoogle} alt="" className="login-page__social-icon" aria-hidden="true" />
            <span>Continuar com Google</span>
          </>
        )}
      </button>

      <button
        type="button"
        className={[
          'login-page__social-button',
          submittingMethod === 'apple' ? 'login-page__social-button--loading' : '',
        ].filter(Boolean).join(' ')}
        disabled={disabled}
        aria-busy={submittingMethod === 'apple'}
        onClick={onAppleClick}
      >
        {submittingMethod === 'apple' ? (
          <span className="login-page__spinner" aria-hidden="true" />
        ) : (
          <>
            <img src={iconApple} alt="" className="login-page__social-icon" aria-hidden="true" />
            <span>Continuar com Apple</span>
          </>
        )}
      </button>
    </>
  )
}

function SignupCheckbox({
  checked,
  children,
  onChange,
}: {
  checked: boolean
  children: ReactNode
  onChange: (checked: boolean) => void
}) {
  return (
    <button
      type="button"
      className={['login-checkbox', checked ? 'login-checkbox--checked' : ''].filter(Boolean).join(' ')}
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
    >
      <span className="login-checkbox__box" aria-hidden="true">
        {checked ? <span className="login-checkbox__check" /> : null}
      </span>
      <span className="login-checkbox__label">{children}</span>
    </button>
  )
}

function PhoneInput({
  errorMessage,
  isInvalid = false,
  onBlur,
  value,
  onChange,
  onFocus,
}: {
  errorMessage?: string
  isInvalid?: boolean
  onBlur?: () => void
  value: string
  onChange: (value: string) => void
  onFocus?: () => void
}) {
  const phoneDigits = normalizeBrazilPhone(value)
  const isFilled = phoneDigits.length > 0
  const errorId = 'signup-phone-error'

  return (
    <label
      className={[
        'login-phone-input',
        isFilled ? 'login-phone-input--filled' : '',
        isInvalid ? 'login-phone-input--error' : '',
      ].filter(Boolean).join(' ')}
      htmlFor="signup-phone"
    >
      <span className="login-input__label">Celular</span>
      <span className="login-phone-input__container">
        <span className="login-phone-input__prefix" aria-label="Brasil +55">
          <img src={flagBrasil} alt="" className="login-phone-input__flag" aria-hidden="true" />
          <span className="login-phone-input__country-code">+55</span>
        </span>
        <span className="login-phone-input__divider" aria-hidden="true" />
        <input
          id="signup-phone"
          className="login-phone-input__field"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="DDD + número"
          value={formatBrazilPhone(value)}
          aria-describedby={isInvalid && errorMessage ? errorId : undefined}
          aria-invalid={isInvalid || undefined}
          onBlur={onBlur}
          onChange={(event) => onChange(normalizeBrazilPhone(event.target.value))}
          onFocus={onFocus}
        />
        {isInvalid ? (
          <img src={iconError} alt="" className="login-input__error-icon" aria-hidden="true" />
        ) : null}
      </span>
      {isInvalid && errorMessage ? (
        <span className="login-input__error-message" id={errorId}>{errorMessage}</span>
      ) : null}
    </label>
  )
}

function PhoneValidationCodeInput({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const digits = onlyDigits(value).slice(0, phoneValidationCodeLength)
  const activeIndex = Math.min(digits.length, phoneValidationCodeLength - 1)

  useLayoutEffect(() => {
    focusPhoneValidationInput()

    const animationFrame = window.requestAnimationFrame(focusPhoneValidationInput)

    return () => window.cancelAnimationFrame(animationFrame)
  }, [])

  return (
    <label className="login-phone-code" htmlFor="signup-phone-validation-code">
      <span className="login-phone-code__accessibility-label">Código de verificação</span>
      <input
        ref={inputRef}
        id="signup-phone-validation-code"
        className="login-phone-code__input"
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="one-time-code"
        enterKeyHint="done"
        autoFocus
        value={digits}
        aria-label="Código de verificação"
        onBlur={() => setIsFocused(false)}
        onChange={(event) => onChange(onlyDigits(event.target.value).slice(0, phoneValidationCodeLength))}
        onFocus={() => setIsFocused(true)}
      />
      <span className="login-phone-code__slots" aria-hidden="true">
        {Array.from({ length: phoneValidationCodeLength }, (_, index) => {
          const digit = digits[index]
          const isActive = isFocused && index === activeIndex && digits.length < phoneValidationCodeLength

          return (
            <span
              key={index}
              className={[
                'login-phone-code__slot',
                digit ? 'login-phone-code__slot--filled' : '',
                isActive ? 'login-phone-code__slot--active' : '',
              ].filter(Boolean).join(' ')}
            >
              {digit || (isActive ? '' : '0')}
            </span>
          )
        })}
      </span>
    </label>
  )
}

export function LoginPage({
  mode = 'login',
  motionState = 'open',
  onBack,
  onCreateAccountClick,
  onDepositOpen,
  onEnterComplete,
  onLoginClick,
  onLoginSuccess,
  showSignupGarantidaBanner = false,
}: LoginPageProps) {
  const loginEnterFallbackTimerRef = useRef<number | null>(null)
  const loginSuccessTimerRef = useRef<number | null>(null)
  const signupActionLoadingTimerRef = useRef<number | null>(null)
  const addressAbortRef = useRef<AbortController | null>(null)
  const verificationLoadingTimerRef = useRef<number | null>(null)
  const verificationFadeTimerRef = useRef<number | null>(null)
  const authModeMotionTimerRef = useRef<number | null>(null)
  const authModeMotionPhaseRef = useRef<SignupStepMotionPhase>('idle')
  const signupStepMotionTimerRef = useRef<number | null>(null)
  const verificationStreamRef = useRef<MediaStream | null>(null)
  const verificationVideoRef = useRef<HTMLVideoElement | null>(null)
  const loginPageRef = useRef<HTMLElement | null>(null)
  const [displayedMode, setDisplayedMode] = useState<AuthMode>(mode)
  const [authModeMotionPhase, setAuthModeMotionPhase] = useState<SignupStepMotionPhase>('idle')
  const [signupStep, setSignupStep] = useState<SignupStep>('account')
  const [signupStepMotionPhase, setSignupStepMotionPhase] = useState<SignupStepMotionPhase>('idle')
  const [signupLoadingAction, setSignupLoadingAction] = useState<SignupLoadingAction | null>(null)
  const [verificationStage, setVerificationStage] = useState<VerificationStage>('intro')
  const [pendingVerificationStage, setPendingVerificationStage] = useState<VerificationStage | null>(null)
  const [isVerificationFadingOut, setIsVerificationFadingOut] = useState(false)
  const [isVerificationMobile, setIsVerificationMobile] = useState(false)
  const [verificationCameraStatus, setVerificationCameraStatus] = useState<VerificationCameraStatus>('idle')
  const [verificationCameraError, setVerificationCameraError] = useState<string | null>(null)
  const [selectedTimeLimit, setSelectedTimeLimit] = useState(gameTimeLimitOptions[4])
  const [selectedLossLimit, setSelectedLossLimit] = useState(lossLimitOptions[3])
  const [activeCustomLimitSheet, setActiveCustomLimitSheet] = useState<LimitCustomSheetType | null>(null)
  const [customTimeLimitHoursInput, setCustomTimeLimitHoursInput] = useState('')
  const [customTimeLimitMinutesInput, setCustomTimeLimitMinutesInput] = useState('')
  const [customLossLimitInput, setCustomLossLimitInput] = useState('')
  const [customTimeLimitHours, setCustomTimeLimitHours] = useState('')
  const [customTimeLimitMinutes, setCustomTimeLimitMinutes] = useState('')
  const [customLossLimit, setCustomLossLimit] = useState('')
  const [isCustomLimitSheetOpen, setIsCustomLimitSheetOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailErrorMessage, setEmailErrorMessage] = useState<string | null>(null)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [submittingMethod, setSubmittingMethod] = useState<LoginSubmitMethod | null>(null)
  const [cpf, setCpf] = useState('')
  const [cpfErrorMessage, setCpfErrorMessage] = useState<string | null>(null)
  const [phone, setPhone] = useState('')
  const [phoneErrorMessage, setPhoneErrorMessage] = useState<string | null>(null)
  const [isPhoneValidationOpen, setIsPhoneValidationOpen] = useState(false)
  const [phoneValidationCode, setPhoneValidationCode] = useState('')
  const [phoneValidationSeconds, setPhoneValidationSeconds] = useState(phoneValidationCountdownStart)
  const [acceptsPromos, setAcceptsPromos] = useState(true)
  const [cep, setCep] = useState('')
  const [region, setRegion] = useState('')
  const [isRegionSheetOpen, setIsRegionSheetOpen] = useState(false)
  const [neighborhood, setNeighborhood] = useState('')
  const [street, setStreet] = useState('')
  const [addressNumber, setAddressNumber] = useState('')
  const [noAddressNumber, setNoAddressNumber] = useState(false)
  const [addressComplement, setAddressComplement] = useState('')
  const [addressLookupStatus, setAddressLookupStatus] = useState<AddressLookupStatus>('idle')
  const [addressLookupError, setAddressLookupError] = useState<string | null>(null)
  const [signupGarantidaCountdownDeadline] = useState(() => getGarantidaPromoDeadline())
  const [signupGarantidaCountdownNow, setSignupGarantidaCountdownNow] = useState(() => Date.now())
  const isEmailValid = useMemo(() => loginEmailPattern.test(email.trim()), [email])
  const isPasswordFilled = password.length > 0
  const isSubmitting = submittingMethod !== null
  const isEmailSubmitting = submittingMethod === 'email'
  const isSignupActionLoading = signupLoadingAction !== null
  const canSubmitCredentials = isEmailValid && isPasswordFilled && !isSubmitting
  const showEmailError = emailErrorMessage !== null
  const cpfDigits = onlyDigits(cpf)
  const phoneDigits = normalizeBrazilPhone(phone)
  const phoneValidationDigits = onlyDigits(phoneValidationCode)
  const cepDigits = onlyDigits(cep)
  const canContinuePersonal = cpfDigits.length === 11 && phoneDigits.length === 11
  const canConfirmPhoneValidation = phoneValidationDigits.length === phoneValidationCodeLength
  const shouldShowAddressDetails = cepDigits.length === 8
  const canConfirmAddress = shouldShowAddressDetails
    && street.trim().length > 0
    && (noAddressNumber || addressNumber.trim().length > 0)
    && addressLookupStatus !== 'loading'
  const showCpfError = cpfErrorMessage !== null
  const showPhoneError = phoneErrorMessage !== null
  const signupGarantidaCountdown = useMemo(() => (
    getPromoCountdownParts(signupGarantidaCountdownDeadline - signupGarantidaCountdownNow)
  ), [signupGarantidaCountdownDeadline, signupGarantidaCountdownNow])

  const cancelSignupActionLoading = () => {
    if (signupActionLoadingTimerRef.current === null) return

    window.clearTimeout(signupActionLoadingTimerRef.current)
    signupActionLoadingTimerRef.current = null
    setSignupLoadingAction(null)
  }

  const clearAuthSubmitLoadingTimer = useCallback(() => {
    if (loginSuccessTimerRef.current === null) return

    window.clearTimeout(loginSuccessTimerRef.current)
    loginSuccessTimerRef.current = null
  }, [])

  const clearSignupActionLoadingTimer = useCallback(() => {
    if (signupActionLoadingTimerRef.current === null) return

    window.clearTimeout(signupActionLoadingTimerRef.current)
    signupActionLoadingTimerRef.current = null
  }, [])

  const clearAuthModeMotionTimer = useCallback(() => {
    if (authModeMotionTimerRef.current === null) return

    window.clearTimeout(authModeMotionTimerRef.current)
    authModeMotionTimerRef.current = null
  }, [])

  const updateAuthModeMotionPhase = useCallback((nextPhase: SignupStepMotionPhase) => {
    authModeMotionPhaseRef.current = nextPhase
    setAuthModeMotionPhase(nextPhase)
  }, [])

  const clearSignupStepMotionTimer = useCallback(() => {
    if (signupStepMotionTimerRef.current === null) return

    window.clearTimeout(signupStepMotionTimerRef.current)
    signupStepMotionTimerRef.current = null
  }, [])

  const clearVerificationTimers = useCallback(() => {
    if (verificationLoadingTimerRef.current !== null) {
      window.clearTimeout(verificationLoadingTimerRef.current)
      verificationLoadingTimerRef.current = null
    }

    if (verificationFadeTimerRef.current !== null) {
      window.clearTimeout(verificationFadeTimerRef.current)
      verificationFadeTimerRef.current = null
    }
  }, [])

  const stopVerificationCamera = useCallback(() => {
    verificationStreamRef.current?.getTracks().forEach((track) => track.stop())
    verificationStreamRef.current = null

    if (verificationVideoRef.current) {
      verificationVideoRef.current.srcObject = null
    }
  }, [])

  const clearLoginEnterFallbackTimer = useCallback(() => {
    if (loginEnterFallbackTimerRef.current === null) return

    window.clearTimeout(loginEnterFallbackTimerRef.current)
    loginEnterFallbackTimerRef.current = null
  }, [])

  const handleSurfaceAnimationEnd = useCallback((event: AnimationEvent<HTMLDivElement>) => {
    if (event.currentTarget !== event.target) return
    if (event.animationName !== 'login-page-slide-in') return
    if (motionState !== 'entering') return

    clearLoginEnterFallbackTimer()
    onEnterComplete?.()
  }, [clearLoginEnterFallbackTimer, motionState, onEnterComplete])

  const goToSignupStep = useCallback((nextStep: SignupStep) => {
    if (nextStep === signupStep) return

    clearSignupStepMotionTimer()

    setSignupStepMotionPhase('exiting')

    signupStepMotionTimerRef.current = window.setTimeout(() => {
      setSignupStep(nextStep)
      setSignupStepMotionPhase('entering')

      signupStepMotionTimerRef.current = window.setTimeout(() => {
        signupStepMotionTimerRef.current = null
        setSignupStepMotionPhase('idle')
      }, signupStepEnterDurationMs)
    }, signupStepExitDurationMs)
  }, [clearSignupStepMotionTimer, signupStep])

  const resetAuthPageState = useCallback(() => {
    clearAuthSubmitLoadingTimer()
    clearSignupActionLoadingTimer()
    clearSignupStepMotionTimer()
    clearVerificationTimers()
    addressAbortRef.current?.abort()
    addressAbortRef.current = null
    stopVerificationCamera()

    setSignupStep('account')
    setSignupStepMotionPhase('idle')
    setSignupLoadingAction(null)
    setVerificationStage('intro')
    setPendingVerificationStage(null)
    setIsVerificationFadingOut(false)
    setVerificationCameraStatus('idle')
    setVerificationCameraError(null)
    setSelectedTimeLimit(gameTimeLimitOptions[4])
    setSelectedLossLimit(lossLimitOptions[3])
    setActiveCustomLimitSheet(null)
    setCustomTimeLimitHoursInput('')
    setCustomTimeLimitMinutesInput('')
    setCustomLossLimitInput('')
    setCustomTimeLimitHours('')
    setCustomTimeLimitMinutes('')
    setCustomLossLimit('')
    setIsCustomLimitSheetOpen(false)
    setEmail('')
    setPassword('')
    setEmailErrorMessage(null)
    setIsPasswordVisible(false)
    setSubmittingMethod(null)
    setCpf('')
    setCpfErrorMessage(null)
    setPhone('')
    setPhoneErrorMessage(null)
    setIsPhoneValidationOpen(false)
    setPhoneValidationCode('')
    setPhoneValidationSeconds(phoneValidationCountdownStart)
    setAcceptsPromos(true)
    setCep('')
    setRegion('')
    setIsRegionSheetOpen(false)
    setNeighborhood('')
    setStreet('')
    setAddressNumber('')
    setNoAddressNumber(false)
    setAddressComplement('')
    setAddressLookupStatus('idle')
    setAddressLookupError(null)
  }, [
    clearAuthSubmitLoadingTimer,
    clearSignupActionLoadingTimer,
    clearSignupStepMotionTimer,
    clearVerificationTimers,
    stopVerificationCamera,
  ])

  useEffect(() => {
    if (mode === displayedMode) {
      if (authModeMotionPhaseRef.current === 'exiting') {
        clearAuthModeMotionTimer()

        authModeMotionTimerRef.current = window.setTimeout(() => {
          authModeMotionTimerRef.current = null
          updateAuthModeMotionPhase('idle')
        }, 0)
      }

      return
    }

    clearAuthModeMotionTimer()

    authModeMotionTimerRef.current = window.setTimeout(() => {
      updateAuthModeMotionPhase('exiting')

      authModeMotionTimerRef.current = window.setTimeout(() => {
        flushSync(() => {
          resetAuthPageState()
          setDisplayedMode(mode)
          updateAuthModeMotionPhase('entering')
        })

        authModeMotionTimerRef.current = window.setTimeout(() => {
          authModeMotionTimerRef.current = null
          updateAuthModeMotionPhase('idle')
        }, signupStepEnterDurationMs)
      }, signupStepExitDurationMs)
    }, 0)
  }, [
    clearAuthModeMotionTimer,
    displayedMode,
    mode,
    resetAuthPageState,
    updateAuthModeMotionPhase,
  ])

  useEffect(() => () => {
    clearLoginEnterFallbackTimer()

    if (loginSuccessTimerRef.current !== null) {
      window.clearTimeout(loginSuccessTimerRef.current)
    }

    if (signupActionLoadingTimerRef.current !== null) {
      window.clearTimeout(signupActionLoadingTimerRef.current)
    }

    if (verificationLoadingTimerRef.current !== null) {
      window.clearTimeout(verificationLoadingTimerRef.current)
    }

    if (verificationFadeTimerRef.current !== null) {
      window.clearTimeout(verificationFadeTimerRef.current)
    }

    if (authModeMotionTimerRef.current !== null) {
      window.clearTimeout(authModeMotionTimerRef.current)
    }

    if (signupStepMotionTimerRef.current !== null) {
      window.clearTimeout(signupStepMotionTimerRef.current)
    }

    addressAbortRef.current?.abort()
    stopVerificationCamera()
  }, [clearLoginEnterFallbackTimer, stopVerificationCamera])

  useEffect(() => {
    clearLoginEnterFallbackTimer()

    if (motionState !== 'entering') return

    const fallbackTimer = window.setTimeout(() => {
      loginEnterFallbackTimerRef.current = null
      onEnterComplete?.()
    }, loginPageMotionDurationMs + 40)
    loginEnterFallbackTimerRef.current = fallbackTimer

    return () => {
      window.clearTimeout(fallbackTimer)

      if (loginEnterFallbackTimerRef.current === fallbackTimer) {
        loginEnterFallbackTimerRef.current = null
      }
    }
  }, [clearLoginEnterFallbackTimer, motionState, onEnterComplete])

  useEffect(() => {
    const mediaQueryList = window.matchMedia(mobileCameraMediaQuery)
    const updateMobileStatus = () => {
      setIsVerificationMobile(mediaQueryList.matches || navigator.maxTouchPoints > 1)
    }

    updateMobileStatus()
    mediaQueryList.addEventListener('change', updateMobileStatus)

    return () => mediaQueryList.removeEventListener('change', updateMobileStatus)
  }, [])

  useLayoutEffect(() => {
    const loginPageElement = loginPageRef.current

    if (!loginPageElement) return undefined

    const updateLoginViewportHeight = () => {
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight

      if (viewportHeight > 0) {
        loginPageElement.style.setProperty('--login-page-viewport-height', `${viewportHeight}px`)
      }
    }

    updateLoginViewportHeight()

    window.addEventListener('resize', updateLoginViewportHeight)
    window.visualViewport?.addEventListener('resize', updateLoginViewportHeight)
    window.visualViewport?.addEventListener('scroll', updateLoginViewportHeight)

    return () => {
      window.removeEventListener('resize', updateLoginViewportHeight)
      window.visualViewport?.removeEventListener('resize', updateLoginViewportHeight)
      window.visualViewport?.removeEventListener('scroll', updateLoginViewportHeight)
      loginPageElement.style.removeProperty('--login-page-viewport-height')
    }
  }, [])

  useEffect(() => {
    const captureConfig = verificationStage === 'document-front'
      || verificationStage === 'document-back'
      || verificationStage === 'face'
      ? verificationCaptureScreens[verificationStage]
      : null

    let isActive = true
    let cameraStateTimer: number | null = null
    const scheduleCameraState = (status: VerificationCameraStatus, error: string | null = null) => {
      if (cameraStateTimer !== null) {
        window.clearTimeout(cameraStateTimer)
      }

      cameraStateTimer = window.setTimeout(() => {
        cameraStateTimer = null
        if (!isActive) return

        setVerificationCameraStatus(status)
        setVerificationCameraError(error)
      }, 0)
    }

    const clearScheduledCameraState = () => {
      if (cameraStateTimer === null) return

      window.clearTimeout(cameraStateTimer)
      cameraStateTimer = null
    }

    if (!captureConfig || !isVerificationMobile) {
      stopVerificationCamera()
      scheduleCameraState('idle')
      return () => {
        isActive = false
        clearScheduledCameraState()
      }
    }

    stopVerificationCamera()
    scheduleCameraState('loading')

    if (!window.isSecureContext) {
      scheduleCameraState('unavailable', 'Abra o app em HTTPS para ativar a câmera no celular.')
      return () => {
        isActive = false
        clearScheduledCameraState()
      }
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      scheduleCameraState('unavailable', 'Câmera indisponível neste navegador ou dispositivo.')
      return () => {
        isActive = false
        clearScheduledCameraState()
      }
    }

    navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: { ideal: captureConfig.cameraFacingMode },
      },
    })
      .then((stream) => {
        if (!isActive) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        verificationStreamRef.current = stream

        if (verificationVideoRef.current) {
          verificationVideoRef.current.srcObject = stream
          void verificationVideoRef.current.play()
        }

        setVerificationCameraStatus('ready')
        setVerificationCameraError(null)
      })
      .catch((error: unknown) => {
        if (!isActive) return

        const errorName = error instanceof DOMException ? error.name : ''
        const cameraErrorMessage = verificationCameraErrorMessageByName[errorName]
          ?? 'Não foi possível abrir a câmera. Confira a permissão no celular.'

        setVerificationCameraStatus('unavailable')
        setVerificationCameraError(cameraErrorMessage)
      })

    return () => {
      isActive = false
      clearScheduledCameraState()
      stopVerificationCamera()
    }
  }, [isVerificationMobile, stopVerificationCamera, verificationStage])

  useEffect(() => {
    if (!isPhoneValidationOpen) return undefined

    const countdownTimer = window.setInterval(() => {
      setPhoneValidationSeconds((currentSeconds) => (
        currentSeconds <= 1 ? phoneValidationCountdownStart : currentSeconds - 1
      ))
    }, 1000)

    return () => window.clearInterval(countdownTimer)
  }, [isPhoneValidationOpen])

  useEffect(() => {
    if (!showSignupGarantidaBanner) return undefined

    const countdownTimer = window.setInterval(() => {
      setSignupGarantidaCountdownNow(Date.now())
    }, PROMO_COUNTDOWN_TICK_MS)

    return () => window.clearInterval(countdownTimer)
  }, [showSignupGarantidaBanner])

  const lookupCep = (nextCepDigits: string) => {
    const abortController = new AbortController()
    addressAbortRef.current?.abort()
    addressAbortRef.current = abortController
    setAddressLookupStatus('loading')
    setAddressLookupError(null)

    fetch(`https://viacep.com.br/ws/${nextCepDigits}/json/`, { signal: abortController.signal })
      .then((response) => {
        if (!response.ok) throw new Error('CEP indisponível')

        return response.json() as Promise<ViaCepResponse>
      })
      .then((data) => {
        if (abortController.signal.aborted) return
        if (data.erro) throw new Error('CEP não encontrado')

        setRegion(getBrazilRegionByUf(data.uf))
        setNeighborhood(data.bairro ?? '')
        setStreet(data.logradouro ?? '')
        setAddressLookupStatus('success')
      })
      .catch((error: unknown) => {
        if (abortController.signal.aborted) return

        setRegion('')
        setNeighborhood('')
        setStreet('')
        setAddressLookupStatus('error')
        setAddressLookupError(error instanceof Error ? error.message : 'Não foi possível buscar o CEP')
      })
  }

  const validateEmail = () => {
    const nextEmailErrorMessage = getEmailErrorMessage(email)

    setEmailErrorMessage(nextEmailErrorMessage)

    return nextEmailErrorMessage === null
  }

  const handleEmailChange = (nextEmail: string) => {
    setEmail(nextEmail)
    setEmailErrorMessage(null)
  }

  const validateCpf = () => {
    const nextCpfErrorMessage = getCpfErrorMessage(cpf)

    setCpfErrorMessage(nextCpfErrorMessage)

    return nextCpfErrorMessage === null
  }

  const handleCpfChange = (nextCpf: string) => {
    setCpf(onlyDigits(nextCpf).slice(0, 11))
    setCpfErrorMessage(null)
  }

  const validatePhone = () => {
    const nextPhoneErrorMessage = getPhoneErrorMessage(phone)

    setPhoneErrorMessage(nextPhoneErrorMessage)

    return nextPhoneErrorMessage === null
  }

  const handlePhoneChange = (nextPhone: string) => {
    setPhone(nextPhone)
    setPhoneErrorMessage(null)
  }

  const beginAuthSubmitLoading = (method: LoginSubmitMethod, onComplete: () => void) => {
    if (loginSuccessTimerRef.current !== null) return

    setSubmittingMethod(method)
    loginSuccessTimerRef.current = window.setTimeout(() => {
      loginSuccessTimerRef.current = null
      setSubmittingMethod(null)
      onComplete()
    }, authSubmitLoadingDurationMs)
  }

  const beginSignupActionLoading = (action: SignupLoadingAction, onComplete: () => void) => {
    if (signupActionLoadingTimerRef.current !== null || signupLoadingAction !== null) return

    setSignupLoadingAction(action)
    signupActionLoadingTimerRef.current = window.setTimeout(() => {
      signupActionLoadingTimerRef.current = null
      setSignupLoadingAction(null)
      onComplete()
    }, primaryButtonLoadingDurationMs)
  }

  const beginLoginSuccess = (method: LoginSubmitMethod) => {
    beginAuthSubmitLoading(method, () => onLoginSuccess?.())
  }

  const beginSignupAccountSuccess = (method: LoginSubmitMethod) => {
    beginAuthSubmitLoading(method, () => goToSignupStep('personal'))
  }

  const handleLoginSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const isEmailAccepted = validateEmail()

    if (!isEmailAccepted || !isPasswordFilled || isSubmitting) return

    beginLoginSuccess('email')
  }

  const handleSignupAccountSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const isEmailAccepted = validateEmail()

    if (!isEmailAccepted || !isPasswordFilled || isSubmitting) return

    beginSignupAccountSuccess('email')
  }

  const handlePersonalSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!canContinuePersonal || isSignupActionLoading) return

    flushSync(() => {
      setPhoneValidationCode('')
      setPhoneValidationSeconds(phoneValidationCountdownStart)
      setIsPhoneValidationOpen(true)
    })

    focusPhoneValidationInput()
  }

  const confirmPhoneValidation = () => {
    if (!canConfirmPhoneValidation || isSignupActionLoading) return

    beginSignupActionLoading('phone-validation', () => {
      setIsPhoneValidationOpen(false)
      goToSignupStep('address')
    })
  }

  const closePhoneValidation = () => {
    cancelSignupActionLoading()
    setIsPhoneValidationOpen(false)
  }

  const handlePhoneValidationSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    confirmPhoneValidation()
  }

  const handleAddressSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!canConfirmAddress || isSignupActionLoading) return

    beginSignupActionLoading('address', () => {
      setVerificationStage('intro')
      goToSignupStep('verification')
    })
  }

  const handleVerificationStart = () => {
    if (isSignupActionLoading) return

    clearVerificationTimers()
    beginSignupActionLoading('verification-start', () => {
      setPendingVerificationStage(null)
      setIsVerificationFadingOut(false)
      setVerificationStage('document-front')
    })
  }

  const transitionToNextVerificationStage = (stage: VerificationCaptureStage) => {
    if (isVerificationFadingOut) return

    const nextStage = verificationNextStageByCapture[stage]

    clearVerificationTimers()
    setPendingVerificationStage(nextStage)
    setIsVerificationFadingOut(true)

    verificationFadeTimerRef.current = window.setTimeout(() => {
      verificationFadeTimerRef.current = null
      setVerificationStage('loading')
      setIsVerificationFadingOut(false)

      verificationLoadingTimerRef.current = window.setTimeout(() => {
        verificationLoadingTimerRef.current = null
        setPendingVerificationStage(null)
        setVerificationStage(nextStage)
      }, verificationLoadingDurationMs)
    }, verificationFadeDurationMs)
  }

  const handleVerificationSkip = (stage: VerificationCaptureStage) => {
    transitionToNextVerificationStage(stage)
  }

  const handleVerificationCapture = (stage: VerificationCaptureStage) => {
    if (isVerificationMobile && verificationCameraStatus !== 'ready') return

    transitionToNextVerificationStage(stage)
  }

  const openCustomLimitSheet = (type: LimitCustomSheetType) => {
    if (type === 'time') {
      setCustomTimeLimitHoursInput(customTimeLimitHours)
      setCustomTimeLimitMinutesInput(customTimeLimitHours === '24' ? '' : customTimeLimitMinutes)
    } else {
      setCustomLossLimitInput(customLossLimit)
    }

    setActiveCustomLimitSheet(type)
    setIsCustomLimitSheetOpen(true)
  }

  const closeCustomLimitSheet = () => {
    cancelSignupActionLoading()
    setIsCustomLimitSheetOpen(false)
  }

  const handleCustomLimitSubmit = () => {
    if (isSignupActionLoading) return

    if (activeCustomLimitSheet === 'time') {
      if (!isCustomTimeLimitValid(customTimeLimitHoursInput, customTimeLimitMinutesInput)) return

      beginSignupActionLoading('custom-limit', () => {
        setCustomTimeLimitHours(customTimeLimitHoursInput)
        setCustomTimeLimitMinutes(customTimeLimitHoursInput === '24' ? '' : customTimeLimitMinutesInput)
        setSelectedTimeLimit(customLimitOption)
        closeCustomLimitSheet()
      })
      return
    }

    if (activeCustomLimitSheet === 'loss') {
      if (parseCurrencyLimitCents(customLossLimitInput) <= 0) return

      beginSignupActionLoading('custom-limit', () => {
        setCustomLossLimit(customLossLimitInput)
        setSelectedLossLimit(customLimitOption)
        closeCustomLimitSheet()
      })
    }
  }

  const handleLimitsSave = () => {
    if (isSignupActionLoading) return

    beginSignupActionLoading('limits-save', () => onDepositOpen?.())
  }

  const handleBack = () => {
    cancelSignupActionLoading()

    if (displayedMode !== 'signup') {
      onBack?.()
      return
    }

    if (signupStep === 'verification' && verificationStage !== 'intro') {
      clearVerificationTimers()
      setPendingVerificationStage(null)
      setIsVerificationFadingOut(false)
      setVerificationStage('intro')
      return
    }

    if (signupStep === 'address') {
      goToSignupStep('personal')
      return
    }

    if (signupStep === 'personal') {
      goToSignupStep('account')
      return
    }

    onBack?.()
  }

  const renderPasswordTrailingAction = () => (
    <button
      type="button"
      className="login-input__eye"
      aria-label={isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'}
      onClick={() => setIsPasswordVisible((current) => !current)}
    >
      <img
        src={isPasswordVisible ? iconEye : iconEyeHide}
        alt=""
        className="login-input__eye-icon"
        aria-hidden="true"
      />
    </button>
  )

  const renderLogin = () => (
    <>
      <AuthHeader onBack={handleBack} />

      <section className="login-page__container" aria-labelledby="login-page-title">
        <h1 className="login-page__title" id="login-page-title">Iniciar sessão</h1>

        <form className="login-page__form-section" onSubmit={handleLoginSubmit} noValidate>
          <div className="login-page__field-stack">
            <LoginInput
              id="login-email"
              label="E-mail"
              icon={iconEmail}
              placeholder="nome@email.com"
              value={email}
              type="email"
              autoComplete="email"
              inputMode="email"
              errorMessage={emailErrorMessage ?? undefined}
              isInvalid={showEmailError}
              onBlur={validateEmail}
              onChange={handleEmailChange}
              onFocus={() => setEmailErrorMessage(null)}
            />
            <LoginInput
              id="login-password"
              label="Senha"
              icon={iconPass}
              placeholder="••••••••••••••"
              value={password}
              type={isPasswordVisible ? 'text' : 'password'}
              autoComplete="current-password"
              onChange={(nextPassword) => setPassword(nextPassword)}
              trailingAction={renderPasswordTrailingAction()}
            />

            <div className="login-page__assist-row">
              <button type="button" className="login-page__biometry">
                <img src={iconBiometria} alt="" className="login-page__biometry-icon" aria-hidden="true" />
                <span>Usar biometria</span>
              </button>
              <button type="button" className="login-page__link-button">
                Esqueci minha senha
              </button>
            </div>
          </div>

          <PrimaryButton
            type="submit"
            disabled={!canSubmitCredentials}
            isLoading={isEmailSubmitting}
          >
            Entrar
          </PrimaryButton>
        </form>

        <div className="login-page__social-section">
          <div className="login-page__divider-text">Ou continue com</div>

          <SocialButtons
            disabled={isSubmitting}
            submittingMethod={submittingMethod}
            onAppleClick={() => beginLoginSuccess('apple')}
            onGoogleClick={() => beginLoginSuccess('google')}
          />

          <div className="login-page__signup">
            <span>Ainda não tem uma conta?</span>
            <button type="button" className="login-page__signup-link" onClick={onCreateAccountClick}>
              Criar conta
            </button>
          </div>
        </div>
      </section>
    </>
  )

  const renderSignupGarantidaBanner = () => {
    if (!showSignupGarantidaBanner) return null

    return (
      <aside className="login-page__garantida-banner" aria-label="Promoção Garantida">
        <img
          src={glowGarantidaCadastro01}
          alt=""
          className="login-page__garantida-banner-glow login-page__garantida-banner-glow--left"
          aria-hidden="true"
        />
        <img
          src={imgLewandowskiPromo}
          alt=""
          className="login-page__garantida-banner-player"
          aria-hidden="true"
        />
        <img
          src={glowGarantidaCadastro02}
          alt=""
          className="login-page__garantida-banner-glow login-page__garantida-banner-glow--right"
          aria-hidden="true"
        />

        <div className="login-page__garantida-banner-copy">
          <p className="login-page__garantida-banner-kicker">A GARANTIDA ESTÁ TE ESPERANDO!</p>
          <div className="login-page__garantida-banner-row">
            <div className="login-page__garantida-banner-market">
              <strong>R. LEWANDOWSKI</strong>
              <span><b>0.5+</b> Finalizações ao gol</span>
            </div>
            <div
              className="login-page__garantida-banner-timer"
              aria-label={getCountdownAriaLabel(signupGarantidaCountdown)}
            >
              <img src={iconClock} alt="" className="login-page__garantida-banner-timer-icon" aria-hidden="true" />
              <span className="login-page__garantida-banner-timer-text">
                <span>{formatPromoCountdownSegment(signupGarantidaCountdown.hours)} h</span>
                <span className="login-page__garantida-banner-timer-separator">:</span>
                <span>{formatPromoCountdownSegment(signupGarantidaCountdown.minutes)} m</span>
              </span>
            </div>
          </div>
        </div>
      </aside>
    )
  }

  const renderSignupAccount = () => (
    <section
      className="login-page__container login-page__container--signup"
      aria-labelledby="signup-account-title"
    >
      {renderSignupGarantidaBanner()}

      <div className="login-page__title-row">
        <h1 className="login-page__title" id="signup-account-title">Criar conta</h1>
        <button type="button" className="login-page__support" aria-label="Suporte">
          <img src={iconSuporte} alt="" className="login-page__support-icon" aria-hidden="true" />
        </button>
      </div>

      <form className="login-page__form-section login-page__form-section--signup" onSubmit={handleSignupAccountSubmit} noValidate>
        <div className="login-page__field-stack">
          <LoginInput
            id="signup-email"
            label="E-mail"
            icon={iconEmail}
            placeholder="nome@email.com"
            value={email}
            type="email"
            autoComplete="email"
            inputMode="email"
            errorMessage={emailErrorMessage ?? undefined}
            isInvalid={showEmailError}
            onBlur={validateEmail}
            onChange={handleEmailChange}
            onFocus={() => setEmailErrorMessage(null)}
          />
          <LoginInput
            id="signup-password"
            label="Senha"
            icon={iconPass}
            placeholder="••••••••••••••"
            value={password}
            type={isPasswordVisible ? 'text' : 'password'}
            autoComplete="new-password"
            onChange={(nextPassword) => setPassword(nextPassword)}
            trailingAction={renderPasswordTrailingAction()}
          />
        </div>

        <PrimaryButton
          type="submit"
          disabled={!isEmailValid || !isPasswordFilled || isSubmitting}
          isLoading={isEmailSubmitting}
        >
          Criar conta
        </PrimaryButton>
      </form>

      <div className="login-page__social-section">
        <div className="login-page__divider-text login-page__divider-text--compact">Ou continue com</div>

        <SocialButtons
          disabled={isSubmitting}
          submittingMethod={submittingMethod}
          onAppleClick={() => beginSignupAccountSuccess('apple')}
          onGoogleClick={() => beginSignupAccountSuccess('google')}
        />

        <div className="login-page__signup">
          <span>Já tem uma conta?</span>
          <button type="button" className="login-page__signup-link" onClick={onLoginClick}>
            Entrar
          </button>
        </div>
      </div>

      <p className="login-page__legal">
        Ao continuar, declaro que tenho mais de 18 anos, aceito os{' '}
        <button type="button" className="login-page__legal-link">Termos de uso</button> e as{' '}
        <button type="button" className="login-page__legal-link">Políticas de Privacidade</button>, e entendo que
        o Pitaco apoia a{' '}
        <button type="button" className="login-page__legal-link">Política de Jogo Responsável</button>.
      </p>
    </section>
  )

  const renderSignupPersonal = () => (
    <section
      className="login-page__container login-page__container--signup login-page__container--personal"
      aria-labelledby="signup-personal-title"
    >
      {renderSignupGarantidaBanner()}

      <h1 className="login-page__title" id="signup-personal-title">Dados para começar a jogar</h1>
      <p className="login-page__description">
        Precisamos do seu CPF e celular para validar sua identidade, de acordo com a legislação brasileira.
        Isso permite jogar com segurança e evita fraudes.
      </p>

      <form className="login-page__form-section login-page__form-section--signup" onSubmit={handlePersonalSubmit} noValidate>
        <div className="login-page__field-stack">
          <LoginInput
            id="signup-cpf"
            label="CPF"
            icon={iconCPF}
            placeholder="000.000.000-00"
            value={formatCpf(cpf)}
            type="tel"
            autoComplete="off"
            inputMode="numeric"
            maxLength={14}
            errorMessage={cpfErrorMessage ?? undefined}
            isInvalid={showCpfError}
            onBlur={validateCpf}
            onChange={handleCpfChange}
            onFocus={() => setCpfErrorMessage(null)}
          />
          <PhoneInput
            value={phone}
            errorMessage={phoneErrorMessage ?? undefined}
            isInvalid={showPhoneError}
            onBlur={validatePhone}
            onChange={handlePhoneChange}
            onFocus={() => setPhoneErrorMessage(null)}
          />
        </div>

        <SignupCheckbox checked={acceptsPromos} onChange={setAcceptsPromos}>
          Quero receber promoções, novidades e outras comunicações da Pitaco
        </SignupCheckbox>

        <PrimaryButton
          type="submit"
          disabled={!canContinuePersonal || isSignupActionLoading}
          isLoading={signupLoadingAction === 'personal'}
        >
          Continuar
        </PrimaryButton>
      </form>
    </section>
  )

  const renderPhoneValidationBottomSheet = () => (
    <BottomSheet
      isOpen={isPhoneValidationOpen}
      onClose={closePhoneValidation}
      title="Validar celular"
      leadingContent={<span className="login-phone-validation-sheet__header-spacer" aria-hidden="true" />}
      sheetClassName="login-phone-validation-sheet"
      bodyClassName="login-phone-validation-sheet__body"
      blurBackdrop
      footerContent={(
        <PrimaryButton
          type="button"
          disabled={!canConfirmPhoneValidation || isSignupActionLoading}
          isLoading={signupLoadingAction === 'phone-validation'}
          onClick={confirmPhoneValidation}
        >
          Validar celular
        </PrimaryButton>
      )}
      hideScrollIndicator
    >
      <form
        className="login-phone-validation"
        onSubmit={handlePhoneValidationSubmit}
        noValidate
      >
        <div className="login-phone-validation__copy">
          <p className="login-phone-validation__description">
            Insira o código de 6 dígitos que enviamos para o número{' '}
            <strong className="login-phone-validation__phone">{formatBrazilPhoneForValidation(phoneDigits)}</strong>
          </p>
          <p className="login-phone-validation__change">
            <span>Número errado?</span>
            <button
              type="button"
              className="login-phone-validation__change-button"
              onClick={closePhoneValidation}
            >
              Altere aqui.
            </button>
          </p>
        </div>

        <div className="login-phone-validation__code-group">
          <PhoneValidationCodeInput
            value={phoneValidationCode}
            onChange={setPhoneValidationCode}
          />
          <p className="login-phone-validation__resend">
            <span>Reenviar código em</span>
            <strong>{phoneValidationSeconds} seg</strong>
          </p>
        </div>
      </form>
    </BottomSheet>
  )

  const renderRegionBottomSheet = () => (
    <BottomSheet
      isOpen={isRegionSheetOpen}
      onClose={() => setIsRegionSheetOpen(false)}
      title="Selecione um Estado"
      sheetClassName="login-region-sheet"
      bodyClassName="login-region-sheet__body"
      blurBackdrop
    >
      <fieldset className="login-region-sheet__options">
        <legend className="login-region-sheet__legend">Estado/Região</legend>
        {brazilRegionOptions.map((option) => (
          <label key={option} className="login-region-sheet__option">
            <span className="login-region-sheet__option-label">{option}</span>
            <input
              className="login-region-sheet__radio"
              type="radio"
              name="signup-region"
              value={option}
              checked={region === option}
              onChange={() => {
                setRegion(option)
                setIsRegionSheetOpen(false)
              }}
            />
          </label>
        ))}
      </fieldset>
    </BottomSheet>
  )

  const renderSignupAddress = () => (
    <section
      className="login-page__container login-page__container--signup login-page__container--address"
      aria-labelledby="signup-address-title"
    >
      {renderSignupGarantidaBanner()}

      <h1 className="login-page__title" id="signup-address-title">Onde você mora?</h1>

      <form className="login-page__form-section login-page__form-section--signup" onSubmit={handleAddressSubmit} noValidate>
        <div className="login-page__field-stack">
          <LoginInput
            id="signup-cep"
            label="CEP"
            placeholder="00000-000"
            value={formatCep(cep)}
            type="tel"
            autoComplete="postal-code"
            inputMode="numeric"
            maxLength={9}
            errorMessage={addressLookupError ?? undefined}
            isInvalid={addressLookupStatus === 'error'}
            onChange={(nextCep) => {
              const nextCepDigits = onlyDigits(nextCep).slice(0, 8)

              setCep(nextCepDigits)
              setAddressLookupError(null)

              if (nextCepDigits.length !== 8) {
                addressAbortRef.current?.abort()
                addressAbortRef.current = null
                setAddressLookupStatus('idle')
                return
              }

              lookupCep(nextCepDigits)
            }}
          />

          {shouldShowAddressDetails ? (
            <>
              {addressLookupStatus === 'loading' ? (
                <div className="login-page__lookup-status" role="status">Buscando endereço...</div>
              ) : null}

              <RegionSelect
                id="signup-region"
                label="Estado/Região"
                placeholder="Insira o estado ou região"
                value={region}
                isOpen={isRegionSheetOpen}
                onOpen={() => setIsRegionSheetOpen(true)}
              />
              <LoginInput
                id="signup-neighborhood"
                label="Bairro"
                placeholder="Insira o bairro"
                value={neighborhood}
                onChange={setNeighborhood}
              />
              <LoginInput
                id="signup-street"
                label="Endereço - Rua, Avenida"
                placeholder="Insira o endereço"
                value={street}
                onChange={setStreet}
              />
              <LoginInput
                id="signup-number"
                label="Número"
                placeholder="Insira o número"
                value={addressNumber}
                type="tel"
                inputMode="numeric"
                onChange={(nextNumber) => setAddressNumber(onlyDigits(nextNumber).slice(0, 8))}
              />
              <SignupCheckbox checked={noAddressNumber} onChange={setNoAddressNumber}>
                Endereço sem número
              </SignupCheckbox>
              <LoginInput
                id="signup-complement"
                label="Complemento"
                placeholder="Insira o complemento (se tiver)"
                value={addressComplement}
                onChange={setAddressComplement}
              />
            </>
          ) : null}
        </div>

        <PrimaryButton
          type="submit"
          disabled={!canConfirmAddress || isSignupActionLoading}
          isLoading={signupLoadingAction === 'address'}
        >
          Confirmar endereço
        </PrimaryButton>
      </form>
    </section>
  )

  const renderVerificationIntro = () => (
    <section className="login-page__verification" aria-labelledby="signup-verification-title">
      <div className="login-page__verification-body">
        <div className="login-page__verification-card" aria-hidden="true">
          <div className="login-page__verification-visual">
            <img
              src={imgVerificaIdentidadeLogo}
              alt=""
              className="login-page__verification-logo"
              aria-hidden="true"
            />
            <span className="login-page__verification-mask-clip" aria-hidden="true">
              <span className="login-page__verification-mask-window">
                <span className="login-page__verification-mask" />
              </span>
            </span>
            <img
              src={imgVerificaIdentidadeBorda}
              alt=""
              className="login-page__verification-frame"
              aria-hidden="true"
            />
            <span className="login-page__verification-scan-line" aria-hidden="true" />
          </div>
        </div>
        <div className="login-page__verification-copy">
          <h1 className="login-page__verification-title" id="signup-verification-title">
            Vamos verificar sua identidade
          </h1>
          <p className="login-page__verification-description">
            Para jogar com tudo, precisamos verificar sua identidade. Fique em um lugar bem iluminado e sem acessórios
            como óculos ou boné.
          </p>
        </div>
      </div>

      <div className="login-page__verification-footer">
        <PrimaryButton
          type="button"
          disabled={isSignupActionLoading}
          isLoading={signupLoadingAction === 'verification-start'}
          onClick={handleVerificationStart}
        >
          Verificar identidade agora
        </PrimaryButton>
        <div className="login-page__unico">
          <span>Verificação protegida por</span>
          <img src={logoUnico} alt="Unico" className="login-page__unico-logo" />
        </div>
      </div>
    </section>
  )

  const renderVerificationCapture = (stage: VerificationCaptureStage) => {
    const captureConfig = verificationCaptureScreens[stage]
    const isFaceCapture = stage === 'face'
    const isCaptureButtonDisabled = !isVerificationMobile
      || isVerificationFadingOut
      || verificationCameraStatus !== 'ready'
    const shouldShowCaptureAction = isVerificationMobile && verificationCameraStatus === 'ready'
    const shouldShowSkipVerification = !isVerificationMobile
      || (verificationCameraStatus === 'unavailable' && verificationCameraError !== null)
    const cameraStatusLabel = verificationCameraStatus === 'loading'
      ? 'Carregando câmera...'
      : verificationCameraError ?? 'A câmera será exibida no celular.'

    return (
      <section
        className={[
          'login-page__verification',
          'login-page__verification--capture',
          isFaceCapture ? 'login-page__verification--capture-face' : '',
        ].filter(Boolean).join(' ')}
        aria-labelledby={`signup-verification-${stage}-title`}
      >
        <div
          className={[
            'login-page__verification-step',
            isVerificationFadingOut ? 'login-page__verification-step--fading' : '',
          ].filter(Boolean).join(' ')}
        >
          <div className="login-page__verification-body login-page__verification-body--capture">
            <p className="login-page__capture-eyebrow">{captureConfig.eyebrow}</p>

            <button
              type="button"
              className={[
                'login-page__capture-card',
                isFaceCapture ? 'login-page__capture-card--face' : '',
              ].filter(Boolean).join(' ')}
              disabled={isCaptureButtonDisabled}
              aria-label={captureConfig.ariaLabel}
              onClick={() => handleVerificationCapture(stage)}
            >
              {isVerificationMobile ? (
                <video
                  ref={verificationVideoRef}
                  className={[
                    'login-page__capture-video',
                    isFaceCapture ? 'login-page__capture-video--mirrored' : '',
                  ].filter(Boolean).join(' ')}
                  autoPlay
                  muted
                  playsInline
                />
              ) : null}

              {isVerificationMobile && verificationCameraStatus === 'ready' ? null : (
                <span className="login-page__capture-status">
                  {verificationCameraStatus === 'loading' ? (
                    <span className="login-page__capture-status-spinner" aria-hidden="true" />
                  ) : null}
                  <span>{cameraStatusLabel}</span>
                </span>
              )}

              <span
                className={[
                  'login-page__capture-target',
                  isFaceCapture ? 'login-page__capture-target--face' : '',
                ].filter(Boolean).join(' ')}
                aria-hidden="true"
              />
            </button>

            <div className="login-page__verification-copy">
              <h1 className="login-page__verification-title" id={`signup-verification-${stage}-title`}>
                {captureConfig.title}
              </h1>
            </div>
          </div>

          {shouldShowCaptureAction || shouldShowSkipVerification ? (
            <div className="login-page__verification-footer login-page__verification-footer--capture">
              {shouldShowCaptureAction ? (
                <PrimaryButton
                  type="button"
                  disabled={isVerificationFadingOut}
                  onClick={() => handleVerificationCapture(stage)}
                >
                  Capturar foto
                </PrimaryButton>
              ) : (
                <button
                  type="button"
                  className="login-page__skip-verification"
                  disabled={isVerificationFadingOut}
                  onClick={() => handleVerificationSkip(stage)}
                >
                  Pular verificação
                </button>
              )}
            </div>
          ) : null}
        </div>
      </section>
    )
  }

  const renderVerificationLoading = () => (
    <section
      className="login-page__verification login-page__verification--loading"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="login-page__verification-loading">
        <span className="login-page__verification-loading-spinner" aria-hidden="true" />
        <span className="login-page__sr-only">
          {pendingVerificationStage === 'limits' ? 'Validando identidade' : 'Carregando próxima etapa'}
        </span>
      </div>
    </section>
  )

  const renderLimitChips = (
    options: string[],
    selectedValue: string,
    onSelect: (value: string) => void,
    customSheetType: LimitCustomSheetType,
  ) => (
    <div className="login-page__limit-chips">
      {options.map((option) => {
        const isSelected = selectedValue === option
        const isCustomOption = option === customLimitOption

        return (
          <button
            key={option}
            type="button"
            className={[
              'login-page__limit-chip',
              isSelected ? 'login-page__limit-chip--selected' : '',
            ].filter(Boolean).join(' ')}
            aria-pressed={isSelected}
            onClick={() => {
              if (isCustomOption) {
                openCustomLimitSheet(customSheetType)
                return
              }

              onSelect(option)
            }}
          >
            {option}
          </button>
        )
      })}
    </div>
  )

  const renderVerificationLimits = () => (
    <section className="login-page__verification login-page__verification--limits" aria-labelledby="signup-limits-title">
      <header className="login-page__limits-header">
        <h1 className="login-page__limits-header-title" id="signup-limits-title">Limites de jogo</h1>
      </header>

      <div className="login-page__limits-body">
        <p className="login-page__limits-description">
          De acordo com a legislação brasileira, é necessário definir limites de tempo e de perdas para continuar a jogar.
        </p>

        <div className="login-page__limits-groups">
          <section
            className="login-page__limits-group login-page__limits-group--divided"
            aria-labelledby="signup-time-limit-title"
          >
            <div className="login-page__limits-group-heading">
              <img src={iconLimiteJogoDiario} alt="" className="login-page__limits-group-icon" aria-hidden="true" />
              <h2 className="login-page__limits-group-title" id="signup-time-limit-title">
                Limite de tempo de jogo diário
              </h2>
            </div>
            {renderLimitChips(gameTimeLimitOptions, selectedTimeLimit, setSelectedTimeLimit, 'time')}
          </section>

          <section className="login-page__limits-group" aria-labelledby="signup-loss-limit-title">
            <div className="login-page__limits-group-heading">
              <img src={iconLimitePerdaDiario} alt="" className="login-page__limits-group-icon" aria-hidden="true" />
              <h2 className="login-page__limits-group-title" id="signup-loss-limit-title">
                Limite de perdas diário
              </h2>
            </div>
            {renderLimitChips(lossLimitOptions, selectedLossLimit, setSelectedLossLimit, 'loss')}
          </section>
        </div>
      </div>

      <footer className="login-page__limits-footer">
        <div className="login-page__limits-footer-content">
          <p className="login-page__limits-footer-note">
            Você pode alterar esses limites em “Minha conta” &gt; “Jogo Responsável”.
          </p>
          <PrimaryButton
            type="button"
            disabled={isSignupActionLoading}
            isLoading={signupLoadingAction === 'limits-save'}
            onClick={handleLimitsSave}
          >
            Salvar limites
          </PrimaryButton>
        </div>
      </footer>
    </section>
  )

  const renderLimitsCustomBottomSheet = () => {
    if (activeCustomLimitSheet === null) return null

    const isTimeLimitSheet = activeCustomLimitSheet === 'time'
    const title = isTimeLimitSheet ? 'Limite de tempo de jogo diário' : 'Limite de perdas diário'
    const description = isTimeLimitSheet
      ? 'Insira outro valor para seu limite de tempo de jogo diário.'
      : 'Insira outro valor para seu limite de perdas diário.'
    const isTimeLimitMinutesDisabled = customTimeLimitHoursInput === '24'
    const isValueValid = isTimeLimitSheet
      ? isCustomTimeLimitValid(customTimeLimitHoursInput, customTimeLimitMinutesInput)
      : parseCurrencyLimitCents(customLossLimitInput) > 0
    const handleCustomTimeLimitHoursChange = (value: string) => {
      const nextHours = normalizeTimeLimitHoursInput(value)

      setCustomTimeLimitHoursInput(nextHours)

      if (nextHours === '24') {
        setCustomTimeLimitMinutesInput('')
      }
    }
    const handleCustomTimeLimitMinutesChange = (value: string) => {
      if (isTimeLimitMinutesDisabled) return

      setCustomTimeLimitMinutesInput(normalizeTimeLimitMinutesInput(value))
    }

    return (
      <BottomSheet
        isOpen={isCustomLimitSheetOpen}
        onClose={closeCustomLimitSheet}
        title={title}
        leadingContent={<span className="login-limits-custom-sheet__header-spacer" aria-hidden="true" />}
        sheetClassName="login-limits-custom-sheet"
        bodyClassName="login-limits-custom-sheet__body"
        blurBackdrop
        footerContent={(
          <PrimaryButton
            type="button"
            disabled={!isValueValid || isSignupActionLoading}
            isLoading={signupLoadingAction === 'custom-limit'}
            onClick={handleCustomLimitSubmit}
          >
            Continuar
          </PrimaryButton>
        )}
        hideScrollIndicator
      >
        <form
          className="login-limits-custom-form"
          onSubmit={(event) => {
            event.preventDefault()
            handleCustomLimitSubmit()
          }}
        >
          <p className="login-limits-custom-form__description">{description}</p>
          {isTimeLimitSheet ? (
            <div className="login-limits-custom-form__time-row">
              <label className="login-limits-custom-form__field">
                <span className="login-page__sr-only">Horas do limite de tempo de jogo diário</span>
                <span className="login-limits-custom-form__input-shell">
                  <input
                    className="login-limits-custom-form__input"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={customTimeLimitHoursInput}
                    placeholder="0"
                    aria-label="Horas do limite de tempo de jogo diário"
                    onChange={(event) => handleCustomTimeLimitHoursChange(event.target.value)}
                  />
                  <span className="login-limits-custom-form__affix" aria-hidden="true">horas</span>
                </span>
              </label>
              <label className="login-limits-custom-form__field">
                <span className="login-page__sr-only">Minutos do limite de tempo de jogo diário</span>
                <span
                  className={[
                    'login-limits-custom-form__input-shell',
                    isTimeLimitMinutesDisabled ? 'login-limits-custom-form__input-shell--disabled' : '',
                  ].filter(Boolean).join(' ')}
                >
                  <input
                    className="login-limits-custom-form__input"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={customTimeLimitMinutesInput}
                    placeholder="0"
                    aria-label="Minutos do limite de tempo de jogo diário"
                    disabled={isTimeLimitMinutesDisabled}
                    onChange={(event) => handleCustomTimeLimitMinutesChange(event.target.value)}
                  />
                  <span className="login-limits-custom-form__affix" aria-hidden="true">minutos</span>
                </span>
              </label>
            </div>
          ) : (
            <label className="login-limits-custom-form__field">
              <span className="login-page__sr-only">{title}</span>
              <span className="login-limits-custom-form__input-shell">
                <span className="login-limits-custom-form__affix" aria-hidden="true">R$</span>
                <input
                  className="login-limits-custom-form__input"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={customLossLimitInput}
                  placeholder="0,00"
                  aria-label={description}
                  onChange={(event) => setCustomLossLimitInput(formatCurrencyLimitInput(event.target.value))}
                />
              </span>
            </label>
          )}
        </form>
      </BottomSheet>
    )
  }

  const renderVerification = () => {
    if (verificationStage === 'document-front' || verificationStage === 'document-back' || verificationStage === 'face') {
      return renderVerificationCapture(verificationStage)
    }

    if (verificationStage === 'loading') return renderVerificationLoading()
    if (verificationStage === 'limits') return renderVerificationLimits()

    return renderVerificationIntro()
  }

  const renderSignup = () => {
    if (signupStep === 'verification') return renderVerification()
    if (signupStep === 'address') return renderSignupAddress()
    if (signupStep === 'personal') return renderSignupPersonal()

    return renderSignupAccount()
  }

  const signupStepMotionClassName = [
    'login-page__signup-step-motion',
    signupStepMotionPhase !== 'idle' ? `login-page__signup-step-motion--${signupStepMotionPhase}` : '',
  ].filter(Boolean).join(' ')
  const authModeMotionClassName = [
    'login-page__auth-mode-motion',
    authModeMotionPhase !== 'idle' ? `login-page__auth-mode-motion--${authModeMotionPhase}` : '',
  ].filter(Boolean).join(' ')

  return (
    <main
      ref={loginPageRef}
      className={[
        'login-page',
        `login-page--${motionState}`,
        displayedMode === 'signup' ? 'login-page--signup' : '',
        displayedMode === 'signup' && signupStep === 'verification' ? 'login-page--verification' : '',
      ].filter(Boolean).join(' ')}
      data-motion={motionState}
    >
      <div className="login-page__scrim" aria-hidden="true" />
      <div className="login-page__surface" onAnimationEnd={handleSurfaceAnimationEnd}>
        <div className={authModeMotionClassName}>
          {displayedMode === 'signup' ? (
            <>
              {signupStep !== 'verification' ? <AuthHeader activeStep={signupStep} onBack={handleBack} /> : null}
              <div key={signupStep} className={signupStepMotionClassName}>
                {renderSignup()}
              </div>
            </>
          ) : renderLogin()}
        </div>
      </div>
      {displayedMode === 'signup' && signupStep === 'personal' ? renderPhoneValidationBottomSheet() : null}
      {displayedMode === 'signup' && signupStep === 'address' ? renderRegionBottomSheet() : null}
      {displayedMode === 'signup' && signupStep === 'verification' && verificationStage === 'limits'
        ? renderLimitsCustomBottomSheet()
        : null}
    </main>
  )
}

import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Check,
  Eye,
  EyeOff,
  Layers3,
  LockKeyhole,
  Mail,
  Package,
  UserRound,
} from 'lucide-react'
import { forgotPassword, login, resetPassword, signup } from './api'
import { returnPath, startSession, useSession } from './session'

const content = {
  login: {
    title: 'Welcome back.',
    description: 'Sign in to keep your inventory moving.',
    action: 'Sign in to workspace',
  },
  signup: {
    title: 'Make room for better.',
    description: 'Create your account. Bring your inventory together.',
    action: 'Create account',
  },
  reset: {
    title: 'Forgot your password?',
    description: 'Enter your email to get a password reset code.',
    action: 'Send reset code',
  },
}

function AuthInput({ label, icon: Icon, password = false, ...props }) {
  const [visible, setVisible] = useState(false)
  const id = `auth-${props.name}`
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-xs font-semibold text-[#34483e]"
      >
        {label}
      </label>
      <div className="relative">
        <Icon
          size={17}
          strokeWidth={1.6}
          className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[#95a399]"
        />
        <input
          {...props}
          id={id}
          type={
            password ? (visible ? 'text' : 'password') : props.type || 'text'
          }
          className={`h-12 w-full rounded-lg border border-[#dfe6e1] bg-[#fbfcfb] pl-11 text-sm text-[#233f32] transition placeholder:text-[#a2ada6] focus:border-[#51836a] focus:bg-white focus:outline-2 focus:outline-offset-0 focus:outline-[#51836a]/15 max-sm:text-base [@media(max-height:700px)]:h-11 ${password ? 'pr-12' : 'pr-3.5'}`}
        />
        {password && (
          <button
            type="button"
            className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-[#899a8e] hover:bg-[#edf3ee] hover:text-[#315a43]"
            aria-label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
            onClick={() => setVisible(!visible)}
          >
            {visible ? (
              <EyeOff size={17} strokeWidth={1.7} />
            ) : (
              <Eye size={17} strokeWidth={1.7} />
            )}
          </button>
        )}
      </div>
    </div>
  )
}

function Brand({ light = false }) {
  return (
    <div
      className={`flex items-center gap-2.5 text-[23px] font-bold tracking-[-0.8px] ${light ? 'text-white' : 'text-[#183d30]'}`}
    >
      <img
        src={`${import.meta.env.BASE_URL}stocksense.svg`}
        className="size-9"
        alt=""
      />
      <span>
        Stock<span className="font-medium">Sense</span>
        <span className="text-[#bce58b]">.</span>
      </span>
    </div>
  )
}

export default function AuthPage({ mode = 'login' }) {
  const session = useSession()
  const location = useLocation()
  const [notice, setNotice] = useState('')
  const [stage, setStage] = useState('email')
  const [resetEmail, setResetEmail] = useState('')
  const isResetCode = mode === 'reset' && stage === 'code'
  const copy = content[mode]

  if (session) return <Navigate to={returnPath(location)} replace />

  async function submit(event) {
    event.preventDefault()
    setNotice('')
    const data = new FormData(event.currentTarget)
    const email = String(data.get('email') || resetEmail || '').trim()
    const name = String(data.get('name') || '').trim()
    const password = String(data.get('password') || '')
    const code = String(data.get('code') || '').trim()

    try {
      if (mode === 'reset' && !isResetCode) {
        if (!email) {
          setNotice('Please enter your email.')
          return
        }
        const result = await forgotPassword(email)
        setResetEmail(email)
        setStage('code')
        setNotice(result.message || 'OTP sent to your email')
        return
      }

      if (mode === 'reset' && isResetCode) {
        if (!email) {
          setNotice('Please enter your email first.')
          return
        }
        if (!code || password.length < 6) {
          setNotice(
            'Please enter the reset code and a password with at least 6 characters.',
          )
          return
        }
        const result = await resetPassword({
          email,
          otp: code,
          newPassword: password,
        })
        setStage('email')
        setNotice(result.message || 'Password reset successful')
        return
      }

      if (mode === 'signup' && !name) {
        setNotice('Please enter your full name.')
        return
      }
      if (!email || !password || (mode === 'signup' && password.length < 6)) {
        setNotice(
          'Please enter your email and a password with at least 6 characters.',
        )
        return
      }

      const result =
        mode === 'signup'
          ? await signup({ name, email, password })
          : await login({ email, password })
      const user = result.data?.user || {}
      startSession({
        email: user.email || email,
        name: user.name || name,
        id: user.id,
        role: user.role,
      })
    } catch (error) {
      setNotice(error.message)
    }
  }

  return (
    <div className="grid h-dvh min-h-0 overflow-hidden bg-[#fbfcfa] lg:grid-cols-[0.94fr_1.06fr]">
      <aside className="relative hidden min-h-0 flex-col overflow-hidden bg-[#123d30] px-10 py-8 text-white lg:flex xl:px-14 xl:py-10 [@media(max-height:700px)]:py-6">
        <div className="pointer-events-none absolute -right-40 -bottom-56 size-[620px] rounded-full bg-[radial-gradient(circle,#527d4140,transparent_68%)]" />
        <div className="relative z-10">
          <Brand light />
        </div>

        <div className="relative z-10 my-auto py-6 [@media(max-height:700px)]:py-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[9px] font-medium tracking-[1.7px] text-[#c4d6bc]">
            <span className="size-1.5 rounded-full bg-[#c6ee8a]" /> A LITTLE
            ORDER. A LOT OF POSSIBILITY.
          </span>
          <h1 className="mt-6 text-[clamp(36px,3.5vw,56px)] leading-[1.13] font-semibold tracking-[-2.4px] [@media(max-height:700px)]:mt-4 [@media(max-height:700px)]:text-[40px]">
            Less guesswork.
            <br />
            More <span className="text-[#c6ee8a]">control.</span>
          </h1>
          <p className="mt-5 max-w-[340px] text-[13px] leading-7 text-[#a9c2b1] [@media(max-height:700px)]:mt-3">
            Every product, every location, every movement.
            <br />
            One calm place to keep it all together.
          </p>

          <div
            className="relative mx-auto mt-5 h-[210px] w-full max-w-[370px] [@media(max-height:760px)]:h-[155px] [@media(max-height:650px)]:hidden"
            aria-hidden="true"
          >
            <div className="absolute top-1/2 left-1/2 size-[185px] -translate-1/2 rounded-full border border-dashed border-[#739b6c]/30 [@media(max-height:760px)]:size-[145px]" />
            <div className="absolute top-1/2 left-1/2 size-[135px] -translate-1/2 rotate-[-9deg] rounded-[28px] border border-[#bbd796]/35 bg-linear-145 from-[#74985c]/40 to-[#315b3e]/60 shadow-[16px_18px_40px_#09281c40] [@media(max-height:760px)]:size-[110px]">
              <Package
                className="m-auto h-full w-[80px] text-[#bfdca0] [@media(max-height:760px)]:w-[68px]"
                strokeWidth={0.8}
              />
            </div>
            <div className="absolute top-7 left-0 flex -rotate-3 items-center gap-2.5 rounded-xl border border-[#719164]/30 bg-[#244e39] px-3.5 py-3 shadow-lg [@media(max-height:760px)]:top-3">
              <span className="grid size-7 place-items-center rounded-lg bg-[#c6ee8a]/10 text-[#c6ee8a]">
                <ArrowDownToLine size={15} />
              </span>
              <span className="text-[11px] text-[#d7e5ce]">
                Receive with ease
              </span>
            </div>
            <div className="absolute right-0 bottom-7 flex rotate-3 items-center gap-2.5 rounded-xl border border-[#719164]/30 bg-[#244e39] px-3.5 py-3 shadow-lg [@media(max-height:760px)]:bottom-3">
              <span className="grid size-7 place-items-center rounded-lg bg-[#c6ee8a]/10 text-[#c6ee8a]">
                <Check size={16} />
              </span>
              <span className="text-[11px] text-[#d7e5ce]">
                Everything in place
              </span>
            </div>
          </div>
        </div>

        <div className="relative flex items-center justify-between border-t border-white/10 pt-5 text-[10px] text-[#8faa96] [@media(max-height:700px)]:pt-3">
          <span>Inventory, in sync.</span>
          <span className="flex items-center gap-1.5">
            <Layers3 size={13} /> Built for your everyday.
          </span>
        </div>
      </aside>

      <main className="grid min-h-0 grid-rows-[auto_1fr_auto] px-6 py-6 sm:px-10 lg:px-12 lg:py-8 xl:px-16 [@media(max-height:700px)]:py-4">
        <header className="flex min-h-9 items-center justify-between gap-3">
          <div className="lg:hidden">
            <Brand />
          </div>
          <span className="hidden text-[10px] font-medium tracking-[1.8px] text-[#8d9d91] lg:block">
            YOUR STOCK. YOUR SPACE.
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-[#e4ebe2] bg-white px-2.5 py-1.5 text-[9px] font-medium text-[#7c8e7c] max-[380px]:hidden">
            <span className="size-1 rounded-full bg-[#8daf74]" /> Inventory
            workspace
          </span>
        </header>

        <div className="min-h-0 overflow-y-auto overscroll-contain [scrollbar-width:thin]">
          <div className="mx-auto flex min-h-full w-full max-w-[390px] flex-col justify-center py-6 [@media(max-height:700px)]:py-3">
            <div className="mb-6 [@media(max-height:700px)]:mb-4">
              <span className="mb-4 flex size-11 items-center justify-center rounded-xl border border-[#e0e9d9] bg-[#edf4e7] text-[#63824e] [@media(max-height:700px)]:hidden">
                {mode === 'signup' ? (
                  <UserRound size={21} strokeWidth={1.6} />
                ) : (
                  <LockKeyhole size={21} strokeWidth={1.6} />
                )}
              </span>
              <h2 className="text-[32px] leading-tight font-semibold tracking-[-1.3px] text-[#1d392d] max-sm:text-[29px]">
                {isResetCode ? 'Check your inbox.' : copy.title}
              </h2>
              <p className="mt-2.5 text-[13px] leading-6 text-[#88958c] [@media(max-height:700px)]:mt-2">
                {isResetCode
                  ? 'Enter your reset code and choose a new password.'
                  : copy.description}
              </p>
            </div>

            <form onSubmit={submit}>
              <div className="flex flex-col gap-[18px] [@media(max-height:700px)]:gap-3.5">
                {mode === 'signup' && (
                  <AuthInput
                    label="Full name"
                    name="name"
                    icon={UserRound}
                    placeholder="Your full name"
                    autoComplete="name"
                    maxLength={100}
                    required
                  />
                )}
                {!isResetCode && (
                  <AuthInput
                    label="Email address"
                    name="email"
                    icon={Mail}
                    type="email"
                    placeholder="you@company.com"
                    autoComplete="email"
                    required
                  />
                )}
                {mode !== 'reset' && (
                  <AuthInput
                    label="Password"
                    name="password"
                    icon={LockKeyhole}
                    password
                    placeholder="Enter your password"
                    autoComplete={
                      mode === 'login' ? 'current-password' : 'new-password'
                    }
                    minLength={mode === 'login' ? 1 : 6}
                    required
                  />
                )}
                {isResetCode && (
                  <>
                    <AuthInput
                      label="One-time code"
                      name="code"
                      icon={Mail}
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      placeholder="6-digit code"
                      autoComplete="one-time-code"
                      required
                    />
                    <AuthInput
                      label="New password"
                      name="password"
                      icon={LockKeyhole}
                      password
                      placeholder="At least 6 characters"
                      minLength={mode === 'login' ? 1 : 6}
                      autoComplete="new-password"
                      required
                    />
                  </>
                )}
              </div>
              {mode === 'login' && (
                <div className="mt-3.5 flex justify-end">
                  <Link
                    to="/auth/reset"
                    state={location.state}
                    className="text-[11px] font-medium text-[#477051] hover:text-[#173f2a] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}
              {mode === 'signup' && (
                <p className="mt-2.5 text-[10px] text-[#8d9c91]">
                  Use at least 6 characters. New accounts start as Warehouse
                  Staff; an administrator can grant manager access.
                </p>
              )}
              {notice && (
                <p
                  role="alert"
                  className="mt-3 rounded-lg border border-[#ecdcc5] bg-[#fff9ed] px-3 py-2 text-[11px] leading-5 text-[#927142]"
                >
                  {notice}
                </p>
              )}
              <button
                type="submit"
                className="mt-5 flex h-12 w-full items-center justify-center gap-2.5 rounded-lg border border-[#245438] bg-[#285c3e] text-[12px] font-semibold text-white shadow-[0_3px_8px_#24482d12] transition hover:bg-[#19472d] active:translate-y-px [@media(max-height:700px)]:mt-4 [@media(max-height:700px)]:h-11"
              >
                {isResetCode ? 'Reset password' : copy.action}
                <ArrowRight size={16} />
              </button>
            </form>

            {mode === 'reset' && (
              <button
                type="button"
                className="mx-auto mt-4 text-[11px] text-[#779366] hover:underline"
                onClick={() => {
                  setStage(isResetCode ? 'email' : 'code')
                  setNotice('')
                }}
              >
                {isResetCode
                  ? 'Back to email entry'
                  : 'Preview the OTP entry screen'}
              </button>
            )}
            <div className="mt-6 border-t border-[#e5ebe3] pt-5 text-center text-[12px] text-[#8a988c] [@media(max-height:700px)]:mt-4 [@media(max-height:700px)]:pt-4">
              {mode === 'login' ? (
                <>
                  New to StockSense?{' '}
                  <Link
                    to="/auth/signup"
                    state={location.state}
                    className="inline-flex items-center gap-0.5 font-semibold text-[#426d43] hover:text-[#173f2a]"
                  >
                    Create an account <ArrowUpRight size={13} />
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <Link
                    to="/auth/login"
                    state={location.state}
                    className="font-semibold text-[#426d43] hover:text-[#173f2a]"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        <footer className="flex items-center justify-between gap-2 pt-4 text-[9px] text-[#a0aca2] [@media(max-height:600px)]:hidden">
          <span>StockSense © {new Date().getFullYear()}</span>
          <span>A place for everything.</span>
        </footer>
      </main>
    </div>
  )
}

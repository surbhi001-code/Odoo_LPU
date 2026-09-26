import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Box, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import Field from '../../components/forms/Field'
import Button from '../../components/ui/Button'

const content = {
  login: [
    'Welcome back.',
    'A clearer view of your inventory is waiting.',
    'Sign in',
  ],
  signup: [
    'A fresh start for your stock.',
    'Create your StockSense workspace.',
    'Create account',
  ],
  reset: [
    'Let’s get you back in.',
    'Reset your password with a one-time code.',
    'Send reset code',
  ],
}

function PasswordField({ label = 'Password', autoComplete }) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <Field
        label={label}
        type={visible ? 'text' : 'password'}
        minLength={8}
        placeholder="At least 8 characters"
        autoComplete={autoComplete}
        className="pr-12!"
        required
      />
      <button
        type="button"
        className="absolute right-2 bottom-1 flex size-8 items-center justify-center rounded-md text-[#82916f] hover:bg-[#f0f5e9]"
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        onClick={() => setVisible(!visible)}
      >
        {visible ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  )
}

export default function AuthPage({ mode = 'login' }) {
  const [notice, setNotice] = useState(false)
  const [stage, setStage] = useState('email')
  return (
    <div className="grid min-h-dvh grid-cols-1 min-[801px]:grid-cols-[0.9fr_1.1fr]">
      <aside className="hidden flex-col justify-between bg-[#143b32] px-[55px] py-[43px] text-[#eff5e8] min-[801px]:flex max-[1050px]:p-[35px]">
        <Link
          to="/"
          className="flex items-center gap-2.5 text-[23px] font-extrabold tracking-[-0.7px] text-white"
        >
          <img
            className="size-9"
            src={`${import.meta.env.BASE_URL}stocksense.svg`}
            alt=""
          />
          StockSense
        </Link>
        <div>
          <span className="text-[10px] font-semibold tracking-[1.55px] text-[#a8c588]">
            LESS GUESSWORK. MORE CLARITY.
          </span>
          <h1 className="my-5 text-[55px] leading-[1.22] tracking-[-2.5px] max-[1050px]:text-[45px]">
            Your inventory.
            <br />
            Everything
            <br />
            <span className="text-[#c6ee8a]">in its place.</span>
          </h1>
          <p className="text-[13px] leading-[1.9] text-[#a7beac]">
            From the first receipt to the final delivery.
            <br />
            Keep your stock, and your team, in sync.
          </p>
          <div
            className="relative mx-auto my-[34px] w-[190px] -rotate-10 text-[#8caf78]"
            aria-hidden="true"
          >
            <Box size={150} strokeWidth={0.7} />
            <span className="absolute right-0 bottom-0 grid size-15 rotate-15 place-items-center rounded-[17px] bg-[#335944] text-[#c2df9f]">
              <ShieldCheck size={38} />
            </span>
          </div>
        </div>
        <small className="text-[10px] text-[#809e89]">
          StockSense · Inventory management, simplified.
        </small>
      </aside>

      <main className="relative flex min-h-dvh flex-col justify-center bg-white px-[65px] py-[45px] max-[1050px]:p-[35px] max-[800px]:p-[30px] max-[520px]:p-[25px]">
        <Link
          to="/"
          className="mb-[55px] flex items-center gap-2 self-end text-[11px] text-[#73915d] hover:text-[#315e35] max-[800px]:mb-10 max-[520px]:text-[10px]"
        >
          Explore the local workspace <ArrowRight size={16} />
        </Link>
        <div className="m-auto w-full max-w-[390px]">
          <span className="text-[9px] font-semibold tracking-[1.55px] text-[#7f9587]">
            WELCOME TO STOCKSENSE
          </span>
          <h2 className="mt-3 text-[30px] leading-[1.4] tracking-[-1px] max-[800px]:text-[28px] max-[520px]:text-[27px]">
            {content[mode][0]}
          </h2>
          <p className="mt-[9px] text-xs leading-[1.8] text-[#82916f]">
            {content[mode][1]}
          </p>
          <p className="my-[22px] rounded-lg border border-[#e5eddc] bg-[#f6f9f1] px-[15px] py-[13px] text-[11px] leading-[1.8] text-[#728161]">
            Frontend preview · Authentication and email delivery will be
            connected later. No credentials are saved.
          </p>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              setNotice(true)
            }}
          >
            <div className="flex flex-col gap-[18px]">
              {mode === 'signup' && (
                <Field
                  label="Full name"
                  placeholder="Your full name"
                  autoComplete="name"
                  required
                />
              )}
              {stage === 'email' && (
                <Field
                  label="Email address"
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                />
              )}
              {mode !== 'reset' && (
                <PasswordField
                  autoComplete={
                    mode === 'login' ? 'current-password' : 'new-password'
                  }
                />
              )}
              {mode === 'reset' && stage === 'code' && (
                <>
                  <Field
                    label="One-time code"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    placeholder="6-digit code"
                    autoComplete="one-time-code"
                    required
                  />
                  <PasswordField
                    label="New password"
                    autoComplete="new-password"
                  />
                </>
              )}
            </div>
            {mode === 'login' && (
              <Link
                className="mt-3.5 block text-right text-[11px] text-[#62804c] hover:underline"
                to="/auth/reset"
              >
                Forgot password?
              </Link>
            )}
            {notice && (
              <p
                className="mt-[17px] rounded-md border border-[#f4ded2] bg-[#fff3ee] px-[13px] py-[11px] text-[11px] leading-[1.8] text-[#ad6148]"
                role="status"
              >
                {mode === 'reset'
                  ? 'No email was sent. Connect the authentication API to verify a code and reset your password.'
                  : 'Authentication is not connected yet. Use the local workspace preview to explore the inventory UI.'}
              </p>
            )}
            <Button className="mt-[22px] min-h-[42px]! w-full">
              {mode === 'reset' && stage === 'code'
                ? 'Reset password'
                : content[mode][2]}
              <ArrowRight size={17} />
            </Button>
          </form>
          {mode === 'reset' && (
            <button
              className="mx-auto mt-[18px] block text-[11px] font-medium text-[#648853] hover:underline"
              onClick={() => {
                setStage(stage === 'email' ? 'code' : 'email')
                setNotice(false)
              }}
            >
              {stage === 'email'
                ? 'Preview the OTP entry screen'
                : 'Back to email entry'}
            </button>
          )}
          <p className="mt-[23px] text-center text-[11px] leading-[1.8] text-[#82916f]">
            {mode === 'login' ? (
              <>
                New to StockSense?{' '}
                <Link
                  className="font-semibold text-[#5b7d45] hover:underline"
                  to="/auth/signup"
                >
                  Create an account
                </Link>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <Link
                  className="font-semibold text-[#5b7d45] hover:underline"
                  to="/auth/login"
                >
                  Sign in
                </Link>
              </>
            )}
          </p>
        </div>
        <small className="mt-[55px] text-center text-[10px] text-[#a7b198]">
          Organized stock. Smoother days.
        </small>
      </main>
    </div>
  )
}

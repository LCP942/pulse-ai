import { type FormEvent, useEffect, useRef, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface FormValues {
  name: string
  email: string
  password: string
}

const initialValues: FormValues = { name: '', email: '', password: '' }

function validate(values: FormValues) {
  const errors: Partial<Record<keyof FormValues, string>> = {}
  if (!values.name.trim()) errors.name = 'Name is required.'
  if (!values.email.trim()) errors.email = 'Email is required.'
  else if (!/\S+@\S+\.\S+/.test(values.email)) errors.email = 'Enter a valid email address.'
  if (values.password.length < 8) errors.password = 'Password must be at least 8 characters.'
  return errors
}

/** Same inline-validation and success pattern as Contact — one form UX
    across the app, no native browser bubbles. The signup is simulated:
    nothing is stored or sent anywhere. */
export default function Signup() {
  const [values, setValues] = useState<FormValues>(initialValues)
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({})
  const [submitted, setSubmitted] = useState(false)
  const successHeadingRef = useRef<HTMLHeadingElement>(null)

  const errors = validate(values)

  useEffect(() => {
    if (submitted) successHeadingRef.current?.focus()
  }, [submitted])

  function handleBlur(field: keyof FormValues) {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  function handleChange(field: keyof FormValues, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setTouched({ name: true, email: true, password: true })
    if (Object.keys(validate(values)).length === 0) {
      setSubmitted(true)
    }
  }

  function errorProps(field: keyof FormValues) {
    const visible = touched[field] && !!errors[field]
    return {
      'aria-invalid': visible,
      'aria-describedby': visible ? `signup-${field}-error` : undefined,
    }
  }

  function FieldError({ field }: { field: keyof FormValues }) {
    if (!(touched[field] && errors[field])) return null
    return (
      <p id={`signup-${field}-error`} role="alert" className="text-sm text-destructive">
        {errors[field]}
      </p>
    )
  }

  if (submitted) {
    return (
      <section className="mx-auto max-w-[480px] px-4 py-16 sm:px-6">
        <title>Sign up — Pulse</title>
        <div
          role="status"
          className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-8 text-center"
        >
          <CheckCircle2 aria-hidden="true" className="size-12 text-success" />
          <h1
            ref={successHeadingRef}
            tabIndex={-1}
            className="font-heading text-2xl font-semibold outline-none"
          >
            You're in.
          </h1>
          <p className="text-sm text-muted-foreground">
            Welcome, {values.name.split(' ')[0]} — your 14-day free trial starts now.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-[480px] px-4 py-16 sm:px-6">
      <title>Sign up — Pulse</title>
      <h1 className="font-heading text-3xl font-semibold tracking-tight">Create your account</h1>
      <p className="mt-3 text-muted-foreground">
        Start your free trial — no credit card required.
      </p>
      <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="signup-name">Name</Label>
          <Input
            id="signup-name"
            name="name"
            autoComplete="name"
            value={values.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            {...errorProps('name')}
          />
          <FieldError field="name" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="signup-email">Email</Label>
          <Input
            id="signup-email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            {...errorProps('email')}
          />
          <FieldError field="email" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="signup-password">Password</Label>
          <Input
            id="signup-password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={values.password}
            onChange={(e) => handleChange('password', e.target.value)}
            onBlur={() => handleBlur('password')}
            {...errorProps('password')}
          />
          <FieldError field="password" />
        </div>
        <Button type="submit" className="w-full">
          Sign up
        </Button>
      </form>
    </section>
  )
}

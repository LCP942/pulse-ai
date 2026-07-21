import { type FormEvent, useEffect, useRef, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface FormValues {
  name: string
  email: string
  message: string
}

const initialValues: FormValues = { name: '', email: '', message: '' }

function validate(values: FormValues) {
  const errors: Partial<Record<keyof FormValues, string>> = {}
  if (!values.name.trim()) errors.name = 'Name is required.'
  if (!values.email.trim()) errors.email = 'Email is required.'
  else if (!/\S+@\S+\.\S+/.test(values.email)) errors.email = 'Enter a valid email address.'
  if (!values.message.trim()) errors.message = 'Message is required.'
  return errors
}

export default function Contact() {
  const [values, setValues] = useState<FormValues>(initialValues)
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({})
  const [submitted, setSubmitted] = useState(false)
  const successHeadingRef = useRef<HTMLHeadingElement>(null)

  const errors = validate(values)

  // The submit button disappears with the form on success; without an
  // explicit focus move, keyboard and screen-reader focus falls back to
  // <body> and the confirmation may never be announced.
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
    setTouched({ name: true, email: true, message: true })
    if (Object.keys(validate(values)).length === 0) {
      setSubmitted(true)
    }
  }

  /** aria props shared by every field: flags the error and points at it. */
  function errorProps(field: keyof FormValues) {
    const visible = touched[field] && !!errors[field]
    return {
      'aria-invalid': visible,
      'aria-describedby': visible ? `contact-${field}-error` : undefined,
    }
  }

  function FieldError({ field }: { field: keyof FormValues }) {
    if (!(touched[field] && errors[field])) return null
    return (
      <p id={`contact-${field}-error`} role="alert" className="text-sm text-destructive">
        {errors[field]}
      </p>
    )
  }

  if (submitted) {
    return (
      <section className="mx-auto max-w-[480px] px-4 py-16 sm:px-6">
        <title>Contact — Pulse</title>
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
            Message sent.
          </h1>
          <p className="text-sm text-muted-foreground">
            Thanks, {values.name.split(' ')[0]} — we'll get back to you shortly.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-[480px] px-4 py-16 sm:px-6">
      <title>Contact — Pulse</title>
      <h1 className="font-heading text-3xl font-semibold tracking-tight">Talk to us</h1>
      <p className="mt-3 text-muted-foreground">
        Questions about pricing, or want a walkthrough for your team? Send us a note.
      </p>
      <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="contact-name">Name</Label>
          <Input
            id="contact-name"
            value={values.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            {...errorProps('name')}
          />
          <FieldError field="name" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="contact-email">Email</Label>
          <Input
            id="contact-email"
            type="email"
            value={values.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            {...errorProps('email')}
          />
          <FieldError field="email" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="contact-message">Message</Label>
          <textarea
            id="contact-message"
            value={values.message}
            onChange={(e) => handleChange('message', e.target.value)}
            onBlur={() => handleBlur('message')}
            {...errorProps('message')}
            rows={5}
            className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <FieldError field="message" />
        </div>
        <Button type="submit" className="w-full">
          Send message
        </Button>
      </form>
    </section>
  )
}

import { Quote } from 'lucide-react'
import { motion, useReducedMotion, type Variants } from 'motion/react'
import { testimonials } from '@/data/testimonials'
import { AnimatedWords, revealViewport, subtitleFade, titleContainer } from '@/lib/motion'

const cardReveal: Variants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: 'easeOut' as const, delay },
  }),
}

export function Testimonials() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <section className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 sm:py-24">
      <motion.h2
        initial={shouldReduceMotion ? undefined : 'hidden'}
        whileInView="show"
        viewport={revealViewport}
        variants={shouldReduceMotion ? undefined : titleContainer}
        className="text-center font-heading text-3xl font-semibold text-balance sm:text-4xl"
      >
        <AnimatedWords text="What our customers say" shouldReduceMotion={shouldReduceMotion} />
      </motion.h2>
      <motion.p
        initial={shouldReduceMotion ? undefined : 'hidden'}
        whileInView="show"
        viewport={revealViewport}
        variants={shouldReduceMotion ? undefined : subtitleFade}
        className="mx-auto mt-3 max-w-lg text-center text-muted-foreground"
      >
        Here's what customers say after putting Pulse's recommendations into
        production.
      </motion.p>
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={testimonial.id}
            initial={shouldReduceMotion ? undefined : 'hidden'}
            whileInView="show"
            viewport={revealViewport}
            custom={index * 0.1}
            variants={shouldReduceMotion ? undefined : cardReveal}
            className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6"
          >
            <div className="flex items-center gap-3">
              <img
                src={testimonial.photo}
                alt={testimonial.author}
                width={44}
                height={44}
                loading="lazy"
                decoding="async"
                className="size-11 shrink-0 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-medium">{testimonial.author}</p>
                <p className="text-xs text-muted-foreground">
                  {testimonial.role}, {testimonial.company}
                </p>
              </div>
              <Quote aria-hidden="true" className="ml-auto size-6 shrink-0 text-primary/60" />
            </div>
            <p className="text-muted-foreground">{testimonial.quote}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

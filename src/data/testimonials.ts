export interface Testimonial {
  id: string
  quote: string
  author: string
  role: string
  company: string
  photo: string
}

export const testimonials: Testimonial[] = [
  {
    id: 'nora-chen',
    quote:
      'Pulse flagged a churn risk in our top accounts three weeks before it showed up in our own dashboards. That warning alone saved two six-figure contracts.',
    author: 'Nora Chen',
    role: 'Head of Revenue',
    company: 'Loop Analytics',
    photo: '/testimonials/nora-chen.webp',
  },
  {
    id: 'marcus-webb',
    quote:
      "We raised prices for the first time in two years and actually knew what would happen. MRR grew 14% in the first quarter with almost no extra churn.",
    author: 'Marcus Webb',
    role: 'Co-founder & CEO',
    company: 'Fieldnote',
    photo: '/testimonials/marcus-webb.webp',
  },
  {
    id: 'priya-shah',
    quote:
      'Setting up an A/B pricing test took an afternoon instead of a quarter of engineering time. That alone paid for Pulse in the first month.',
    author: 'Priya Shah',
    role: 'VP of Growth',
    company: 'Northlane',
    photo: '/testimonials/priya-shah.webp',
  },
  {
    id: 'daniel-okafor',
    quote:
      "The forecasts are the first revenue numbers the whole team trusts without a caveat. Board meetings got a lot shorter.",
    author: 'Daniel Okafor',
    role: 'CFO',
    company: 'Ridgeline',
    photo: '/testimonials/daniel-okafor.webp',
  },
]

/**
 * Photo credits (Unsplash License, free to use — attributed as a courtesy):
 * Nora Chen — Christina @ wocintechchat.com (unsplash.com/@wocintechchat)
 * Marcus Webb — The Connected Narrative (unsplash.com/@theconnectednarrative)
 * Priya Shah — Ayo Ogunseinde (unsplash.com/@armedshutter)
 * Daniel Okafor — Nigel Msipa (unsplash.com/@nigelm23)
 */

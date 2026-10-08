// ─────────────────────────────────────────────────────────────
// Single source of truth. Edit this file; no component changes needed.
// ─────────────────────────────────────────────────────────────
import projects from './projects'
import experience from './experience'
import skills from './skills'

const siteConfig = {
  name: 'Siddhartha',
  fullName: 'Siddhartha Banerjee',
  handle: 'siddhartha2001dev',
  role: 'Full Stack Developer',
  location: 'Kolkata, India',
  coordinates: '22.5726° N, 88.3639° E',
  timezone: 'Asia/Kolkata',
  status: 'Immediate joiner · Open to full-time roles',
  email: 'siddhubj31@gmail.com',
  resume: '/resume.pdf',
  heroLines: ['FULL', 'STACK', 'DEVELOPER'],
  heroTagline: 'Full stack engineer building production-ready products',

  about: {
    statement: ['I BUILD', 'DIGITAL PRODUCTS', 'WHERE CODE MEETS', 'DESIGN.'],
    lead: 'I’m a full stack developer with hands-on experience shipping production features for TapCRM. I work across React, Node.js, Express and PostgreSQL, with a focus on reliable APIs, reusable interfaces and thoughtful user experiences.',
    facts: [
      { label: 'Based in', value: 'Kolkata, India' },
      { label: 'Current role', value: 'Full Stack Developer Intern · Tapvera Technologies' },
      { label: 'Education', value: 'B.Tech ECE · 2023 — 2026' },
      { label: 'Focus', value: 'React, Node.js, PostgreSQL, MongoDB' },
    ],
    philosophy:
      'Ship small, ship clean. Validate on the server, respect the user on the client, and make the boring parts (auth, errors, empty states) feel considered.',
    interests: ['Product engineering', 'Real-time applications', 'AI integrations', 'Developer tooling'],
    designInterests: ['UI/UX design', 'Wireframing & prototyping', 'Type-led interfaces'],
  },

  socialLinks: [
    { label: 'GitHub', href: 'https://github.com/siddhartha2001dev' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/siddhartha-banerjee-9002a321b' },
    { label: 'Behance', href: 'https://behance.net/siddharbanerje10' },
    { label: 'Email', href: 'mailto:siddhubj31@gmail.com' },
    { label: 'Resume', href: '/resume.pdf' },
  ],

  contact: {
    headline: ['LET’S', 'MAKE', 'SOMETHING.'],
    cta: 'LET’S TALK',
    note: 'Immediate joiner, open to full-time Full Stack Developer and Software Developer roles.',
  },

  projects,
  experience,
  skills,
}

export default siteConfig

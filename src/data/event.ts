/**
 * All Frontera Hacks 2027 content in one place.
 *
 * Components read from this file, so updating the schedule, FAQ, sponsors,
 * etc. never requires touching component code. Source of truth for the text
 * is the "Theme & Content" note in the Obsidian vault.
 *
 * Values marked TODO are not confirmed yet (see the note's "Still open" list).
 */

import buildImg from '../assets/pillars/build.png'
import connectImg from '../assets/pillars/connect.png'
import growImg from '../assets/pillars/grow.png'
import discordIcon from '../assets/social/discord.svg'
import instagramIcon from '../assets/social/instagram.svg'
import youtubeIcon from '../assets/social/youtube.svg'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type NavLink = { label: string; href: `#${string}` }

export type Pillar = { title: string; description: string; image: string }

export type Track = {
  number: string
  name: string
  icon: string
  /** Each string is one paragraph on the back of the card. */
  description: string[]
}

export type ScheduleItem = { time: string; event: string }

export type ScheduleDay = {
  /** Short tab label, e.g. "SAT". */
  label: string
  /** Tab date, e.g. "MARCH 6TH". */
  date: string
  items: ScheduleItem[]
}

export type Sponsor = {
  name: string
  /** Website link; null until confirmed. */
  url: string | null
  /** Imported logo image; null shows the name as styled text instead. */
  logo: string | null
}

export type FaqItem = { question: string; answer: string }

export type Social = {
  name: string
  handle: string | null
  /** Profile link; null hides the icon until a link is provided. */
  url: string | null
  icon: string
}

// ---------------------------------------------------------------------------
// Event basics
// ---------------------------------------------------------------------------

export const event = {
  name: 'Frontera Hacks',
  year: 2027,
  edition: '4th annual',
  organizer: 'Frontera Devs',
  tagline: 'Accelerating innovation in the RGV',
  dateLabel: 'March 6th – 7th, 2027',
  location: 'McAllen, TX', // TODO: exact venue
  durationHours: 24,
  /** TODO: confirm the live 2027 registration link. null = button hidden. */
  registerUrl: null as string | null,
  contactEmail: 'fronterahacks@gmail.com',
  codeOfConductUrl: 'https://static.mlh.io/docs/mlh-code-of-conduct.pdf',
} as const

// ---------------------------------------------------------------------------
// Countdown
// March 6-7, 2027 is before US daylight saving starts (March 14), so McAllen
// is on Central Standard Time: UTC-06:00.
// ---------------------------------------------------------------------------

export const countdown = {
  /** Hacking starts (opening ceremony). */
  start: new Date('2027-03-06T10:30:00-06:00'),
  /** Submissions close. TODO: confirm the countdown should end here. */
  end: new Date('2027-03-07T08:00:00-06:00'),
  messages: {
    before: 'Hacking starts in',
    beforeTarget: 'Sat, March 6 · 10:30 AM CST',
    during: 'Submissions close in',
    duringTarget: 'Sun, March 7 · 8:00 AM CST',
    after: 'Submissions closed',
    afterTarget: 'That’s a wrap — see you next year.',
  },
} as const

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

export const navLinks: NavLink[] = [
  { label: 'About', href: '#about' },
  { label: 'Tracks', href: '#tracks' },
  { label: 'Schedule', href: '#schedule' },
  { label: 'Sponsors', href: '#sponsors' },
  { label: 'FAQ', href: '#faq' },
]

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------

export const hero = {
  ctaLead: 'Spark your curiosity at',
  ctaHighlight: 'Frontera Hacks',
  subline:
    'The 4th annual hackathon hosted by Frontera Devs to foster a community of developers like you, driven to innovate in the RGV.',
} as const

// ---------------------------------------------------------------------------
// About
// ---------------------------------------------------------------------------

export const about = {
  terminalTitle: '// ABOUT.exe',
  heading: 'ABOUT FRONTERA HACKS',
  description:
    'Frontera Devs is hosting its 4th annual Frontera Hacks, a 24 hour hackathon that aims to foster a community of developers driven to innovate. At Frontera Hacks, we aim to provide an experience for developers of all skill levels to adopt skills taught outside of the classroom, collaborate with like-minded teams, and design projects with the potential to accelerate innovation in the Rio Grande Valley.',
  pillarsLabel: 'AT FRONTERA HACKS, YOU WILL:',
  pillars: [
    {
      title: 'CONNECT.',
      description: 'Meet developers interested in shaping the future of innovation at Frontera Hacks',
      image: connectImg,
    },
    {
      title: 'GROW.',
      description: 'Advance your technical and interpersonal skills through our hands-on workshops',
      image: growImg,
    },
    {
      title: 'BUILD.',
      description: 'Develop solutions with the potential to aid and impact our community',
      image: buildImg,
    },
  ] satisfies Pillar[],
} as const

// ---------------------------------------------------------------------------
// Tracks
// ---------------------------------------------------------------------------

export const tracks = {
  terminalTitle: '// TRACKS.exe',
  heading: 'CHOOSE YOUR TRACK',
  subtitle: '> Select a track to begin your hackathon journey.',
  items: [
    {
      number: '01',
      name: 'Social Good',
      icon: '🤝',
      description: [
        "Create a project that uses technology to make a positive difference in people's lives. Whether addressing healthcare access, education equity, civic engagement, mental health, or community resilience, this track is about building solutions that uplift individuals and strengthen communities.",
        'Projects should be driven by empathy and impact — prioritizing the needs of real people and creating tools that are accessible, ethical, and genuinely useful.',
      ],
    },
    {
      number: '02',
      name: 'Machine Learning / AI',
      icon: '🤖',
      description: [
        "Build a project that harnesses the power of machine learning and artificial intelligence to solve meaningful challenges. Whether it's developing predictive models, creating intelligent automation, building recommendation systems, or applying computer vision and NLP, this track is about turning data into impact.",
        'Projects can focus on making AI more accessible and explainable, applying models to underserved domains, or designing systems that push the boundaries of what technology can do.',
      ],
    },
    {
      number: '03',
      name: 'Enterprise',
      icon: '🏢',
      description: [
        'Design a solution that transforms the way organizations operate. From streamlining workflows and automating processes to improving team collaboration, data management, or decision-making at scale, this track challenges you to build tools that make businesses smarter and more efficient.',
        "Projects can target any industry and focus on reducing friction, cutting costs, improving productivity, or enabling companies to do things they simply couldn't do before.",
      ],
    },
  ] satisfies Track[],
} as const

// ---------------------------------------------------------------------------
// Schedule
// ---------------------------------------------------------------------------

export const schedule = {
  terminalTitle: '// SCHEDULE.exe',
  heading: 'HACKATHON SCHEDULE',
  bootLines: [
    '> INITIALIZING SCHEDULE DATABASE...',
    '> DECRYPTING EVENT DATA...',
    '> ACCESS GRANTED ██████████ 100%',
  ],
  days: [
    {
      label: 'SAT',
      date: 'MARCH 6TH',
      items: [
        { time: '9:00 AM', event: 'Check In' },
        { time: '10:00 AM', event: 'Breakfast Time' },
        { time: '10:30 AM', event: 'Opening Ceremony & Hackathon Starts' },
        { time: '11:00 AM', event: 'AI/API Workshop' },
        { time: '12:30 PM', event: 'Lunch Time' },
        { time: '1:00 PM', event: 'Github Workshop' },
        { time: '1:30 PM', event: 'Board Games Room Open' },
        { time: '2:30 PM', event: 'Ping Pong Available' },
        { time: '4:30 PM', event: 'Dinner Time' },
        { time: '5:30 PM', event: 'UI/UX Workshop' },
        { time: '11:00 PM', event: 'Karaoke' },
      ],
    },
    {
      label: 'SUN',
      date: 'MARCH 7TH',
      items: [
        { time: '12:00 AM', event: 'Midnight Movie' },
        { time: '8:00 AM', event: 'Submission Closes & Breakfast Time' },
        { time: '10:00 AM', event: 'Professor Trivia' },
        { time: '12:00 PM', event: 'Judging Concludes' },
        { time: '12:15 PM', event: 'Closing Ceremony' },
        { time: '12:30 PM', event: 'Winner Showcase' },
        { time: '1:30 PM', event: 'Hackathon Officially Ends' },
      ],
    },
  ] satisfies ScheduleDay[],
} as const

// ---------------------------------------------------------------------------
// Sponsors
// ---------------------------------------------------------------------------

export const sponsors = {
  terminalTitle: '// SPONSORS.exe',
  heading: 'OUR SPONSORS',
  subtitle: '> Frontera Hacks is made possible by our wonderful sponsors.',
  items: [
    // TODO: add website link + logo once provided.
    { name: 'McAllen Chamber of Commerce', url: null, logo: null },
  ] satisfies Sponsor[],
  cta: {
    prompt: '> Want to help make this event a reality?',
    label: '> BECOME A SPONSOR',
    href: 'mailto:fronteradevs@gmail.com?subject=We%20Are%20Interested%20In%20Becoming%20A%20Sponsor%20For%20Frontera%20Hacks',
  },
} as const

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------

export const faq = {
  terminalTitle: '// FAQ.exe',
  heading: 'Frequently Asked Questions',
  items: [
    {
      question: 'What is a hackathon?',
      answer:
        'A hackathon is a sprint-like event where developers collaborate to build projects that solve challenges. At Frontera Hacks, hackers can look forward to educational workshops, learning from skilled mentors, and, of course, fun games and great swag.',
    },
    {
      question: 'Who is this event for?',
      answer:
        'Students from all backgrounds are welcome at Frontera Hacks. No extensive knowledge of programming is necessary.',
    },
    {
      question: 'Do I need a team to participate?',
      answer:
        "While teams are not required in order to participate, it's a great way to meet new people and create something together. Teams may have up to 4 members, and you will have a chance to meet other hackers at our Team Formation events and in the Discord server!",
    },
    {
      question: 'What is the cost to participate?',
      answer:
        'Nada, nothing, zilch. There is absolutely no cost for applying or participating in Frontera Hacks. We want to make this event as accessible as possible to all those interested so make sure you apply!',
    },
    {
      question: "What if I don't know how to code?",
      answer:
        "No experience is needed — whether you're a coder, an artist, a designer, or a writer, you'll get a chance to work with various mentors, attend workshops, interact with companies, and learn alongside fellow participants.",
    },
    {
      question: 'What if I need special accommodations?',
      answer:
        'Frontera Hacks prioritizes accessibility and accommodations that make our event welcoming for everyone. Please list any special accommodations in your admissions, or contact us with any other concerns.',
    },
    {
      question: 'How many members can I have on my team?',
      answer:
        "The max amount of team members are 4. If you are unable to get that many teammates, don't stress — you will be able to connect with potential teammates the day of the hackathon.",
    },
    {
      question: 'Is any major able to join or is it only STEM majors?',
      answer:
        'Any students are able to participate in the hackathon, no matter what major or field they are currently studying.',
    },
  ] satisfies FaqItem[],
} as const

// ---------------------------------------------------------------------------
// Socials & footer
// ---------------------------------------------------------------------------

export const socials: Social[] = [
  { name: 'Instagram', handle: 'fronterahacks', url: 'https://instagram.com/fronterahacks', icon: instagramIcon },
  { name: 'YouTube', handle: 'Frontera Devs', url: 'https://www.youtube.com/@fronteradevs/', icon: youtubeIcon },
  // TODO: Discord invite link.
  { name: 'Discord', handle: null, url: null, icon: discordIcon },
]

export const footer = {
  helpText: 'Need help? Email us at',
  credit: `${event.year} ${event.name}. Made with ♡ by the ${event.organizer} team`,
} as const

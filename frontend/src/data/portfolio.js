/**
 * Portfolio case studies. Every project here is FICTIONAL demonstration work
 * written for this portfolio piece; none describes a real client engagement.
 * Interface previews are drawn in code by <ProjectPreview>, not screenshots.
 */
export const PORTFOLIO_CATEGORIES = ['Website Design', 'UI/UX Design', 'Web Applications', 'Dashboard Design', 'E-commerce'];

export const portfolio = [
  {
    slug: 'finora',
    name: 'Finora',
    category: 'Dashboard Design',
    year: 2026,
    summary: 'A cash-flow dashboard for small business owners.',
    description: 'Finora turns bank feeds and invoices into one view of cash on hand, upcoming bills and runway, so owners can decide without opening a spreadsheet.',
    tech: ['React', 'Recharts', 'Tailwind CSS', 'REST API'],
    preview: { kind: 'dashboard', accent: '#2f6b5a', tint: '#e3efe9' },
    featured: true,
    problem: 'Owners of five-to-fifty person businesses were checking three tools and a spreadsheet every Monday to answer one question: how much money will we have at the end of the month? The numbers disagreed, and the spreadsheet was always a week old.',
    goals: [
      'Answer "how much cash will we have?" within five seconds of opening the app.',
      'Show upcoming bills and expected payments on the same timeline.',
      'Make every chart readable without relying on colour.',
      'Work on a phone for the owner who checks between meetings.',
    ],
    process: [
      { stage: 'Discover', text: 'Eight interviews with owners and bookkeepers, plus a review of the spreadsheets they actually used. The shared pattern was a weekly forecast, not a monthly report.' },
      { stage: 'Design', text: 'We prototyped three home screens and tested them with the same owners. The winning layout put a single forecast line above everything else.' },
      { stage: 'Develop', text: 'A component library first (cards, chart wrappers, tables), then the screens. Charts share one colour scale and one tooltip format.' },
      { stage: 'Deliver', text: 'A staged rollout behind a feature flag, with a short guided tour for first-time users.' },
    ],
    decisions: [
      { title: 'One number first', text: 'The forecast balance sits alone at the top in large type. Everything else explains it.' },
      { title: 'Patterned chart series', text: 'Expected and confirmed amounts differ by fill pattern as well as colour, so the chart survives grayscale printing and colour-vision differences.' },
      { title: 'Tables that collapse into lists', text: 'On phones, the invoice table becomes a list of cards with the amount and due date at the same position in every row.' },
    ],
    solution: 'A responsive dashboard with a 13-week cash forecast, an invoices timeline and a bills calendar, built on a reusable component library that the product team now extends on its own.',
  },
  {
    slug: 'wellnest',
    name: 'Wellnest',
    category: 'Website Design',
    year: 2026,
    summary: 'An appointment website for a network of family clinics.',
    description: 'A calm, accessible website where patients find the right clinician, see real availability and book a visit in under two minutes.',
    tech: ['React', 'React Router', 'Tailwind CSS', 'Headless CMS'],
    preview: { kind: 'booking', accent: '#2f6688', tint: '#e2edf3' },
    featured: true,
    problem: 'Patients could only book by phone during office hours. The old website listed clinicians but not their availability, so most visits ended with "please call us".',
    goals: [
      'Let patients book a visit without a phone call.',
      'Meet WCAG 2.2 AA across every booking step.',
      'Give clinic staff a content workflow they can run without developers.',
    ],
    process: [
      { stage: 'Discover', text: 'Call-centre listening sessions showed the five reasons people phone. Each became a path on the new home page.' },
      { stage: 'Design', text: 'A booking flow of three steps (reason, time, details) tested with older patients and screen-reader users.' },
      { stage: 'Develop', text: 'Availability loads from the scheduling API and is cached per clinic. Every form error is announced and linked to its field.' },
      { stage: 'Deliver', text: 'Editors were trained on the CMS, and an accessibility checklist was added to the publishing workflow.' },
    ],
    decisions: [
      { title: 'Large, generous tap targets', text: 'Time slots are 48px tall and grouped by morning and afternoon, so they are easy to hit on a phone.' },
      { title: 'Plain-language copy', text: 'Medical terms were rewritten at a reading age of twelve, with the clinical term kept in brackets where it matters.' },
      { title: 'No dead ends', text: 'If no slot fits, the page offers the next clinic with availability instead of an empty state.' },
    ],
    solution: 'A content-managed website with a three-step booking flow, clinician profiles and live availability, designed and tested for accessibility from the first wireframe.',
  },
  {
    slug: 'marketly',
    name: 'Marketly',
    category: 'E-commerce',
    year: 2025,
    summary: 'A marketplace for independent makers.',
    description: 'Marketly helps small studios sell handmade goods with fast product pages, honest shipping estimates and a checkout that fits on one phone screen.',
    tech: ['React', 'Vite', 'Node.js', 'Payments API'],
    preview: { kind: 'shop', accent: '#9a4b2c', tint: '#f4e6dc' },
    featured: true,
    problem: 'Makers were losing buyers between the product page and payment. Shipping costs appeared only at the last step, and the checkout asked for an account first.',
    goals: [
      'Show the full price, shipping included, on the product page.',
      'Allow guest checkout in two steps.',
      'Keep product pages fast on slow mobile connections.',
    ],
    process: [
      { stage: 'Discover', text: 'Checkout analytics and twelve buyer interviews pointed to surprise shipping costs as the main reason people left.' },
      { stage: 'Design', text: 'Product pages were redesigned around photography and the full delivered price. Checkout shrank from five steps to two.' },
      { stage: 'Develop', text: 'Responsive images with modern formats, route-based code splitting and a server-side shipping estimate.' },
      { stage: 'Deliver', text: 'An A/B rollout to half of traffic before switching everyone over.' },
    ],
    decisions: [
      { title: 'Delivered price, always', text: 'Every price shown includes estimated shipping to the buyer\'s region, with the breakdown one tap away.' },
      { title: 'Maker first', text: 'Each product page leads with the studio behind it, because buyers said that was why they were there.' },
      { title: 'Two-step checkout', text: 'Address and payment, nothing else. Accounts are offered after purchase, not before.' },
    ],
    solution: 'A marketplace storefront with maker profiles, delivered-price product pages and a two-step guest checkout, built as a fast single-page application.',
  },
  {
    slug: 'routewise',
    name: 'Routewise',
    category: 'Web Applications',
    year: 2025,
    summary: 'A route planner for regional courier teams.',
    description: 'Dispatchers plan the day\'s deliveries on a live map, rebalance routes when a van is delayed and send each driver an updated stop list.',
    tech: ['React', 'Node.js', 'PostgreSQL', 'Maps API'],
    preview: { kind: 'transit', accent: '#3f5ba6', tint: '#e3e8f4' },
    problem: 'Dispatchers planned routes on paper maps and a whiteboard. A single delayed van meant phoning every driver to reshuffle stops.',
    goals: [
      'Plan a day of 300+ stops in under an hour.',
      'Rebalance routes in a few clicks when plans change.',
      'Keep drivers\' stop lists in sync without phone calls.',
    ],
    process: [
      { stage: 'Discover', text: 'Two days shadowing dispatchers showed that most of their time went into re-planning, not planning.' },
      { stage: 'Design', text: 'A split view: the stop list on the left, the map on the right, with drag-to-reassign between routes and a keyboard alternative.' },
      { stage: 'Develop', text: 'Route data streams from the API; the map and list share one state store so they never disagree.' },
      { stage: 'Deliver', text: 'Piloted with one depot for a month before rolling out to the others.' },
    ],
    decisions: [
      { title: 'List and map stay in sync', text: 'Selecting a stop in either view highlights it in both, so dispatchers never lose their place.' },
      { title: 'Keyboard reassignment', text: 'Every drag action has a menu alternative, so routes can be rebalanced without a mouse.' },
      { title: 'Calm colour for routes', text: 'Each route gets a distinct pattern and label, not just a colour, so eight routes stay readable.' },
    ],
    solution: 'A web application for planning and rebalancing courier routes, with synced map and list views and instant driver updates.',
  },
  {
    slug: 'tandem',
    name: 'Tandem',
    category: 'UI/UX Design',
    year: 2026,
    summary: 'Shift swapping for hospitality teams.',
    description: 'A mobile-first product design for restaurant and hotel staff to swap shifts, see who is working and get manager approval in one place.',
    tech: ['Figma', 'Prototyping', 'Usability testing', 'React'],
    preview: { kind: 'mobile-app', accent: '#2a7472', tint: '#dff0ef' },
    problem: 'Shift swaps happened in group chats. Managers missed requests, and staff turned up for shifts that had already been swapped away.',
    goals: [
      'Make a swap request in three taps.',
      'Give managers one queue of pending approvals.',
      'Show everyone the confirmed rota, not the rumour.',
    ],
    process: [
      { stage: 'Discover', text: 'Diary studies with eleven staff across three venues captured how swaps really happened.' },
      { stage: 'Design', text: 'Low-fidelity flows, then a clickable prototype tested in the back of house during real shifts.' },
      { stage: 'Develop', text: 'A React prototype of the core swap flow validated the interaction details on real phones.' },
      { stage: 'Deliver', text: 'A full design file, a component kit and an annotated hand-off for the client\'s engineering team.' },
    ],
    decisions: [
      { title: 'The rota is the home screen', text: 'Staff open the app to check when they work, so the week view is the first thing they see.' },
      { title: 'One-thumb actions', text: 'Primary actions sit in the bottom third of the screen for use while carrying trays or keys.' },
      { title: 'Status in words', text: 'Swap states read "Waiting for Sam" or "Approved by Priya", never a coloured dot alone.' },
    ],
    solution: 'A tested product design and prototype for shift swapping, delivered as an annotated design system and React proof of concept.',
  },
  {
    slug: 'harvest-table',
    name: 'Harvest Table',
    category: 'Website Design',
    year: 2025,
    summary: 'A website for a group of three neighbourhood restaurants.',
    description: 'Seasonal menus, opening hours and reservations for three restaurants under one roof, editable by the kitchen team every week.',
    tech: ['React', 'Tailwind CSS', 'Headless CMS', 'Reservations API'],
    preview: { kind: 'restaurant', accent: '#7c6127', tint: '#f1ead9' },
    problem: 'Menus changed weekly but lived in PDFs that took days to update. Guests booked the wrong location because all three restaurants shared one confusing page.',
    goals: [
      'Let chefs update menus themselves, in minutes.',
      'Give each restaurant its own clear page and booking button.',
      'Load fast on phones outside the restaurant door.',
    ],
    process: [
      { stage: 'Discover', text: 'Interviews with the three head chefs and front-of-house managers, plus a review of six months of booking mistakes.' },
      { stage: 'Design', text: 'A shared editorial template with a distinct colour and photograph per restaurant.' },
      { stage: 'Develop', text: 'Menus as structured CMS content, rendered as accessible HTML instead of PDFs.' },
      { stage: 'Deliver', text: 'A one-hour training session per kitchen and a printed quick-reference card.' },
    ],
    decisions: [
      { title: 'Menus as HTML, not PDF', text: 'Menus are searchable, readable by screen readers and fast to load on mobile data.' },
      { title: 'Location in the headline', text: 'Every page names its street in the first line, so guests know where they are booking.' },
      { title: 'Hours that know the day', text: 'Opening hours highlight today and say whether the kitchen is open right now.' },
    ],
    solution: 'A content-managed website with per-restaurant pages, weekly editable menus and integrated reservations.',
  },
];

export const getProject = (slug) => portfolio.find((p) => p.slug === slug);

/** Related = same category first, then the most recent others. */
export function relatedProjects(slug, count = 2) {
  const current = getProject(slug);
  if (!current) return [];
  const others = portfolio.filter((p) => p.slug !== slug);
  const same = others.filter((p) => p.category === current.category);
  const rest = others.filter((p) => p.category !== current.category).sort((a, b) => b.year - a.year);
  return [...same, ...rest].slice(0, count);
}

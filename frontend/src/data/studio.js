import { Monitor, Code2, PenTool, AppWindow, Layers, Plug } from 'lucide-react';
import demo from '@shared/demo-data.json';

/** Studio content for the public website. DesignHub Studio is a fictional company. */
export const services = [
  {
    slug: 'website-design',
    name: 'Website Design',
    inquiryType: 'Website Design',
    icon: Monitor,
    short: 'Marketing sites that explain what you do and make the next step obvious.',
    description: 'We design websites around the questions your visitors arrive with, then give every page one clear next step. Content, layout and typography are decided together, not in separate phases.',
    includes: ['Content and page structure', 'Visual direction and typography', 'Responsive layouts for every page', 'SEO foundations and metadata', 'CMS set-up and editor training'],
    timeline: '6–10 weeks',
    tint: 'bg-accent-soft',
  },
  {
    slug: 'frontend-development',
    name: 'Frontend Development',
    inquiryType: 'Frontend Development',
    icon: Code2,
    short: 'Fast, accessible React interfaces built from a component library.',
    description: 'We build interfaces in React with a shared component library, so the hundredth screen is as consistent as the first. Performance budgets and accessibility checks run on every change.',
    includes: ['React component architecture', 'Responsive, accessible markup', 'Performance budgets', 'Automated browser testing', 'Hand-off documentation'],
    timeline: '4–12 weeks',
    tint: 'bg-surface-3',
  },
  {
    slug: 'ui-ux-design',
    name: 'UI/UX Design',
    inquiryType: 'UI/UX Design',
    icon: PenTool,
    short: 'Research, flows and prototypes tested with the people who will use them.',
    description: 'We start with the people who will use the product: interviews, task analysis and usability tests. Flows and prototypes are tested before anything is built.',
    includes: ['User interviews and research synthesis', 'User flows and wireframes', 'Interactive prototypes', 'Usability testing', 'Accessibility review'],
    timeline: '3–8 weeks',
    tint: 'bg-accent-soft',
  },
  {
    slug: 'web-application-development',
    name: 'Web Application Development',
    inquiryType: 'Web Application',
    icon: AppWindow,
    short: 'Dashboards, portals and internal tools with real data behind them.',
    description: 'Customer portals, dashboards and internal tools, built end to end: interface, API and database. We favour boring, proven technology and leave you with code your team can own.',
    includes: ['Product scoping and architecture', 'React frontend and REST APIs', 'PostgreSQL data modelling', 'Authentication and roles', 'Deployment and monitoring'],
    timeline: '10–20 weeks',
    tint: 'bg-surface-3',
  },
  {
    slug: 'design-systems',
    name: 'Design Systems',
    inquiryType: 'Design System',
    icon: Layers,
    short: 'Tokens, components and documentation shared across teams.',
    description: 'One source of truth for colour, type, spacing and components, in design files and in code. We document it so new team members can use it on day one.',
    includes: ['Design token architecture', 'Component library in Figma and React', 'Usage and accessibility guidelines', 'Contribution workflow', 'Adoption support for teams'],
    timeline: '8–16 weeks',
    tint: 'bg-accent-soft',
  },
  {
    slug: 'api-integration',
    name: 'API Integration',
    inquiryType: 'API Integration',
    icon: Plug,
    short: 'Connect your product to payments, CRMs, maps and the tools you already use.',
    description: 'We connect your interface to the services it depends on, with clear loading and error states so the experience holds up when a third party is slow.',
    includes: ['API evaluation and selection', 'Integration architecture', 'Error, retry and loading states', 'Webhooks and background jobs', 'Integration test coverage'],
    timeline: '2–6 weeks',
    tint: 'bg-surface-3',
  },
];

export const process = [
  {
    name: 'Discover',
    runIn: 'To begin,',
    text: 'we learn how your business works and who the product is for. Interviews, analytics and a review of what already exists turn into a short brief we agree on together.',
    deliverables: ['Project brief', 'Research summary', 'Success measures'],
  },
  {
    name: 'Design',
    runIn: 'Next,',
    text: 'we sketch flows, then wireframes, then high-fidelity screens, testing with real users along the way. You see work every week, not only at the end.',
    deliverables: ['User flows', 'Prototype', 'Design system foundations'],
  },
  {
    name: 'Develop',
    runIn: 'Then',
    text: 'we build in small, reviewable increments on a staging site you can open at any time. Components, accessibility and performance are checked on every change.',
    deliverables: ['Staging site', 'Component library', 'Automated tests'],
  },
  {
    name: 'Deliver',
    runIn: 'Finally,',
    text: 'we launch, measure and hand over: documentation, training and a support window so your team is confident running it without us.',
    deliverables: ['Launch plan', 'Documentation', 'Team training'],
  },
];

export const faqs = [
  { q: 'How long does a typical project take?', a: 'Most websites take six to ten weeks. Web applications usually take ten to twenty weeks, depending on scope. We agree a timeline in the discovery phase and review it every two weeks.' },
  { q: 'Do you work with existing designs or codebases?', a: 'Yes. We often join projects partway through, either building from an existing design file or improving a React codebase that is already in production.' },
  { q: 'Who owns the code and design files?', a: 'You do. Source code, design files and documentation are transferred to you at the end of the project, with no licence fees.' },
  { q: 'How do you price projects?', a: 'We price each phase separately after a short discovery call, so you always know what the next phase costs before it starts.' },
  { q: 'Can you support the product after launch?', a: 'Every project includes a support window after launch. After that, we offer a monthly retainer for improvements and maintenance.' },
  { q: 'Do you design for accessibility?', a: 'Always. We design and test against WCAG 2.2 AA from the first wireframe, including keyboard navigation, screen readers and colour contrast.' },
];

export const values = [
  { title: 'Clarity over decoration', text: 'Every element on a screen has to earn its place. If it does not help someone understand or act, it goes.' },
  { title: 'Accessible by default', text: 'Accessibility is part of the definition of done, not an audit at the end.' },
  { title: 'Small steps, shown often', text: 'We share working software every week, so feedback arrives while it is still cheap to act on.' },
  { title: 'Leave teams stronger', text: 'Documentation, clean code and training mean the product keeps improving after we leave.' },
];

/** Public team listing: fictional people from the demo dataset. No contact details exposed. */
export const team = demo.team.map(({ id, name, role, department, bio, skills }) => ({ id, name, role, department, bio, skills }));

export const contact = {
  email: 'hello@designhub.example',
  phone: '+1 (555) 010-0199',
  phoneHref: 'tel:+15550100199',
  address: ['214 Harbor Street, Suite 3', 'Portland, OR 97204'],
  hours: 'Monday to Friday, 9:00–17:30 Pacific',
  notice: 'Fictional contact details for demonstration. The email and phone number do not reach a real studio.',
};

export const social = [
  { label: 'GitHub', href: 'https://github.com/' },
  { label: 'Dribbble', href: 'https://dribbble.com/' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/' },
];

/** Licensed atmosphere photographs (Unsplash licence via Lorem Picsum), stored locally. */
export const photoCredits = [
  { src: '/images/arch-1081.webp', author: 'Julien Moreau', url: 'https://unsplash.com/photos/688Fna1pwOQ', alt: 'Stepped white building corner rising into a pale sky' },
  { src: '/images/arch-942.webp', author: 'Carl Nenzen Loven', url: 'https://unsplash.com/photos/busqfOj6i80', alt: 'Angular white concrete building against a dark sky' },
  { src: '/images/arch-893.webp', author: 'Samuel Zeller', url: 'https://unsplash.com/photos/j0g8taxHZa0', alt: 'Curved latticed facade forming sweeping lines' },
  { src: '/images/arch-743.webp', author: 'Anthony Delanoix', url: 'https://unsplash.com/photos/Aa8_X_YgrO4', alt: 'Narrow wedge-shaped building corner seen from below' },
];

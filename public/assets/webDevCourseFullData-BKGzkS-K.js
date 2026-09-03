var e=(e,t,n,r,i,a,o,s,c,l)=>({id:e,title:t,description:n,duration:r,type:i,readingContent:a,practiceLabChallenge:void 0,codeExamples:o,keyPoints:s,practiceQuestions:c?.map((t,n)=>({id:`pq-${e}-${n}`,...t})),resourceLinks:l?.map((t,n)=>({id:`res-${e}-${n}`,...t})),resources:[{id:`res-${e}-pdf-notes`,name:`Web Development Fundamentals.pdf`,description:`HTML5, CSS3, JavaScript and responsive web design reference guide.`,category:`PDF`,fileSize:`4.5 MB`,downloadPermission:!0,url:`/webdev-complete-notes.pdf`}]}),t={1:`# Module 1: Introduction to Web Development & How the Web Works

## Overview
Web Development encompasses creating, building, and maintaining applications that run inside web browsers across mobile devices, tablets, and desktops.

## Learning Objectives
- Understand the Client-Server Architecture and HTTP/HTTPS request-response cycles.
- Understand the roles of DNS (Domain Name System), Web Hosting Servers, and CDNs.
- Differentiate between Frontend (Client-side), Backend (Server-side), and Database systems.

## Concept: Client-Server Web Lifecycle
\`\`\`text
┌──────────────┐      1. DNS Lookup ("kaizenq.in")       ┌──────────────┐
│              ├────────────────────────────────────────>│  DNS Server  │
│              │<────────────────────────────────────────┤              │
│              │            2. IP Address                └──────────────┘
│              │
│  Client      │      3. HTTPS GET /index.html           ┌──────────────┐
│  Browser     ├────────────────────────────────────────>│ Web Server   │
│              │<────────────────────────────────────────┤ (Nginx/Node) │
│              │      4. HTML, CSS, JS Bundle            └──────────────┘
└──────────────┘
\`\`\`

> 💡 **Tip:** Always use HTTPS (Port 443 with TLS 1.3 encryption) for web production assets to protect student sessions from packet sniffing.
`,2:'# Module 2: HTML5 Semantic Structure & Forms\n\n## Overview\nHypertext Markup Language (HTML5) defines the meaning, structure, and accessibility semantics of web documents.\n\n## Learning Objectives\n- Use semantic layout elements: `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, and `<footer>`.\n- Build accessible form controls with `<form>`, `<input>`, `<select>`, `<textarea>`, and `<label>`.\n- Master form validation attributes: `required`, `pattern`, `min`, `max`, and ARIA accessibility labels.\n\n## Example: Semantic Accessible Card\n```html\n<article class="course-card" aria-labelledby="course-title">\n  <header>\n    <span class="badge">Web Development</span>\n    <h2 id="course-title">Full Stack Web Fundamentals</h2>\n  </header>\n  <p>Learn HTML5, CSS3, and JavaScript to build modern responsive applications.</p>\n  <footer>\n    <a href="/course/web-dev" class="btn-primary" role="button">Start Learning</a>\n  </footer>\n</article>\n```\n\n> 📌 **Note:** Semantic HTML elements provide screen readers and search engines (SEO) with structural meaning that plain `<div>` tags lack.\n',3:`# Module 3: CSS3 Styling & The Box Model

## Overview
Cascading Style Sheets (CSS3) controls visual styling, typography, colors, and layout positioning. The Box Model dictates how margins, borders, padding, and content areas calculate element dimensions.

## Learning Objectives
- Master the CSS Box Model: \`content\`, \`padding\`, \`border\`, and \`margin\`.
- Understand \`box-sizing: border-box\` and CSS resets.
- Master CSS specificity calculation (inline styles > IDs > classes > elements).
- Use CSS Custom Properties (Variables) for theming (e.g. \`--primary-color: #3b82f6;\`).

## Example: Modern Box Reset & Theming
\`\`\`css
:root {
  --primary: #4f46e5;
  --bg-dark: #0f172a;
  --text-light: #f8fafc;
  --radius-md: 8px;
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.card {
  background-color: var(--bg-dark);
  color: var(--text-light);
  padding: 1.5rem;
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
\`\`\`
`,4:`# Module 4: Responsive Design with Flexbox & CSS Grid

## Overview
Modern web layouts must adapt seamlessly across varying viewport dimensions from mobile phones (375px) to 4K monitors (3840px). Flexbox provides 1-dimensional alignment; CSS Grid provides 2-dimensional layouts.

## Learning Objectives
- Master Flexbox axis alignment (\`justify-content\`, \`align-items\`, \`flex-grow\`, \`flex-shrink\`, \`flex-wrap\`).
- Master CSS Grid tracks (\`grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))\`, \`gap\`).
- Write Mobile-First Media Queries (\`@media (min-width: 768px)\`).

## Example: Responsive Auto-Fit Grid
\`\`\`css
.course-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

/* Tablet & Desktop Auto-Fitting */
@media (min-width: 640px) {
  .course-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}
\`\`\`

> 💡 **Tip:** Always design mobile-first using \`min-width\` media queries rather than desktop-down \`max-width\` queries for cleaner, more maintainable CSS.
`,5:`# Module 5: CSS Animations, Transitions & Modern Layouts

## Overview
Smooth transitions and micro-interactions enhance visual polish and user engagement without relying on heavy JavaScript libraries.

## Learning Objectives
- Master CSS transitions: \`transition: all 0.2s ease-in-out\`.
- Write CSS keyframe animations with \`@keyframes\` and \`animation-timing-function\`.
- Implement modern glassmorphism (\`backdrop-filter: blur(12px)\`) and glowing gradients.

## Example: Glassmorphic Interactive Button
\`\`\`css
.glass-btn {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.glass-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
}
\`\`\`
`,6:`# Module 6: JavaScript for Web Interactivity

## Overview
JavaScript brings static HTML & CSS pages to life through dynamic DOM manipulation, interactive modals, tabs, and form validation.

## Learning Objectives
- Query DOM nodes with \`document.querySelector\` and \`querySelectorAll\`.
- Toggle UI states using classes (\`classList.add\`, \`classList.remove\`, \`classList.toggle\`).
- Implement dynamic modal dialogs and dropdown menus with keyboard accessibility (\`Escape\` key handler).

## Example: Accessible Modal Controller
\`\`\`javascript
const openModalBtn = document.querySelector('#open-modal');
const modal = document.querySelector('#dialog-modal');
const closeModalBtn = document.querySelector('#close-modal');

const toggleModal = (isOpen) => {
  modal.classList.toggle('is-visible', isOpen);
  modal.setAttribute('aria-hidden', !isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
};

openModalBtn.addEventListener('click', () => toggleModal(true));
closeModalBtn.addEventListener('click', () => toggleModal(false));
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') toggleModal(false);
});
\`\`\`
`,7:`# Module 7: Working with Web APIs & Data Fetching

## Overview
Modern web apps dynamically fetch data from REST and GraphQL backends to update UI components without full page refreshes.

## Learning Objectives
- Understand the \`fetch()\` API and JSON serialization (\`JSON.parse\`, \`JSON.stringify\`).
- Handle loading states, skeleton screens, and network error banners gracefully.
- Store user preferences in \`localStorage\` and \`sessionStorage\`.

## Example: Dynamic Course Card Loader
\`\`\`javascript
async function loadCoursesCatalog() {
  const container = document.getElementById('catalog-container');
  container.innerHTML = '<div class="spinner">Loading courses...</div>';

  try {
    const res = await fetch('/api/courses');
    const { data: courses } = await res.json();

    container.innerHTML = courses.map(course => \`
      <div class="card">
        <h3>\${course.title}</h3>
        <p>\${course.shortDescription}</p>
        <span class="badge">\${course.duration}</span>
      </div>
    \`).join('');
  } catch (err) {
    container.innerHTML = '<p class="error">Failed to load courses. Please try again.</p>';
  }
}
\`\`\`
`,8:`# Module 8: Building a Real-World Website Project

## Overview
Synthesize HTML, CSS, and JavaScript skills into a fully functional multi-page web application featuring navigation routers, search filtering, and state persistence.

## Learning Objectives
- Structure frontend assets into modular directories (\`/css\`, \`/js\`, \`/assets\`).
- Implement client-side URL routing and tab switching.
- Build live search and category filtering in real-time.
`,9:`# Module 9: Web Performance & SEO Optimization

## Overview
High-performance websites achieve fast page loads, high Core Web Vitals scores, and superior search engine discoverability.

## Learning Objectives
- Optimize Core Web Vitals: LCP (Largest Contentful Paint), INP (Interaction to Next Paint), and CLS (Cumulative Layout Shift).
- Lazy-load images with \`<img loading="lazy">\` and use modern WebP/AVIF formats.
- Implement Open Graph and JSON-LD Structured Data for rich search snippets.
`,10:`# Module 10: Hosting, Deployment & Portfolio Building

## Overview
Deploy web applications to modern cloud hosting platforms and showcase projects in an online developer portfolio.

## Learning Objectives
- Deploy static sites with continuous integration via GitHub Pages, Vercel, Netlify, and Firebase Hosting.
- Set up custom domains, DNS records, and SSL/TLS certificates.
- Build a polished developer portfolio highlighting live projects and source code repositories.
`},n=[{id:`web-mod-1`,title:`Module 1: Introduction to Web Development`,description:`Web architecture, HTTP/HTTPS, client-server models, and browsers.`,duration:`2 Hours`,topics:[{id:`web-top-1`,title:`How the Web Works`,description:`Client-server architecture, DNS resolution, and HTTP lifecycles.`,estimatedDuration:`45 mins`,learningUnits:[e(`web-unit-1-notes`,`Module 1 - Complete Notes`,`Web Architecture & Client-Server Protocols.`,`45 mins`,`Reading`,t[1])]}]},{id:`web-mod-2`,title:`Module 2: HTML5 Semantic Structure & Forms`,description:`Semantic tags, document structure, forms, inputs, and accessibility.`,duration:`3 Hours`,topics:[{id:`web-top-2`,title:`Semantic HTML5 & Accessible Forms`,description:`Semantic landmarks, input validations, and ARIA labels.`,estimatedDuration:`45 mins`,learningUnits:[e(`web-unit-2-notes`,`Module 2 - Complete Notes`,`Semantic HTML5 & Accessible Web Forms.`,`45 mins`,`Reading`,t[2])]}]},{id:`web-mod-3`,title:`Module 3: CSS3 Styling & Box Model`,description:`Box model, margin, padding, border, CSS variables, and specificity.`,duration:`3 Hours`,topics:[{id:`web-top-3`,title:`CSS Styling Foundations`,description:`The box model, CSS reset, custom properties, and cascading rules.`,estimatedDuration:`45 mins`,learningUnits:[e(`web-unit-3-notes`,`Module 3 - Complete Notes`,`CSS3 Box Model & Theming with Variables.`,`45 mins`,`Reading`,t[3])]}]},{id:`web-mod-4`,title:`Module 4: Responsive Design with Flexbox & Grid`,description:`Flexbox alignment, 2D CSS Grid systems, and media queries.`,duration:`4 Hours`,topics:[{id:`web-top-4`,title:`Responsive Flexbox & Grid Systems`,description:`Auto-fit grids, flexible containers, and mobile-first breakpoints.`,estimatedDuration:`45 mins`,learningUnits:[e(`web-unit-4-notes`,`Module 4 - Complete Notes`,`Flexbox & CSS Grid Responsive Layouts.`,`45 mins`,`Reading`,t[4])]}]},{id:`web-mod-5`,title:`Module 5: CSS Animations & Modern Layouts`,description:`Keyframe animations, transitions, transforms, and glassmorphism.`,duration:`3 Hours`,topics:[{id:`web-top-5`,title:`Transitions & Glassmorphic UI`,description:`Smooth keyframes, micro-interactions, and glass aesthetics.`,estimatedDuration:`45 mins`,learningUnits:[e(`web-unit-5-notes`,`Module 5 - Complete Notes`,`CSS Keyframes, Transitions & Modern Aesthetics.`,`45 mins`,`Reading`,t[5])]}]},{id:`web-mod-6`,title:`Module 6: JavaScript for Web Interactivity`,description:`DOM manipulation, events, modals, dropdowns, and form validation.`,duration:`3 Hours`,topics:[{id:`web-top-6`,title:`Dynamic DOM & User Interactions`,description:`Event listeners, accessible dialogs, and interactive widgets.`,estimatedDuration:`45 mins`,learningUnits:[e(`web-unit-6-notes`,`Module 6 - Complete Notes`,`JavaScript DOM Manipulation & Interactions.`,`45 mins`,`Reading`,t[6])]}]},{id:`web-mod-7`,title:`Module 7: Working with Web APIs & Data Fetching`,description:`Fetch API, async/await, RESTful APIs, JSON handling, and localStorage.`,duration:`3 Hours`,topics:[{id:`web-top-7`,title:`API Integration & Local Storage`,description:`Async data fetching, error handling, and browser storage.`,estimatedDuration:`45 mins`,learningUnits:[e(`web-unit-7-notes`,`Module 7 - Complete Notes`,`Fetch API, REST Integration & Local Storage.`,`45 mins`,`Reading`,t[7])]}]},{id:`web-mod-8`,title:`Module 8: Building a Real-World Website Project`,description:`End-to-end responsive web project with search, filters, and state.`,duration:`3 Hours`,topics:[{id:`web-top-8`,title:`Capstone Website Project`,description:`Multi-page architecture, live filters, and state persistence.`,estimatedDuration:`45 mins`,learningUnits:[e(`web-unit-8-notes`,`Module 8 - Complete Notes`,`Real-World Full-Featured Web Application Project.`,`45 mins`,`Reading`,t[8])]}]},{id:`web-mod-9`,title:`Module 9: Web Performance & SEO Optimization`,description:`Core Web Vitals, image optimization, meta tags, and structured data.`,duration:`3 Hours`,topics:[{id:`web-top-9`,title:`Performance & Search Engine Optimization`,description:`LCP/CLS tuning, lazy loading, Open Graph, and JSON-LD metadata.`,estimatedDuration:`45 mins`,learningUnits:[e(`web-unit-9-notes`,`Module 9 - Complete Notes`,`Core Web Vitals, Web Performance & Technical SEO.`,`45 mins`,`Reading`,t[9])]}]},{id:`web-mod-10`,title:`Module 10: Hosting, Deployment & Portfolio Building`,description:`Deploying with GitHub, Netlify, Vercel, DNS records, and developer portfolios.`,duration:`3 Hours`,topics:[{id:`web-top-10`,title:`Cloud Deployment & Developer Portfolio`,description:`CI/CD deployment pipelines, custom domains, and portfolio showcases.`,estimatedDuration:`45 mins`,learningUnits:[e(`web-unit-10-notes`,`Module 10 - Complete Notes`,`Web Deployment, Custom Domains & Portfolio Launch.`,`45 mins`,`Reading`,t[10])]}]}];export{n as webDevCourseModules};
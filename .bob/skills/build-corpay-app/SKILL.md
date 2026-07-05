---
name: build-corpay-app
description: Use when the user wants to build the Corpay 2025 Annual Report Node.js Express app — generates all project files (server.js, package.json, public/index.html, public/styles.css, public/script.js) ready for IBM Cloud Code Engine deployment via buildpacks.
---

# Build Corpay 2025 Annual Report App

Follow these steps exactly to generate a production-quality Node.js Express web application for the Corpay 2025 Annual Report: Five AI Opportunities Identified by IBM.

---

## Constraints

- Do NOT generate a Dockerfile.
- Do NOT use React, Angular, Vue, or Bootstrap.
- Do NOT add a database, authentication, file writes, or any backend beyond Express serving static files and a /health endpoint.
- Keep npm dependencies to an absolute minimum.
- The app must run locally with `npm install` && `npm start`.
- The app must be deployable to IBM Cloud Code Engine using Cloud Native Buildpacks (source-to-image).

---

## Step 1 — Create `package.json`

Write the file at `package.json` with the following content:

```json
{
  "name": "corpay-annual-report",
  "version": "1.0.0",
  "description": "Corpay 2025 Annual Report: Five AI Opportunities Identified by IBM",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}
```

---

## Step 2 — Create `server.js`

Write the file at `server.js`:

```js
// server.js — Express entry point
// Serves static assets from /public and exposes /health for Code Engine probes.

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Health check — required by IBM Cloud Code Engine
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Serve all frontend assets from /public
app.use(express.static(path.join(__dirname, 'public')));

// Fallback to index.html for any unmatched route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## Step 3 — Create `public/styles.css`

Write the file at `public/styles.css`. Use the design system below exactly.

Design system:
- Background: Dark navy executive desk-style background with subtle Corpay/global payments visual elements (base color `#07111f`, layered with CSS gradients, SVG grid lines, network patterns, and ghost document pseudo-elements — see Background / Visual Environment section below)
- Paper panel: `#f7f4ed`
- IBM blue accent: `#0f62fe`
- Highlight yellow: `#fff2a8`
- Text dark: `#1f2937`
- Muted gray: `#6b7280`
- Font: `'IBM Plex Sans', 'Inter', 'Helvetica Neue', Arial, sans-serif`
- Import IBM Plex Sans from Google Fonts in the HTML `<head>`.

Key CSS requirements:
- Full-screen hero with centered content, fade-in animation on load.
- Sticky right-side navigation with 5 labels: Fraud, Credit, Compliance, AP, Cyber.
  - Active item highlighted in IBM blue.
  - On mobile (≤768px): right nav hides; a top horizontal nav or compact section list appears instead.
- Each `.report-section` fades in as it scrolls into view (use `IntersectionObserver` in JS, toggling an `.is-visible` class).
- `.quote-highlight` uses a yellow background (`#fff2a8`) with an animated width sweep from 0% to 100% when `.is-visible` is applied to the parent section.
- `.ibm-insight-card` styled as an IBM blue left-bordered card.
- Smooth scroll behavior on `html`.
- Premium executive aesthetic: generous whitespace, refined typography, subtle hover states, no gradients, no shadows heavier than `0 2px 8px rgba(0,0,0,0.08)`.

**Background / Visual Environment**

Do not use a plain dark background.

Keep the main content as a digital 10-K report experience, but make the background feel like the report is sitting on an executive desk.

Create a layered background environment using CSS only (no external image downloads):

- Dark navy desk surface or textured executive tabletop (CSS radial/linear gradients on `body`)
- Subtle blueprint-style financial grid lines (SVG `<pattern>` via inline `<svg>` or CSS background-image data URI)
- Faint world map or global payment route lines in the background (inline SVG paths, very low opacity, positioned absolutely behind content)
- Very subtle transaction/network dot patterns tied to Corpay's global payments business (CSS radial gradients or small inline SVG)
- A partially visible 10-K document or report pages behind the main report panel (CSS pseudo-elements `::before`/`::after` on `.report-section`, rotated slightly, low opacity paper-colored rectangles)
- Optional subtle desk objects such as a pen or paper clip rendered as simple CSS shapes or inline SVG — tasteful and not distracting
- The main `.report-page` panel must remain the clear visual focus

Design requirements:
- Background should feel like a high-end consulting team has marked up Corpay's 10-K on a dark executive desk
- Faint global payment network lines and the sense of handwritten margin notes in the surrounding area
- All background elements must be low contrast and not compete with the report content
- Entirely CSS-based: use gradients, pseudo-elements, subtle SVG patterns, or simple decorative HTML elements
- No external image URLs

---

## Step 4 — Create `public/index.html`

Write the file at `public/index.html`. Use semantic HTML5. Structure:

### `<head>`
- `<meta charset="UTF-8">`
- `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
- `<title>Corpay 2025 Annual Report — IBM AI on Z</title>`
- Google Fonts link for IBM Plex Sans (weights 300, 400, 500, 600)
- `<link rel="stylesheet" href="styles.css">`

### Right-side sticky nav (outside main content flow)
```html
<nav class="side-nav" aria-label="Section navigation">
  <ul>
    <li><a href="#section-1" class="side-nav__item" data-section="section-1">Fraud</a></li>
    <li><a href="#section-2" class="side-nav__item" data-section="section-2">Credit</a></li>
    <li><a href="#section-3" class="side-nav__item" data-section="section-3">Compliance</a></li>
    <li><a href="#section-4" class="side-nav__item" data-section="section-4">AP</a></li>
    <li><a href="#section-5" class="side-nav__item" data-section="section-5">Cyber</a></li>
  </ul>
</nav>
```

### Mobile top nav
```html
<nav class="mobile-nav" aria-label="Mobile section navigation">
  <a href="#section-1">Fraud</a>
  <a href="#section-2">Credit</a>
  <a href="#section-3">Compliance</a>
  <a href="#section-4">AP</a>
  <a href="#section-5">Cyber</a>
</nav>
```

### Hero section (`<section class="hero">`)
- Full viewport height.
- Headline: **We Read Your Annual Report.**
- Subheading: *We found five opportunities where AI on IBM Z can help Corpay reduce risk, improve decisioning, and strengthen payment operations.*
- Body: *Rather than bringing generic AI use cases, IBM reviewed Corpay's 2025 Annual Report and mapped five business priorities to practical AI opportunities on IBM Z. Each opportunity below begins with Corpay's own disclosure, followed by IBM's perspective on where real-time, trusted AI can create value.*
- Button: **Begin Executive Briefing** — `onclick` smooth-scrolls to `#section-1`.
- Source note: *Source: Corpay 2025 Form 10-K.*

### Five report sections (`<section id="section-N" class="report-section">`)

Each section uses this inner structure:
```html
<div class="report-page">
  <div class="report-page__header">
    <span class="report-page__number">Observation N</span>
    <h2 class="report-page__title"><!-- title --></h2>
  </div>
  <blockquote class="quote-highlight"><!-- 10-K quote --></blockquote>
  <div class="ibm-insight-card">
    <span class="ibm-insight-card__label">IBM Insight</span>
    <!-- insight content below -->
  </div>
  <div class="report-page__body">
    <h3>Why this matters</h3><p>...</p>
    <h3>IBM AI on Z opportunity</h3><p>...</p>
    <h3>Why AI on Z is different</h3><p>...</p>
    <ul class="outcome-list"><!-- 3–5 bullets --></ul>
  </div>
  <button class="continue-btn" data-next="section-N+1">Continue Reading →</button>
</div>
```

Use the exact text from the five sections defined below.

**Section 1 — Fraud**
- Quote: *"We may incur substantial losses due to fraudulent use of our payment solutions."*
- Why this matters: Fraud is not just a back-office issue. In a payments business, every transaction represents a real-time decision point. If suspicious activity is identified only after authorization or settlement, Corpay may be left trying to recover funds after the damage has already occurred.
- Opportunity: Transactional AI on IBM Z can analyze 100% of payment transactions instantly, while the transaction is still in flight. This allows Corpay to score transactions for suspicious behavior before approval, helping catch and block fraud before a payment is authorized rather than attempting to recover funds afterward.
- Why different: Because the AI runs where core transaction processing already occurs, Corpay can avoid moving sensitive transaction data off-platform for analysis. That means lower latency, reduced data movement, and real-time decisioning at enterprise scale.
- Bullets: Analyze every transaction, not just sampled activity / Detect suspicious patterns before payment approval / Reduce fraud losses and post-event recovery efforts / Preserve transaction speed and customer experience / Keep sensitive payment data on the platform

**Section 2 — Credit**
- Quote: *"If we fail to adequately assess and monitor credit risks or fraud of or by our customers or third parties, we could experience an increase in credit loss."*
- Why this matters: Credit exposure can change quickly. A customer that looked acceptable during onboarding may become higher risk based on behavior, transaction patterns, payment timing, or external events. Static or delayed credit reviews can leave the business exposed.
- Opportunity: AI embedded directly into the transactional pipeline can continuously monitor account behavior and identify deteriorating credit quality in near real time. When a customer crosses a risk threshold, Corpay could trigger executable action immediately, such as flagging the account, adjusting limits, requiring review, or increasing monitoring.
- Why different: AI on IBM Z allows credit risk signals to be evaluated as transactions occur, instead of waiting for downstream analysis. This creates an opportunity to move from periodic risk assessment to continuous risk monitoring.
- Bullets: Monitor customer behavior continuously / Identify risk threshold breaches faster / Reduce exposure to credit losses / Support faster account-level intervention / Improve confidence in credit decisioning

**Section 3 — Compliance**
- Quote: *"Failure to comply with the FCPA, AML regulations, economic and trade sanctions regulations and similar laws and regulations applicable to our international activities, could subject us to penalties and other adverse consequences."*
- Why this matters: Corpay operates across a complex global payments environment. Cross-border transactions require rapid decisions across payee verification, AML monitoring, sanctions screening, jurisdictional rules, and regulatory expectations. Delays or gaps can create financial, operational, and reputational risk.
- Opportunity: Corpay can use AI on IBM Z to support instant payee verification and sanctions screening for cross-border transactions across more than 200 jurisdictions. Real-time compliance monitoring can help evaluate payments before they move, reducing the latency and data-transfer risks associated with sending sensitive payment information off-platform for AI analysis.
- Why different: Compliance decisions are most valuable when they happen before the payment leaves the system. By keeping AI close to the transaction, Corpay can improve speed, security, and auditability while reducing unnecessary movement of sensitive financial data.
- Bullets: Screen cross-border payments in real time / Support AML, FCPA, and sanctions compliance workflows / Reduce latency from off-platform analysis / Minimize sensitive data movement / Help avoid regulatory penalties and adverse consequences

**Section 4 — AP**
- Quote: *"AI technologies are being rapidly adopted across the payment and enterprise software industries."*
- Why this matters: Corpay identifies AI adoption as a competitive force in the payments and enterprise software market. This creates both a risk and an opportunity. Competitors may use AI to improve automation, reduce manual effort, identify spend anomalies, and create better customer experiences.
- Opportunity: AI on IBM Z can help Corpay apply real-time anomaly detection to accounts payable and spend management workflows. As invoices, payments, and employee spend events occur, AI can flag irregular invoices, out-of-policy spending, duplicate activity, unusual vendors, or abnormal transaction patterns.
- Why different: Keeping AI close to the transaction allows Corpay to detect issues as they happen rather than after the fact. It also avoids unnecessary latency and security exposure from moving sensitive financial data to another platform for processing.
- Bullets: Identify irregular invoices in real time / Flag out-of-policy spending earlier / Reduce manual review burden / Improve AP automation and spend governance / Strengthen Corpay's competitive AI position

**Section 5 — Cyber**
- Quote: *"We may not be able to adequately protect our systems or the data we collect from continually evolving cybersecurity and data-protection risks, which could subject us to liability and damage our reputation."*
- Why this matters: AI can create value, but it can also create new risk if sensitive financial, customer, or transaction data must be copied, exported, or moved to external environments for analysis. Every data movement path can increase exposure, complexity, cost, and governance requirements.
- Opportunity: AI on IBM Z allows Corpay to generate insights where the data already resides. Instead of moving highly sensitive financial data off-platform for AI analysis, Corpay can bring AI to the data, reducing exposure while still enabling real-time intelligence.
- Why different: The mainframe is already designed for secure, high-volume, mission-critical transaction processing. Running AI directly on IBM Z helps preserve that security posture while reducing data-transfer risk, latency, and operational complexity.
- Bullets: Reduce unnecessary movement of sensitive financial data / Preserve security around core transaction systems / Lower data-transfer risk and cost / Improve governance and auditability / Enable AI without weakening the security model

### Closing section
- Title: **From Disclosure to Decisioning**
- Copy: *All five opportunities share a common theme: the most valuable AI decision is the one made while the transaction is still in flight. IBM AI on Z helps bring intelligence directly to the systems where Corpay's most critical payment, risk, compliance, and security decisions already happen.*
- CTA: **Let's explore where AI on Z could create the greatest value for Corpay first.**

### Footer
*Prepared by Mike Murphy and Christian Toulet for Corpay. Based on IBM's review of Corpay's 2025 Form 10-K.*

---

## Step 5 — Create `public/script.js`

Write the file at `public/script.js`. Use vanilla JavaScript only. Include:

1. **Smooth scroll** — `document.querySelectorAll('a[href^="#"]')` with `scrollIntoView({ behavior: 'smooth' })`.
2. **Section reveal** — `IntersectionObserver` on all `.report-section` elements; add `.is-visible` class when `intersectionRatio > 0.15`. This triggers CSS fade-in and quote highlighter animation.
3. **Active nav highlight** — second `IntersectionObserver` (or same one) updates `.side-nav__item` and `.mobile-nav a` active state as sections enter the viewport.
4. **Continue Reading buttons** — `document.querySelectorAll('.continue-btn')` click handler reads `data-next` attribute and scrolls to that section id.
5. **Hero button** — scrolls to `#section-1` on click.

---

## Step 6 — Create placeholder directories

Create empty placeholder files so the directory structure exists:
- `public/images/.gitkeep`
- `public/assets/.gitkeep`

---

## Step 7 — Verify

After writing all files, confirm:
- `package.json` has `"start": "node server.js"` and only `express` as a dependency.
- `server.js` listens on `process.env.PORT || 8080` and has a `/health` route returning 200.
- No Dockerfile exists in the project root.
- All five sections are present in `index.html` with correct IDs (`section-1` through `section-5`).
- `script.js` contains IntersectionObserver logic and smooth scroll.

Tell the user:
> All files have been generated. Run `npm install && npm start` and open http://localhost:8080 to preview. The app is ready for deployment to IBM Cloud Code Engine using Cloud Native Buildpacks — no Dockerfile needed.

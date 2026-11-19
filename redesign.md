# Project: Especialista do Ar — Complete Website Redesign

## Role and Mission

Act as a Senior Product Designer, Art Director, UX Architect, Design Systems Engineer, and Senior Astro Frontend Architect.

Your mission is to plan a complete, high-quality redesign of **Especialista do Ar**, an existing Brazilian website focused on air conditioning, indoor climate control, energy efficiency, technical product analysis, and informed purchasing decisions.

Website: https://especialista-do-ar.pages.dev

This is not a minor visual refresh, a landing page redesign, or a simple CSS modernization.

**The objective is to transform the entire website into a cohesive, premium, professional digital platform with a distinctive visual identity that communicates air conditioning, indoor comfort, climate technology, engineering, and energy intelligence.**

The final result must look and feel like a carefully art-directed product developed by an experienced design and engineering team — never like a generic AI-generated website or template.

The redesign must cover the entire application: every page, route, layout, section, component, interaction, and responsive state.

---

# 1. Mandatory Skills and Workflow

Before making any design decisions, inspect and use the following installed skills:

- `@ui-ux-pro-max`
- `@taste`
- `@impeccable`
- `@grill-with-docs`
- `@to-spec`
- `@to-tickets`

Read their actual instructions and follow their recommendations. Do not assume their capabilities based only on their names.

### Responsibilities of each skill

**UI UX Pro Max**
- Establish the overall UX direction.
- Define visual design principles and design system foundations.
- Establish typography, color palettes, component patterns, spacing, and responsive conventions.
- Ensure usability, consistency, and accessibility.

**Taste**
- Establish a distinctive visual and artistic direction.
- Avoid generic AI-generated aesthetics.
- Improve visual composition, hierarchy, typography, density, and personality.
- Ensure the interface feels intentionally designed rather than assembled from generic components.

**Impeccable**
- Audit existing interfaces.
- Identify visual weaknesses and usability problems.
- Improve typography, spacing, hierarchy, color usage, component styling, and interface details.
- Apply consistent, high-quality visual refinement.

**Grill with Docs**
- Drive the planning and documentation workflow.
- Help investigate the existing codebase.
- Produce a complete redesign specification before implementation.
- Break the specification into actionable, dependency-aware implementation tickets.
- Keep project documentation synchronized with decisions and progress.

Use the skills as complementary tools. Resolve conflicting recommendations through a consistent design direction rather than blindly combining unrelated styles.

Do not install additional design tools, introduce a separate visual design application, or create an unnecessary design workflow.

The existing Astro codebase is the implementation environment.

---

# 2. First Phase: Deep Project Discovery and Audit

Do not modify the application yet.

Start by understanding the actual project.

Inspect:

- The complete repository structure.
- Astro configuration and rendering strategy.
- All routes and page templates.
- Shared layouts and components.
- Existing CSS architecture and global styles.
- JavaScript and TypeScript functionality.
- Data sources and integrations.
- Existing assets, product images, icons, and fonts.
- SEO implementation and metadata.
- Responsive behavior.
- Existing interactive components.
- Performance-sensitive areas.
- Any existing design tokens or component conventions.

Identify every relevant page and route, including dynamically generated routes.

Do not assume that the homepage represents the entire application.

### Website browser inspection

Use the installed **Vercel agent-browser** tool to inspect the real website through its browser.

Inspect the current website at:

https://especialista-do-ar.pages.dev

Explore all discoverable sections, navigation paths, and relevant routes.

Inspect the interface in desktop and mobile viewport sizes.

Evaluate:

- Visual hierarchy.
- Navigation and information architecture.
- Typography.
- Colors and contrast.
- Spacing and alignment.
- Component consistency.
- Cards, tables, forms, filters, and buttons.
- Data presentation.
- Product presentation.
- Mobile usability.
- Interaction patterns.
- Empty, loading, error, and success states where applicable.

Use screenshots when helpful for visual comparison and documentation.

The browser inspection and repository inspection must complement each other.

If a route cannot be accessed, investigate the reason. Do not silently ignore it or invent its contents.

### Audit deliverable

Create a complete inventory of:

1. All routes and page types.
2. Shared components.
3. Page-specific components.
4. Existing functionality.
5. Visual inconsistencies.
6. UX problems.
7. Technical constraints.
8. Opportunities for improvement.

The redesign must be based on the real application, not assumptions.

---

# 3. Product Identity and Art Direction

## Brand positioning

Especialista do Ar should be perceived as a trusted, sophisticated, technically knowledgeable platform specializing in air conditioning and indoor climate intelligence.

It should communicate:

- Indoor comfort.
- Climate control.
- Air conditioning technology.
- Energy efficiency.
- Engineering and technical expertise.
- Reliable information.
- Product comparison and evaluation.
- Informed purchasing decisions.

The interface must visually communicate the subject of the website.

Avoid generic SaaS dashboards that could belong to any industry.

Avoid generic e-commerce templates.

Avoid generic AI landing pages.

The design should have its own identity, strongly connected to climatization and environmental comfort.

## Desired visual personality

The overall aesthetic should be:

- Premium.
- Professional.
- Sophisticated.
- Technological.
- Clean.
- Editorial.
- Technical, without becoming cold or inaccessible.
- Modern, without relying on short-lived design trends.
- Trustworthy and authoritative.

Think of a combination of a premium technology publication, a professional climate intelligence platform, and a sophisticated consumer product research experience.

The result should feel like a mature digital product.

## Climate-inspired visual language

Explore subtle visual references to:

- Airflow and circulation.
- Temperature and thermal gradients.
- Cool and warm air.
- Environmental comfort.
- Climate engineering.
- Precision measurement.
- Energy consumption and efficiency.
- Modern HVAC equipment.

These concepts can influence visual composition, graphic elements, data visualization, backgrounds, transitions, and interface details.

However:

- Do not fill the interface with decorative airflow illustrations.
- Do not use excessive blue gradients.
- Do not rely on snowflakes, fans, thermometers, or generic HVAC icons everywhere.
- Do not use illustrations as a substitute for good layout design.
- Do not make every section look identical.

Climate-related visual elements must be subtle, intentional, and sophisticated.

## Color direction

Explore a distinctive palette inspired by indoor climate, technical precision, and energy efficiency.

Possible starting directions include:

- Deep petrol blue or midnight blue for authority.
- Refined cool blue and teal accents for climate technology.
- Neutral warm whites and sophisticated grays for surfaces.
- Subtle green tones for energy efficiency and positive performance indicators.
- Restrained warm amber accents for temperature, warnings, and important highlights.

These are starting references, not mandatory final values.

Develop and justify the actual palette through the design exploration process.

Ensure semantic color usage is consistent.

Do not make every interface element colorful.

## Typography

Choose a deliberate typographic system.

Typography should distinguish:

- Editorial headings.
- Page titles.
- Technical information.
- Product names.
- Numerical indicators.
- Body text.
- Labels and metadata.
- Dense tables.

Use typography to establish hierarchy and personality.

Pay particular attention to numerical readability in energy consumption, efficiency ratings, BTU values, prices, and product specifications.

Avoid oversized headings without purpose.

## Visual composition

Prioritize:

- Strong alignment.
- Intentional whitespace.
- Consistent spacing.
- Clear content hierarchy.
- Balanced information density.
- Excellent readability.
- Sophisticated section transitions.
- Appropriate use of borders and surfaces.
- Purposeful image placement.
- Consistent component proportions.

Do not overuse rounded cards, pill-shaped elements, floating panels, shadows, or decorative containers.

Not every section needs a card.

Not every piece of content needs a background.

The interface must feel composed, not assembled.

---

# 4. Complete Website Redesign Scope

The redesign must cover every existing page and feature.

The following areas are especially important. Treat this list as a starting point and expand it based on actual repository discovery.

## A. Homepage

Redesign the homepage as the main presentation of the brand.

It must immediately communicate:

- What Especialista do Ar offers.
- Why visitors should trust the platform.
- How visitors can use its tools.
- How visitors can discover and compare air conditioners.
- How the platform helps them make better decisions.

Establish an excellent visual hierarchy and a clear user journey.

Avoid a generic hero followed by repetitive card grids.

The homepage should have its own editorial identity and carefully designed section compositions.

## B. INMETRO Product Database

This is one of the platform's most important features.

The interface must communicate technical credibility and make large amounts of information easy to understand.

Redesign:

- Database presentation.
- Search experience.
- Advanced filters.
- Quick filters.
- Sorting.
- Product rows and cards.
- Efficiency indicators.
- Technical attributes.
- Pagination or progressive loading.
- Mobile presentation.
- Empty and loading states.

Pay particular attention to information density and readability.

The database must remain easy to navigate even with thousands of products.

Do not sacrifice functionality or data visibility for visual minimalism.

## C. Individual Product Analysis Pages

Create a sophisticated editorial product-review experience.

The visual structure should support:

- Product identification.
- Product imagery.
- Technical specifications.
- Energy efficiency.
- Performance analysis.
- Strengths and weaknesses.
- Important considerations.
- Comparisons.
- Related products.
- Purchase opportunities.

The design must distinguish editorial analysis from commercial recommendations.

Affiliate offers must be integrated naturally and transparently.

Avoid aggressive advertising aesthetics.

## D. BTU Calculator / Climate Assistant

Redesign the entire user experience of the calculator.

It should feel like a polished, intelligent technical assistant.

Improve:

- Form structure.
- Question hierarchy.
- Input controls.
- Progress feedback.
- Validation.
- Result presentation.
- Recommended cooling capacity.
- Technical explanations.
- Follow-up actions.

Make the experience easy for non-technical visitors without losing technical credibility.

## E. Product Comparison

Design a professional product comparison experience.

Focus on:

- Clear side-by-side comparison.
- Aligned specifications.
- Important differences.
- Energy efficiency.
- Capacity.
- Estimated consumption.
- Technical details.
- Responsive behavior.

Users must quickly understand which products differ and why those differences matter.

## F. Regional Energy Cost Calculator

Create a clear, technically credible calculator experience.

Consider:

- Regional electricity costs.
- Consumption estimates.
- Usage duration.
- Monthly cost.
- Annual cost.
- Product efficiency.
- Graphs and indicators.
- Calculation explanations.

Data visualizations must be informative, accessible, and visually consistent.

## G. Offers and Affiliate Sections

Design product offers with a professional editorial and commercial balance.

Prioritize:

- Product clarity.
- Price readability.
- Product differentiation.
- Relevant technical information.
- Transparent affiliate presentation.
- Clear purchase actions.

Avoid excessive promotional badges, urgency tactics, and generic marketplace layouts.

## H. Remaining Pages and Features

Discover and include every other existing route and section in the redesign.

Nothing should be left behind.

This includes, where applicable:

- Navigation.
- Header and footer.
- Search.
- Category pages.
- Brand pages.
- Content and educational articles.
- Technical guides.
- Legal pages.
- SEO landing pages.
- Related-content sections.
- Not-found pages.
- Shared navigation and mobile menus.

The final specification must explicitly identify every route and explain its redesign requirements.

---

# 5. Design System Requirements

Create a cohesive design system before implementation.

The specification must define:

## Foundations

- Primary, secondary, neutral, and semantic colors.
- Typography families and scales.
- Spacing scale.
- Layout grid.
- Content widths.
- Breakpoints.
- Border styles.
- Border radii.
- Shadows.
- Motion principles.
- Iconography.
- Image treatment.

## Components

Define consistent patterns for:

- Header and navigation.
- Footer.
- Buttons.
- Links.
- Inputs.
- Select controls.
- Checkboxes.
- Radio buttons.
- Search fields.
- Filters.
- Dropdowns.
- Tabs.
- Badges.
- Tooltips.
- Cards.
- Tables.
- Product summaries.
- Product specifications.
- Charts.
- Result panels.
- Alerts.
- Dialogs.
- Pagination.
- Breadcrumbs.
- Loading indicators.
- Empty states.

Include variants and interaction states where necessary.

Do not create components just to increase abstraction. Establish reusable patterns where they provide genuine consistency and maintainability.

## Responsive design

Every page and component must work properly on:

- Mobile.
- Tablet.
- Desktop.
- Wide desktop screens.

Define responsive behavior intentionally.

Do not simply shrink desktop layouts.

Tables, comparison interfaces, calculators, and navigation require particular attention on mobile.

## Accessibility

The design system must account for:

- Semantic HTML.
- Keyboard navigation.
- Visible focus states.
- Accessible form labels.
- Sufficient contrast.
- Reduced motion preferences.
- Screen-reader-friendly interactions.
- Appropriate heading hierarchy.

---

# 6. Technical Constraints and Non-Negotiable Requirements

The website is built with **Astro**, with a strong focus on performance and SEO.

Preserve and improve this architecture.

## Astro and frontend architecture

- Respect the existing Astro architecture.
- Prefer Astro components for static and server-rendered interfaces.
- Use client-side JavaScript only where interaction requires it.
- Avoid unnecessary hydration.
- Avoid introducing large frontend frameworks without a demonstrated need.
- Keep components maintainable and reusable.
- Follow existing project conventions unless a documented architectural improvement is justified.
- Preserve TypeScript correctness where applicable.

## Performance

The redesign must not compromise performance.

Pay attention to:

- Core Web Vitals.
- Image optimization.
- Font loading.
- CSS size.
- JavaScript execution.
- Hydration boundaries.
- Layout shifts.
- Lazy loading.
- Rendering strategy.

Animations must be lightweight and purposeful.

Avoid heavy animation libraries for simple effects.

## SEO

Preserve and improve:

- Existing URLs.
- Page titles.
- Meta descriptions.
- Canonical URLs.
- Structured data.
- Heading hierarchy.
- Internal linking.
- Semantic HTML.
- Indexability.
- Content accessibility to search engines.

Do not change URL structures without a clear reason and a documented redirect strategy.

Do not remove useful content or technical information for aesthetic reasons.

Do not replace meaningful text with images.

## Functionality preservation

This is a visual and UX redesign, not a product rewrite.

All existing functionality must continue working.

Preserve:

- INMETRO data.
- Search and filtering logic.
- Product analysis data.
- Affiliate links and tracking.
- BTU calculations.
- Product comparison logic.
- Regional energy calculations.
- Existing integrations.
- Existing business rules.

Do not invent new technical data or alter calculation formulas.

If a functionality is unclear, investigate the existing implementation before changing it.

---

# 7. Visual Quality Standards

The following are explicit anti-patterns to avoid:

- Generic AI-generated landing page aesthetics.
- Excessive gradients.
- Excessive rounded cards.
- Repetitive card grids.
- Unnecessary glassmorphism.
- Oversized headings.
- Random icon combinations.
- Decorative elements without purpose.
- Excessive use of shadows.
- Arbitrary colors.
- Inconsistent spacing.
- Inconsistent button styles.
- Excessive animations.
- Fake statistics.
- Fake testimonials.
- Placeholder product images.
- Unnecessary marketing copy.
- Generic SaaS dashboard layouts.
- Unnecessary visual complexity.

A premium design is not achieved by adding effects.

It is achieved through thoughtful hierarchy, proportion, typography, composition, restraint, consistency, and attention to detail.

Every design decision must serve the product, the user, or the brand.

---

# 8. Documentation-First Execution Plan

Use `@grill-with-docs` to plan and document this entire redesign.

**Do not start implementing the redesign during this planning phase.**

First produce a complete specification and implementation plan.

Adapt the exact documentation structure to the repository's existing conventions and the installed skill's recommendations.

The planning deliverables must include:

### 1. Project audit

Document:

- Existing architecture.
- Routes and page inventory.
- Component inventory.
- Existing functionality.
- Current design weaknesses.
- Technical constraints.
- SEO and performance considerations.

### 2. Design direction

Document:

- Brand positioning.
- Art direction.
- Visual principles.
- Climate-inspired design language.
- Color palette.
- Typography.
- Layout principles.
- Motion principles.
- Reference concepts.
- Anti-patterns.

### 3. Complete design system specification

Document all design tokens, components, variants, interaction states, and responsive conventions.

### 4. Page-by-page redesign specification

For every existing route, document:

- Its purpose.
- Its target user needs.
- Its information architecture.
- Its proposed layout.
- Its visual hierarchy.
- Its components.
- Its interaction requirements.
- Its responsive behavior.
- Its SEO considerations.

### 5. Technical implementation strategy

Document:

- Astro architecture considerations.
- Component reuse strategy.
- CSS organization.
- Token implementation.
- Hydration boundaries.
- Performance requirements.
- SEO safeguards.
- Testing strategy.

### 6. Acceptance criteria

Define measurable completion requirements for the redesign.

### 7. Implementation tickets

After the specification is complete, generate a dependency-aware collection of implementation tickets.

Organize them into logical milestones, for example:

- Foundation and design tokens.
- Shared layouts and navigation.
- Core UI components.
- Homepage.
- Product database.
- Product analysis pages.
- BTU assistant.
- Product comparison.
- Energy calculator.
- Offers and affiliate interfaces.
- Remaining pages.
- Responsive refinement.
- Accessibility.
- Performance and SEO validation.
- Final visual audit.

These milestones are examples. Adapt them to the actual project.

Each ticket must include:

- Unique identifier.
- Clear title.
- Objective.
- Context.
- Scope.
- Relevant files or components, when known.
- Dependencies.
- Implementation guidance.
- Acceptance criteria.
- Testing requirements.

Tickets must be sufficiently detailed for an autonomous coding agent to execute without guessing the intended design.

Avoid overly broad tickets such as "Redesign the homepage."

Split work into logical, independently verifiable tasks.

Establish implementation dependencies so that foundational work happens before dependent pages.

---

# 9. Browser-Based Visual Validation

Use **Vercel agent-browser** as the primary browser inspection and validation tool.

Do not introduce Playwright as an additional testing dependency for this workflow.

Use the browser to:

- Inspect the existing application.
- Review current page layouts.
- Capture relevant screenshots.
- Navigate redesigned pages.
- Validate desktop and mobile layouts.
- Test interactions.
- Identify visual inconsistencies.
- Inspect overflow and alignment issues.
- Validate forms, filters, navigation, and calculators.
- Compare implementation against the documented design direction.

Follow the actual installed agent-browser instructions and commands.

Do not assume command syntax or invent browser capabilities.

The browser is part of the quality assurance workflow, not merely a screenshot generator.

---

# 10. Decision-Making Principles

When making design and architectural decisions, prioritize in this order:

1. User experience and usability.
2. Strong and distinctive brand identity.
3. Visual quality and consistency.
4. Technical clarity and maintainability.
5. Performance.
6. SEO.
7. Responsive behavior.
8. Accessibility.

These requirements should work together, not compete unnecessarily.

If a design decision could negatively affect performance, SEO, accessibility, or existing functionality, document the trade-off and propose a better alternative.

Do not make assumptions about unavailable information.

Document uncertainties and investigate them.

Do not silently discard existing features.

Do not make unnecessary architectural changes simply to accommodate the redesign.

---

# 11. Final Deliverables for This Planning Phase

At the end of this phase, I expect:

1. A complete audit of the current website and repository.
2. A complete inventory of routes and components.
3. A clearly justified premium visual direction specific to air conditioning and climate control.
4. A complete design system specification.
5. A detailed page-by-page redesign specification.
6. A technical implementation strategy compatible with Astro.
7. A performance, SEO, and accessibility preservation strategy.
8. A complete set of dependency-aware implementation tickets.
9. A clear recommended implementation order.
10. A list of unresolved questions, risks, and assumptions.

All documentation must be organized, actionable, and consistent with the repository's existing documentation conventions.

The specification must be detailed enough that a future implementation phase can execute the redesign without redefining the visual direction.

---

# 12. Final Instructions

Work methodically.

First inspect the installed skills and the repository.

Then inspect the live website with agent-browser.

Then audit the application.

Then define the art direction and design system.

Then write the complete specification.

Finally, create the implementation tickets.

**Do not start coding the redesign during this phase.**

Do not modify production functionality.

Do not perform broad refactoring.

Do not replace existing components before the specification and tickets are approved.

At the end, provide a concise summary containing:

- What was inspected.
- What was discovered.
- The proposed visual direction.
- Which documentation files were created.
- How many routes were audited.
- How many implementation tickets were created.
- The recommended execution order.
- Any unresolved questions or risks.

The result of this phase should be a professional, comprehensive, implementation-ready redesign blueprint for Especialista do Ar.

**Think like a senior design team preparing a complete product redesign, not like an AI asked to make a website look prettier.**

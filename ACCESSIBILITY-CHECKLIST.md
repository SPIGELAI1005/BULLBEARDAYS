# Accessibility Checklist for BullBearDays

This checklist helps ensure WCAG 2.1 Level AA compliance.

## ✅ Completed

### Semantic HTML
- [ ] Use proper heading hierarchy (h1 → h2 → h3)
- [ ] Use semantic elements (`<nav>`, `<main>`, `<article>`, `<section>`)
- [ ] Form inputs have associated `<label>` elements
- [ ] Use `<button>` for actions, `<a>` for navigation

### Keyboard Navigation
- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are visible
- [ ] Tab order is logical
- [ ] No keyboard traps
- [ ] Skip to main content link present

### ARIA Labels
- [ ] Images have alt text
- [ ] Icon buttons have aria-label
- [ ] Complex widgets have proper ARIA roles
- [ ] Live regions for dynamic content (aria-live)
- [ ] Form validation messages are announced

### Color & Contrast
- [ ] Text contrast ratio ≥ 4.5:1 (normal text)
- [ ] Text contrast ratio ≥ 3:1 (large text ≥18pt)
- [ ] Color is not the only means of conveying information
- [ ] Focus indicators have ≥ 3:1 contrast

### Screen Reader Support
- [ ] Page title is descriptive
- [ ] Landmarks are properly labeled
- [ ] Hidden content uses aria-hidden or hidden
- [ ] Screen reader only text where needed
- [ ] Loading states are announced

### Forms & Inputs
- [ ] All inputs have labels
- [ ] Error messages are associated with inputs
- [ ] Required fields are indicated
- [ ] Placeholder text is not the only label
- [ ] Form validation is accessible

### Media & Content
- [ ] Images have descriptive alt text
- [ ] Decorative images have alt=""
- [ ] Charts have text alternatives
- [ ] Auto-playing content can be paused
- [ ] No flashing content (seizure risk)

### Mobile & Touch
- [ ] Touch targets are ≥ 44x44 pixels
- [ ] Content is responsive
- [ ] Text is resizable to 200%
- [ ] No horizontal scrolling at 320px width

## 🔧 Implementation Guide

### 1. Add ARIA Labels to Icon Buttons

**File:** `src/components/Header.tsx`

```tsx
<Button
  variant="ghost"
  size="icon"
  onClick={handleSomething}
  aria-label="Open navigation menu"
>
  <Menu className="h-5 w-5" />
</Button>
```

### 2. Add Skip to Main Content Link

**File:** `src/pages/Index.tsx`

```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 z-50 bg-primary text-primary-foreground p-4"
>
  Skip to main content
</a>

<main id="main-content">
  {/* Main content */}
</main>
```

### 3. Improve Focus Indicators

**File:** `src/index.css`

```css
/* Enhanced focus styles */
*:focus-visible {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 2px;
}

button:focus-visible,
a:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 2px;
  box-shadow: 0 0 0 4px hsla(var(--primary) / 0.2);
}
```

### 4. Add Screen Reader Only Class

**File:** `src/index.css`

```css
/* Screen reader only text */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.sr-only-focusable:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

### 5. Add Alt Text to Images

**File:** `src/components/AnimatedLogo.tsx`

```tsx
<img
  src={logoSrc}
  alt="BullBearDays logo - Trading chart analysis"
  className="..."
/>
```

### 6. Announce Dynamic Content

**File:** `src/components/AnalysisResults.tsx`

```tsx
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className="..."
>
  <p className="sr-only">
    Analysis complete: {signal} signal with {probability}% confidence
  </p>
  {/* Visual content */}
</div>
```

### 7. Accessible Form Validation

**File:** `src/components/ChatInput.tsx`

```tsx
<div>
  <label htmlFor="chart-context" className="block text-sm font-medium mb-2">
    Chart Context
  </label>
  <textarea
    id="chart-context"
    aria-describedby="context-hint"
    aria-invalid={hasError}
    aria-errormessage={hasError ? "context-error" : undefined}
  />
  <p id="context-hint" className="text-xs text-muted-foreground mt-1">
    Describe what you want to analyze
  </p>
  {hasError && (
    <p id="context-error" role="alert" className="text-destructive text-sm mt-1">
      Please provide context for analysis
    </p>
  )}
</div>
```

### 8. Accessible Modals

**File:** `src/components/AnalysisDetailModal.tsx`

Ensure modal traps focus and restores it on close:

```tsx
<Dialog
  open={isOpen}
  onOpenChange={onClose}
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <DialogContent>
    <DialogHeader>
      <DialogTitle id="modal-title">Analysis Details</DialogTitle>
      <DialogDescription id="modal-description">
        Detailed analysis results for {asset}
      </DialogDescription>
    </DialogHeader>
    {/* Modal content */}
  </DialogContent>
</Dialog>
```

### 9. Keyboard Shortcuts Accessible

**File:** `src/components/ShortcutsHelp.tsx`

```tsx
<kbd
  className="..."
  aria-label="Control plus U"
>
  Ctrl + U
</kbd>
```

### 10. Accessible Charts

**File:** `src/components/PerformanceDashboard.tsx`

```tsx
<figure>
  <figcaption className="sr-only">
    Performance chart showing win rate of {winRate}% over {totalTrades} trades
  </figcaption>
  <ResponsiveContainer>
    <LineChart data={data} aria-hidden="true">
      {/* Chart elements */}
    </LineChart>
  </ResponsiveContainer>
  <div className="sr-only">
    {/* Text description of chart data */}
    <p>Total trades: {totalTrades}</p>
    <p>Win rate: {winRate}%</p>
  </div>
</figure>
```

## 🧪 Testing Tools

### Browser Extensions
- **axe DevTools** - Chrome/Firefox extension for accessibility testing
- **WAVE** - Web accessibility evaluation tool
- **Lighthouse** - Chrome DevTools built-in audit

### Screen Readers
- **NVDA** (Windows) - Free screen reader
- **JAWS** (Windows) - Popular commercial screen reader
- **VoiceOver** (macOS/iOS) - Built-in Apple screen reader
- **TalkBack** (Android) - Built-in Android screen reader

### Manual Testing
```bash
# Test keyboard navigation
# 1. Tab through all interactive elements
# 2. Use Enter/Space to activate buttons
# 3. Use Arrow keys in custom widgets
# 4. Test Esc to close modals

# Test screen reader
# Windows: NVDA (Ctrl + Alt + N to start)
# macOS: VoiceOver (Cmd + F5 to start)
```

## 📊 Audit Commands

```bash
# Run Lighthouse accessibility audit
npm run build
npm run preview
# Open DevTools > Lighthouse > Accessibility

# Install axe-core for automated tests
npm install -D @axe-core/react
```

**Add to main.tsx (development only):**
```typescript
if (process.env.NODE_ENV !== 'production') {
  import('@axe-core/react').then((axe) => {
    axe.default(React, ReactDOM, 1000);
  });
}
```

## 🎯 Target Scores

- **Lighthouse Accessibility:** ≥ 95
- **WAVE Errors:** 0
- **axe Violations:** 0
- **Keyboard Navigation:** 100% functional

## 📋 Priority Fixes

### High Priority
1. Add ARIA labels to all icon-only buttons
2. Ensure proper heading hierarchy
3. Add skip to main content link
4. Fix color contrast issues
5. Add alt text to all images

### Medium Priority
6. Improve focus indicators
7. Add aria-live regions for dynamic content
8. Ensure form validation is accessible
9. Add keyboard shortcuts documentation
10. Test with screen readers

### Low Priority
11. Add text descriptions for charts
12. Improve touch target sizes
13. Add lang attribute to html tag
14. Add descriptive page titles for SPA routes
15. Document accessibility features

## 📝 Documentation

Create user documentation:
- Keyboard shortcuts guide
- Screen reader instructions
- Accessibility features list
- Contact for accessibility issues

---

*Target completion: Before production launch*
*WCAG Level: AA*
*Last updated: January 26, 2026*



# Dashboard Analytics Visual Polish

## Summary
Fix the pie chart white ring, add hover animations to all chart elements and stat cards, and clean up the overall chart styling.

## Changes (all in `src/components/ABMPortal.tsx`)

### 1. Fix Pie Chart White Ring
The `<Pie>` component defaults to `stroke="#fff"`. Fix by adding `stroke="none"` (or `stroke={C.card}` for subtle separation) to the `<Pie>` element on line 465.

### 2. Add Hover Animations to Stat Cards
Update the `Stat` component (line 149) to include `transition: "transform 0.2s ease, box-shadow 0.2s ease"` and add `onMouseEnter`/`onMouseLeave` handlers that apply `transform: "translateY(-4px)"` and a subtle glow box-shadow on hover.

### 3. Add Hover Animations to Chart Cards
Wrap each chart container div (Coverage Trend, Sentiment, Client Health, Pitch Performance) with the same hover-lift effect: `transition: "transform 0.2s ease, border-color 0.2s ease"`, lifting `-3px` on hover with accent-tinted border.

### 4. Bar Chart Hover Effect
Add `onMouseEnter` cursor styling and use Recharts' `activeBar` prop on `<Bar>` components to show a brighter fill on hover. Add `cursor="pointer"` to bar elements.

### 5. Pie Chart Hover Effect
Add `activeShape` rendering to the `<Pie>` component that scales the hovered sector slightly outward (larger `outerRadius`) with a subtle glow effect.

### 6. Clean Up Tooltip Styling
Ensure all `<Tooltip>` components have consistent dark-themed styling with `background: C.surface`, rounded corners, no white borders, and proper text colors.

## Files Changed
| File | Change |
|------|--------|
| `src/components/ABMPortal.tsx` | Update Stat component, chart containers, Pie/Bar props for hover effects and white ring fix |


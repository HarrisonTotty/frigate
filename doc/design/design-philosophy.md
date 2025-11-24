# Design Philosophy

Frigate follows a strict design system philosophy to ensure consistency and maintainability across the UI. The visual design is inspired by hard sci-fi aesthetics and terminal user interfaces, creating an intimidating yet functional spaceship bridge experience.

## 1. Hard Sci-Fi Realism

- **Flat, minimalistic design** - Focus on realism and functionality over decoration
- **No flashy or fantastical elements** - Think *The Expanse*, not *Star Wars*
- **Grounded in reality** - Leverage actual spaceflight and nautical terminology
- **Intimidating complexity** - Dense data visualizations and technical jargon convey depth
- **Professional interface** - Should feel like operating real equipment

## 2. Strictly Flat, Text-Based Design

- **Zero icons or emojis** - All UI elements are text-only
- **Flat rectangles** - No gradients, shadows, or rounded corners (border-radius: 0)
- **TUI/i3-inspired** - Visual style inspired by terminal UIs and minimalist window managers
- **ASCII art borders** - Use simple box-drawing characters for visual separation
- **Muted color palette** - Grays, blues, minimal use of bright colors except for alerts
- **Clear typography** - Monospace fonts for all text (data, labels, buttons)
- **Zero decorative elements** - Every pixel serves a functional purpose
- **Minimal animations** - Only when absolutely necessary for feedback
- **No box shadows** - All elements have boxShadow: 'none'

## 3. Technical Jargon and Complexity

- **Acronyms and abbreviations** - Use realistic technical terminology (e.g., "PWR", "STS", "TGT")
- **Dense information** - Pack displays with relevant data
- **Keyboard-driven** - Every action accessible via keyboard shortcuts
- **Text-only buttons** - Buttons are bracketed text labels like `[CONNECT]` or `[FIRE]`
- **Consistent interaction patterns** - Similar actions work the same way across positions

## 4. Usability and Accessibility

- **Clear visual hierarchy** - Typography (size, weight) and spacing define importance
- **High contrast** - Black backgrounds with bright text for readability
- **Accessibility** - Screen reader support, colorblind-friendly color choices
- **Responsive layouts** - Adapts to different screen sizes and resolutions

## 5. Cross-Platform Compatibility

- **Native performance** - Leverages hardware acceleration where available
- **Progressive enhancement** - Works on web, better on native
- **Consistent experience** - Same functionality across all platforms
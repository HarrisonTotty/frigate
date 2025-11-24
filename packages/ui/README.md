# @frigate/ui

Component library and design system for the Frigate spaceship bridge interface.

## Installation

```bash
pnpm add @frigate/ui
```

## Usage

### Importing the Shell

```tsx
import { FrigateShell } from '@frigate/ui';

function App() {
  return (
    <FrigateShell>
      <YourBridgeInterface />
    </FrigateShell>
  );
}
```

### Using Layout Primitives

```tsx
import { Grid, Panel, Stack, Modal } from '@frigate/ui';

function BridgeView() {
  return (
    <Grid cols="1fr 2fr 1fr" gap={4}>
      <Panel title="Helm" variant="default">
        <Stack direction="column" gap={3}>
          <span>Speed: 0.5c</span>
          <span>Course: 045°</span>
        </Stack>
      </Panel>
      
      <Panel title="Tactical Map" variant="raised" fullHeight>
        {/* Radar/map content */}
      </Panel>
      
      <Panel title="Engineering" variant="default">
        {/* Power allocation */}
      </Panel>
    </Grid>
  );
}
```

### Using Theme Tokens

```tsx
import { colors, spacing, typography } from '@frigate/ui';

const StyledButton = styled.button`
  background-color: ${colors.primary.default};
  padding: ${spacing[3]} ${spacing[4]};
  font-family: ${typography.fontFamily.mono};
  font-size: ${typography.fontSize.body};
`;
```

Or use CSS custom properties directly:

```tsx
<button
  style={{
    backgroundColor: 'var(--frigate-primary)',
    padding: 'var(--frigate-space-3) var(--frigate-space-4)',
    fontFamily: 'var(--frigate-font-mono)',
  }}
>
  Launch
</button>
```

## Components

### Layout Components

#### `<Grid>`
Flexible grid layout for bridge station arrangements.

**Props:**
- `cols?: string` - CSS grid-template-columns value (default: '1fr')
- `gap?: number` - Gap between items using spacing scale (default: 4)
- `fullHeight?: boolean` - Stretch to container height
- `className?: string` - Additional CSS classes

**Example:**
```tsx
<Grid cols="repeat(3, 1fr)" gap={4}>
  <Panel>Station 1</Panel>
  <Panel>Station 2</Panel>
  <Panel>Station 3</Panel>
</Grid>
```

#### `<Panel>`
Surface container with optional title and variants.

**Props:**
- `title?: string` - Panel header title
- `variant?: 'default' | 'raised' | 'muted'` - Visual style
- `scrollable?: boolean` - Enable content scrolling
- `fullHeight?: boolean` - Stretch to container height
- `className?: string` - Additional CSS classes

**Example:**
```tsx
<Panel title="Helm Controls" variant="raised" scrollable>
  {/* Content */}
</Panel>
```

#### `<Stack>`
Flexbox-based vertical or horizontal layout.

**Props:**
- `direction?: 'row' | 'column'` - Stack direction (default: 'column')
- `gap?: number` - Gap using spacing scale (default: 4)
- `align?: 'start' | 'center' | 'end' | 'stretch'` - Cross-axis alignment
- `justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around'` - Main-axis justification
- `className?: string` - Additional CSS classes

**Example:**
```tsx
<Stack direction="row" justify="space-between">
  <span>Speed</span>
  <span>0.5c</span>
</Stack>
```

#### `<Modal>`
Centered dialog with overlay.

**Props:**
- `visible: boolean` - Controls visibility
- `title?: string` - Modal header title
- `size?: 'sm' | 'md' | 'lg'` - Modal width (400px/600px/800px)
- `onClose?: () => void` - Close handler (called on X or overlay click)
- `className?: string` - Additional CSS classes

**Example:**
```tsx
const [open, setOpen] = React.useState(false);

<Modal visible={open} title="Confirm Action" onClose={() => setOpen(false)}>
  <p>Are you sure you want to engage weapons?</p>
</Modal>
```

#### `<Overlay>`
Semi-transparent backdrop (usually used internally by Modal).

**Props:**
- `visible: boolean` - Controls visibility
- `onClick?: () => void` - Click handler for dismissal
- `className?: string` - Additional CSS classes

### Core Components

#### `<Button>`
Multi-variant button component with loading states.

**Props:**
- `variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost'` - Visual style
- `size?: 'sm' | 'md' | 'lg'` - Button size
- `fullWidth?: boolean` - Stretch to container width
- `loading?: boolean` - Show loading spinner
- `icon?: React.ReactNode` - Icon element
- `disabled?: boolean` - Disable interaction

**Example:**
```tsx
<Button variant="primary" size="md" icon="→">
  Launch
</Button>
```

#### `<Badge>`
Small status indicator with color variants.

**Props:**
- `variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'`
- `className?: string`

**Example:**
```tsx
<Badge variant="success">READY</Badge>
<Badge variant="danger">ALERT</Badge>
```

#### `<ProgressBar>`
Visual indicator for progress or resource levels.

**Props:**
- `value: number` - Current value (0-100)
- `max?: number` - Maximum value (default: 100)
- `variant?: 'primary' | 'success' | 'warning' | 'danger'`
- `showLabel?: boolean` - Display percentage label
- `height?: number` - Bar height in pixels

**Example:**
```tsx
<ProgressBar value={75} variant="success" showLabel />
```

#### `<Gauge>`
Numerical display with label and unit.

**Props:**
- `label: string` - Display label
- `value: number | string` - Current value
- `unit?: string` - Unit of measurement
- `variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'`

**Example:**
```tsx
<Gauge label="Speed" value="0.5" unit="c" variant="primary" />
```

### Navigation Components

#### `<Tabs>` & `<TabPanel>`
Tabbed navigation for content sections.

**Tabs Props:**
- `tabs: Tab[]` - Array of tab definitions
- `activeTab: string` - Currently active tab ID
- `onTabChange: (tabId: string) => void` - Tab change handler

**TabPanel Props:**
- `value: string` - Tab ID this panel belongs to
- `activeTab: string` - Currently active tab ID

**Example:**
```tsx
const [active, setActive] = useState('helm');
const tabs = [
  { id: 'helm', label: 'Helm' },
  { id: 'weapons', label: 'Weapons' },
];

<Tabs tabs={tabs} activeTab={active} onTabChange={setActive} />
<TabPanel value="helm" activeTab={active}>
  <p>Helm controls</p>
</TabPanel>
<TabPanel value="weapons" activeTab={active}>
  <p>Weapon systems</p>
</TabPanel>
```

#### `<Accordion>`
Expandable/collapsible content sections.

**Props:**
- `items: AccordionItem[]` - Array of accordion items
- `multiple?: boolean` - Allow multiple panels open
- `defaultExpanded?: string[]` - Initially expanded item IDs

**Example:**
```tsx
<Accordion
  items={[
    { id: '1', title: 'Systems', content: <p>All nominal</p> },
    { id: '2', title: 'Alerts', content: <p>None</p> },
  ]}
  multiple
/>
```

### Data Components

#### `<DataGrid>`
Sortable, selectable data table with monospace alignment.

**Props:**
- `columns: DataGridColumn<T>[]` - Column definitions
- `data: T[]` - Row data array
- `getRowKey: (row: T) => string | number` - Row key accessor
- `selectable?: boolean` - Enable row selection
- `selectedRows?: Set<string | number>` - Selected row keys
- `onRowSelect?: (keys: Set) => void` - Selection handler
- `onRowClick?: (row: T) => void` - Row click handler
- `compact?: boolean` - Reduced padding

**Example:**
```tsx
const columns = [
  { id: 'name', label: 'Name', sortable: true, accessor: (row) => row.name },
  { id: 'status', label: 'Status', render: (row) => <Badge>{row.status}</Badge> },
];

<DataGrid
  columns={columns}
  data={crewMembers}
  getRowKey={(row) => row.id}
  selectable
/>
```

### Chart Components

#### `<RadarChart>`
Circular radar display using Canvas rendering.

**Props:**
- `contacts: RadarContact[]` - Array of contacts to display
- `range: number` - Radar range in kilometers
- `showRings?: boolean` - Display range rings
- `ringCount?: number` - Number of range rings
- `onContactClick?: (contact) => void` - Contact click handler
- `size?: number` - Radar size in pixels

**Example:**
```tsx
const contacts = [
  { id: '1', x: 0.3, y: 0.5, type: 'friendly', label: 'F-1' },
  { id: '2', x: -0.4, y: 0.2, type: 'hostile', label: 'H-1' },
];

<RadarChart contacts={contacts} range={1000} size={300} />
```

#### `<BarChart>`
Simple bar chart for resource allocation.

**Props:**
- `data: BarChartData[]` - Bar data with labels, values, colors
- `max?: number` - Maximum value for scaling
- `showValues?: boolean` - Display value labels
- `height?: number` - Chart height in pixels

**Example:**
```tsx
const data = [
  { label: 'Shields', value: 30, color: 'var(--frigate-primary)' },
  { label: 'Weapons', value: 25, color: 'var(--frigate-danger)' },
];

<BarChart data={data} showValues height={200} />
```

#### `<LineChart>`
Time-series line chart using Canvas.

**Props:**
- `data: number[]` - Array of data points
- `color?: string` - Line color
- `height?: number` - Chart height
- `width?: number` - Chart width
- `showPoints?: boolean` - Display data points
- `filled?: boolean` - Fill area under line

**Example:**
```tsx
const speedHistory = [0, 5, 12, 18, 25, 32, 38, 45, 50];

<LineChart data={speedHistory} color="var(--frigate-primary)" filled height={100} width={300} />
```

## Theme

### Color Palette

```typescript
import { colors } from '@frigate/ui';

colors.background.base      // #1a1a1a
colors.background.surface   // #2a2a2a
colors.primary.default      // #3a7ca5
colors.success.default      // #4a9d5f
colors.warning.default      // #d4a855
colors.danger.default       // #c85450
colors.text.primary         // #e0e0e0
```

### Spacing Scale

```typescript
import { spacing } from '@frigate/ui';

spacing[0]  // 0
spacing[1]  // 0.25rem (4px)
spacing[2]  // 0.5rem (8px)
spacing[4]  // 1rem (16px)
spacing[8]  // 2rem (32px)
```

### Typography

```typescript
import { typography } from '@frigate/ui';

typography.fontFamily.mono  // 'Roboto Mono', 'Courier New', monospace
typography.fontSize.display // 1.5rem (24px)
typography.fontSize.body    // 0.875rem (14px)
```

## Storybook

View all components and their variants in Storybook:

```bash
pnpm --filter @frigate/ui storybook
```

Navigate to http://localhost:6006 to explore the component library.

## Development

### Build
```bash
pnpm --filter @frigate/ui build
```

### Type Check
```bash
pnpm --filter @frigate/ui typecheck
```

### Run Tests
```bash
pnpm --filter @frigate/ui test
```

## Multi-Monitor Support

The UI package includes utilities for multi-monitor bridge layouts:

```tsx
<div className="frigate-monitor-span-2">
  {/* Content spanning 2 monitors */}
</div>
```

Use Grid with custom column configurations for flexible multi-panel arrangements:

```tsx
<Grid cols="300px 1fr 1fr 300px" gap={4}>
  {/* Sidebar, Main View, Secondary View, Sidebar */}
</Grid>
```

## Design Philosophy

- **Token-based**: All styles reference CSS custom properties for consistency
- **Composable**: Layout primitives combine to build complex UIs
- **Type-safe**: Full TypeScript support with strict mode
- **Accessible**: Focus states, ARIA labels, keyboard navigation
- **Monospace-friendly**: Design optimized for telemetry and data displays

---

## Interaction Patterns

### Keyboard Shortcuts

Global keyboard shortcut system with context-aware activation.

```tsx
import { KeyboardShortcutProvider, useKeyboardShortcut } from '@frigate/ui';

function App() {
  return (
    <KeyboardShortcutProvider>
      <YourApp />
    </KeyboardShortcutProvider>
  );
}

function HelmConsole() {
  // Register shortcuts
  useKeyboardShortcut({
    id: 'full-stop',
    key: 's',
    modifiers: ['meta'],
    description: 'Emergency stop',
    context: 'helm', // Only active in helm context
    handler: () => console.log('Full stop!'),
  });

  return <div>Helm controls...</div>;
}
```

**Props:**
- `id: string` - Unique identifier
- `key: string` - Primary key (e.g., 's', 'Enter', 'Escape')
- `modifiers?: ('ctrl' | 'shift' | 'alt' | 'meta')[]` - Modifier keys
- `description: string` - Human-readable description
- `context?: string` - Context where shortcut is active (undefined = global)
- `handler: (event: KeyboardEvent) => void` - Handler function
- `preventDefault?: boolean` - Prevent default browser behavior (default: true)

### Command Palette

Fuzzy-searchable command palette with keyboard navigation (Cmd+K/Ctrl+K).

```tsx
import { KeyboardShortcutProvider, useCommandPalette } from '@frigate/ui';

function BridgeInterface() {
  const commands = [
    {
      id: 'warp',
      label: 'Engage Warp Drive',
      category: 'Helm',
      icon: '🚀',
      keywords: ['warp', 'ftl'],
      handler: () => engageWarp(),
    },
    {
      id: 'shields',
      label: 'Raise Shields',
      category: 'Tactical',
      icon: '🛡',
      handler: () => raiseShields(),
    },
  ];

  const { palette } = useCommandPalette(commands);

  return (
    <KeyboardShortcutProvider>
      <div>Bridge interface... {palette}</div>
    </KeyboardShortcutProvider>
  );
}
```

**Command Props:**
- `id: string` - Unique identifier
- `label: string` - Display label
- `description?: string` - Optional description
- `category?: string` - Category for grouping
- `keywords?: string[]` - Keywords for search matching
- `icon?: string` - Icon (emoji or text)
- `handler: () => void` - Handler to execute
- `enabled?: boolean` - Whether command is available (default: true)

### Alert System

Toast notifications with severity tiers and acknowledgment workflow.

```tsx
import { AlertProvider, AlertManager, useAlert } from '@frigate/ui';

function App() {
  return (
    <AlertProvider>
      <YourApp />
      <AlertManager /> {/* Renders toast notifications */}
    </AlertProvider>
  );
}

function EngineeringConsole() {
  const alert = useAlert();

  const handlePowerFailure = () => {
    alert.critical(
      'POWER FAILURE',
      'Main power offline. Switching to auxiliary.',
    );
  };

  const handleRepairComplete = () => {
    alert.success('Repairs Complete', 'All systems nominal');
  };

  return <div>Engineering controls...</div>;
}
```

**Alert Methods:**
- `alert.info(title, message?, options?)` - Informational (5s auto-dismiss)
- `alert.success(title, message?, options?)` - Success (3s auto-dismiss)
- `alert.warning(title, message?, options?)` - Warning (5s auto-dismiss)
- `alert.danger(title, message?, options?)` - Danger (requires acknowledgment)
- `alert.critical(title, message?, options?)` - Critical (requires ack + sound)

**Alert Options:**
- `requiresAck?: boolean` - Requires acknowledgment to dismiss
- `timeout?: number` - Auto-dismiss timeout in ms (0 = no auto-dismiss)
- `playSound?: boolean` - Play alert sound (if enabled globally)

**Alert Banner (non-toast):**
```tsx
import { AlertBanner } from '@frigate/ui';

<AlertBanner
  severity="warning"
  title="Low Power"
  message="Power reserves below 20%"
  onClose={() => dismissAlert()}
/>
```

---

## License

See workspace root LICENSE file.


import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Settings } from '../mainmenu/Settings';
import { AlertProvider } from '../alerts';

const meta: Meta<typeof Settings> = {
  title: 'MainMenu/Settings',
  component: Settings,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <AlertProvider>
        <div style={{ width: '600px', height: '500px' }}>
          <Story />
        </div>
      </AlertProvider>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Settings>;

/**
 * Settings modal closed
 */
export const Closed: Story = {
  args: {
    visible: false,
  },
};

/**
 * Settings modal open with default values
 */
export const DefaultSettings: Story = {
  args: {
    visible: true,
  },
};

/**
 * Settings modal with custom values
 */
export const CustomSettings: Story = {
  render: () => {
    const [visible, setVisible] = useState(true);
    
    return (
      <Settings
        visible={visible}
        onClose={() => setVisible(false)}
        settings={{
          theme: 'dark-blue',
          audioVolume: 75,
          soundEffects: false,
          backgroundMusic: true,
          fpsLimit: 120,
          graphicsQuality: 'high',
          vsync: true,
        }}
      />
    );
  },
};

/**
 * Interactive demo
 */
export const InteractiveDemo: Story = {
  render: () => {
    const [visible, setVisible] = useState(true);
    
    return (
      <>
        <button onClick={() => setVisible(true)}>Open Settings</button>
        <Settings
          visible={visible}
          onClose={() => {
            console.log('Settings closed');
            setVisible(false);
          }}
          onSave={(settings) => {
            console.log('Settings saved:', settings);
            setVisible(false);
          }}
        />
      </>
    );
  },
};

import type { Meta, StoryObj } from '@storybook/react';
import { MainMenu } from '../mainmenu/MainMenu';
import { AlertProvider } from '../alerts';

const meta: Meta<typeof MainMenu> = {
  title: 'MainMenu/MainMenu',
  component: MainMenu,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <AlertProvider>
        <Story />
      </AlertProvider>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MainMenu>;

/**
 * Default main menu state - disconnected
 */
export const Disconnected: Story = {
  args: {
    connectionStatus: 'disconnected',
    version: '0.1.0',
    recentServers: [],
  },
};

/**
 * Main menu showing recent servers
 */
export const WithRecentServers: Story = {
  args: {
    connectionStatus: 'disconnected',
    version: '0.1.0',
    recentServers: [
      'http://localhost:8000',
      'http://192.168.1.100:8000',
      'https://hyperion-server.example.com',
    ],
  },
};

/**
 * Connecting state with loading indicator
 */
export const Connecting: Story = {
  args: {
    connectionStatus: 'connecting',
    version: '0.1.0',
    recentServers: ['http://localhost:8000'],
  },
};

/**
 * Successfully connected to server
 */
export const Connected: Story = {
  args: {
    connectionStatus: 'connected',
    version: '0.1.0',
    recentServers: ['http://localhost:8000'],
  },
};

/**
 * Connection error state
 */
export const ConnectionError: Story = {
  args: {
    connectionStatus: 'error',
    errorMessage: 'Connection timeout - server did not respond',
    version: '0.1.0',
    recentServers: ['http://localhost:8000'],
  },
};

/**
 * Interactive demo with all callbacks
 */
export const InteractiveDemo: Story = {
  args: {
    connectionStatus: 'disconnected',
    version: '0.1.0',
    recentServers: [
      'http://localhost:8000',
      'http://192.168.1.100:8000',
    ],
    onConnect: (url) => console.log('Connect to:', url),
    onSettings: () => console.log('Open settings'),
    onQuit: () => console.log('Quit application'),
    onSelectRecentServer: (url) => console.log('Selected recent server:', url),
  },
};

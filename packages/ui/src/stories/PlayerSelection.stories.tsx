import type { Meta, StoryObj } from '@storybook/react';
import { PlayerSelectionView } from '../lobby/PlayerSelectionView';
import { AlertProvider } from '../alerts';

const meta: Meta<typeof PlayerSelectionView> = {
  title: 'Lobby/PlayerSelectionView',
  component: PlayerSelectionView,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <AlertProvider>
        <div style={{ height: '100vh', backgroundColor: '#0d0d0d' }}>
          <Story />
        </div>
      </AlertProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PlayerSelectionView>;

export const Default: Story = {
  args: {
    apiUrl: 'http://localhost:8000',
  },
};

export const WithDisconnect: Story = {
  args: {
    apiUrl: 'http://localhost:8000',
    onDisconnect: () => {
      console.log('Disconnect clicked');
    },
  },
};

/**
 * Settings Component
 * 
 * Modal dialog for application preferences including theme, audio,
 * and graphics settings.
 */

import React, { useState } from 'react';
import { Modal } from '../layout';
import { Stack } from '../layout';
import { Button } from '../components';

export interface SettingsProps {
  /** Whether the settings modal is open */
  visible: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Current settings */
  settings?: UserSettings;
  /** Callback when settings are saved */
  onSave?: (settings: UserSettings) => void;
  /** Additional CSS class */
  className?: string;
}

export interface UserSettings {
  /** Theme variant */
  theme: 'dark' | 'dark-blue' | 'high-contrast';
  /** Audio volume (0-100) */
  audioVolume: number;
  /** Sound effects enabled */
  soundEffects: boolean;
  /** Background music enabled */
  backgroundMusic: boolean;
  /** Target FPS limit */
  fpsLimit: 30 | 60 | 120 | 'unlimited';
  /** Graphics detail level */
  graphicsQuality: 'low' | 'medium' | 'high';
  /** Enable VSync */
  vsync: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  audioVolume: 70,
  soundEffects: true,
  backgroundMusic: true,
  fpsLimit: 60,
  graphicsQuality: 'medium',
  vsync: true,
};

/**
 * Settings panel for user preferences
 */
export function Settings({
  visible,
  onClose,
  settings: initialSettings,
  onSave,
  className = '',
}: SettingsProps) {
  const [settings, setSettings] = useState<UserSettings>(
    initialSettings || DEFAULT_SETTINGS
  );

  const handleSave = () => {
    if (onSave) {
      onSave(settings);
    }
    onClose();
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  const updateSetting = <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="SETTINGS"
      className={className}
    >
      <Stack gap={6}>
        {/* Theme Settings */}
        <section>
          <h3 className="text-heading font-bold text-text-primary mb-3">
            THEME
          </h3>
          <Stack gap={2}>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="theme"
                value="dark"
                checked={settings.theme === 'dark'}
                onChange={() => updateSetting('theme', 'dark')}
                className="w-4 h-4"
              />
              <span className="text-body text-text-primary">Dark (Default)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="theme"
                value="dark-blue"
                checked={settings.theme === 'dark-blue'}
                onChange={() => updateSetting('theme', 'dark-blue')}
                className="w-4 h-4"
              />
              <span className="text-body text-text-primary">Dark Blue</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="theme"
                value="high-contrast"
                checked={settings.theme === 'high-contrast'}
                onChange={() => updateSetting('theme', 'high-contrast')}
                className="w-4 h-4"
              />
              <span className="text-body text-text-primary">High Contrast</span>
            </label>
          </Stack>
        </section>

        {/* Audio Settings */}
        <section>
          <h3 className="text-heading font-bold text-text-primary mb-3">
            AUDIO
          </h3>
          <Stack gap={3}>
            <div>
              <label className="block text-small text-text-muted mb-2 uppercase tracking-wide">
                Master Volume: {settings.audioVolume}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.audioVolume}
                onChange={(e) => updateSetting('audioVolume', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.soundEffects}
                onChange={(e) => updateSetting('soundEffects', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-body text-text-primary">Sound Effects</span>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.backgroundMusic}
                onChange={(e) => updateSetting('backgroundMusic', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-body text-text-primary">Background Music</span>
            </label>
          </Stack>
        </section>

        {/* Graphics Settings */}
        <section>
          <h3 className="text-heading font-bold text-text-primary mb-3">
            GRAPHICS
          </h3>
          <Stack gap={3}>
            <div>
              <label className="block text-small text-text-muted mb-2 uppercase tracking-wide">
                Quality Level
              </label>
              <select
                value={settings.graphicsQuality}
                onChange={(e) => updateSetting('graphicsQuality', e.target.value as any)}
                className="w-full px-3 py-2 bg-background-secondary border border-surface text-text-primary"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-small text-text-muted mb-2 uppercase tracking-wide">
                FPS Limit
              </label>
              <select
                value={settings.fpsLimit}
                onChange={(e) => updateSetting('fpsLimit', e.target.value as any)}
                className="w-full px-3 py-2 bg-background-secondary border border-surface text-text-primary"
              >
                <option value="30">30 FPS</option>
                <option value="60">60 FPS</option>
                <option value="120">120 FPS</option>
                <option value="unlimited">Unlimited</option>
              </select>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.vsync}
                onChange={(e) => updateSetting('vsync', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-body text-text-primary">Enable VSync</span>
            </label>
          </Stack>
        </section>

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t border-surface">
          <Button onClick={handleReset} variant="ghost">
            RESET TO DEFAULTS
          </Button>
          <div className="flex gap-2">
            <Button onClick={onClose} variant="ghost">
              CANCEL
            </Button>
            <Button onClick={handleSave} variant="primary">
              SAVE
            </Button>
          </div>
        </div>
      </Stack>
    </Modal>
  );
}

const SETTINGS_STORAGE_KEY = 'frigate_settings';

/**
 * Load settings from localStorage
 */
export function loadSettings(): UserSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!stored) return DEFAULT_SETTINGS;
    
    const parsed = JSON.parse(stored);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (e) {
    console.error('Failed to load settings:', e);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save settings to localStorage
 */
export function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

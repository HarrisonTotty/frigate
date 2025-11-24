/**
 * Command palette component
 * 
 * Provides a fuzzy-searchable command palette (Cmd+K/Ctrl+K) with keyboard navigation,
 * command categories, recent commands tracking, and extensible command registry.
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import clsx from 'clsx';
import { Modal } from './layout';
import { useKeyboardShortcut } from './keyboard';

/**
 * Command definition for the command palette
 */
export interface Command {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Optional description */
  description?: string;
  /** Category for grouping */
  category?: string;
  /** Keywords for search matching */
  keywords?: string[];
  /** Icon (emoji or text) */
  icon?: string;
  /** Handler to execute when command is triggered */
  handler: () => void;
  /** Whether the command is currently available */
  enabled?: boolean;
}

/**
 * Command palette props
 */
export interface CommandPaletteProps {
  /** Whether the palette is open */
  isOpen: boolean;
  /** Callback when palette should close */
  onClose: () => void;
  /** Available commands */
  commands: Command[];
  /** Placeholder text for search input */
  placeholder?: string;
  /** Maximum number of recent commands to track */
  maxRecent?: number;
}

/**
 * Simple fuzzy search matching
 */
function fuzzyMatch(text: string, query: string): boolean {
  if (!query) return true;
  
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  
  let queryIndex = 0;
  for (let i = 0; i < lowerText.length && queryIndex < lowerQuery.length; i++) {
    if (lowerText[i] === lowerQuery[queryIndex]) {
      queryIndex++;
    }
  }
  
  return queryIndex === lowerQuery.length;
}

/**
 * Score a command match (higher is better)
 */
function scoreCommand(command: Command, query: string): number {
  if (!query) return 0;
  
  const lowerQuery = query.toLowerCase();
  let score = 0;
  
  // Exact label match
  if (command.label.toLowerCase() === lowerQuery) {
    score += 100;
  }
  
  // Label starts with query
  if (command.label.toLowerCase().startsWith(lowerQuery)) {
    score += 50;
  }
  
  // Label contains query
  if (command.label.toLowerCase().includes(lowerQuery)) {
    score += 25;
  }
  
  // Description contains query
  if (command.description?.toLowerCase().includes(lowerQuery)) {
    score += 10;
  }
  
  // Keywords match
  if (command.keywords) {
    for (const keyword of command.keywords) {
      if (keyword.toLowerCase().includes(lowerQuery)) {
        score += 15;
      }
    }
  }
  
  return score;
}

/**
 * Command palette component
 */
export function CommandPalette({
  isOpen,
  onClose,
  commands,
  placeholder = 'Type a command or search...',
  maxRecent = 5,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentCommands, setRecentCommands] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter and sort commands based on search query
  const filteredCommands = useMemo(() => {
    const enabled = commands.filter(cmd => cmd.enabled !== false);
    
    if (!query) {
      // Show recent commands first when no query
      const recent = recentCommands
        .map(id => enabled.find(cmd => cmd.id === id))
        .filter((cmd): cmd is Command => cmd !== undefined);
      
      const remaining = enabled.filter(cmd => !recentCommands.includes(cmd.id));
      
      return [...recent, ...remaining];
    }
    
    // Filter by fuzzy match and score
    return enabled
      .map(cmd => ({
        command: cmd,
        score: scoreCommand(cmd, query),
      }))
      .filter(({ command, score }) => {
        if (score > 0) return true;
        
        // Fuzzy match as fallback
        return (
          fuzzyMatch(command.label, query) ||
          (command.description && fuzzyMatch(command.description, query)) ||
          (command.keywords && command.keywords.some(kw => fuzzyMatch(kw, query)))
        );
      })
      .sort((a, b) => b.score - a.score)
      .map(({ command }) => command);
  }, [commands, query, recentCommands]);

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, Command[]> = {};
    
    for (const command of filteredCommands) {
      const category = command.category || 'General';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(command);
    }
    
    return groups;
  }, [filteredCommands]);

  // Reset state when palette opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  // Auto-scroll selected item into view
  useEffect(() => {
    if (listRef.current && isOpen) {
      const selectedElement = listRef.current.querySelector('[data-selected="true"]');
      selectedElement?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex, isOpen]);

  // Execute command
  const executeCommand = useCallback((command: Command) => {
    command.handler();
    
    // Track in recent commands
    setRecentCommands(prev => {
      const filtered = prev.filter(id => id !== command.id);
      return [command.id, ...filtered].slice(0, maxRecent);
    });
    
    onClose();
  }, [onClose, maxRecent]);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
        break;
      
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      
      case 'Enter':
        event.preventDefault();
        if (filteredCommands[selectedIndex]) {
          executeCommand(filteredCommands[selectedIndex]);
        }
        break;
      
      case 'Escape':
        event.preventDefault();
        onClose();
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} onClose={onClose} size="md">
      <div className="flex flex-col h-full max-h-[600px]">
        {/* Search input - Terminal style */}
        <div style={{
          padding: 'var(--frigate-space-3)',
          borderBottom: '1px solid var(--frigate-border-base)',
          backgroundColor: 'var(--frigate-bg-surface)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--frigate-space-2)',
            fontFamily: 'var(--frigate-font-mono)',
            fontSize: 'var(--frigate-font-small)'
          }}>
            <span style={{
              color: 'var(--frigate-text-tertiary)',
              fontWeight: 700,
              letterSpacing: '0.05em'
            }}>
              &gt;
            </span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder.toUpperCase()}
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--frigate-text-primary)',
                fontFamily: 'var(--frigate-font-mono)',
                fontSize: 'var(--frigate-font-small)',
                letterSpacing: '0.02em'
              }}
            />
          </div>
        </div>

        {/* Command list - Dense TUI style */}
        <div ref={listRef} style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'var(--frigate-space-2)',
          backgroundColor: 'var(--frigate-bg-base)'
        }}>
          {filteredCommands.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: 'var(--frigate-space-8)',
              color: 'var(--frigate-text-tertiary)',
              fontFamily: 'var(--frigate-font-mono)',
              fontSize: 'var(--frigate-font-tiny)',
              letterSpacing: '0.05em'
            }}>
              [NO COMMANDS FOUND]
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, cmds]) => (
              <div key={category} style={{ marginBottom: 'var(--frigate-space-3)' }}>
                {/* Category header - Technical style */}
                <div style={{
                  padding: '4px 8px',
                  fontSize: 'var(--frigate-font-tiny)',
                  fontWeight: 700,
                  color: 'var(--frigate-text-tertiary)',
                  fontFamily: 'var(--frigate-font-mono)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  borderBottom: '1px solid var(--frigate-border-muted)',
                  marginBottom: 'var(--frigate-space-1)'
                }}>
                  {category}
                </div>
                
                {/* Commands in category */}
                {cmds.map((command, index) => {
                  const globalIndex = filteredCommands.indexOf(command);
                  const isSelected = globalIndex === selectedIndex;
                  
                  return (
                    <button
                      key={command.id}
                      data-selected={isSelected}
                      onClick={() => executeCommand(command)}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '6px 8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--frigate-space-2)',
                        backgroundColor: isSelected ? 'var(--frigate-primary-muted)' : 'transparent',
                        border: '1px solid',
                        borderColor: isSelected ? 'var(--frigate-primary)' : 'transparent',
                        color: isSelected ? 'var(--frigate-text-primary)' : 'var(--frigate-text-secondary)',
                        fontFamily: 'var(--frigate-font-mono)',
                        fontSize: 'var(--frigate-font-small)',
                        cursor: 'pointer',
                        transition: 'all 50ms ease',
                        marginBottom: '1px'
                      }}
                    >
                      {command.icon && (
                        <span style={{
                          flexShrink: 0,
                          fontSize: 'var(--frigate-font-body)',
                          width: '16px',
                          textAlign: 'center'
                        }}>
                          {command.icon}
                        </span>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontWeight: 600,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          letterSpacing: '0.02em'
                        }}>
                          {command.label.toUpperCase()}
                        </div>
                        {command.description && (
                          <div style={{
                            fontSize: 'var(--frigate-font-tiny)',
                            color: 'var(--frigate-text-tertiary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            marginTop: '2px',
                            letterSpacing: '0.02em'
                          }}>
                            {command.description}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hint - Terminal style */}
        <div style={{
          padding: 'var(--frigate-space-2) var(--frigate-space-3)',
          borderTop: '1px solid var(--frigate-border-base)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 'var(--frigate-font-tiny)',
          color: 'var(--frigate-text-tertiary)',
          fontFamily: 'var(--frigate-font-mono)',
          letterSpacing: '0.05em',
          backgroundColor: 'var(--frigate-bg-surface)'
        }}>
          <div>
            <kbd style={{
              padding: '2px 6px',
              backgroundColor: 'var(--frigate-bg-raised)',
              border: '1px solid var(--frigate-border-base)',
              fontWeight: 600,
              letterSpacing: '0.05em'
            }}>[↑↓]</kbd>
            {' '}NAVIGATE
          </div>
          <div>
            <kbd style={{
              padding: '2px 6px',
              backgroundColor: 'var(--frigate-bg-raised)',
              border: '1px solid var(--frigate-border-base)',
              fontWeight: 600,
              letterSpacing: '0.05em'
            }}>[ENTER]</kbd>
            {' '}SELECT
          </div>
          <div>
            <kbd style={{
              padding: '2px 6px',
              backgroundColor: 'var(--frigate-bg-raised)',
              border: '1px solid var(--frigate-border-base)',
              fontWeight: 600,
              letterSpacing: '0.05em'
            }}>[ESC]</kbd>
            {' '}CLOSE
          </div>
        </div>
      </div>
    </Modal>
  );
}

/**
 * Hook to use command palette with keyboard shortcut
 */
export function useCommandPalette(commands: Command[]) {
  const [isOpen, setIsOpen] = useState(false);

  // Register Cmd+K / Ctrl+K shortcut
  useKeyboardShortcut({
    id: 'command-palette',
    key: 'k',
    modifiers: ['meta'],
    description: 'Open command palette',
    handler: () => setIsOpen(true),
  });

  const palette = (
    <CommandPalette
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      commands={commands}
    />
  );

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(prev => !prev),
    palette,
  };
}

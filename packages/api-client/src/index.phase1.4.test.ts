import { describe, it, expect } from 'vitest';
import { HyperionApiClient } from './index';

describe('HyperionApiClient (Phase 1.4)', () => {
  const client = new HyperionApiClient({ baseUrl: 'http://localhost:8080' });

  it('should expose catalog and rest resources', () => {
    expect(client.catalog).toBeDefined();
    expect(client.rest).toBeDefined();
  });

  it('should export CatalogResource', () => {
    // Should be able to import CatalogResource directly
    expect(typeof client.catalog.getModuleSlots).toBe('function');
  });
});

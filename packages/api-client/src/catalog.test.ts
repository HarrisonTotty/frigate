import { describe, it, expect } from 'vitest';
import { fetchModuleSlots, fetchModuleVariants } from './catalog';

// Mock fetch for unit testing
const mockSlots = [{ id: 'aux-support-system', name: 'Aux Support System', has_varients: true }];
const mockVariants = [{ id: 'aux-support-system-mk1', slot_id: 'aux-support-system', name: 'Aux Support System Mk1', stats: {} }];

globalThis.fetch = async (url: RequestInfo | URL) => {
  let urlStr: string = '';
  if (typeof url === 'string') {
    urlStr = url;
  } else if (typeof url === 'object' && url !== null && url.constructor && url.constructor.name === 'URL') {
    urlStr = (url as URL).toString();
  } else if (typeof url === 'object' && url !== null && 'url' in url) {
    urlStr = (url as Request).url;
  }
  if (urlStr.includes('module-slots')) {
    return {
      ok: true,
      json: async () => ({ slots: mockSlots })
    } as Response;
  }
  if (urlStr.includes('module-variants')) {
    return {
      ok: true,
      json: async () => ({ variants: mockVariants })
    } as Response;
  }
  return { ok: false } as Response;
};

describe('catalog API client', () => {
  it('fetchModuleSlots returns slots', async () => {
    const slots = await fetchModuleSlots();
    expect(slots).toEqual(mockSlots);
  });

  it('fetchModuleVariants returns variants', async () => {
    const variants = await fetchModuleVariants();
    expect(variants).toEqual(mockVariants);
  });
});

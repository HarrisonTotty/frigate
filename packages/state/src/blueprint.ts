// Minimal blueprint state slice: types and reducer skeleton
import type { ModuleInstance } from '@frigate/api-client';

export interface BlueprintState {
  readonly id: string | null;
  readonly name: string | null;
  readonly shipClass?: string | null;
  readonly instances: readonly ModuleInstance[];
  readonly crew?: readonly any[];
}

export const initialBlueprintState: BlueprintState = {
  id: null,
  name: null,
  shipClass: null,
  instances: [],
  crew: [],
};

// Action types
export type BlueprintAction =
  | { type: 'blueprint/load'; payload: Partial<BlueprintState> }
  | { type: 'blueprint/addInstance'; payload: ModuleInstance }
  | { type: 'blueprint/removeInstance'; payload: { instanceId: string } }
  | { type: 'blueprint/setVariant'; payload: { instanceId: string; variantId: string | null } };

// Very small reducer function to be used with React.useReducer or similar
export function blueprintReducer(state: BlueprintState, action: BlueprintAction): BlueprintState {
  switch (action.type) {
    case 'blueprint/load':
      return { ...state, ...action.payload };
    case 'blueprint/addInstance':
      return { ...state, instances: [...state.instances, action.payload] };
    case 'blueprint/removeInstance':
      return { ...state, instances: state.instances.filter(i => i.id !== action.payload.instanceId) };
    case 'blueprint/setVariant':
      return {
        ...state,
        instances: state.instances.map(i => (i.id === action.payload.instanceId ? { ...i, variant_id: action.payload.variantId } : i)),
      };
    default:
      return state;
  }
}

// Default export is the reducer function to allow `import blueprintReducer from './blueprint'`
export default blueprintReducer;

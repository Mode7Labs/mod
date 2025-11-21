export interface ModuleDefinition {
  type: string;
  label: string;
  category: 'source' | 'cv' | 'processor' | 'mixer' | 'output' | 'visualization';
  color: string;
  inputs: number;
  outputs: number;
  defaultParams?: Record<string, any>;
}

export interface ModuleDefinition {
  type: string;
  label: string;
  category: 'source' | 'cv' | 'processor' | 'mixer' | 'output' | 'visualization';
  color: string;
  inputs: number;
  outputs: number;
  inputLabels?: string[];
  inputIds?: string[];
  outputLabels?: string[];
  defaultParams?: Record<string, any>;
}

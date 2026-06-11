export type PortDataType = 'String' | 'Number' | 'Boolean' | 'File' | 'Folder' | 'JSON';
export interface SkillPort {
  nombre: string;
  tipo: PortDataType;
  descripcion?: string;
  requerido?: boolean;
  default?: string | number | boolean | null;
  ejemplo?: string;
  opciones?: string[];
  sensible?: boolean;
}
export interface SkillExecution {
  tipo: 'script' | 'llm' | 'http' | 'manual';
  runtime?: 'python3' | 'node' | 'bash';
  entrypoint?: string;
  comando_ejemplo?: string;
  prompt_template?: string;
  modelo?: string;
  url?: string;
  metodo?: 'GET' | 'POST';
  timeout_segundos?: number;
}
export interface SkillDefinition {
  id: string;
  name: string;
  displayName?: string;
  version: string;
  dominio: string;
  descripcion: string;
  tipo_experto?: string;
  tags: string[];
  inputs: SkillPort[];
  outputs: SkillPort[];
  ejecucion?: SkillExecution;
  skills_dependientes?: string[];
  limitaciones?: string[];
  autor?: string;
  organizacion?: string;
  validado?: boolean;
  fecha_validacion?: string;
  schema_version: '2.0';
  package_path?: string;
  ejecucion_aprobada?: boolean;
  aprobado_por?: string;
  fecha_aprobacion?: string;
}
export interface FlowNode {
  instance_id: string;
  skill_id: string;
  skill_version?: string;
  label?: string;
  position: { x: number; y: number };
  static_inputs?: Record<string, string | number | boolean | { $secret: string }>;
  on_error?: 'fail' | 'continue' | 'retry';
  max_retries?: number;
  pinned_outputs?: Record<string, unknown> | null;
  missing_skill?: boolean;
}
export interface PortRef {
  node: string;
  port: string;
}
export interface FlowConnection {
  id: string;
  from: PortRef;
  to: PortRef;
  transform?: string | null;
}
export interface FlowExposedInput {
  expone: PortRef;
  como: string;
  descripcion?: string;
}
export interface FlowExposedOutput {
  expone: PortRef;
  como: string;
}
export interface FlowDefinition {
  id: string;
  name: string;
  descripcion?: string;
  schema_version: '2.0';
  rev: number;
  nodes: FlowNode[];
  connections: FlowConnection[];
  flow_inputs: FlowExposedInput[];
  flow_outputs: FlowExposedOutput[];
  created_at: string;
  updated_at: string;
  migrated_from_v1?: boolean;
}
export interface FlowDefinitionV1 {
  id: string;
  name: string;
  skills_en_orden: string[];
  connections?: Array<{ from: string; to: string }>;
  [key: string]: unknown;
}
export interface ExecutionEnvelope {
  status: 'success' | 'error';
  outputs: Record<string, unknown>;
  error: string | null;
  duracion_ms?: number;
  logs?: string[];
}
export interface NodeExecutionRecord {
  instance_id: string;
  skill_id: string;
  status: 'pending' | 'running' | 'success' | 'error' | 'skipped';
  started_at?: string;
  finished_at?: string;
  resolved_inputs?: Record<string, unknown>;
  envelope?: ExecutionEnvelope;
  attempt?: number;
}
export interface ExecutionRecord {
  execution_id: string;
  flow_id: string;
  appskill_id?: string;
  status: 'running' | 'success' | 'error' | 'partial';
  flow_inputs_values: Record<string, unknown>;
  steps: NodeExecutionRecord[];
  context: Record<string, ExecutionEnvelope>;
  flow_outputs_values: Record<string, unknown>;
  started_at: string;
  finished_at?: string;
  pinned?: boolean;
}
export interface StudioSettings {
  retencion_ejecuciones_dias: number;
  max_ejecuciones_por_flow: number;
  retencion_uploads_dias: number;
  timeout_flow_segundos: number;
  upload_max_mb: number;
  allow_server_paths: boolean;
}
export type Compat = 'ok' | 'coerce' | 'no';
export const TYPE_COMPATIBILITY: Record<PortDataType, Record<PortDataType, Compat>> = {
  String: { String:'ok', Number:'coerce', Boolean:'coerce', File:'no', Folder:'no', JSON:'coerce' },
  Number: { String:'ok', Number:'ok', Boolean:'no', File:'no', Folder:'no', JSON:'ok' },
  Boolean: { String:'ok', Number:'no', Boolean:'ok', File:'no', Folder:'no', JSON:'ok' },
  File: { String:'ok', Number:'no', Boolean:'no', File:'ok', Folder:'no', JSON:'no' },
  Folder: { String:'ok', Number:'no', Boolean:'no', File:'no', Folder:'ok', JSON:'no' },
  JSON: { String:'coerce', Number:'no', Boolean:'no', File:'no', Folder:'no', JSON:'ok' },
};

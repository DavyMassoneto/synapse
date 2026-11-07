export interface ModelRequest {
  system: string;
  prompt: string;
  signal?: AbortSignal;
}

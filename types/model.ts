// types/model.ts
export interface Model {
  id?: string | number;
  name: string;
  provider?: string; // Provider name (for responses)
  provider_id?: string | number; // Provider ID (for requests)
  public?: boolean;
}
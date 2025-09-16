// types/model.ts
import { Provider } from "./provider";

export interface Model {
  id?: string | number;
  name: string;
  provider?: Provider;
  public?: boolean;
}
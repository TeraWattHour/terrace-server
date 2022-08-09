import type { Request } from "express";

export type LocalRequest = {
  locals?: {
    [key: string]: any;
  } & {
    userId?: string;
  };
} & Request;

export interface ControllerClass {
  mount: (...args: any) => void;
}

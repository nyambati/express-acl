import { Response, Request, NextFunction } from "express";

interface configOptions {
  baseUrl: string;
  filename?: string;
  path?: string;
  rules?: Array<any>;
  defaultRole?: string;
  decodedObjectName?: string;
  roleSearchPath?: string;
  denyCallback?: (res?: Response) => {};
}
interface responseObj {
  status: string;
  message: string;
}
interface unlessOption {
  path: Array<any>;
}

declare namespace expressacl {
  export function config(
    options: configOptions,
    responseObj?: responseObj
  ): null;
  namespace authorize {
    export function unless(
      config: unlessOption
    ): (req: Request, res: Response, next: NextFunction) => null;
  }
  export function authorize(
    req: Request,
    res: Response,
    next: NextFunction
  ): null;
}
export = expressacl;

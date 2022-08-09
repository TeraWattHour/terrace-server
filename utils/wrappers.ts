import Context from "./context";

export function w(t: ThisType<any>, handler: (c: Context) => any) {
  return (...args: any[]) => {
    const ctx = new Context(args[0], args[1]);
    return handler.apply(t, [ctx]);
  };
}

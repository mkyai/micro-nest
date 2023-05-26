// import { of } from "rxjs";
// import { catchError, timeout } from "rxjs/operators";
// import { validateResponse } from "../helper";
// require("dotenv").config();

// export const Micro = (client?: string | number): MethodDecorator => {
//   return (target: Record<string, any>, key: any, descriptor: any) => {
//     descriptor.value = function (...args: any[]) {
//       const start = Date.now();
//       const clientIndex = client && typeof client === "number" ? client : 0;
//       const connection =
//         client && typeof client === "string"
//           ? client
//           : Object.keys(target)[clientIndex];

//       return this[`${connection}`]
//         .send(`${connection}.${key}`, args)
//         .pipe(
//           timeout(parseInt(<string>process.env.REQUEST_TIMEOUT, 10) ?? 5000)
//         )
//         .pipe(catchError((val) => of(val)))
//         .toPromise()
//         .then((res: Record<string, any>) => {
//           return validateResponse(res, start);
//         });
//     };

//     return descriptor;
//   };
// };

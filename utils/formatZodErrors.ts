import { ErrorCode } from "@/consts/errorCodes";
import { ZodError } from "zod";

const formatZodErrors = (error: ZodError<any>) => {
  return error.issues.map((x) => ({
    code: ErrorCode.VALIDATION,
    field: x.path[0],
    message: x.message,
  }));
};
export default formatZodErrors;

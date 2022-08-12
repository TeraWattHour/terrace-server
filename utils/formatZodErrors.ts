import { ErrorCode } from "common/errorCodes";
import { ZodError } from "zod";

const formatZodErrors = (error: ZodError<any>) => {
  return {
    code: ErrorCode.VALIDATION,
    data: error.issues,
  };
};
export default formatZodErrors;

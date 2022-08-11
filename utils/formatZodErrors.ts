import { ErrorCode } from "@/consts/errorCodes";
import { ZodError } from "zod";

const formatZodErrors = (error: ZodError<any>) => {
  return error.issues;
};
export default formatZodErrors;

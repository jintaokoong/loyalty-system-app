import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../../server/src";

export default createTRPCReact<AppRouter>();

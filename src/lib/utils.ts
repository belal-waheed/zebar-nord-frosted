import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import z from "zod";
import * as zebar from "zebar";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function validateOptions<T extends z.ZodTypeAny>(
  config: unknown,
  validator: T
): z.infer<T> {
  const result = validator.safeParse(config);
  if (!result.success) {
    throw new Error(result.error.message);
  }
  return result.data;
}

export function openTaskManager(glazewm?: { runCommand: (cmd: string) => Promise<any> } | null) {
  try {
    zebar.shellSpawn("Taskmgr.exe", "");
  } catch {
    try {
      zebar.shellSpawn("taskmgr.exe", "");
    } catch {
      if (glazewm) {
        glazewm.runCommand("shell-exec taskmgr.exe");
      }
    }
  }
}

export function openBtop(glazewm?: { runCommand: (cmd: string) => Promise<any> } | null) {
  openTaskManager(glazewm);
}

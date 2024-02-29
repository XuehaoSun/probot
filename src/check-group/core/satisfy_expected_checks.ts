import { CheckResult, CheckRunData, SubProjConfig } from "../types";

export const getChecksResult = (
  checks: string[],
  postedChecks: Record<string, CheckRunData>,
): CheckResult => {
  let result: CheckResult = "all_passing";
  for (const check of checks) {
    if (check in postedChecks) {
      const conclusion = postedChecks[check].conclusion;
      if (conclusion === null) {
        // the check is in progress
        result = "pending";
      } else if (conclusion !== "success") {
        // the check already failed
        return "has_failure";
      }
    } else {
      // the check is missing, hopefully queued
      result = "pending";
    }
  };
  return result;
}

export const getSubProjResult = (
  subProjs: SubProjConfig[],
  postedChecks: Record<string, CheckRunData>,
): [CheckResult, boolean] => {
  let result: CheckResult = "all_passing";
  let hasFailure: boolean = false;
  let finished: boolean = true;
  for (const subProj of subProjs) {
    for (const check of subProj.checks) {
      if (check in postedChecks) {
        const conclusion = postedChecks[check].conclusion;
        if (conclusion === null) {
          // the check is in progress
          result = "pending";
        } else if (conclusion !== "success") {
          // the check already failed
          hasFailure = true;
        }
      } else {
        // the check is missing, hopefully queued
        result = "pending";
      }
    };
  };
  if (result === "pending") {
    finished = false
  }
  if (hasFailure) {
    return ["has_failure", finished];
  }
  return [result, finished];
};

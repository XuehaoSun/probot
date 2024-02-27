import { CheckResult, CheckRunData, SubProjConfig } from "../types";
import { Context } from "probot";
import { getChecksResult } from "./satisfy_expected_checks";

import axios from 'axios';
import { getArtifactName } from "./config_getter";
import { fetchTableData } from "./parse_artifact";


const statusToMark = (
  check: string,
  postedChecks: Record<string, CheckRunData>,
): string => {
  if (check in postedChecks) {
    if (postedChecks[check].conclusion === "success") {
      return "✅";
    }
    if (postedChecks[check].conclusion === "failure") {
      return "❌";
    }
    if (postedChecks[check].conclusion === "cancelled") {
      return "🚫";
    }
    if (postedChecks[check].conclusion === null) {
      return "⌛";  // pending
    }
  }
  return "❓";
};

const statusToLink = (
  check: string,
  postedChecks: Record<string, CheckRunData>,
): string => {
  if (check in postedChecks) {
    const checkData = postedChecks[check]
    // assert(checkData.name === check)
    // if the check name contains the character "|", it will break the table rendering
    const sanitizedCheck = check.replace(/\|/g, "\\|")
    return `[${sanitizedCheck}](${checkData.details_url})`
  }
  return check
}

const parseStatus = (
  check: string,
  postedChecks: Record<string, CheckRunData>,
): string => {
  if (check in postedChecks) {
    const checkData = postedChecks[check]
    if (checkData.conclusion === null) {
      return checkData.status
    } else {
      return checkData.conclusion
    }
  }
  return "no_status"
}

async function parseDownloadUrl(detailURL: string): Promise<{ [name: string]: string }> {
  const regex = /buildId=(\d+)/;
  const match = detailURL.match(regex);
  let buildId: string =""

  if (match && match.length > 1) {
    buildId = match[1];
  } else {
    return {};
  }

  const azureArtifactApiUrl = `https://dev.azure.com/lpot-inc/neural-compressor/_apis/build/builds/${buildId}/artifacts?api-version=5.1`;

  try {
    const response = await axios.get(azureArtifactApiUrl);
    const azureArtifactsData = response.data;
    const artifactCount = azureArtifactsData.count;
    const artifactValue = azureArtifactsData.value;

    console.log(artifactValue);

    const urlDict: { [name: string]: string } = {};

    for (const item of artifactValue) {
      const artifactDownloadUrl = `${item.resource.downloadUrl.slice(0, -3)}file&subPath=%2F`;
      urlDict[item.name] = artifactDownloadUrl;
    }

    return urlDict;
  } catch (error) {
    console.error('Error fetching Azure artifact information:', error);
    return {};
  }
}

export const generateProgressDetailsCLI = (
  subprojects: SubProjConfig[],
  postedChecks: Record<string, CheckRunData>,
): string => {
  let progress = "";

  // these are the required subprojects
  subprojects.forEach((subproject) => {
    progress += `Summary for sub-project ${subproject.id}\n`;
    // for padding
    const longestLength = Math.max(...(subproject.checks.map(check => check.length)));
    subproject.checks.forEach((check) => {
      const mark = statusToMark(check, postedChecks);
      const status = parseStatus(check, postedChecks);
      progress += `${check.padEnd(longestLength, ' ')} | ${mark} | ${status.padEnd(12, ' ')}\n`;
    });
    progress += "\n\n";
  });
  progress += "\n";

  progress += "## Currently received checks\n";
  let longestLength = 1;
  for (const availableCheck in postedChecks) {
    longestLength = Math.max(longestLength, availableCheck.length);
  }
  for (const availableCheck in postedChecks) {
    const mark = statusToMark(availableCheck, postedChecks);
    const status = parseStatus(availableCheck, postedChecks);
    progress += `${availableCheck.padEnd(longestLength, ' ')} | ${mark} | ${status.padEnd(12, ' ')}\n`;
  }
  progress += "\n";
  return progress;
};

export const generateProgressDetailsMarkdown = async (
  subprojects: SubProjConfig[],
  postedChecks: Record<string, CheckRunData>,
): Promise<string> => {
  let progress = "## Groups summary\n\n";
  subprojects.forEach(async (subproject) => {
    // get the aggregated status of all statuses in the subproject
    const checkResult = getChecksResult(subproject.checks, postedChecks)
    let subprojectEmoji = "🟡";
    if (checkResult === "all_passing") {
      subprojectEmoji = "🟢";
    } else if (checkResult === "has_failure") {
      subprojectEmoji = "🔴";
    }
    // generate the markdown table
    progress += "<details>\n\n"
    progress += `<summary><b>${subprojectEmoji} ${subproject.id}</b></summary>\n\n`;
    progress += "| Check ID | Status | link |     |\n";
    progress += "| -------- | ------ | ---- | --- |\n";

    for (const check of subproject.checks) {
      const link = statusToLink(check, postedChecks);
      const status = parseStatus(check, postedChecks);
      const mark = statusToMark(check, postedChecks);
      if (status === "success" || status === "failure") {
        const artifactLinkDict = await parseDownloadUrl(postedChecks[check].details_url);
        const artifactLink = getArtifactName(check, artifactLinkDict);
        if (artifactLink === undefined) {
          progress += `| ${link} | ${status} |  | ${mark} |\n`;
        } else {
          progress += `| ${link} | ${status} | [artifact](${artifactLink}) | ${mark} |\n`;
        }
      } else {
        progress += `| ${link} | ${status} |  | ${mark} |\n`;
      }
    }

    // if (subproject.id == "Unit Tests basic workflow") {
    //   const url = 'https://artprodcus3.artifacts.visualstudio.com/Acd5c2212-3bfc-4706-9afe-b292ced6ae69/b7121868-d73a-4794-90c1-23135f974d09/_apis/artifact/cGlwZWxpbmVhcnRpZmFjdDovL2xwb3QtaW5jL3Byb2plY3RJZC9iNzEyMTg2OC1kNzNhLTQ3OTQtOTBjMS0yMzEzNWY5NzRkMDkvYnVpbGRJZC8yNjk3NC9hcnRpZmFjdE5hbWUvVVRfY292ZXJhZ2VfcmVwb3J00/content?format=file&subPath=%2Fcoverage_compare.html';
    //   try {
    //     const tableData = await fetchTableData(url);
    //     progress += `| ${tableData} |`
    //   } catch (error) {
    //     console.error('Error:', error);
    //   }
    // }
    progress += `\nThese checks are required after the changes to \`${subproject.paths.join("`, `")}\`.\n`
    progress += "\n</details>\n\n";
  });
  return progress;
};

const PR_COMMENT_START = "<!-- checkgroup-comment-start -->";

async function formPrComment(
  result: CheckResult,
  inputs: Record<string, any>,
  subprojects: SubProjConfig[],
  postedChecks: Record<string, CheckRunData>
): Promise<string> {
  let parsedConclusion = result.replace("_", " ")
  // capitalize
  parsedConclusion = parsedConclusion.charAt(0).toUpperCase() + parsedConclusion.slice(1);
  const hasFailed = result === "has_failure"
  const conclusionEmoji = (result === "all_passing") ? "🟢" : (hasFailed) ? "🔴" : "🟡"
  const lightning = (result === "all_passing") ? "⚡" : (hasFailed) ? "⛈️" : "🌩️"
  const failedMesage = (
    `> **Warning**\n> This job will need to be re-run to merge your PR.`
    + ` If you do not have write access to the repository, you can ask \`${inputs.maintainers}\` to re-run it.`
    + " If you push a new commit, all of CI will re-trigger.\n\n"
  )

  const progressDetails = await generateProgressDetailsMarkdown(subprojects, postedChecks)
  return (
    PR_COMMENT_START
    + `\n# ${lightning} Required checks status: ${parsedConclusion} ${conclusionEmoji}\n\n`
    + ((hasFailed) ? failedMesage : "")
    + ((subprojects.length) ? progressDetails : "No groups match the files changed in this PR.\n\n")
    + "---\n\n"
    + "Thank you for your contribution! 💜\n\n"
    + `> **Note**\n> This comment is automatically generated and updates for ${inputs.timeout} minutes every ${inputs.interval} seconds.`
    + ` If you have any other questions, contact \`${inputs.owner}\` for help.`
  )
}

async function getPrComment(context: Context): Promise<{ id: number; body: string }> {
  const params = context.issue()
  const commentsRes = await context.octokit.rest.issues.listComments(params);
  for (const comment of commentsRes.data) {
    if (comment.body!.includes(PR_COMMENT_START)) {
      return { id: comment.id, body: comment.body! };
    }
  }
  return { id: 0, body: "" };
}

export async function commentOnPr(
  context: Context,
  result: CheckResult,
  inputs: Record<string, any>,
  subprojects: SubProjConfig[],
  postedChecks: Record<string, CheckRunData>,
) {
  const existingData = await getPrComment(context);
  context.log.debug(`existingData: ${JSON.stringify(existingData)}`)
  const newComment = await formPrComment(result, inputs, subprojects, postedChecks);
  if (existingData.body === newComment) {
    return;
  }
  if (existingData.id === 0) {
    await context.octokit.issues.createComment(context.issue({ body: newComment }));
  } else {
    await context.octokit.issues.updateComment(
      context.repo({ body: newComment, comment_id: existingData.id })
    );
  }
}
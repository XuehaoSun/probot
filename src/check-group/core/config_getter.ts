import { CheckGroupConfig } from "../types";
import { Context } from "probot";
import { parseUserConfig } from "./user_config_parser";
import { PullRequestEvent } from '@octokit/webhooks-types';
import { artifactDict } from './constant';
import * as core from '@actions/core'
import axios from "axios";
import { AxiosResponse, AxiosError } from 'axios'

/**
 * Fetches the app configuration from the user's repository.
 *
 * @param context The base Probot context which is even independent.
 * @returns The configuration or default configuration if non exists.
 */
export const fetchConfig = async (context: Context): Promise<CheckGroupConfig> => {
  let configData: Record<string, unknown> = undefined
  const payload = context.payload as PullRequestEvent;
  const repoFullName = payload.pull_request.head.repo.full_name
  const githubRepository = payload.pull_request.base.repo.full_name
  core.debug(`fetchConfig ${repoFullName} ${githubRepository}`)
  if (repoFullName == githubRepository) {
    const prBranch = payload.pull_request.head.ref;
    core.info(`The PR is from a branch in the repository. Reading the config in '${prBranch}'`)
    configData = await readConfig(context, prBranch)
  } else {
    const baseBranch = payload.pull_request.base.ref;
    core.info(`The PR is from a fork: '${repoFullName}'. For security, reading the config in '${baseBranch}'`)
    configData = await readConfig(context, baseBranch)
  }
  core.debug(`configData: ${JSON.stringify(configData)}`)
  return parseUserConfig(configData);
};

export async function checkURL(url: string): Promise<number> {
  const statusCode: number =
    await axios.get(url)
      .then((response: AxiosResponse<{ user: { name: string } }>) => {
        return response.status;
      })
      .catch((reason: AxiosError<{ additionalInfo: string }>) => {
        return reason.response?.status;
      });
  return statusCode
}

export const getArtifactName = async (check: string, urlDict: { [name: string]: string }): Promise<string | undefined> => {
  if (artifactDict[`${check}`] !== undefined) {
    const [id, _] = [artifactDict[`${check}`].id, artifactDict[`${check}`].name];
    const checkLink = urlDict[id];
    return checkLink
  } else {
    return undefined
  }
}

const readConfig = async (context: Context, branch: string): Promise<Record<string, unknown>> => {
  const params = context.repo({ path: '.github/checkgroup.yml' })
  // https://github.com/probot/octokit-plugin-config
  const { config } = await context.octokit.config.get({ ...params, branch: branch })
  return config
}
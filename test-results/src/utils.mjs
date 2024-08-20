import fs from "node:fs";
import fetch from "node-fetch";
import qs from "querystring";

const PROMETHEUS_URL = "http://prometheus:9090/api/v1/query_range";
const RESULTS_FILE_BASE_PATH = "/results";
const PERFORMANCE_RESULTS_TEMPLATE = `${RESULTS_FILE_BASE_PATH}/performance-template.csv`;
const BREAKPOINT_RESULTS_TEMPLATE = `${RESULTS_FILE_BASE_PATH}/breakpoint-template.csv`;

/**
 *
 * @param {string} name
 * @returns {string}
 */
export function getCpuUsageQuery(name) {
  return `sum(rate(container_cpu_usage_seconds_total{instance=~".*",name=~"${name}",name=~".+"}[1m])) by (name) * 100`;
}

/**
 *
 * @param {string} name
 * @returns {string}
 */
export function getMemoryUsageQuery(name) {
  return `sum(container_memory_rss{name=~"${name}",name=~".+"}) by (name)`;
}

/**
 *
 * @param {{
 *  start: string;
 *  end: string;
 * query: string;
 * }} params
 * @returns {string}
 */
export function getUrlRequest({ end, query, start }) {
  return `${PROMETHEUS_URL}?${qs.stringify({ end, query, start, step: 5 })}`;
}

/**
 *
 * @param {string} name
 * @returns
 */
function getPerformanceResultsFilePath(name) {
  return `${RESULTS_FILE_BASE_PATH}/${name}-performance.csv`;
}

/**
 *
 * @param {string} name
 * @returns
 */
function getBreakpointResultsFilePath(name) {
  return `${RESULTS_FILE_BASE_PATH}/${name}-breakpoint.csv`;
}

/**
 *
 * @param {string} name
 * @param {string} line
 * @param {string} templateFile
 */
function saveTestData(line, resultsFileName, templateFile) {
  if (!fs.existsSync(resultsFileName)) {
    fs.copyFileSync(templateFile, resultsFileName);
  }

  fs.appendFileSync(resultsFileName, line + "\n");
}

/**
 *
 * @param {string} name
 * @param {string} line
 */
export function saveBreakpointTestData(name, line) {
  return saveTestData(
    line,
    getBreakpointResultsFilePath(name),
    BREAKPOINT_RESULTS_TEMPLATE
  );
}

/**
 *
 * @param {string} name
 * @param {string} line
 */
export function savePerformanceTestData(name, line) {
  return saveTestData(
    line,
    getPerformanceResultsFilePath(name),
    PERFORMANCE_RESULTS_TEMPLATE
  );
}

/**
 *
 * @param {string} url
 */
async function getAvgUsage(url) {
  const response = await fetch(url);
  const { status, data, ...rest } = await response.json();

  if (status !== "success") {
    console.error("failed to fetch", data, response, rest);
    throw new Error("failed to fetch " + JSON.stringify(data, response, rest));
  }

  /**
   * @type {[number, string][]}
   */
  const results = data.result[0]?.values;

  if (!results) return -1;

  const sum = results.reduce((sum, [, value]) => sum + Number(value), 0);

  return sum / results.length;
}

/**
 *
 * @param {{
 * end: string;
 * start: string;
 * name: string;
 * }} param0
 */
export async function getAvgCpuUsage({ end, start, name }) {
  return getAvgUsage(
    getUrlRequest({ end, query: getCpuUsageQuery(name), start })
  );
}

/**
 *
 * @param {{
 * end: string;
 * start: string;
 * name: string;
 * }} param0
 */
export async function getAvgRamUsage({ end, start, name }) {
  return getAvgUsage(
    getUrlRequest({ end, query: getMemoryUsageQuery(name), start })
  );
}

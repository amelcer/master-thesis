import fs from "node:fs";
import readline from "node:readline";

/**
 * @typedef {{
 *  id: string;
 *  name: string;
 *  lastName: string;
 *  birthday: string;
 *  email: string;
 * }} Person
 */

/**
 *
 * @param {number} [from]
 * @param {number} [to]
 * @returns {Promise<Person[]>}
 */
export async function getObjectsFromFile(from = 0, to = undefined) {
  const fileStream = fs.createReadStream("/data/data.csv");
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  /**
   * @type {Array<string>}
   */
  let csvHeaders;
  let lineNumber = -1;
  const result = [];

  for await (const line of rl) {
    lineNumber += 1;

    // need to read first line as it contains csv headers
    if (lineNumber === 0) {
      csvHeaders = line.split(",");

      continue;
    }

    if (lineNumber < from) {
      continue;
    }

    if (lineNumber > to) {
      break;
    }

    const splittedLine = line.split(",");
    const entries = csvHeaders.map((key, index) => [key, splittedLine[index]]);
    result.push(Object.fromEntries(entries));
  }

  return result;
}
/**
 *
 * @param {Person[]} array
 * @returns {Person[]}
 */
export function getSortPersonArray(array) {
  return array.toSorted((a, b) => a.lastName.localeCompare(b.lastName));
}

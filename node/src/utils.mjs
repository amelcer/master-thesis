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
  let lineNumber = -1;
  const result = [];

  for await (const line of rl) {
    lineNumber += 1;

    // skip csv headers or lines belo starting point
    if (lineNumber === 0 || lineNumber < from) {
      continue;
    }

    if (lineNumber > to) {
      break;
    }

    const splittedLine = line.split(",");
    const person = {
      id: splittedLine[0],
      name: splittedLine[1],
      lastName: splittedLine[2],
      birthday: splittedLine[3],
      email: splittedLine[4],
    };

    result.push(person);
  }

  return result;
}
/**
 *
 * @param {Person[]} array
 * @returns {void}
 */
export function sortPersonArray(array) {
  array.sort((a, b) => a.lastName.localeCompare(b.lastName));
}

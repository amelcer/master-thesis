import fs from "node:fs";
import { faker } from "@faker-js/faker";

const fileName = "data/data.csv";
const dataLength = 500_000;
let content = "id,name,lastName,birthday,email\n";

for (let i = 0; i < dataLength; i++) {
  content += `${faker.string.uuid()},${faker.person.firstName()},${faker.person.lastName()},${faker.date
    .past()
    .toISOString()},${faker.internet.email()}\n`;
}

fs.writeFile(fileName, content, (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log(`${dataLength} rows written to ${fileName}`);
  }
});

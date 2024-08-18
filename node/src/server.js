import express from "express";
import { getObjectsFromFile, getSortPersonArray } from "./utils.mjs";

const app = express();
app.use(express.json());

app.get("/people", async (req, res) => {
  const { from, to } = req.query;
  let parsedFrom =
    typeof to === "undefined" ? undefined : Number.parseInt(from);
  let parsedTo = typeof to === "undefined" ? undefined : Number.parseInt(to);

  if (parsedFrom && !Number.isSafeInteger(parsedFrom)) {
    parsedFrom = 0;
  }

  if (parsedTo && !Number.isSafeInteger(parsedTo)) {
    parsedTo = undefined;
  }

  if (parsedFrom > parsedTo) {
    res
      .status(400)
      .json({ message: "'from' value should be lower than 'to' value" });
    return;
  }

  try {
    const data = await getObjectsFromFile(parsedFrom, parsedTo);

    res.json({
      count: 500_000,
      data: getSortPersonArray(data),
    });
  } catch (e) {
    res.status(500).json({ error: e || "Something went wrong" });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

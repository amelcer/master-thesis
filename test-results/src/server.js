import express from "express";
import fs from "node:fs";

const app = express();
app.use(express.json());

app.post("/save", async (req, res) => {
  console.log("TRYING TO SAVE", req.body);

  try {
    // parsa data
    // fetch cpu metrics from prometheus
    // curl -G "http://localhost:9090/api/v1/query_range" \
    // --data-urlencode 'query=sum(rate(container_cpu_usage_seconds_total{instance=~".*",name=~"master-thesis-nodejs-app-1",name=~".+"}[1m])) by (name) * 100' \
    // --data-urlencode "start=2024-08-18T00:00:00Z" \
    // --data-urlencode "end=2024-08-19T01:00:00Z" \
    // --data-urlencode "step=60"
    fs.writeFileSync("/results/test.txt", JSON.stringify(req.body));
    console.log("SAVED ");
    res.status(200).json({ message: "saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err });
  }
});

const port = 4201;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

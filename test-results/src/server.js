import express from "express";
import {
  getAvgCpuUsage,
  getAvgRamUsage,
  saveBreakpointTestData,
  savePerformanceTestData,
} from "./utils.mjs";

const app = express();

app.use(express.json());

app.post("/save-performance-metrics", async (req, res) => {
  console.log("TRYING TO SAVE", req.body);

  const {
    startDate,
    endDate,
    containerName,
    avg,
    min,
    med,
    max,
    failedRequests,
    succeedRequests,
    "p(90)": p90,
    "p(95)": p95,
    failedResponseTime,
    succeedResponseTime,
    correctStructure,
    wrongStructure,
    sortedCorrectly,
    sortedIncorrectly,
  } = req.body;

  try {
    const [avgCpu, avgRam] = await Promise.all([
      getAvgCpuUsage({ end: endDate, start: startDate, name: containerName }),
      getAvgRamUsage({ end: endDate, start: startDate, name: containerName }),
    ]);

    const line = [
      startDate,
      endDate,
      containerName,
      avg,
      min,
      med,
      max,
      failedRequests,
      succeedRequests,
      p90,
      p95,
      avgCpu,
      avgRam,
      failedResponseTime,
      succeedResponseTime,
      correctStructure,
      wrongStructure,
      sortedCorrectly,
      sortedIncorrectly,
    ].join(",");
    savePerformanceTestData(containerName, line);

    console.log("SAVED ", line);
    res.status(200).json({ message: "saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err });
  }
});

app.post("/save-breakpoint-metrics", async (req, res) => {
  console.log("TRYING TO SAVE", req.body);

  const {
    startDate,
    endDate,
    containerName,
    vus,
    succeedRequests,
    failedRequests,
    properResponseLength,
    wrongResponseLength,
    avg,
    min,
    med,
    max,
    "p(90)": p90,
    "p(95)": p95,
  } = req.body;

  try {
    const [avgCpu, avgRam] = await Promise.all([
      getAvgCpuUsage({ end: endDate, start: startDate, name: containerName }),
      getAvgRamUsage({ end: endDate, start: startDate, name: containerName }),
    ]);

    const line = [
      startDate,
      endDate,
      containerName,
      vus,
      avgCpu,
      avgRam,
      succeedRequests,
      failedRequests,
      properResponseLength,
      wrongResponseLength,
      avg,
      min,
      med,
      max,
      p90,
      p95,
    ].join(",");
    saveBreakpointTestData(containerName, line);

    console.log("SAVED ", line);
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

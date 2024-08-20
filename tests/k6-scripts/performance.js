import http from "k6/http";
import exec from "k6/execution";
import { check, sleep } from "k6";

const fromToArray = [
  { from: 0, to: 2000, expectedLength: 2000 },
  { from: 150000, to: 150800, expectedLength: 801 },
  { from: 430000, to: 430005, expectedLength: 6 },
];

export const options = {
  scenarios: {
    averageLoad: {
      executor: "ramping-vus",
      stages: [
        { duration: "30s", target: 10 },
        { duration: "1m", target: 40 },
        { duration: "1m", target: 40 },
        { duration: "1m", target: 20 },
        { duration: "30s", target: 0 },
      ],
    },
  },
};

/**
 *
 * @param {Array} data
 * @returns {boolean}
 */
function isSortedCorrectly(data) {
  for (let i = 0; i < data.length - 1; i++) {
    if (data[i].lastName.localeCompare(data[i + 1].lastName) > 0) {
      return false;
    }
  }

  return true;
}

export default function () {
  const userIndex = exec.vu.iterationInInstance % fromToArray.length;
  const { from, to, expectedLength } = fromToArray[userIndex];

  const res = http.get(`http://${__ENV.API_URL}/people?from=${from}&to=${to}`);

  check(res, {
    "status is 200": (r) => r.status === 200,
    "response time < 1000ms": (r) => r.timings.duration < 1000,
    "has correct structure": (r) => {
      const { count, data } = JSON.parse(r.body);
      return count === 500000 && data.length === expectedLength;
    },
    "data is sorted correctly": (r) =>
      isSortedCorrectly(JSON.parse(r.body).data),
  });

  sleep(1);
}

export function handleSummary(summary) {
  const testEndDate = new Date();
  const testStartDate = new Date(__ENV.START_TIME);

  const {
    avg,
    min,
    med,
    max,
    "p(90)": p90,
    "p(95)": p95,
  } = summary.metrics.http_req_duration.values;

  // if http_req_failed === true, then it means that request passes the test (so it means that it failed)
  // http_req_failed................: 0.00%   ✓ 0       ✗ 14  it means that 14 requests have status 2xx and 0 requests have 4xx or 5xx
  const { fails: succeedRequests, passes: failedRequests } =
    summary.metrics.http_req_failed.values;

  const data = {
    startDate: testStartDate.toISOString(),
    endDate: testEndDate.toISOString(),
    containerName: __ENV.CONTAINER_NAME,
    avg,
    min,
    med,
    max,
    "p(90)": p90,
    "p(95)": p95,
    failedRequests,
    succeedRequests,
  };

  const resp = http.post(
    "http://test-results:4201/save-performance-metrics",
    JSON.stringify(data),
    {
      headers: {
        "Content-type": "application/json",
      },
    }
  );

  if (resp.status != 200) {
    console.error("Could not send summary, got status " + resp.status);
  }
}

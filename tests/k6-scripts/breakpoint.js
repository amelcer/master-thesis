import http from "k6/http";
import { check } from "k6";

const NUMBER_OF_RESULTS = 1000;

/**
 * this tests increases the number of users until 95% of requests are faster than 1s
 * and 99% of requests has not failed
 */
export const options = {
  executor: "ramping-arrival-rate",
  stages: [
    { duration: "15m", target: 1000 }, // just slowly ramp-up to large number of users load
  ],

  thresholds: {
    http_req_failed: [{ threshold: "rate<0.01", abortOnFail: true }], // http errors should be less than 1%, otherwise abort the test
    http_req_duration: [{ threshold: "p(95)<1000", abortOnFail: true }], // 95% of requests should be below 1s
  },
};

export default () => {
  const res = http.get(
    `http://${__ENV.API_URL}/people?to=${NUMBER_OF_RESULTS}`
  );

  check(res, {
    "status is 200": (r) => r.status === 200,
    "response has proper data length": (r) =>
      JSON.parse(r.body).data.length === NUMBER_OF_RESULTS,
  });
};

export function handleSummary(summary) {
  const testEndDate = new Date();
  const testStartDate = new Date(__ENV.START_TIME);

  const { value: vus } = summary.metrics.vus.values;

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

  const { passes: properResponseLength, fails: wrongResponseLength } =
    summary.root_group.checks[0];

  const data = {
    startDate: testStartDate.toISOString(),
    endDate: testEndDate.toISOString(),
    containerName: __ENV.CONTAINER_NAME,
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
  };

  const resp = http.post(
    "http://test-results:4201/save-breakpoint-metrics",
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

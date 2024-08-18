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

# Comparing different programming languages for web backend

## Run all applications

Run [docker-compose-windows.yml](docker-compose-windows.yml) from Windows machine. It will allow to measure containers usage of CPU and memory

```bat
    docker network create monitoring
    docker-compose up
```

Remember to uncomment application in [docker-compose.yml](docker-compose.yml) which you would like to test and run:

```sh
docker-compose build
docker-compose up
```

## Run tests

Provide a path to test to run against running application

```sh
docker-compose run k6 run /scripts/{script-name}.js --env API_URL=nodejs-app:3000
```

Make request for metrics to prometheus:

```
curl -G "http://localhost:9090/api/v1/query_range" \
--data-urlencode 'query=sum(rate(container_cpu_usage_seconds_total{instance=~".*",name=~"master-thesis-nodejs-app-1",name=~".+"}[1m])) by (name) * 100' \
--data-urlencode "start=2024-08-18T00:00:00Z" \
--data-urlencode "end=2024-08-19T01:00:00Z" \
--data-urlencode "step=60"

```

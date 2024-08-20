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
# performance test
docker-compose run k6 run /scripts/performance.js  --env START_TIME=$(date --utc +%FT%TZ) --env API_URL=nodejs-app:3000 --env CONTAINER_NAME=master-thesis-nodejs-app-1

# breakpoint test
docker-compose run k6 run /scripts/breakpoint.js --env START_TIME=$(date --utc +%FT%TZ) --env API_URL=nodejs-app:3000  --env CONTAINER_NAME=master-thesis-nodejs-app-1
```

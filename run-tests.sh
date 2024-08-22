#!/bin/bash

echo "Make sure cadvisor, prometheus, influxdb, grafana and test-results are running!"

log_with_time() {
    echo ""
    echo "$(date '+%Y-%m-%dT%H:%M:%SZ') $1"
    echo ""
}

run_tests() {
    local test_type=$1
    local app=$2

    log_with_time "Start running $test_type tests"
    for i in {0..10}; do
        log_with_time "Start of $i $test_type test for $app"

        docker-compose run k6 run /scripts/${test_type}.js --env START_TIME=$(date --utc +%FT%TZ) --env API_URL=$app:3000 --env CONTAINER_NAME=master-thesis-$app-1

        log_with_time "End of $i $test_type test for $app"
        log_with_time "Waiting for app stabilization [5min]"
        sleep 300
    done
}

apps=("nodejs-app" "python-app" "java-app" "go-app")

for app in "${apps[@]}"; do
    log_with_time "Starting $app"
    docker-compose up $app -d
    
    log_with_time "Waiting for app to stabilize [2min]"
    sleep 120

    run_tests "breakpoint" $app

    log_with_time "End of breakpoint test"
    log_with_time "Waiting for app to stabilize [5min]"
    sleep 300
    
    run_tests "performance" $app

    docker-compose stop $app
    log_with_time "$app stopped"
    echo "########################## END OF TESTS FOR $app ##########################"
    sleep 60
done

log_with_time "########################## END OF TESTS ##########################"

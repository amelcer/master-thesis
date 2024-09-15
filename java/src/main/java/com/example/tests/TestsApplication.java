package com.example.tests;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.io.*;
import java.util.*;
import java.util.stream.Collectors;

@SpringBootApplication
public class TestsApplication {

	public static void main(String[] args) {
		SpringApplication.run(TestsApplication.class, args);
	}

}


@RestController
class PeopleController {

	
    @GetMapping("/people")
    public Map<String, Object> getPeople(
            @RequestParam(value = "from", required = false) Integer from,
            @RequestParam(value = "to", required = false) Integer to) {

        if (from == null) {
            from = 0; 
        }

        if (to == null) {
            to = Integer.MAX_VALUE; 
        }

        if (from > to) {
            throw new IllegalArgumentException("'from' parameter cannot be greater than 'to' parameter");
        }

        List<Map<String, String>> people = this.getPeopleInRange(from, to);
        people.sort(Comparator.comparing(p -> p.get("lastName")));

        return Map.of("count", 500000, "data", people);
    }

    private List<Map<String, String>> getPeopleInRange(int from, int to) {
        List<Map<String, String>> people = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new FileReader("/data/data.csv"))) {
            String line;
            String[] headers = reader.readLine().split(",");
            int lineNumber = 0;

            while ((line = reader.readLine()) != null) {
                lineNumber++;
                if (lineNumber < from) {
                    continue;
                }

                if (lineNumber > to) {
                    break;
                }

                String[] values = line.split(",");
                Map<String, String> person = Map.of(headers[0], values[0], headers[1], values[1], headers[2], values[2],  headers[3], values[3],  headers[4], values[4]);
                people.add(person);
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to read the CSV file");
        }

        return people;
    }
}

package main

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"sort"
	"strconv"
)

type person struct {
	Id       string `json:"id"`
	Name     string `json:"name"`
	LastName string `json:"lastName"`
	Birthday string `json:"birthday"`
	Email    string `json:"email"`
}

func main() {
	http.HandleFunc("/people", peopleHandler)
	fmt.Println("Server is listening on port 3000...")
	http.ListenAndServe(":3000", nil)
}

func peopleHandler(w http.ResponseWriter, r *http.Request) {
	fromStr := r.URL.Query().Get("from")
	toStr := r.URL.Query().Get("to")

	from, err := strconv.Atoi(fromStr)
	if err != nil || from < 0 {
		from = 0
	}

	to, err := strconv.Atoi(toStr)
	if err != nil || to < from {
		to = int(^uint(0) >> 1) // max int
	}

	people, err := getPeopleInRange(from, to)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := struct {
		Count int      `json:"count"`
		Data  []person `json:"data"`
	}{
		Count: 500000,
		Data:  people,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func getPeopleInRange(from, to int) ([]person, error) {
	file, err := os.Open("/data/data.csv")
	if err != nil {
		return nil, err
	}
	defer file.Close()

	reader := csv.NewReader(file)
	_, err = reader.Read() 
	if err != nil {
		return nil, err
	}

	var people []person
	lineNumber := 0

	for {
		record, err := reader.Read()
		if err != nil {
			break
		}
		lineNumber++

		if lineNumber < from { 
			continue
		}

		if lineNumber > to {
			break
		}

		person := person{
			Id:       record[0],
			Name:     record[1],
			LastName: record[2],
			Birthday: record[3],
			Email:    record[4],
		}

		people = append(people, person)
	}

	sort.Slice(people, func(i, j int) bool {
		return people[i].LastName < people[j].LastName
	})

	return people, nil
}

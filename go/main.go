package main

import (
	"encoding/csv"
	"net/http"
	"os"
	"sort"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Person struct {
	ID       string
	Name     string
	LastName string
	Birthday string
	Email    string
}

func getPeople(c *gin.Context) {
	from, _ := strconv.Atoi(c.DefaultQuery("from", "0"))
	to, _ := strconv.Atoi(c.Query("to"))

	if from > to {
		c.JSON(http.StatusBadRequest, gin.H{"message": "'from' value should be lower than 'to' value"})
		return
	}

	file, err := os.Open("/data/data.csv")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer file.Close()

	reader := csv.NewReader(file)
	records, _ := reader.ReadAll()
	people := []Person{}

	for _, record := range records[from+1 : to+1] {
		person := Person{
			ID:       record[0],
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

	c.JSON(http.StatusOK, gin.H{"count": 500000, "data": people})
}

func main() {
	r := gin.Default()
	r.GET("/people", getPeople)
	r.Run(":3000")
}

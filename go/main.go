package main

import (
	"bufio"
	"fmt"
	"net/http"
	"os"
	"sort"
	"strconv"
	"math"
	"strings"
	"github.com/gin-gonic/gin"
)

type person struct {
	Id       string `json:"id"`
	Name     string `json:"name"`
	LastName string `json:"lastName"`
	Birthday string `json:"birthday"`
	Email    string `json:"email"`
}

func main() {
	gin.SetMode(gin.ReleaseMode)

	r := gin.New()
	r.GET("/people", peopleHandler)

	fmt.Println("Server is listening on port 3000...")
	r.Run(":3000")
}

func peopleHandler(c *gin.Context) {
	fromStr := c.DefaultQuery("from", "0")
	toStr := c.DefaultQuery("to", strconv.Itoa(math.MaxInt32))

	from, err := strconv.Atoi(fromStr)
	if err != nil {
		from = 0
	}

	to, err := strconv.Atoi(toStr)
	if err != nil {
		to = math.MaxInt32
	}

	if from > to {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "From is bigger than to"})
	}

	people, err := getPeopleInRange(from, to)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	sort.Slice(people, func(i,j int) bool {
		return people[i].LastName < people[j].LastName
	})

	response := struct {
		Count int      `json:"count"`
		Data  []person `json:"data"`
	}{
		Count: 500000,
		Data:  people,
	}

	c.JSON(http.StatusOK, response)
}

func getPeopleInRange(from, to int) ([]person, error) {
	readFile, err := os.Open("/data/data.csv")

    if err != nil {
        fmt.Println(err)
    }

    fileScanner := bufio.NewScanner(readFile)
    fileScanner.Split(bufio.ScanLines)

	fileScanner.Scan()
	fileScanner.Text() // read header
	
    people := make([]person, 0)
	lineNumber := 0

    for fileScanner.Scan() {
        lineNumber++

		if lineNumber < from {
			continue
		}

		if lineNumber > to {
			break
		}


		record :=  strings.Split(fileScanner.Text(), ",")
		person := person{
			Id:        record[0],
			Name:      record[1],
			LastName:  record[2],
			Birthday:  record[3],
			Email:     record[4],
		}


		people = append(people, person)
    }

    readFile.Close()
	return people, nil

}

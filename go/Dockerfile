FROM golang:1.20-alpine

WORKDIR /go/src/app

COPY main.go .

RUN go mod init

RUN go get -u github.com/gin-gonic/gin

RUN go build

CMD ["./app"]

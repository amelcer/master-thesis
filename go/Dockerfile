FROM golang:1.21-alpine

ENV GIN_MODE=release

WORKDIR /go/src/app

COPY main.go .

RUN go mod init

RUN go get -u github.com/gin-gonic/gin

RUN go build

CMD ["./app"]

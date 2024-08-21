FROM openjdk:17-slim

WORKDIR /app

COPY . /app

RUN ./mvnw package -DskipTests

CMD ["java", "-jar", "target/app.jar"]

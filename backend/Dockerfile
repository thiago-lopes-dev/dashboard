FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn package -DskipTests -q

FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S app && adduser -S app -G app
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
RUN chown app:app app.jar
USER app
ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseContainerSupport"
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar app.jar"]

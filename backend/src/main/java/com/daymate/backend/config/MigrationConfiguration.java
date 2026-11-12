package com.daymate.backend.config;

import org.flywaydb.core.Flyway;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

@Configuration
public class MigrationConfiguration {

    @Bean(initMethod = "migrate")
    Flyway flyway(Environment environment) {
        String databaseUrl = DatabaseConfiguration.firstNonBlank(
                environment.getProperty("spring.flyway.url"),
                environment.getProperty("spring.datasource.url"),
                environment.getProperty("DATABASE_URL_UNPOOLED"),
                environment.getProperty("DATABASE_URL"));

        if (databaseUrl == null) {
            throw new IllegalStateException(
                    "Migration database configuration is missing. Set DATABASE_URL or DATABASE_URL_UNPOOLED.");
        }

        DatabaseConfiguration.ConnectionDetails connection = DatabaseConfiguration.connectionDetails(
                databaseUrl,
                environment.getProperty("spring.flyway.user",
                        environment.getProperty("spring.datasource.username", "sa")),
                environment.getProperty("spring.flyway.password",
                        environment.getProperty("spring.datasource.password", "")));

        return Flyway.configure()
                .dataSource(connection.jdbcUrl(), connection.username(), connection.password())
                .locations("classpath:db/migration")
                .cleanDisabled(true)
                .load();
    }
}

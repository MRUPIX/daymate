package com.daymate.backend.config;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.context.annotation.DependsOn;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.env.Environment;

@Configuration
public class DatabaseConfiguration {

    @Bean(destroyMethod = "close")
    @Primary
    @DependsOn("flyway")
    HikariDataSource dataSource(Environment environment) {
        String databaseUrl = firstNonBlank(
                environment.getProperty("spring.datasource.url"),
                environment.getProperty("DATABASE_URL_POOLED"),
                environment.getProperty("DATABASE_URL"));

        if (databaseUrl == null) {
            throw new IllegalStateException(
                    "Database configuration is missing. Set DATABASE_URL_POOLED or DATABASE_URL.");
        }

        ConnectionDetails connection = connectionDetails(
                databaseUrl,
                environment.getProperty("spring.datasource.username", "sa"),
                environment.getProperty("spring.datasource.password", ""));
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(connection.jdbcUrl());
        config.setUsername(connection.username());
        config.setPassword(connection.password());

        config.setPoolName("daymate-database-pool");
        config.setMaximumPoolSize(5);
        config.setMinimumIdle(0);
        config.setConnectionTimeout(10_000);
        config.setValidationTimeout(5_000);
        config.setIdleTimeout(60_000);

        return new HikariDataSource(config);
    }

    static ConnectionDetails connectionDetails(String databaseUrl, String defaultUsername, String defaultPassword) {
        if (databaseUrl.startsWith("jdbc:")) {
            return new ConnectionDetails(databaseUrl, defaultUsername, defaultPassword);
        }

        URI uri;
        try {
            uri = URI.create(databaseUrl);
        } catch (IllegalArgumentException exception) {
            throw new IllegalStateException("The configured database URL is invalid.", exception);
        }

        if (!("postgres".equalsIgnoreCase(uri.getScheme())
                || "postgresql".equalsIgnoreCase(uri.getScheme()))) {
            throw new IllegalStateException("DATABASE_URL must use the postgres or postgresql scheme.");
        }

        String rawUserInfo = uri.getRawUserInfo();
        if (rawUserInfo == null || !rawUserInfo.contains(":")) {
            throw new IllegalStateException("DATABASE_URL must include a database username and password.");
        }

        int separator = rawUserInfo.indexOf(':');
        String username = decode(rawUserInfo.substring(0, separator));
        String password = decode(rawUserInfo.substring(separator + 1));

        String host = uri.getHost();
        if (host == null || host.isBlank()) {
            throw new IllegalStateException("DATABASE_URL must include a database host.");
        }
        if (host.contains(":")) {
            host = "[" + host + "]";
        }

        StringBuilder jdbcUrl = new StringBuilder("jdbc:postgresql://").append(host);
        if (uri.getPort() != -1) {
            jdbcUrl.append(':').append(uri.getPort());
        }
        jdbcUrl.append(uri.getRawPath());

        String query = uri.getRawQuery();
        if (query != null && !query.isBlank()) {
            jdbcUrl.append('?').append(query.replace("channel_binding=", "channelBinding="));
        }

        return new ConnectionDetails(jdbcUrl.toString(), username, password);
    }

    private static String decode(String value) {
        return URLDecoder.decode(value.replace("+", "%2B"), StandardCharsets.UTF_8);
    }

    static String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value.trim();
            }
        }
        return null;
    }

    record ConnectionDetails(String jdbcUrl, String username, String password) {
    }
}

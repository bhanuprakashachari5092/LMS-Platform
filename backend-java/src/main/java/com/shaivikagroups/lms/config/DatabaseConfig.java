package com.shaivikagroups.lms.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

/**
 * Intelligent Database Configuration that normalizes Render's DATABASE_URL URI format
 * (e.g. postgres://user:password@host:port/dbname) into JDBC format.
 */
@Configuration
public class DatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Value("${DATABASE_URL:}")
    private String databaseUrl;

    @Value("${spring.datasource.url:}")
    private String springDatasourceUrl;

    @Value("${spring.datasource.username:postgres}")
    private String defaultUsername;

    @Value("${spring.datasource.password:postgres}")
    private String defaultPassword;

    @Bean
    @Primary
    @Profile("prod")
    public DataSource productionDataSource() {
        String effectiveUrl = (databaseUrl != null && !databaseUrl.isBlank()) ? databaseUrl.trim() : springDatasourceUrl;

        HikariConfig config = new HikariConfig();
        config.setDriverClassName("org.postgresql.Driver");
        config.setMaximumPoolSize(15);
        config.setMinimumIdle(3);
        config.setConnectionTimeout(30000);
        config.setIdleTimeout(300000);
        config.setMaxLifetime(1800000);

        if (effectiveUrl.startsWith("postgres://") || effectiveUrl.startsWith("postgresql://")) {
            try {
                // Strip postgres:// or postgresql:// scheme
                URI uri = new URI(effectiveUrl.replaceFirst("^postgres://", "postgresql://"));
                String host = uri.getHost();
                int port = uri.getPort() > 0 ? uri.getPort() : 5432;
                String path = uri.getPath(); // starts with /
                String dbName = (path != null && path.length() > 1) ? path.substring(1) : "postgres";

                String jdbcUrl = String.format("jdbc:postgresql://%s:%d/%s", host, port, dbName);
                if (uri.getQuery() != null && !uri.getQuery().isBlank()) {
                    jdbcUrl += "?" + uri.getQuery();
                }

                config.setJdbcUrl(jdbcUrl);

                if (uri.getUserInfo() != null) {
                    String[] parts = uri.getUserInfo().split(":", 2);
                    config.setUsername(parts[0]);
                    if (parts.length > 1) {
                        config.setPassword(parts[1]);
                    }
                }
                log.info("[DATABASE CONFIG] Successfully converted Render URI to JDBC URL: {}", jdbcUrl.replaceAll(":[^/@]+@", ":****@"));
            } catch (URISyntaxException e) {
                log.error("[DATABASE CONFIG] Failed to parse DATABASE_URL URI: {}. Falling back to default config.", e.getMessage());
                config.setJdbcUrl(effectiveUrl);
                config.setUsername(defaultUsername);
                config.setPassword(defaultPassword);
            }
        } else {
            config.setJdbcUrl(effectiveUrl.startsWith("jdbc:") ? effectiveUrl : "jdbc:postgresql://localhost:5432/kaizenq_lms");
            config.setUsername(defaultUsername);
            config.setPassword(defaultPassword);
        }

        return new HikariDataSource(config);
    }
}

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
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.Map;

/**
 * Intelligent Database Configuration that normalizes Neon & Cloud PostgreSQL DATABASE_URL URI format
 * (e.g. postgresql://user:password@host:port/dbname?sslmode=require) into standard JDBC format.
 */
@Configuration
public class DatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Value("${DATABASE_URL_UNPOOLED:${DATABASE_URL:}}")
    private String databaseUrl;

    @Value("${spring.datasource.url:}")
    private String springDatasourceUrl;

    @Value("${spring.datasource.username:postgres}")
    private String defaultUsername;

    @Value("${spring.datasource.password:postgres}")
    private String defaultPassword;

    @Bean
    @Primary
    @Profile("!test")
    public DataSource configuredDataSource() {
        String effectiveUrl = resolveDatabaseUrl();

        HikariConfig config = new HikariConfig();
        config.setDriverClassName("org.postgresql.Driver");
        config.setMaximumPoolSize(15);
        config.setMinimumIdle(3);
        config.setConnectionTimeout(30000);
        config.setIdleTimeout(300000);
        config.setMaxLifetime(1800000);

        if (effectiveUrl.startsWith("postgres://") || effectiveUrl.startsWith("postgresql://")) {
            try {
                URI uri = new URI(effectiveUrl.replaceFirst("^postgres://", "postgresql://"));
                String host = uri.getHost();
                int port = uri.getPort() > 0 ? uri.getPort() : 5432;
                String path = uri.getPath();
                String dbName = (path != null && path.length() > 1) ? path.substring(1) : "neondb";

                String query = uri.getQuery();
                if (query == null || !query.contains("sslmode")) {
                    query = (query != null && !query.isBlank()) ? query + "&sslmode=require" : "sslmode=require";
                }

                String jdbcUrl = String.format("jdbc:postgresql://%s:%d/%s?%s", host, port, dbName, query);
                config.setJdbcUrl(jdbcUrl);

                if (uri.getUserInfo() != null) {
                    String[] parts = uri.getUserInfo().split(":", 2);
                    config.setUsername(parts[0]);
                    if (parts.length > 1) {
                        config.setPassword(parts[1]);
                    }
                }
                log.info("[DATABASE CONFIG] Configured Neon/PostgreSQL JDBC DataSource: {}", jdbcUrl.replaceAll(":[^/@]+@", ":****@"));
            } catch (URISyntaxException e) {
                log.error("[DATABASE CONFIG] Failed to parse DATABASE_URL URI: {}. Falling back to default URL.", e.getMessage());
                config.setJdbcUrl(effectiveUrl);
                config.setUsername(defaultUsername);
                config.setPassword(defaultPassword);
            }
        } else {
            String jdbcUrl = effectiveUrl.startsWith("jdbc:") ? effectiveUrl : "jdbc:postgresql://localhost:5432/kaizenq_lms";
            config.setJdbcUrl(jdbcUrl);
            config.setUsername(defaultUsername);
            config.setPassword(defaultPassword);
        }

        return new HikariDataSource(config);
    }

    private String resolveDatabaseUrl() {
        if (databaseUrl != null && !databaseUrl.isBlank()) {
            return databaseUrl.trim();
        }
        if (springDatasourceUrl != null && !springDatasourceUrl.isBlank() && !springDatasourceUrl.contains("localhost:5432")) {
            return springDatasourceUrl.trim();
        }

        // Auto-discover Neon environment variables from .env.local or .env in current or parent directory
        Map<String, String> localEnv = loadDotEnv();
        String discoveredUrl = localEnv.get("DATABASE_URL_UNPOOLED");
        if (discoveredUrl == null || discoveredUrl.isBlank()) {
            discoveredUrl = localEnv.get("DATABASE_URL");
        }
        if (discoveredUrl != null && !discoveredUrl.isBlank()) {
            log.info("[DATABASE CONFIG] Discovered Neon DATABASE_URL from .env.local file: {}", discoveredUrl.replaceAll(":[^/@]+@", ":****@"));
            return discoveredUrl.trim();
        }

        if (springDatasourceUrl != null && !springDatasourceUrl.isBlank()) {
            return springDatasourceUrl.trim();
        }

        return "jdbc:postgresql://localhost:5432/kaizenq_lms";
    }

    private Map<String, String> loadDotEnv() {
        Map<String, String> envMap = new HashMap<>();
        String[] candidatePaths = {
            ".env.local",
            "../.env.local",
            "../../.env.local",
            ".env",
            "../.env"
        };

        for (String path : candidatePaths) {
            File f = new File(path);
            if (f.exists() && f.isFile()) {
                try (BufferedReader reader = new BufferedReader(new FileReader(f))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#")) continue;
                        int eqIdx = line.indexOf('=');
                        if (eqIdx > 0) {
                            String key = line.substring(0, eqIdx).trim();
                            String val = line.substring(eqIdx + 1).trim();
                            if ((val.startsWith("\"") && val.endsWith("\"")) ||
                                (val.startsWith("'") && val.endsWith("'"))) {
                                val = val.substring(1, val.length() - 1);
                            }
                            envMap.putIfAbsent(key, val);
                        }
                    }
                } catch (Exception e) {
                    log.debug("Error reading dotenv file {}: {}", path, e.getMessage());
                }
            }
        }
        return envMap;
    }
}

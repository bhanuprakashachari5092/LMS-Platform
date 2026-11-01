package com.shaivikagroups.lms.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * SpringDoc OpenAPI 3.0 specification config for interactive Swagger UI docs.
 */
@Configuration
public class OpenApiConfig {

    @Value("${server.port:5000}")
    private String serverPort;

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";

        return new OpenAPI()
                .info(new Info()
                        .title("KaizenQ LMS SaaS REST API")
                        .version("2.0.0")
                        .description("Production-Ready Multi-Tenant Learning Management System API built on Spring Boot 3 & Java 21 LTS.")
                        .contact(new Contact()
                                .name("KaizenQ Support")
                                .email("support@kaizenq.in")
                                .url("https://www.kaizenq.in"))
                        .license(new License().name("Proprietary").url("https://www.kaizenq.in/terms")))
                .servers(List.of(
                        new Server().url("https://www.kaizenq.in").description("Production Server"),
                        new Server().url("http://localhost:" + serverPort).description("Local Development Server")
                ))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")));
    }
}


package com.shaivikagroups.lms;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class LmsApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @BeforeEach
    void before(TestInfo info) {
        System.out.println(">>> RUNNING TEST: " + info.getDisplayName());
    }

    @AfterEach
    void after(TestInfo info) {
        System.out.println("<<< FINISHED TEST: " + info.getDisplayName());
    }

    @Test
    void contextLoads() {
        System.out.println("Context loaded successfully!");
    }

    @Test
    void healthEndpointReturnsHealthy() throws Exception {
        mockMvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("healthy"))
                .andExpect(jsonPath("$.version").value("2.0.0"));
    }

    @Test
    void rootEndpointReturnsRunningService() throws Exception {
        mockMvc.perform(get("/"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.status").value("running"));
    }
}

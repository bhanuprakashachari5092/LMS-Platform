package com.shaivikagroups.lms.ai;

import com.shaivikagroups.lms.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai")
@Tag(name = "AI Mentor", description = "Multilingual AI Mentor, lesson explanation, and course recommendations")
public class AiMentorController {

    private final AiMentorService aiMentorService;

    public AiMentorController(AiMentorService aiMentorService) {
        this.aiMentorService = aiMentorService;
    }

    @PostMapping("/chat")
    @Operation(summary = "Chat with AI Mentor with course context in Telugu, Hindi, or English")
    public ResponseEntity<ApiResponse<AiChatResponse>> chat(@Valid @RequestBody AiChatRequest request) {
        AiChatResponse response = aiMentorService.chat(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/explain")
    @Operation(summary = "Explain concept with adaptive difficulty in Telugu, Hindi, or English")
    public ResponseEntity<ApiResponse<AiExplanationResponse>> explainConcept(@Valid @RequestBody AiExplanationRequest request) {
        AiExplanationResponse response = aiMentorService.explainConcept(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/recommendations")
    @Operation(summary = "Generate AI learning path and course recommendations")
    public ResponseEntity<ApiResponse<AiRecommendationResponse>> getRecommendations(@RequestBody(required = false) AiRecommendationRequest request) {
        if (request == null) {
            request = new AiRecommendationRequest();
        }
        AiRecommendationResponse response = aiMentorService.getRecommendations(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}


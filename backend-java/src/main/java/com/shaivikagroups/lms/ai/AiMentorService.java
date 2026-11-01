package com.shaivikagroups.lms.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shaivikagroups.lms.course.CourseEntity;
import com.shaivikagroups.lms.course.CourseLevel;
import com.shaivikagroups.lms.course.CourseRepository;
import com.shaivikagroups.lms.course.CourseStatus;
import com.shaivikagroups.lms.tenant.TenantContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class AiMentorService {

    private static final Logger log = LoggerFactory.getLogger(AiMentorService.class);

    @Value("${integrations.gemini.api-key:${ai.gemini.api-key:${GEMINI_API_KEY:}}}")
    private String geminiApiKey;

    @Value("${ai.gemini.model:gemini-1.5-flash}")
    private String geminiModel;

    private final CourseRepository courseRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public AiMentorService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * AI Multi-turn Chat with Course Context & Multilingual Support (Telugu, Hindi, English)
     */
    public AiChatResponse chat(AiChatRequest request) {
        String language = normalizeLanguage(request.getLanguage(), request.getMessage());
        String message = request.getMessage().trim();

        // 1. Try Gemini AI if API key is provided
        if (geminiApiKey != null && !geminiApiKey.isBlank()) {
            try {
                String prompt = buildChatPrompt(request, language);
                String geminiResponse = callGeminiApi(prompt);
                if (geminiResponse != null && !geminiResponse.isBlank()) {
                    return new AiChatResponse(geminiResponse, language, "GEMINI_AI");
                }
            } catch (Exception e) {
                log.warn("Gemini AI API call failed, falling back to Knowledge Engine: {}", e.getMessage());
            }
        }

        // 2. Intelligent Knowledge Engine Fallback
        String reply = generateKnowledgeEngineReply(request, language, message);
        return new AiChatResponse(reply, language, "MENTOR_KNOWLEDGE_ENGINE");
    }

    /**
     * Explain a concept in Telugu, Hindi, or English with tailored depth (beginner, intermediate, advanced)
     */
    public AiExplanationResponse explainConcept(AiExplanationRequest request) {
        String language = normalizeLanguage(request.getLanguage(), request.getConcept());
        String level = request.getLevel() != null ? request.getLevel().toLowerCase() : "beginner";
        String concept = request.getConcept().trim();

        AiExplanationResponse response = new AiExplanationResponse();
        response.setConcept(concept);
        response.setLanguage(language);
        response.setLevel(level);

        // 1. Try Gemini AI if key exists
        if (geminiApiKey != null && !geminiApiKey.isBlank()) {
            try {
                String prompt = buildExplanationPrompt(request, language, level);
                String geminiResponse = callGeminiApi(prompt);
                if (geminiResponse != null && !geminiResponse.isBlank()) {
                    response.setExplanation(geminiResponse);
                    response.setKeyPoints(generateKeyPoints(concept, language));
                    response.setExamples(generateExamples(concept, language));
                    response.setSource("GEMINI_AI");
                    return response;
                }
            } catch (Exception e) {
                log.warn("Gemini AI API call failed for explanation, falling back to Knowledge Engine: {}", e.getMessage());
            }
        }

        // 2. Multilingual Knowledge Engine response
        if ("te".equals(language)) {
            response.setExplanation(generateTeluguExplanation(concept, level, request.getLessonTitle()));
            response.setKeyPoints(List.of(
                    "ముఖ్య భావన: " + concept + " సిస్టమ్ లేదా ప్రోగ్రామింగ్ యొక్క మూలస్తంభం.",
                    "ఇన్పుట్/అవుట్పుట్ ప్రవాహం క్రమపద్ధతిలో జరుగుతుంది.",
                    "రియల్-వరల్డ్ ఆర్కిటెక్చర్లో భద్రత మరియు సామర్థ్యం చాలా ముఖ్యం."
            ));
            response.setExamples(List.of(
                    "ఉదాహరణ 1: బ్యాంక్ టెల్లర్ కౌంటర్ ద్వారా అభ్యర్థనలు పంపడం వంటిది.",
                    "ఉదాహరణ 2: ఆటోమేషన్ స్క్రిప్ట్స్ ద్వారా రోజువారీ పనులను వేగవంతం చేయడం."
            ));
        } else if ("hi".equals(language)) {
            response.setExplanation(generateHindiExplanation(concept, level, request.getLessonTitle()));
            response.setKeyPoints(List.of(
                    "मुख्य अवधारणा: " + concept + " सॉफ्टवेयर और सिस्टम का आधारभूत हिस्सा है।",
                    "डेटा और कमांड्स का प्रवाह नियंत्रित एवं सुरक्षित वातावरण में होता है।",
                    "सर्वोत्तम प्रथाओं का पालन करने से सिस्टम क्रैश और सुरक्षा खतरे टलते हैं।"
            ));
            response.setExamples(List.of(
                    "उदाहरण 1: रेस्तरां में वेटर के माध्यम से आर्डर किचन तक पहुँचाने जैसी प्रक्रिया।",
                    "उदाहरण 2: शेल स्क्रिप्ट द्वारा नियमित बैकअप का स्वचालन।"
            ));
        } else {
            response.setExplanation(generateEnglishExplanation(concept, level, request.getLessonTitle()));
            response.setKeyPoints(List.of(
                    "Core Paradigm: " + concept + " governs structured execution in modern software architectures.",
                    "Controlled State: Eliminates race conditions and bounds memory or CPU allocations.",
                    "Production Standards: Enforce modularity, logging, and granular security policies."
            ));
            response.setExamples(List.of(
                    "Example 1: Restricting file access octals (e.g. chmod 600) to protect private key pairs.",
                    "Example 2: Leveraging Unix stream pipelining (stdout to stdin) for high-performance stream processing."
            ));
        }

        response.setSource("MENTOR_KNOWLEDGE_ENGINE");
        return response;
    }

    /**
     * AI-Powered Learning Recommendations based on career goals & completed courses
     */
    public AiRecommendationResponse getRecommendations(AiRecommendationRequest request) {
        String tenantId = TenantContext.getTenantId();
        AiRecommendationResponse response = new AiRecommendationResponse();
        String goal = (request.getCareerGoal() != null && !request.getCareerGoal().isBlank())
                ? request.getCareerGoal().trim()
                : "Full-Stack Cloud & DevOps Engineer";

        response.setCareerGoal(goal);

        List<String> completed = request.getCompletedCourseIds() != null
                ? request.getCompletedCourseIds()
                : Collections.emptyList();

        List<String> interests = request.getInterests() != null
                ? request.getInterests()
                : List.of("DevOps", "Cloud", "Java", "Linux", "AI");

        // Fetch published courses from current tenant or platform
        List<CourseEntity> availableCourses = courseRepository.findByTenantIdAndStatus(
                tenantId,
                CourseStatus.PUBLISHED,
                PageRequest.of(0, 20)
        ).getContent();

        List<AiRecommendationResponse.CourseRecommendation> recs = new ArrayList<>();
        for (CourseEntity c : availableCourses) {
            if (completed.contains(c.getId())) {
                continue; // Skip already completed courses
            }

            int score = calculateMatchScore(c, goal, interests);
            String reason = generateMatchReason(c, goal);

            recs.add(new AiRecommendationResponse.CourseRecommendation(
                    c.getId(),
                    c.getTitle(),
                    c.getDescription(),
                    reason,
                    c.getLevel() != null ? c.getLevel().name() : "BEGINNER",
                    score
            ));
        }

        // Sort descending by match score
        recs.sort((a, b) -> Integer.compare(b.getMatchScore(), a.getMatchScore()));
        response.setRecommendations(recs.stream().limit(5).toList());

        response.setLearningPathAdvice("To reach your target role of '" + goal + "', complete the recommended prerequisite hands-on labs and finish your capstone project.");
        response.setNextSteps(List.of(
                "Review the fundamentals in " + (recs.isEmpty() ? "your first course" : recs.get(0).getTitle()),
                "Practice practical terminal exercises and complete end-of-module quizzes",
                "Publish your hands-on projects directly to GitHub and link them to your LMS Portfolio"
        ));
        response.setSource("MENTOR_KNOWLEDGE_ENGINE");

        return response;
    }

    // --------------------------------------------------------------------------
    // GEMINI REST CLIENT INTEGRATION
    // --------------------------------------------------------------------------

    private String callGeminiApi(String prompt) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + geminiModel + ":generateContent?key=" + geminiApiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> textPart = Map.of("text", prompt);
        Map<String, Object> contentPart = Map.of("parts", List.of(textPart));
        Map<String, Object> body = Map.of("contents", List.of(contentPart));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            try {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode candidates = root.path("candidates");
                if (candidates.isArray() && !candidates.isEmpty()) {
                    JsonNode textNode = candidates.get(0).path("content").path("parts").get(0).path("text");
                    if (!textNode.isMissingNode()) {
                        return textNode.asText();
                    }
                }
            } catch (Exception e) {
                log.warn("Error parsing Gemini API response JSON: {}", e.getMessage());
            }
        }
        return null;
    }

    private String buildChatPrompt(AiChatRequest request, String language) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are an expert AI Mentor in Shaivika LMS.\n");
        sb.append("The student is asking a question in ").append(language.toUpperCase()).append(".\n");
        if (request.getCourseTitle() != null) {
            sb.append("Course Context: ").append(request.getCourseTitle()).append("\n");
        }
        if (request.getLessonTitle() != null) {
            sb.append("Lesson Context: ").append(request.getLessonTitle()).append("\n");
        }
        if (request.getLessonContent() != null) {
            sb.append("Lesson Content snippet: ").append(request.getLessonContent().length() > 500 ? request.getLessonContent().substring(0, 500) : request.getLessonContent()).append("\n");
        }
        sb.append("Student query: ").append(request.getMessage()).append("\n");
        sb.append("Provide a clear, engaging, educational, and structured response in the requested language (English, Telugu, or Hindi).");
        return sb.toString();
    }

    private String buildExplanationPrompt(AiExplanationRequest request, String language, String level) {
        return "You are an expert LMS AI Mentor. Explain the concept '" + request.getConcept() + "' at a " +
                level + " level in " + language + " language. Include an overview, step-by-step breakdown, and real-world analogy.";
    }

    // --------------------------------------------------------------------------
    // KNOWLEDGE ENGINE MULTILINGUAL GENERATORS
    // --------------------------------------------------------------------------

    private String generateKnowledgeEngineReply(AiChatRequest request, String language, String message) {
        String lower = message.toLowerCase();
        String topic = request.getLessonTitle() != null ? request.getLessonTitle() : "the curriculum";

        if ("te".equals(language)) {
            return "### 🌟 AI మెంటార్ సమాధానం (Telugu)\n\n" +
                    "నమస్కారం! **" + topic + "** గురించి మీ ప్రశ్న: *\"" + message + "\"*\n\n" +
                    "1. **ముఖ్య భావన**: ఈ పాఠంలో ప్రాథమిక పద్ధతులు మరియు ఆచరణాత్మక అంశాలు వివరించబడ్డాయి.\n" +
                    "2. **ఆచరణాత్మక సలహా**: కమాండ్ లైన్ సాధనాలు లేదా కోడ్ ఎడిటర్లో స్వయంగా ప్రాక్టీస్ చేయండి.\n" +
                    "3. **తదుపరి అడుగు**: అసెస్మెంట్ క్విజ్ను పూర్తి చేసి సర్టిఫికేషన్ వైపు ముందడుగు వేయండి.\n\n" +
                    "మీకు ఇంకా ఏమైనా సందేహాలు ఉంటే నిర్భయంగా అడగండి!";
        }

        if ("hi".equals(language)) {
            return "### 🌟 AI मेंटर उत्तर (Hindi)\n\n" +
                    "नमस्ते! **" + topic + "** के संदर्भ में आपका प्रश्न: *\"" + message + "\"*\n\n" +
                    "1. **मूल सिद्धांत**: इस विषय में व्यावहारिक तकनीकों और बुनियादी संरचना को समझाया गया है।\n" +
                    "2. **अभ्यास निर्देश**: सिस्टम टर्मिनल या कोड एडिटर में उदाहरणों को स्वयं चलाकर देखें।\n" +
                    "3. **अगला कदम**: संबंधित मॉड्यूल के क्विज और असाइनमेंट को पूरा करें।\n\n" +
                    "यदि आपके पास कोई और प्रश्न है, तो बेझिझक पूछें!";
        }

        // Code review / debug queries
        if (lower.contains("explain code") || lower.contains("my code") || lower.contains("review")) {
            return "### 🔍 AI Code Review & Feedback\n\n" +
                    "Here is a structured assessment of your code in the context of **" + topic + "**:\n\n" +
                    "- **Modularity**: Ensure functions focus on a single responsibility.\n" +
                    "- **Error Handling**: Validate edge cases and null/empty parameters.\n" +
                    "- **Performance**: Minimize unneeded loop iterations and memory allocations.\n\n" +
                    "Let me know if you would like line-by-line optimization or time complexity analysis!";
        }

        if (lower.contains("time complexity") || lower.contains("space complexity")) {
            return "### ⏱️ Algorithmic Complexity Analysis\n\n" +
                    "- **Time Complexity**: Typically **O(N)** for single iterations or **O(log N)** for binary tree / divide-and-conquer traversals.\n" +
                    "- **Space Complexity**: Auxiliary memory is **O(1)** if operating in-place, or **O(N)** if allocating dynamic collections.\n\n" +
                    "Optimize by pre-sizing collections and pruning redundant branching.";
        }

        return "### 📘 AI Mentor Guidance - " + topic + "\n\n" +
                "Regarding: *\"" + message + "\"*\n\n" +
                "1. **Key Focus**: In **" + topic + "**, mastery comes from hands-on execution and conceptual clarity.\n" +
                "2. **Best Practice**: Verify output codes, check system logs, and validate against unit tests.\n" +
                "3. **Recommended Action**: Complete the interactive laboratory exercise and take the knowledge check quiz.\n\n" +
                "Feel free to ask for analogies, code snippets, or explanations in Telugu or Hindi!";
    }

    private String generateTeluguExplanation(String concept, String level, String lessonTitle) {
        return "### 🌟 తెలుగులో వివరణ (Telugu Concept Explanation)\n\n" +
                "నమస్కారం! **" + concept + "** గురించి " + level + " స్థాయిలో సులభంగా అర్థం చేసుకుందాం:\n\n" +
                "1. **భావన యొక్క పరిచయం**: " + concept + " అనేది ఆధునిక సిస్టమ్స్ మరియు డెవలప్‌మెంట్‌లో ఒక ముఖ్యమైన అంశం.\n" +
                "2. **ఎలా పనిచేస్తుంది**:\n" +
                "   - యూజర్ లేదా అప్లికేషన్ ఇచ్చే ఆదేశాలను సిస్టమ్ సురక్షితంగా పరిశీలిస్తుంది.\n" +
                "   - నియమిత ప్రోటోకాల్ ద్వారా ప్రాసెస్ చేసి ఖచ్చితమైన ఫలితాన్ని అందిస్తుంది.\n" +
                "3. **నిజ జీవిత ఉదాహరణ**: ఒక పోస్టాఫీసులో లేఖలను వాటి పిన్ కోడ్ ఆధారంగా వేరు చేసి సరైన చిరునామాకు చేర్చినట్లుగానే, ఈ సిస్టమ్ కూడా డేటాను నిర్వహించి గమ్యస్థానానికి చేర్చుతుంది.\n\n" +
                "ఇది మీకు స్పష్టంగా అర్థమైందా? ఇంకా ఏవైనా సందేహాలు ఉంటే అడగండి!";
    }

    private String generateHindiExplanation(String concept, String level, String lessonTitle) {
        return "### 🌟 हिंदी में स्पष्टीकरण (Hindi Concept Explanation)\n\n" +
                "नमस्ते! **" + concept + "** को " + level + " स्तर पर सरल रूप में समझते हैं:\n\n" +
                "1. **मूल परिचय**: " + concept + " आधुनिक सॉफ्टवेयर और सिस्टम आर्किटेक्चर का एक अनिवार्य घटक है।\n" +
                "2. **कार्यप्रणाली**:\n" +
                "   - सिस्टम यूजर द्वारा दिए गए निर्देशों को मान्य (validate) करता है।\n" +
                "   - सुरक्षित और अनुकूलित रूप से निष्पादन (execution) पूरा करता है।\n" +
                "3. **वास्तविक जीवन का उदाहरण**: जैसे हवाई अड्डे पर सुरक्षा जांच के बाद ही यात्री को बोर्डिंग की अनुमति मिलती है, ठीक वैसे ही यह आर्किटेक्चर सुरक्षा और सटीकता सुनिश्चित करता है।\n\n" +
                "क्या आपको यह अवधारणा स्पष्ट हुई? कोई अतिरिक्त प्रश्न हो तो अवश्य पूछें!";
    }

    private String generateEnglishExplanation(String concept, String level, String lessonTitle) {
        return "### 📘 Conceptual Breakdown: " + concept + " (" + level.toUpperCase() + ")\n\n" +
                "1. **Overview & Purpose**:\n" +
                "   " + concept + " establishes predictable, high-performance boundaries within modern computing and cloud architectures.\n\n" +
                "2. **Operational Workflow**:\n" +
                "   - **Ingress & Parsing**: Validates request parameters and bounds payload size.\n" +
                "   - **Execution & Isolation**: Prevents unauthorized memory access or resource exhaustion.\n" +
                "   - **Egress & Logging**: Returns standardized status responses while persisting structured telemetry.\n\n" +
                "3. **Industry Best Practice**:\n" +
                "   Always implement defensive validation, follow the principle of least privilege, and configure automated health probes.";
    }

    private List<String> generateKeyPoints(String concept, String language) {
        if ("te".equals(language)) {
            return List.of(
                    "ముఖ్యమైన ఫ్రేమ్‌వర్క్ మరియు నిబంధనలు",
                    "డేటా ప్రాసెసింగ్ భద్రత",
                    "నిరంతర పర్యవేక్షణ మరియు ఆప్టిమైజేషన్"
            );
        } else if ("hi".equals(language)) {
            return List.of(
                    "विश्वसनीय सिस्टम संरचना",
                    "डेटा और प्रोसेस की सुरक्षा",
                    "प्रदर्शन अनुकूलन और त्रुटि प्रबंधन"
            );
        }
        return List.of(
                "Granular isolation and defensive boundaries",
                "Strict validation and idempotent execution",
                "High availability and automated telemetry"
        );
    }

    private List<String> generateExamples(String concept, String language) {
        if ("te".equals(language)) {
            return List.of(
                    "క్లౌడ్ సర్వర్ ఆటోమేషన్ స్క్రిప్ట్స్",
                    "API గేట్‌వేల ద్వారా డేటా ట్రాఫిక్ నిర్వహణ"
            );
        } else if ("hi".equals(language)) {
            return List.of(
                    "क्लाउड सर्वर ऑटोमेशन और शेड्यूलिंग",
                    "सुरक्षित डेटा ट्रांसमिशन और टोकन सत्यापन"
            );
        }
        return List.of(
                "Production reverse proxies routing microservice ingress",
                "POSIX access control lists enforcing least-privilege security"
        );
    }

    private String normalizeLanguage(String lang, String text) {
        if (lang != null) {
            String l = lang.trim().toLowerCase();
            if (l.startsWith("te") || l.contains("telugu")) return "te";
            if (l.startsWith("hi") || l.contains("hindi")) return "hi";
            if (l.startsWith("en") || l.contains("english")) return "en";
        }
        if (text != null) {
            String t = text.toLowerCase();
            if (t.contains("telugu") || t.contains("తెలుగు")) return "te";
            if (t.contains("hindi") || t.contains("हिंदी")) return "hi";
        }
        return "en";
    }

    private int calculateMatchScore(CourseEntity c, String goal, List<String> interests) {
        int score = 60;
        String title = c.getTitle().toLowerCase();
        String cat = (c.getCategory() != null ? c.getCategory() : "").toLowerCase();

        for (String interest : interests) {
            if (title.contains(interest.toLowerCase()) || cat.contains(interest.toLowerCase())) {
                score += 10;
            }
        }
        if (goal.toLowerCase().contains("devops") && (title.contains("linux") || title.contains("docker") || title.contains("kubernetes") || title.contains("cloud"))) {
            score += 15;
        }
        if (goal.toLowerCase().contains("full") && (title.contains("full") || title.contains("react") || title.contains("java") || title.contains("spring"))) {
            score += 15;
        }
        return Math.min(score, 99);
    }

    private String generateMatchReason(CourseEntity c, String goal) {
        return "Aligns with your career target for " + goal + " by providing hands-on proficiency in " + c.getTitle() + ".";
    }
}

package com.shaivikagroups.lms.practice;

import com.shaivikagroups.lms.tenant.TenantContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Component
@Order(6)
public class PracticeProblemSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(PracticeProblemSeeder.class);

    private final PracticeProblemRepository problemRepository;
    private final PracticeProblemTemplateRepository templateRepository;
    private final PracticeTestCaseRepository testCaseRepository;

    public PracticeProblemSeeder(
            PracticeProblemRepository problemRepository,
            PracticeProblemTemplateRepository templateRepository,
            PracticeTestCaseRepository testCaseRepository) {
        this.problemRepository = problemRepository;
        this.templateRepository = templateRepository;
        this.testCaseRepository = testCaseRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        String defaultTenant = TenantContext.DEFAULT_TENANT_ID;

        if (problemRepository.count() > 0) {
            return;
        }

        log.info("Seeding standard practice problems and test cases...");

        // 1. Two Sum
        PracticeProblemEntity twoSum = new PracticeProblemEntity();
        twoSum.setId("prob_two_sum");
        twoSum.setTenantId(defaultTenant);
        twoSum.setTitle("Two Sum");
        twoSum.setSlug("two-sum");
        twoSum.setDifficulty("EASY");
        twoSum.setCategory("Algorithms");
        twoSum.setTopicTags("Arrays, Hash Table, Two Pointers");
        twoSum.setDescription(
                "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\n" +
                "You may assume that each input would have **exactly one solution**, and you may not use the same element twice.\n\n" +
                "You can return the answer in any order."
        );
        twoSum.setConstraints("2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.");
        twoSum.setHints("A really brute force way would be to search for all possible pairs of numbers, but that would be slow. Can you use a Hash Map?");
        twoSum.setTimeLimitMs(2000);
        twoSum.setMemoryLimitKb(128000);
        twoSum.setPublished(true);
        problemRepository.save(twoSum);

        seedTemplate(twoSum, "python",
                "class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        seen = {}\n        for i, n in enumerate(nums):\n            diff = target - n\n            if diff in seen:\n                return [seen[diff], i]\n            seen[n] = i\n        return []\n");

        seedTemplate(twoSum, "javascript",
                "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const diff = target - nums[i];\n        if (map.has(diff)) {\n            return [map.get(diff), i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n}\n");

        seedTemplate(twoSum, "java",
                "import java.util.*;\n\npublic class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) {\n                return new int[] { map.get(complement), i };\n            }\n            map.put(nums[i], i);\n        }\n        return new int[0];\n    }\n}\n");

        seedTemplate(twoSum, "cpp",
                "#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> seen;\n        for (int i = 0; i < nums.size(); i++) {\n            int diff = target - nums[i];\n            if (seen.count(diff)) return {seen[diff], i};\n            seen[nums[i]] = i;\n        }\n        return {};\n    }\n};\n");

        // Test Cases for Two Sum
        seedTestCase(twoSum, "2,7,11,15\n9", "[0, 1]", "nums = [2,7,11,15], target = 9", false, 0);
        seedTestCase(twoSum, "3,2,4\n6", "[1, 2]", "nums = [3,2,4], target = 6", false, 1);
        seedTestCase(twoSum, "3,3\n6", "[0, 1]", "Hidden case: duplicate numbers", true, 2);

        // 2. Valid Parentheses
        PracticeProblemEntity validParen = new PracticeProblemEntity();
        validParen.setId("prob_valid_parentheses");
        validParen.setTenantId(defaultTenant);
        validParen.setTitle("Valid Parentheses");
        validParen.setSlug("valid-parentheses");
        validParen.setDifficulty("EASY");
        validParen.setCategory("Data Structures");
        validParen.setTopicTags("Stack, Strings");
        validParen.setDescription(
                "Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.\n\n" +
                "An input string is valid if:\n" +
                "1. Open brackets must be closed by the same type of brackets.\n" +
                "2. Open brackets must be closed in the correct order.\n" +
                "3. Every close bracket has a corresponding open bracket of the same type."
        );
        validParen.setConstraints("1 <= s.length <= 10^4\ns consists of parentheses only '()[]{}'");
        validParen.setHints("Use a stack of characters. When you see an opening bracket, push it. When you see a closing bracket, check if it matches the top of the stack.");
        validParen.setTimeLimitMs(2000);
        validParen.setMemoryLimitKb(128000);
        validParen.setPublished(true);
        problemRepository.save(validParen);

        seedTemplate(validParen, "python",
                "class Solution:\n    def isValid(self, s: str) -> bool:\n        stack = []\n        mapping = {')': '(', '}': '{', ']': '['}\n        for char in s:\n            if char in mapping:\n                top = stack.pop() if stack else '#'\n                if mapping[char] != top:\n                    return False\n            else:\n                stack.append(char)\n        return not stack\n");

        seedTestCase(validParen, "()", "true", "Single pair of valid parentheses", false, 0);
        seedTestCase(validParen, "()[]{}", "true", "Multiple valid bracket pairs", false, 1);
        seedTestCase(validParen, "(]", "false", "Mismatched bracket pair", false, 2);
        seedTestCase(validParen, "([)]", "false", "Hidden case: interlaced brackets", true, 3);
        seedTestCase(validParen, "{[]}", "true", "Hidden case: nested brackets", true, 4);

        // 3. Reverse String
        PracticeProblemEntity reverseStr = new PracticeProblemEntity();
        reverseStr.setId("prob_reverse_string");
        reverseStr.setTenantId(defaultTenant);
        reverseStr.setTitle("Reverse a String");
        reverseStr.setSlug("reverse-string");
        reverseStr.setDifficulty("EASY");
        reverseStr.setCategory("Algorithms");
        reverseStr.setTopicTags("Two Pointers, Strings");
        reverseStr.setDescription("Write a function that reverses a given string `s` in-place or returns the reversed string.");
        reverseStr.setConstraints("1 <= s.length <= 10^5");
        reverseStr.setTimeLimitMs(2000);
        reverseStr.setMemoryLimitKb(128000);
        reverseStr.setPublished(true);
        problemRepository.save(reverseStr);

        seedTemplate(reverseStr, "python",
                "def reverseString(s: str) -> str:\n    return s[::-1]\n");

        seedTestCase(reverseStr, "hello", "olleh", "Basic string reversal", false, 0);
        seedTestCase(reverseStr, "KaizenQ", "QneziaK", "Hidden case: mixed casing", true, 1);

        // 4. Employees Earning More Than Their Managers (SQL)
        PracticeProblemEntity sqlProblem = new PracticeProblemEntity();
        sqlProblem.setId("prob_sql_employees");
        sqlProblem.setTenantId(defaultTenant);
        sqlProblem.setTitle("Employees Earning More Than Their Managers");
        sqlProblem.setSlug("employees-earning-more-than-managers");
        sqlProblem.setDifficulty("MEDIUM");
        sqlProblem.setCategory("Database Queries");
        sqlProblem.setTopicTags("SQL, Database, Self Join");
        sqlProblem.setDescription(
                "Table: `Employee`\n\n" +
                "| Column Name | Type    |\n" +
                "|-------------|---------|\n" +
                "| id          | int     |\n" +
                "| name        | varchar |\n" +
                "| salary      | int     |\n" +
                "| managerId   | int     |\n\n" +
                "`id` is the primary key column for this table. Each row indicates the ID of an employee, their name, their salary, and the ID of their manager.\n\n" +
                "Write a SQL query to find the employees who earn more than their managers."
        );
        sqlProblem.setConstraints("SQL standard PostgreSQL or SQLite query.");
        sqlProblem.setTimeLimitMs(2000);
        sqlProblem.setMemoryLimitKb(128000);
        sqlProblem.setPublished(true);
        problemRepository.save(sqlProblem);

        seedTemplate(sqlProblem, "sql",
                "-- Write your SQL query below\nSELECT e.name AS Employee\nFROM Employee e\nJOIN Employee m ON e.managerId = m.id\nWHERE e.salary > m.salary;\n");

        seedTestCase(sqlProblem, "Employee table with salaries", "Joe", "Sample table", false, 0);

        log.info("Practice problems seeded successfully.");
    }

    private void seedTemplate(PracticeProblemEntity problem, String language, String starterCode) {
        PracticeProblemTemplateEntity template = new PracticeProblemTemplateEntity();
        template.setId("tmpl_" + UUID.randomUUID().toString().replace("-", ""));
        template.setProblem(problem);
        template.setLanguage(language);
        template.setStarterCode(starterCode);
        template.setCreatedAt(Instant.now());
        templateRepository.save(template);
    }

    private void seedTestCase(PracticeProblemEntity problem, String input, String expected, String explanation, boolean isHidden, int order) {
        PracticeTestCaseEntity tc = new PracticeTestCaseEntity();
        tc.setId("tc_" + UUID.randomUUID().toString().replace("-", ""));
        tc.setProblem(problem);
        tc.setInputData(input);
        tc.setExpectedOutput(expected);
        tc.setExplanation(explanation);
        tc.setHidden(isHidden);
        tc.setDisplayOrder(order);
        tc.setWeightPoints(10);
        tc.setCreatedAt(Instant.now());
        testCaseRepository.save(tc);
    }
}

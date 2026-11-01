package com.shaivikagroups.lms.practice;

import com.shaivikagroups.lms.practice.dto.LanguageConfigDTO;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class LanguageRegistry {

    private final Map<String, LanguageConfigDTO> languages = new LinkedHashMap<>();

    public LanguageRegistry() {
        register(new LanguageConfigDTO(
                "python",
                "Python 3",
                "python",
                71,
                ".py",
                "# Python 3 Solution Template\n\nimport sys\n\ndef solve():\n    lines = sys.stdin.read().splitlines()\n    if not lines:\n        return\n    # Process input here\n\nif __name__ == '__main__':\n    solve()\n",
                true
        ));

        register(new LanguageConfigDTO(
                "javascript",
                "JavaScript (Node.js)",
                "javascript",
                63,
                ".js",
                "// JavaScript (Node.js) Solution Template\n\nconst fs = require('fs');\n\nfunction main() {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (!input) return;\n    // Process input here\n}\n\nmain();\n",
                true
        ));

        register(new LanguageConfigDTO(
                "java",
                "Java",
                "java",
                62,
                ".java",
                "// Java Solution Template\n\nimport java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        if (!scanner.hasNext()) return;\n        // Process input here\n    }\n}\n",
                true
        ));

        register(new LanguageConfigDTO(
                "cpp",
                "C++ (GCC)",
                "cpp",
                54,
                ".cpp",
                "// C++ Solution Template\n\n#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Process input here\n    return 0;\n}\n",
                true
        ));

        register(new LanguageConfigDTO(
                "c",
                "C (GCC)",
                "c",
                50,
                ".c",
                "// C Solution Template\n\n#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n\nint main() {\n    // Process input here\n    return 0;\n}\n",
                true
        ));

        register(new LanguageConfigDTO(
                "sql",
                "SQL (PostgreSQL/SQLite)",
                "sql",
                82,
                ".sql",
                "-- Write your SQL solution query statement below\nSELECT * FROM table_name;\n",
                true
        ));
    }

    private void register(LanguageConfigDTO config) {
        languages.put(config.getId().toLowerCase(), config);
    }

    public List<LanguageConfigDTO> getAllLanguages() {
        return new ArrayList<>(languages.values());
    }

    public Optional<LanguageConfigDTO> getLanguage(String id) {
        if (id == null) return Optional.empty();
        return Optional.ofNullable(languages.get(id.toLowerCase()));
    }

    public boolean isSupported(String id) {
        if (id == null) return false;
        LanguageConfigDTO config = languages.get(id.toLowerCase());
        return config != null && config.isEnabled();
    }
}

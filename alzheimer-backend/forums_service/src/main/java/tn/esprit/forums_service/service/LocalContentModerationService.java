package tn.esprit.forums_service.service;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.regex.Pattern;

@Service
public class LocalContentModerationService {

    private static final List<String> VIOLENCE_TERMS = List.of(
            "kill", "murder", "stab", "shoot", "punch", "hit", "violence", "violent", "blood", "dead",
            "tuer", "meurtre", "assassiner", "frapper", "agression", "attaque", "violence", "sang", "mort"
    );

    private static final List<String> SPAM_TERMS = List.of(
            "buy now", "click here", "limited offer", "free money", "urgent", "win now", "casino",
            "crypto", "loan", "discount", "promo", "promotion", "abonne", "gagner", "argent facile"
    );

    private static final Pattern URL_PATTERN = Pattern.compile("(https?://|www\\.)\\S+", Pattern.CASE_INSENSITIVE);
    private static final Pattern EMAIL_PATTERN = Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
    private static final Pattern PHONE_PATTERN = Pattern.compile("\\+?\\d[\\d\\s\\-]{7,}\\d");
    private static final Pattern REPEATED_SYMBOL_PATTERN = Pattern.compile("([!$%*#])\\1{2,}");
    private static final Pattern REPEATED_WORD_PATTERN = Pattern.compile("\\b(\\p{L}{2,})\\b(?:\\s+\\1\\b)+", Pattern.CASE_INSENSITIVE);

    public ModerationScores evaluate(String text) {
        String normalized = normalize(text);
        if (normalized.isBlank()) {
            return new ModerationScores(0, 0);
        }

        int violenceHits = countTermHits(normalized, VIOLENCE_TERMS);
        int spamHits = countTermHits(normalized, SPAM_TERMS);

        int urlHits = countMatches(URL_PATTERN, normalized);
        int emailHits = countMatches(EMAIL_PATTERN, normalized);
        int phoneHits = countMatches(PHONE_PATTERN, normalized);
        int repeatedSymbols = countMatches(REPEATED_SYMBOL_PATTERN, normalized);
        int repeatedWords = countMatches(REPEATED_WORD_PATTERN, normalized);

        int violenceScore = violenceHits * 14;
        if (containsThreatExpression(normalized)) {
            violenceScore += 20;
        }
        if (countExclamationMarks(normalized) >= 4) {
            violenceScore += 6;
        }

        int spamScore = spamHits * 11;
        spamScore += urlHits * 18;
        spamScore += emailHits * 12;
        spamScore += phoneHits * 10;
        spamScore += repeatedSymbols * 6;
        spamScore += repeatedWords * 8;

        if (uppercaseRatio(text) > 0.45d && text != null && text.length() > 24) {
            spamScore += 10;
        }
        if (normalized.contains("http") && normalized.length() < 60) {
            spamScore += 8;
        }

        return new ModerationScores(clamp(violenceScore), clamp(spamScore));
    }

    private String normalize(String text) {
        if (text == null) {
            return "";
        }
        return text.toLowerCase()
                .replace('\n', ' ')
                .replace('\r', ' ')
                .trim();
    }

    private int countTermHits(String text, List<String> terms) {
        int hits = 0;
        for (String term : terms) {
            hits += countOccurrences(text, term);
        }
        return hits;
    }

    private int countOccurrences(String text, String term) {
        if (term.isBlank()) {
            return 0;
        }
        int count = 0;
        int index = 0;
        while ((index = text.indexOf(term, index)) != -1) {
            count++;
            index += term.length();
        }
        return count;
    }

    private int countMatches(Pattern pattern, String text) {
        var matcher = pattern.matcher(text);
        int count = 0;
        while (matcher.find()) {
            count++;
        }
        return count;
    }

    private boolean containsThreatExpression(String text) {
        return text.contains("i will kill")
                || text.contains("kill you")
                || text.contains("go die")
                || text.contains("je vais te tuer")
                || text.contains("tu vas mourir")
                || text.contains("on va te frapper");
    }

    private int countExclamationMarks(String text) {
        int count = 0;
        for (int i = 0; i < text.length(); i++) {
            if (text.charAt(i) == '!') {
                count++;
            }
        }
        return count;
    }

    private double uppercaseRatio(String text) {
        if (text == null || text.isBlank()) {
            return 0.0d;
        }

        int upper = 0;
        int letters = 0;

        for (int i = 0; i < text.length(); i++) {
            char ch = text.charAt(i);
            if (Character.isLetter(ch)) {
                letters++;
                if (Character.isUpperCase(ch)) {
                    upper++;
                }
            }
        }

        if (letters == 0) {
            return 0.0d;
        }
        return (double) upper / letters;
    }

    private int clamp(int value) {
        return Math.max(0, Math.min(100, value));
    }

    public record ModerationScores(int violenceScore, int spamScore) {}
}

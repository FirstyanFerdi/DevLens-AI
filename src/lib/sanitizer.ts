import { RedactedItem, SanitizedResult } from './types';

interface SanitizerRule {
  name: string;
  type: string;
  regex: RegExp;
  replacement: string;
}

const SANITIZER_RULES: SanitizerRule[] = [
  {
    name: 'OpenAI API Key',
    type: 'API_KEY',
    regex: /\bsk-(?:proj-|live-)?[a-zA-Z0-9_-]{20,}\b/g,
    replacement: '[REDACTED_OPENAI_KEY]',
  },
  {
    name: 'Anthropic API Key',
    type: 'API_KEY',
    regex: /\bsk-ant-[a-zA-Z0-9_-]{20,}\b/g,
    replacement: '[REDACTED_ANTHROPIC_KEY]',
  },
  {
    name: 'Google Gemini / GCP API Key',
    type: 'API_KEY',
    regex: /\bAIza[0-9A-Za-z-_]{35}\b/g,
    replacement: '[REDACTED_GEMINI_KEY]',
  },
  {
    name: 'AWS Access Key ID',
    type: 'CLOUD_CREDENTIAL',
    regex: /\bAKIA[0-9A-Z]{16}\b/g,
    replacement: '[REDACTED_AWS_KEY_ID]',
  },
  {
    name: 'AWS Secret Access Key',
    type: 'CLOUD_CREDENTIAL',
    regex: /(?<=\b(?:aws_secret_access_key|aws_secret_key|secret_key)\s*[:=]\s*["']?)[A-Za-z0-9/+=]{40}(?=["']?)/gi,
    replacement: '[REDACTED_AWS_SECRET]',
  },
  {
    name: 'GitHub Personal Access Token',
    type: 'TOKEN',
    regex: /\b(?:ghp|gho|ghu|ghs|ghr)_[0-9a-zA-Z]{36,}\b/g,
    replacement: '[REDACTED_GITHUB_TOKEN]',
  },
  {
    name: 'GitHub Fine-Grained Token',
    type: 'TOKEN',
    regex: /\bgithub_pat_[0-9a-zA-Z_]{60,}\b/g,
    replacement: '[REDACTED_GITHUB_PAT]',
  },
  {
    name: 'JSON Web Token (JWT)',
    type: 'TOKEN',
    regex: /\beyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\b/g,
    replacement: '[REDACTED_JWT]',
  },
  {
    name: 'Database Connection String',
    type: 'DATABASE_URL',
    regex: /\b(?:mongodb(?:\+srv)?|postgres(?:ql)?|mysql|redis):\/\/[a-zA-Z0-9_.-]+:[^@\s]+@[a-zA-Z0-9_.-]+(?::\d+)?\/[a-zA-Z0-9_.-]*/gi,
    replacement: '[REDACTED_DB_CONNECTION_STRING]',
  },
  {
    name: 'Private RSA/EC/SSH Key',
    type: 'PRIVATE_KEY',
    regex: /-----BEGIN (?:[A-Z0-9_ ]+ )?PRIVATE KEY-----[\s\S]*?-----END (?:[A-Z0-9_ ]+ )?PRIVATE KEY-----/g,
    replacement: '[REDACTED_PRIVATE_KEY]',
  },
  {
    name: 'Stripe Secret/Public Key',
    type: 'API_KEY',
    regex: /\b(?:sk|pk)_(?:test|live)_[0-9a-zA-Z]{24,}\b/g,
    replacement: '[REDACTED_STRIPE_KEY]',
  },
  {
    name: 'Slack Token',
    type: 'TOKEN',
    regex: /\bxox[baprs]-[0-9a-zA-Z]{10,48}\b/g,
    replacement: '[REDACTED_SLACK_TOKEN]',
  },
  {
    name: 'Generic Bearer Token',
    type: 'TOKEN',
    regex: /(?<=Bearer\s+)[a-zA-Z0-9_\-\.]{25,}\b/g,
    replacement: '[REDACTED_BEARER_TOKEN]',
  },
  {
    name: 'Password in Configuration',
    type: 'PASSWORD',
    regex: /(?<=\b(?:password|passwd|pwd|secret_key|api_secret)\s*[:=]\s*["']?)[^\s"';,]{6,}(?=["']?)/gi,
    replacement: '[REDACTED_PASSWORD]',
  },
  {
    name: 'Public IPv4 Address',
    type: 'NETWORK_IP',
    regex: /\b(?:(?:1[0-9]{2}|2[0-4][0-9]|25[0-5]|[1-9]?[0-9])\.){3}(?:1[0-9]{2}|2[0-4][0-9]|25[0-5]|[1-9]?[0-9])(?::\d{2,5})?\b/g,
    replacement: '[REDACTED_IP]',
  },
];

export function sanitizeText(inputText: string): SanitizedResult {
  if (!inputText) {
    return { cleanText: '', redactedItems: [], redactedCount: 0 };
  }

  let cleanText = inputText;
  const redactedItems: RedactedItem[] = [];

  for (const rule of SANITIZER_RULES) {
    const matches = cleanText.match(rule.regex);
    if (matches && matches.length > 0) {
      for (const match of matches) {
        // Skip common harmless IP patterns like 127.0.0.1 or 0.0.0.0 if classified as IP
        if (rule.type === 'NETWORK_IP') {
          if (match.startsWith('127.0.0.1') || match.startsWith('0.0.0.0') || match.startsWith('192.168.') || match.startsWith('10.')) {
            // Keep local dev IP as is, or skip redaction for typical localhost
            continue;
          }
        }

        redactedItems.push({
          type: rule.type,
          patternName: rule.name,
          originalMatched: match.length > 12 
            ? `${match.slice(0, 4)}...${match.slice(-4)}`
            : '***',
          replacement: rule.replacement,
        });
      }

      cleanText = cleanText.replace(rule.regex, (match) => {
        if (rule.type === 'NETWORK_IP' && (match.startsWith('127.0.0.1') || match.startsWith('0.0.0.0'))) {
          return match;
        }
        return rule.replacement;
      });
    }
  }

  return {
    cleanText,
    redactedItems,
    redactedCount: redactedItems.length,
  };
}

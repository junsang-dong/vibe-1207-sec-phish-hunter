/**
 * 입력 메시지 검증 함수
 */
export function validateMessage(message: string): { valid: boolean; error?: string } {
  const trimmed = message.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: '메시지를 입력해주세요.' };
  }

  if (trimmed.length < 10) {
    return { valid: false, error: '메시지는 최소 10자 이상이어야 합니다.' };
  }

  if (trimmed.length > 2000) {
    return { valid: false, error: '메시지는 최대 2000자까지 입력 가능합니다.' };
  }

  return { valid: true };
}

/**
 * XSS 방지를 위한 기본적인 HTML 이스케이프
 */
export function sanitizeInput(input: string): string {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * URL 추출 및 하이라이트용
 */
export function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
}

/**
 * 의심스러운 도메인 패턴 검사
 */
export function isSuspiciousDomain(url: string): boolean {
  const suspiciousPatterns = [
    /kakaao?\./i,
    /naverl?\./i,
    /kakao[^t]/i,
    /bit\.ly/i,
    /tinyurl\./i,
    /t\.co/i,
    /goo\.gl/i,
  ];

  return suspiciousPatterns.some(pattern => pattern.test(url));
}


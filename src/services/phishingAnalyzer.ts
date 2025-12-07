import OpenAI from 'openai';
import type { AnalysisResult } from '../types';

const SYSTEM_PROMPT = `당신은 한국의 스미싱/피싱 메시지를 전문적으로 분석하는 보안 AI입니다.

분석 기준:
1. URL 도메인 검증 (공식 사이트 vs 유사 도메인)
   - 카카오톡: kakaotalk.com, talk.kakao.com
   - 네이버: naver.com
   - 쿠팡: coupang.com
   - CJ대한통운: cjlogistics.com
   - 유사 도메인 예: kakaao.com, naverl.com, kakaao-safe.com 등
2. 긴급성/협박성 문구 탐지
   - "즉시", "지금 당장", "24시간 내", "1시간 이내", "오늘 중"
   - "계정 정지", "압류 예정", "수사 진행"
3. 개인정보/금융정보 요구 여부
   - 계좌번호, 카드번호, 주민등록번호, 비밀번호 요구
4. 발신자 신원 확인 가능성
   - 공식 번호인지, 사칭 번호인지
5. 문법/맞춤법 오류 (사칭 징후)
6. 한국 최신 스미싱 패턴 매칭
   - 카카오/네이버 사칭
   - 결제/금융 사기
   - 택배/배송 피싱
   - 정부/공공기관 사칭
   - 고용/리워드 사기

위험 점수 산정:
- HIGH (80-100): 명백한 스미싱/피싱, 즉시 차단 필요
- MEDIUM (40-79): 의심스러운 요소 있음, 신중히 검토 필요
- LOW (0-39): 안전해 보임, 일반적인 메시지

응답 형식 (반드시 유효한 JSON만 반환):
{
  "riskScore": 0-100,
  "riskLevel": "HIGH" | "MEDIUM" | "LOW",
  "reasons": ["이유1", "이유2", "이유3 이상"],
  "actionGuide": ["조치1", "조치2", "조치3 이상"],
  "keywords": ["의심키워드1", "의심키워드2"]
}`;

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // 프론트엔드에서 사용 (프로덕션에서는 백엔드 권장)
});

export async function analyzePhishing(message: string): Promise<AnalysisResult> {
  if (!import.meta.env.VITE_OPENAI_API_KEY) {
    throw new Error('OpenAI API 키가 설정되지 않았습니다. .env 파일을 확인해주세요.');
  }

  try {
    const completion = await Promise.race([
      openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `다음 메시지를 분석해주세요:\n\n${message}` },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('요청 시간이 초과되었습니다.')), 30000)
      ),
    ]);

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('AI 응답을 받지 못했습니다.');
    }

    const result = JSON.parse(content) as AnalysisResult;

    // 응답 검증
    if (
      !result.riskScore ||
      !result.riskLevel ||
      !Array.isArray(result.reasons) ||
      !Array.isArray(result.actionGuide) ||
      !Array.isArray(result.keywords)
    ) {
      throw new Error('AI 응답 형식이 올바르지 않습니다.');
    }

    // 위험 점수 범위 검증
    if (result.riskScore < 0 || result.riskScore > 100) {
      result.riskScore = Math.max(0, Math.min(100, result.riskScore));
    }

    // 위험 레벨 자동 조정
    if (result.riskScore >= 80 && result.riskLevel !== 'HIGH') {
      result.riskLevel = 'HIGH';
    } else if (result.riskScore >= 40 && result.riskScore < 80 && result.riskLevel !== 'MEDIUM') {
      result.riskLevel = 'MEDIUM';
    } else if (result.riskScore < 40 && result.riskLevel !== 'LOW') {
      result.riskLevel = 'LOW';
    }

    return result;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('OpenAI API 키가 유효하지 않습니다.');
      }
      if (error.message.includes('rate limit')) {
        throw new Error('API 사용 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
      }
      if (error.message.includes('timeout') || error.message.includes('시간이 초과')) {
        throw new Error('요청 시간이 초과되었습니다. 네트워크를 확인하고 다시 시도해주세요.');
      }
      throw error;
    }
    throw new Error('알 수 없는 오류가 발생했습니다.');
  }
}


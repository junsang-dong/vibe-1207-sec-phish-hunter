import type { AnalysisResult as AnalysisResultType, RiskLevel } from '../types';
import { extractUrls, isSuspiciousDomain } from '../utils/validators';

interface AnalysisResultProps {
  result: AnalysisResultType;
  message: string;
  onReset: () => void;
  onCopy: () => void;
}

const riskLevelConfig: Record<RiskLevel, { emoji: string; bgColor: string; borderColor: string; textColor: string }> = {
  HIGH: {
    emoji: '🔴',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
    textColor: 'text-red-800',
  },
  MEDIUM: {
    emoji: '🟡',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-300',
    textColor: 'text-yellow-800',
  },
  LOW: {
    emoji: '🟢',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300',
    textColor: 'text-green-800',
  },
};

export function AnalysisResult({ result, message, onReset, onCopy }: AnalysisResultProps) {
  const config = riskLevelConfig[result.riskLevel];
  const urls = extractUrls(message);

  const handleCopy = async () => {
    const resultText = `
위험도: ${result.riskLevel} (${result.riskScore}점)

의심 근거:
${result.reasons.map((r, i) => `${i + 1}. ${r}`).join('\n')}

대응 가이드:
${result.actionGuide.map((a, i) => `${i + 1}. ${a}`).join('\n')}

의심 키워드: ${result.keywords.join(', ')}
    `.trim();

    try {
      await navigator.clipboard.writeText(resultText);
      onCopy();
    } catch (err) {
      console.error('복사 실패:', err);
    }
  };

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <div className={`${config.bgColor} border-2 ${config.borderColor} rounded-lg p-6 shadow-md`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{config.emoji}</span>
            <div>
              <h3 className={`text-xl font-bold ${config.textColor}`}>
                위험도: {result.riskLevel}
              </h3>
              <p className={`text-sm ${config.textColor} opacity-80`}>
                위험 점수: {result.riskScore}점
              </p>
            </div>
          </div>
          {result.riskLevel === 'HIGH' && (
            <div className="animate-pulse-slow">
              <span className="text-2xl">⚠️</span>
            </div>
          )}
        </div>

        <div className="space-y-4 mt-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <span>⚠️</span>
              <span>의심 근거</span>
            </h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {result.reasons.map((reason, index) => (
                <li key={index} className="pl-2">
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <span>💡</span>
              <span>대응 가이드</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-gray-700">
              {result.actionGuide.map((guide, index) => (
                <li key={index} className="pl-2">
                  {guide}
                </li>
              ))}
            </ol>
          </div>

          {result.keywords.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <span>🔑</span>
                <span>주요 위험 키워드</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {urls.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <span>🔗</span>
                <span>발견된 URL</span>
              </h4>
              <div className="space-y-2">
                {urls.map((url, index) => {
                  const suspicious = isSuspiciousDomain(url);
                  return (
                    <div
                      key={index}
                      className={`p-2 rounded border-2 ${
                        suspicious
                          ? 'bg-red-50 border-red-300'
                          : 'bg-gray-50 border-gray-300'
                      }`}
                    >
                      <p className="text-sm font-mono break-all text-gray-700">
                        {url}
                        {suspicious && (
                          <span className="ml-2 text-red-600 font-semibold">⚠️ 의심스러운 도메인</span>
                        )}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onReset}
          className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
        >
          새로 분석하기
        </button>
        <button
          onClick={handleCopy}
          className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          결과 복사
        </button>
      </div>
    </div>
  );
}


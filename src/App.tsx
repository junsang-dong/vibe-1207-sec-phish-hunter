import { useState } from 'react';
import { MessageInput } from './components/MessageInput';
import { AnalysisResult } from './components/AnalysisResult';
import { LoadingSpinner } from './components/LoadingSpinner';
import { analyzePhishing } from './services/phishingAnalyzer';
import type { AnalysisResult as AnalysisResultType } from './types';

function App() {
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<AnalysisResultType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState(false);

  const handleAnalyze = async () => {
    if (message.trim().length < 10) {
      setError('메시지는 최소 10자 이상이어야 합니다.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);
    setCopySuccess(false);

    try {
      const analysisResult = await analyzePhishing(message);
      setResult(analysisResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : '분석 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessage('');
    setResult(null);
    setError('');
    setCopySuccess(false);
  };

  const handleCopy = () => {
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <span>🎣</span>
            <span>PhishHunter Lite</span>
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            스미싱 메시지를 분석해드립니다
          </p>
        </header>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-6">
          {!result && !isLoading && (
            <MessageInput
              value={message}
              onChange={setMessage}
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
              error={error}
            />
          )}

          {isLoading && <LoadingSpinner />}

          {error && !isLoading && !result && (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 text-center">
              <p className="text-red-800 font-semibold mb-2">⚠️ 오류 발생</p>
              <p className="text-red-600">{error}</p>
              <button
                onClick={handleReset}
                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                다시 시도
              </button>
            </div>
          )}

          {result && !isLoading && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">분석 결과</h2>
                <AnalysisResult
                  result={result}
                  message={message}
                  onReset={handleReset}
                  onCopy={handleCopy}
                />
              </div>
              {copySuccess && (
                <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in">
                  결과가 클립보드에 복사되었습니다! ✅
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500 mt-8">
          <p>⚠️ 이 도구는 참고용입니다. 최종 판단은 사용자 본인이 해야 합니다.</p>
          <p className="mt-2">
            의심스러운 메시지는{' '}
            <a
              href="https://www.kisa.or.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              한국인터넷진흥원
            </a>
            에 신고하세요.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;

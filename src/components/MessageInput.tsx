import { useState } from 'react';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  error?: string;
}

export function MessageInput({ value, onChange, onAnalyze, isLoading, error }: MessageInputProps) {
  const [localError, setLocalError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (value.trim().length < 10) {
      setLocalError('메시지는 최소 10자 이상이어야 합니다.');
      return;
    }

    if (value.trim().length > 2000) {
      setLocalError('메시지는 최대 2000자까지 입력 가능합니다.');
      return;
    }

    onAnalyze();
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            의심스러운 메시지를 여기에 붙여넣기
          </label>
          <textarea
            id="message"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setLocalError('');
            }}
            placeholder="예: [카카오] 본인인증 필요합니다&#10;아래 링크에서 즉시 인증하세요&#10;http://kakaao-safe.com/verify&#10;24시간 내 미인증시 계정 정지"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-all"
            rows={6}
            disabled={isLoading}
            maxLength={2000}
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-500">
              {value.length} / 2000자
            </p>
            {(error || localError) && (
              <p className="text-xs text-red-500">{error || localError}</p>
            )}
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading || value.trim().length < 10}
          className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>분석 중...</span>
            </>
          ) : (
            <>
              <span>🔍</span>
              <span>분석하기</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}


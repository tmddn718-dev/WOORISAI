import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/** 키보드 테스트용 작성 화면: 입력칸이 여러 개이고, 하단 버튼은 본문 아래에 고정된다. */
export default function Compose() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const submit = e => { e.preventDefault(); if (title.trim()) navigate(-1); };
  return (
    <form onSubmit={submit} className="flex min-h-full flex-col gap-4 px-4 py-4">
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-gray-600">제목</span>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="제목을 입력하세요" enterKeyHint="next" autoComplete="off"
          className="h-12 w-full rounded-xl border border-gray-200 px-4 outline-none focus:border-brand focus:ring-2 focus:ring-brand/30" />
      </label>
      <label className="block flex-1">
        <span className="mb-1 block text-sm font-medium text-gray-600">내용</span>
        <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="내용을 입력하세요" rows={8}
          className="min-h-48 w-full resize-none rounded-xl border border-gray-200 p-4 outline-none focus:border-brand focus:ring-2 focus:ring-brand/30" />
      </label>
      {/* sticky: 본문 아래쪽에 붙어 있고, 키보드가 뜨면 줄어든 앱 영역 안에서 함께 올라온다 */}
      <div className="sticky bottom-0 -mx-4 mt-auto border-t border-gray-100 bg-white px-4 pb-safe pt-3">
        <button type="submit" disabled={!title.trim()} className="mb-3 h-12 w-full rounded-xl bg-brand font-semibold text-white transition active:scale-[.98] disabled:bg-gray-200 disabled:text-gray-400">
          저장하기
        </button>
      </div>
    </form>
  );
}

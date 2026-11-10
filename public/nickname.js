// 닉네임 규칙과 추천 사전. 화면 안내(클라이언트)와 최종 검증(서버)이 이 파일 하나를 함께 쓴다.
export const NICK_MIN = 2, NICK_MAX = 16;
export const NICK_HINT = '한글·영문·숫자·일부 특수문자(_ . - ! ? ~ ♡ ☆), 2~16자예요.';

// 화면에 보이는 글자(grapheme) 기준으로 센다. string.length나 코드포인트 수를 쓰지 않는다.
const seg = new Intl.Segmenter('ko', { granularity: 'grapheme' });
export const graphemes = s => [...seg.segment(String(s ?? ''))].length;

const ALLOWED = /^[가-힣ㄱ-ㅎㅏ-ㅣA-Za-z0-9_.\-!?~♡☆ ]+$/u; // 이모지는 v1.1에서 불허
const INVISIBLE = /[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/u; // 줄바꿈·제로폭·방향 제어 문자
// 운영자·공식 계정 사칭, 비속어. 검수 담당자가 정기적으로 갱신하는 목록이다.
const IMPERSONATION = ['운영자', '관리자', '우리사이', 'woorisai', 'admin', 'official', '공식', '고객센터', '운영팀'];
const PROFANITY = ['시발', '씨발', 'ㅅㅂ', 'ㅂㅅ', '병신', '개새끼', '좆', 'fuck'];
const squash = s => s.toLowerCase().replace(/[\s_.\-!?~♡☆]/g, '');

const MSG = {
  NICKNAME_EMPTY: '닉네임을 입력해 주세요.',
  NICKNAME_TOO_SHORT: '닉네임은 2자 이상 입력해 주세요.',
  NICKNAME_TOO_LONG: '닉네임은 16자 이내로 입력해 주세요.',
  NICKNAME_INVALID_CHAR: '사용할 수 없는 문자가 포함되어 있어요.',
  NICKNAME_RESTRICTED: '다른 닉네임을 사용해 주세요.',
};
const bad = code => ({ ok: false, code, message: MSG[code] });

// 서버와 클라이언트가 같은 순서로 검사한다: 정규화 → 비가시 문자 → 공백 정리 → 글자 수 → 허용 문자 → 제한 표현
export function validateNickname(raw) {
  let v = String(raw ?? '').normalize('NFC');
  if (INVISIBLE.test(v)) return bad('NICKNAME_INVALID_CHAR');
  v = v.replace(/\s+/g, ' ').trim();
  if (!v) return bad('NICKNAME_EMPTY');
  const n = graphemes(v);
  if (n > NICK_MAX) return bad('NICKNAME_TOO_LONG');
  if (n < NICK_MIN) return bad('NICKNAME_TOO_SHORT');
  if (!ALLOWED.test(v)) return bad('NICKNAME_INVALID_CHAR');
  const k = squash(v);
  if ([...IMPERSONATION, ...PROFANITY].some(w => k.includes(w)) || /\d{8,}/.test(k)) return bad('NICKNAME_RESTRICTED'); // 전화번호 같은 긴 숫자열 포함
  return { ok: true, value: v };
}

// 검수된 수식어 + 검수된 명사. 모든 조합은 test.js가 규칙을 통과하는지 검사한다.
export const ADJECTIVES = ['소통하는', '춤추는', '졸린', '신나는', '수줍은', '여행하는', '반짝이는', '느긋한', '말랑한', '포근한', '다정한', '엉뚱한', '든든한', '상냥한', '씩씩한', '활기찬', '차분한', '따뜻한', '몽글몽글', '달콤한', '푸근한', '명랑한', '느릿한', '재빠른', '노래하는', '산책하는', '낮잠자는', '꿈꾸는', '설레는', '웃고있는'];
export const NOUNS = ['간짜장', '고구마', '물개', '감자', '판다', '복숭아', '펭귄', '두부', '구름', '붕어빵', '호빵', '도토리', '고래', '수달', '토끼', '햄스터', '오리', '마카롱', '푸딩', '만두', '떡볶이', '곰돌이', '다람쥐', '해바라기', '별빛', '달팽이', '코알라', '귤', '새싹', '솜사탕'];
const SAFE = ['포근한구름', '다정한두부', '말랑한푸딩', '느긋한수달', '차분한새싹'];

const pickOne = a => a[Math.floor(Math.random() * a.length)];
// 직전 추천 몇 개(recent)는 피한다. 네트워크 없이 동작한다.
export function suggest(recent = []) {
  for (let i = 0; i < 20; i++) {
    const v = pickOne(ADJECTIVES) + pickOne(NOUNS);
    if (!recent.includes(v) && validateNickname(v).ok) return v;
  }
  return pickOne(SAFE.filter(s => !recent.includes(s))) || pickOne(SAFE);
}

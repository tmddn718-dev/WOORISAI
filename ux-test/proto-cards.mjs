// 홈 '다가오는 약속' 카드 + 발자국 지역 상세 '이곳의 추억' 카드 개선. 두 카드 안의 정보 구조·정렬만 바꾼다(색·서체·사진 크롭·아이콘 체계는 기존 토큰 그대로).
// 마크업 치환은 build.mjs 가 되돌려 원본과 같은지 검사한다.

// 1) 약속 카드: 오른쪽 고정 배지 열을 없애고, 상태를 제목·시간·장소·참석자 아래 별도 행으로.
//    - 내 응답(참석/응답 전/…): 응답 상태 알약 1개. 내가 만든 약속은 '생성자 정보'라 알약이 아닌 텍스트로, 응답 상태와 독립으로 표시.
//    - 변경됨: 알약 대신 데이터에 실제로 있는 변경 문장을 알림 행으로(없는 내용은 만들지 않는다).
const PLAN_OLD = `                      <span style="font:var(--type-label-2);color:var(--ws-color-fg-tertiary);white-space:nowrap">{{ p.goingText }}</span>
                    </span>
                  </span>
                  <span style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex:none">
                    <span style="padding:3px 10px;border-radius:9999px;font:var(--type-label-2);white-space:nowrap;background:{{ p.myBg }};color:{{ p.myFg }}">{{ p.myLabel }}</span>
                    <sc-if value="{{ p.hasChanged }}" hint-placeholder-val="{{ false }}"><span style="padding:2px 8px;border-radius:9999px;font:var(--type-caption-1);white-space:nowrap;background:var(--ws-badge-info-bg);color:var(--ws-badge-info-fg)">변경됨</span></sc-if>
                  </span>`;
const PLAN_NEW = `                      <span style="font:var(--type-label-2);color:var(--ws-color-fg-tertiary);white-space:nowrap">{{ p.goingText }}</span>
                    </span>
                    <span style="display:flex;align-items:center;flex-wrap:wrap;gap:6px 10px;margin-top:4px">
                      <sc-if value="{{ p.showResp }}" hint-placeholder-val="{{ true }}"><span style="display:inline-flex;align-items:center;gap:6px;font:var(--type-label-2);color:var(--ws-color-fg-tertiary);white-space:nowrap">내 응답<span style="padding:2px 10px;border-radius:9999px;font:var(--type-label-2);background:{{ p.myBg }};color:{{ p.myFg }}">{{ p.myLabel }}</span></span></sc-if>
                      <sc-if value="{{ p.isHost }}" hint-placeholder-val="{{ false }}"><span style="font:var(--type-label-2);color:var(--ws-color-fg-brand);white-space:nowrap">내가 만든 약속</span></sc-if>
                    </span>
                    <sc-if value="{{ p.hasChanged }}" hint-placeholder-val="{{ false }}"><span style="display:flex;align-items:flex-start;gap:6px;margin-top:2px;font:var(--type-caption-1);color:var(--ws-badge-info-fg)"><lucide-icon name="info" size="14" style="flex:none;margin-top:1px"></lucide-icon><span style="min-width:0;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">{{ p.changeText }}</span></span></sc-if>
                  </span>`;

// 2) 지역 상세 '이곳의 추억' 카드: 제목은 늘 2줄 높이(1줄이어도 같은 높이, 3줄 이상은 2줄 말줄임)라 날짜·장소와 참여·개수 줄이 모든 카드에서 같은 세로 위치에서 시작한다.
//    참여자 이름이 길어도 사진·이야기 개수는 밀려나지 않게 개수만 고정폭으로 둔다.
const MEM_OLD = `                <span style="display:flex;flex-direction:column;gap:3px;min-width:0;flex:1">
                  <span style="font:var(--type-headline-2);color:var(--ws-color-fg-strong)">{{ m.title }}</span>
                  <span style="font:var(--type-label-2);color:var(--ws-color-fg-tertiary)">{{ m.rangeShort }} · {{ m.p }}</span>
                  <span style="font:var(--type-label-2);color:var(--ws-color-fg-secondary)">{{ m.withShort }} · {{ m.counts }}</span>
                </span>
                <lucide-icon name="chevron-right" size="20"></lucide-icon>
              </div>
            </sc-for>
          </section>`;
const MEM_NEW = `                <span style="display:flex;flex-direction:column;gap:3px;min-width:0;flex:1">
                  <span style="font:var(--type-headline-2);color:var(--ws-color-fg-strong);min-height:2lh;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow-wrap:anywhere">{{ m.title }}</span>
                  <span style="font:var(--type-label-2);color:var(--ws-color-fg-tertiary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ m.rangeShort }} · {{ m.p }}</span>
                  <span style="display:flex;gap:4px;min-width:0;font:var(--type-label-2);color:var(--ws-color-fg-secondary)"><span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ m.withShort }}</span><span style="flex:none;white-space:nowrap">· {{ m.counts }}</span></span>
                </span>
                <lucide-icon name="chevron-right" size="20" style="flex:none"></lucide-icon>
              </div>
            </sc-for>
          </section>`;
export const CARDS_MARKUP = [[PLAN_OLD, PLAN_NEW], [MEM_OLD, MEM_NEW]];
export const CARDS_LOGIC = [
  ["myLabel: state === 'cancelled' ? '취소됨' : MY[0],", "isHost: p.host === ME, showResp: p.host !== ME || state === 'cancelled', changeText: p.changed ? String(p.changed).split(' · ')[0] : '',\n        myLabel: state === 'cancelled' ? '취소됨' : MY[0],"],
];

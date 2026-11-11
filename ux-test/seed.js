// UX 테스트 전용 가상 데이터. 실제 서버 데이터가 아니며, 실제 권한 정책을 구현한 것도 아니다.
export const FRIEND_POOL = [
  { id: 101, name: '민수', username: 'minsu' },
  { id: 102, name: '지아', username: 'jia' },
  { id: 103, name: '하은', username: 'haeun' },
  { id: 104, name: '민지', username: 'minji' },
  { id: 105, name: '지호', username: 'jiho' },
  { id: 106, name: '도윤', username: 'doyun' },
  { id: 107, name: '유나', username: 'yuna' },
  { id: 108, name: '준서', username: 'junseo' }
];
// 가입에 쓸 수 없는 이름(서버의 예약어·사용 중 이름을 흉내낸 것)
export const TAKEN = ['admin', 'woooyaa', 'woorisai', 'test', 'demo', ...FRIEND_POOL.map(f => f.username)];
export const ME_ID = 1;
// 시드 사진 (직접 만든 단색 그라데이션 SVG). 샘플 추억이 아닌 미디어의 대체 이미지로만 쓴다
export const SEED_PHOTOS = ['seed-1.svg', 'seed-2.svg', 'seed-3.svg'];

// 체험용 "기존 사용자" 샘플 계정(username: demo). 브라우저 안의 가상 데이터이며 실제 사용자 데이터와 무관하다.
// 샘플 추억 24개는 Claude Design 최종 시안(우리사이 인터랙티브 프로토타입)의 데이터를 그대로 옮긴 것이다(제목·날짜·장소·참여자·대표 사진·순서).
export const DEMO_USER = { id: ME_ID, name: '서연', username: 'demo', mem_enabled: true };
export const DEMO_FRIENDS = [104, 105, 103, 106, 107, 108]; // 민지, 지호, 하은, 도윤, 유나, 준서
// 샘플 사진: 미디어 id -> 정적 파일. 출처와 라이선스는 ux-test/images/unsplash/CREDITS.md
export const SEED_MEDIA = {
  "90001": "/ux-test/images/unsplash/mem-han.jpg",
  "90002": "/ux-test/images/unsplash/mem-bday.jpg",
  "90003": "/ux-test/images/unsplash/mem-cafe.jpg",
  "90004": "/ux-test/images/unsplash/mem-jeju.jpg",
  "90005": "/ux-test/images/unsplash/mem-expo.jpg",
  "90006": "/ux-test/images/unsplash/mem-cookie.jpg",
  "90007": "/ux-test/images/unsplash/mem-gwangan.jpg",
  "90008": "/ux-test/images/unsplash/mem-gamcheon.jpg",
  "90009": "/ux-test/images/unsplash/mem-haeundae.jpg",
  "90010": "/ux-test/images/unsplash/mem-busanst.jpg",
  "90011": "/ux-test/images/unsplash/mem-gyeongpo.jpg",
  "90012": "/ux-test/images/unsplash/mem-anmok.jpg",
  "90013": "/ux-test/images/unsplash/mem-house.jpg",
  "90014": "/ux-test/images/unsplash/mem-banpo.jpg",
  "90015": "/ux-test/images/unsplash/mem-incheon.jpg",
  "90016": "/ux-test/images/unsplash/mem-namsan.jpg",
  "90017": "/ux-test/images/unsplash/mem-yeosu.jpg",
  "90018": "/ux-test/images/unsplash/mem-udo.jpg",
  "90019": "/ux-test/images/unsplash/mem-aewol.jpg",
  "90020": "/ux-test/images/unsplash/mem-taean.jpg",
  "90021": "/ux-test/images/unsplash/mem-forest.jpg",
  "90022": "/ux-test/images/unsplash/mem-minji.jpg",
  "90023": "/ux-test/images/unsplash/mem-euljiro.jpg",
  "90024": "/ux-test/images/unsplash/mem-first.jpg",
  "90025": "/ux-test/images/unsplash/jeju-fall.jpg",
  "90026": "/ux-test/images/unsplash/jeju-flower.jpg",
  "90027": "/ux-test/images/unsplash/jeju-sea.jpg",
  "90028": "/ux-test/images/unsplash/jeju-house.jpg",
  "90029": "/ux-test/images/unsplash/jeju-light.jpg",
  "90030": "/ux-test/images/unsplash/jeju-cliff.jpg"
};
export const DEMO_POSTS = [
  {
    "id": 324,
    "title": "가을 끝 한강, 돗자리 위에서 노을까지",
    "occurred_on": "2026-11-08",
    "place": {
      "name": "",
      "area": "망원한강공원",
      "city": "서울",
      "country": "대한민국",
      "precision": "area"
    },
    "members": [
      104,
      105,
      103
    ],
    "accepted": [
      104,
      105,
      103
    ],
    "media": [
      90001
    ],
    "notes": [
      {
        "id": 401,
        "kind": "story",
        "by": null,
        "text": "해 지는 걸 보려고 다섯 시부터 자리 잡았다."
      }
    ]
  },
  {
    "id": 323,
    "title": "하은이 서른 번째 생일, 연남동 작은 케이크 가게에서 다 같이 노래 부른 밤",
    "occurred_on": "2026-10-31",
    "place": {
      "name": "",
      "area": "연남동",
      "city": "서울",
      "country": "대한민국",
      "precision": "area"
    },
    "members": [
      103,
      104,
      107,
      108
    ],
    "accepted": [
      103,
      104,
      107,
      108
    ],
    "media": [
      90002
    ],
    "notes": [
      {
        "id": 402,
        "kind": "story",
        "by": null,
        "text": "촛불 서른 개 꽂느라 케이크가 다 녹을 뻔했다."
      }
    ]
  },
  {
    "id": 322,
    "title": "성수 골목 카페 투어",
    "occurred_on": "2026-10-18",
    "place": {
      "name": "",
      "area": "성수동",
      "city": "서울",
      "country": "대한민국",
      "precision": "area"
    },
    "members": [
      107
    ],
    "accepted": [
      107
    ],
    "media": [
      90003
    ],
    "notes": [
      {
        "id": 403,
        "kind": "story",
        "by": null,
        "text": "세 군데 중 두 번째 집 라떼가 제일이었다."
      }
    ]
  },
  {
    "id": 321,
    "title": "제주 2박 3일, 비 그친 뒤의 오름",
    "occurred_on": "2026-10-03",
    "place": {
      "name": "",
      "area": "서귀포",
      "city": "제주",
      "country": "대한민국",
      "precision": "area"
    },
    "members": [
      104,
      105,
      103
    ],
    "accepted": [
      104,
      105,
      103
    ],
    "media": [
      90004,
      90025,
      90026,
      90027,
      90028,
      90029,
      90030,
      90018
    ],
    "notes": [
      {
        "id": 404,
        "kind": "story",
        "by": null,
        "text": "비가 그치자마자 오름에 올랐다. 안개가 천천히 걷히는 걸 넷이서 한참 말없이 봤다."
      },
      {
        "id": 405,
        "kind": "story",
        "by": "민지",
        "text": "협재에서 해 질 때까지. 다음엔 꼭 일주일 있자."
      },
      {
        "id": 406,
        "kind": "story",
        "by": "지호",
        "text": "마지막 날 아침, 숙소 앞 바다."
      },
      {
        "id": 407,
        "kind": "story",
        "by": "하은",
        "text": "렌터카 반납하기 30분 전, 마지막으로 들른 등대."
      }
    ]
  },
  {
    "id": 320,
    "title": "전시 보고 나와서 한참 걸었던 날",
    "occurred_on": "2026-09-20",
    "place": {
      "name": "",
      "area": "종로",
      "city": "서울",
      "country": "대한민국",
      "precision": "area"
    },
    "members": [
      106
    ],
    "accepted": [
      106
    ],
    "media": [
      90005
    ],
    "notes": [
      {
        "id": 408,
        "kind": "story",
        "by": null,
        "text": "전시보다 나와서 걸은 길이 더 기억에 남는다."
      }
    ]
  },
  {
    "id": 319,
    "title": "유나가 구워 온 쿠키와 긴 오후",
    "occurred_on": "2026-09-06",
    "place": {
      "name": "",
      "area": "연희동",
      "city": "서울",
      "country": "대한민국",
      "precision": "area"
    },
    "members": [
      107,
      103
    ],
    "accepted": [
      107,
      103
    ],
    "media": [
      90006
    ],
    "notes": []
  },
  {
    "id": 318,
    "title": "광안리 밤바다 산책",
    "occurred_on": "2026-08-17",
    "place": {
      "name": "",
      "area": "광안리",
      "city": "부산",
      "country": "대한민국",
      "precision": "area"
    },
    "members": [
      105,
      106,
      108
    ],
    "accepted": [
      105,
      106,
      108
    ],
    "media": [
      90007
    ],
    "notes": [
      {
        "id": 409,
        "kind": "story",
        "by": null,
        "text": "다리 불빛이 꺼질 때까지 모래사장에 앉아 있었다."
      }
    ]
  },
  {
    "id": 317,
    "title": "감천마을 계단 끝까지",
    "occurred_on": "2026-08-16",
    "place": {
      "name": "",
      "area": "감천문화마을",
      "city": "부산",
      "country": "대한민국",
      "precision": "area"
    },
    "members": [
      105,
      106,
      108
    ],
    "accepted": [
      105,
      106,
      108
    ],
    "media": [
      90008
    ],
    "notes": []
  },
  {
    "id": 316,
    "title": "해운대 아침 수영",
    "occurred_on": "2026-08-15",
    "place": {
      "name": "",
      "area": "해운대",
      "city": "부산",
      "country": "대한민국",
      "precision": "area"
    },
    "members": [
      105,
      106,
      108
    ],
    "accepted": [
      105,
      106,
      108
    ],
    "media": [
      90009
    ],
    "notes": []
  },
  {
    "id": 315,
    "title": "KTX 타고 부산 도착, 첫 끼는 돼지국밥",
    "occurred_on": "2026-08-15",
    "place": {
      "name": "",
      "area": "부산역",
      "city": "부산",
      "country": "대한민국",
      "precision": "area"
    },
    "members": [
      105,
      106,
      108
    ],
    "accepted": [
      105,
      106,
      108
    ],
    "media": [
      90010
    ],
    "notes": []
  },
  {
    "id": 314,
    "title": "경포 바다까지 걸어간 저녁",
    "occurred_on": "2026-07-13",
    "place": {
      "name": "",
      "area": "강릉 경포",
      "city": "강원",
      "country": "대한민국",
      "precision": "area"
    },
    "members": [
      104,
      107
    ],
    "accepted": [
      104,
      107
    ],
    "media": [
      90011
    ],
    "notes": []
  },
  {
    "id": 313,
    "title": "강릉 안목해변 커피거리",
    "occurred_on": "2026-07-12",
    "place": {
      "name": "",
      "area": "강릉 안목해변",
      "city": "강원",
      "country": "대한민국",
      "precision": "area"
    },
    "members": [
      104,
      107
    ],
    "accepted": [
      104,
      107
    ],
    "media": [
      90012
    ],
    "notes": []
  },
  {
    "id": 312,
    "title": "도윤이 집들이, 처음 해본 밀푀유나베",
    "occurred_on": "2026-06-27",
    "place": {
      "name": "",
      "area": "성남 분당",
      "city": "경기",
      "country": "대한민국",
      "precision": "area"
    },
    "members": [
      106,
      108,
      105
    ],
    "accepted": [
      106,
      108,
      105
    ],
    "media": [
      90013
    ],
    "notes": []
  },
  {
    "id": 311,
    "title": "퇴근하고 반포 무지개분수",
    "occurred_on": "2026-06-18",
    "place": {
      "name": "",
      "area": "반포한강공원",
      "city": "서울",
      "country": "대한민국",
      "precision": "area"
    },
    "members": [
      105
    ],
    "accepted": [
      105
    ],
    "media": [
      90014
    ],
    "notes": []
  },
  {
    "id": 310,
    "title": "인천대교 건너 영종도 드라이브",
    "occurred_on": "2026-06-07",
    "place": {
      "name": "",
      "area": "영종도",
      "city": "인천",
      "country": "대한민국",
      "precision": "area"
    },
    "members": [
      108
    ],
    "accepted": [
      108
    ],
    "media": [
      90015
    ],
    "notes": []
  },
  {
    "id": 309,
    "title": "남산 아래 야경 보러",
    "occurred_on": "2026-05-30",
    "place": {
      "name": "",
      "area": "남산",
      "city": "서울",
      "country": "대한민국",
      "precision": "area"
    },
    "members": [
      106
    ],
    "accepted": [
      106
    ],
    "media": [
      90016
    ],
    "notes": []
  },
  {
    "id": 308,
    "title": "여수 밤바다, 케이블카에서 본 다리",
    "occurred_on": "2026-05-23",
    "place": {
      "name": "",
      "area": "여수 돌산",
      "city": "전남",
      "country": "대한민국",
      "precision": "area"
    },
    "members": [
      103,
      104
    ],
    "accepted": [
      103,
      104
    ],
    "media": [
      90017
    ],
    "notes": []
  },
  {
    "id": 307,
    "title": "우도 한 바퀴, 자전거로",
    "occurred_on": "2026-05-10",
    "place": {
      "name": "",
      "area": "우도",
      "city": "제주",
      "country": "대한민국",
      "precision": "area"
    },
    "members": [
      107
    ],
    "accepted": [
      107
    ],
    "media": [
      90018
    ],
    "notes": []
  },
  {
    "id": 306,
    "title": "제주 한 달 살기 중인 유나 만나러",
    "occurred_on": "2026-05-09",
    "place": {
      "name": "",
      "area": "애월",
      "city": "제주",
      "country": "대한민국",
      "precision": "area"
    },
    "members": [
      107
    ],
    "accepted": [
      107
    ],
    "media": [
      90019
    ],
    "notes": []
  },
  {
    "id": 305,
    "title": "태안 유채꽃 바닷길",
    "occurred_on": "2026-04-19",
    "place": {
      "name": "",
      "area": "태안",
      "city": "충남",
      "country": "대한민국",
      "precision": "area"
    },
    "members": [
      105
    ],
    "accepted": [
      105
    ],
    "media": [
      90020
    ],
    "notes": []
  },
  {
    "id": 304,
    "title": "서울숲 벚꽃 피크닉",
    "occurred_on": "2026-04-05",
    "place": {
      "name": "",
      "area": "서울숲",
      "city": "서울",
      "country": "대한민국",
      "precision": "area"
    },
    "members": [
      104,
      103,
      107
    ],
    "accepted": [
      104,
      103,
      107
    ],
    "media": [
      90021
    ],
    "notes": []
  },
  {
    "id": 303,
    "title": "민지 생일, 촛불 두 번 끈 날",
    "occurred_on": "2026-03-28",
    "place": {
      "name": "",
      "area": "합정",
      "city": "서울",
      "country": "대한민국",
      "precision": "area"
    },
    "members": [
      104,
      103,
      107
    ],
    "accepted": [
      104,
      103,
      107
    ],
    "media": [
      90022
    ],
    "notes": []
  },
  {
    "id": 302,
    "title": "을지로 다방에서 밤 열한 시까지",
    "occurred_on": "2026-03-14",
    "place": {
      "name": "",
      "area": "을지로",
      "city": "서울",
      "country": "대한민국",
      "precision": "area"
    },
    "members": [
      108,
      106
    ],
    "accepted": [
      108,
      106
    ],
    "media": [
      90023
    ],
    "notes": []
  },
  {
    "id": 301,
    "title": "우리사이 첫 기록, 망원동 브런치",
    "occurred_on": "2026-03-07",
    "place": {
      "name": "",
      "area": "망원동",
      "city": "서울",
      "country": "대한민국",
      "precision": "area"
    },
    "members": [
      104
    ],
    "accepted": [
      104
    ],
    "media": [
      90024
    ],
    "notes": []
  }
];

// 체험용 샘플 약속(시안의 약속 6개). 날짜는 접속 시점 기준 상대값이라 항상 '다가오는/지난' 구분이 유지된다. 참여자 id 는 FRIEND_POOL, 나는 ME_ID.
export const demoPlans = (now = Date.now()) => {
  const at = (d, h, m = 0) => { const x = new Date(now); x.setDate(x.getDate() + d); x.setHours(h, m, 0, 0); return x.toISOString(); };
  return [
    { id: 901, title: '민지 이사 축하 저녁', starts_at: at(3, 19, 30), place: '망원동 작은 식당', descr: '집들이 선물은 각자 작은 걸로!', organizer_id: 104, status: 'active', parts: { [ME_ID]: 'yes', 103: 'yes', 105: 'maybe', 104: 'yes' }, changed: '장소가 합정에서 망원동 작은 식당으로 바뀌었어요 · 민지님이 어제 수정', post_ids: [] },
    { id: 902, title: '하은이네 김장 돕기', starts_at: at(5, 11), place: '', descr: '앞치마랑 고무장갑 챙겨 오기', organizer_id: 103, status: 'active', parts: { [ME_ID]: 'invited', 107: 'yes', 104: 'invited', 103: 'yes' }, post_ids: [] },
    { id: 903, title: '부산 당일치기', starts_at: at(12, 8), place: '부산역', descr: '', organizer_id: 105, status: 'cancelled', parts: { [ME_ID]: 'yes', 106: 'yes', 108: 'yes', 105: 'yes' }, post_ids: [] },
    { id: 904, title: '연말 홈파티 장보기', starts_at: at(24, 18), place: '', descr: '', organizer_id: ME_ID, status: 'active', parts: { [ME_ID]: 'yes', 104: 'yes', 105: 'maybe', 107: 'invited', 108: 'no' }, post_ids: [] },
    { id: 905, title: '망원 보드게임 카페', starts_at: at(-10, 15), place: '망원동 보드게임 카페', descr: '지는 사람이 음료 사기', organizer_id: ME_ID, status: 'active', parts: { [ME_ID]: 'yes', 104: 'yes', 105: 'yes', 106: 'no' }, post_ids: [] },
    { id: 906, title: '한강 노을 피크닉', starts_at: new Date('2026-11-08T17:00:00+09:00').toISOString(), place: '망원한강공원', descr: '', organizer_id: 103, status: 'active', parts: { [ME_ID]: 'yes', 104: 'yes', 105: 'yes', 103: 'yes' }, post_ids: [324] }
  ];
};

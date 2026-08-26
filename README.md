# DB-Toolbox

학교스포츠클럽 출석 관리 + 댄스 표현하기 평가 시스템

## 🚀 배포

### 접속 링크
- **관리 페이지**: https://db-toolbox-nine.vercel.app
- **학생용 출석**: https://db-toolbox-nine.vercel.app?mode=attendance
- **댄스 평가**: https://db-toolbox-nine.vercel.app?mode=dance

## 🔧 개발 환경 설정

### 1. 환경 변수 설정

`.env.local` 파일을 생성합니다 (`.env.local.example` 참고):

```bash
cp .env.local.example .env.local
```

그 후 `.env.local`에 다음 값을 입력:
```
VITE_FIREBASE_API_KEY=<your-api-key>
VITE_FIREBASE_AUTH_DOMAIN=db-toolbox-58d1d.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://db-toolbox-58d1d-default-rtdb.asia-southeast1.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=db-toolbox-58d1d
VITE_FIREBASE_STORAGE_BUCKET=db-toolbox-58d1d.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=957810102903
VITE_FIREBASE_APP_ID=1:957810102903:web:e55c954ce22e37aed5ac72
```

### 2. 개발 서버 시작

```bash
npm install
npm run dev
```

http://localhost:5174 에서 실행됩니다.

## 🔒 보안 설정

### Firebase 설정 체크리스트

#### 1. API Key 제한 (필수)
https://console.cloud.google.com/apis/credentials/keys?project=db-toolbox-58d1d

- **HTTP Referrer 설정**:
  - `https://db-toolbox-nine.vercel.app/*`
  - `https://db-toolbox.vercel.app/*`
  - `http://localhost:5174/*`

- **API 제한**:
  - Cloud Firestore API만 활성화
  - Realtime Database API 제외

#### 2. Firestore 보안 규칙
https://console.firebase.google.com/project/db-toolbox-58d1d/firestore/rules

```json
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### 3. Realtime Database 보안 규칙
https://console.firebase.google.com/project/db-toolbox-58d1d/database/db-toolbox-58d1d-default-rtdb/rules

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

### Vercel 환경 변수 설정

Vercel Dashboard → Settings → Environment Variables에서 위의 Firebase 설정을 모두 추가합니다.

## 📁 프로젝트 구조

```
src/
├── components/
│   ├── attendance/       # 출석 관리
│   ├── dance/           # 댄스 평가
│   └── admin/           # 관리자 페이지
├── data/
│   └── groupsData.js    # 반별 조편성 데이터
├── firebase.js          # Firebase 설정
└── App.jsx
```

## 📝 주요 기능

- ✅ 학교스포츠클럽 분단위 출석 관리
- ✅ 댄스 표현하기 동료평가 (1차, 2차)
- ✅ 신뢰도 점검 (이상 패턴 감지)
- ✅ 개별 점수 조정 (신뢰도, 결과평가)
- ✅ 번호순 정렬 (나이스 입력용)
- ✅ 출석 데이터 Excel 내보내기

## 🚨 보안 주의사항

- `.env.local`은 절대 커밋하면 안 됩니다 (`.gitignore`에 등록됨)
- API Key는 환경 변수로만 관리합니다
- 개발 서버와 배포 환경에서 다른 환경 변수를 사용할 수 있습니다

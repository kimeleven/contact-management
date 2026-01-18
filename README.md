# 📱 연락처 관리 웹 애플리케이션

현대적인 디자인과 강력한 기능을 갖춘 연락처 관리 웹 애플리케이션입니다. Google 소셜 로그인과 Supabase 데이터베이스를 활용합니다.

## ✨ 주요 기능

- **🔐 Google 소셜 로그인** - Google 계정으로 안전하게 로그인
- **📋 연락처 관리** - 이름, 전화번호, 이메일, 메모 관리
- **🔍 실시간 검색** - 이름, 전화번호, 이메일로 빠르게 검색
- **📱 반응형 디자인** - 모바일, 태블릿, 데스크톱 모두 지원
- **🎨 현대적인 UI** - 깔끔한 카드 레이아웃, 인디고 컬러 스킴
- **🔒 데이터 보안** - Supabase RLS로 사용자별 데이터 분리
- **⚡ 실시간 동기화** - 자동 저장 및 동기화

## 🛠️ 기술 스택

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Supabase (PostgreSQL + Auth)
- **Authentication**: Google OAuth 2.0
- **Database**: Supabase PostgreSQL
- **UI Framework**: Custom CSS (No framework)

## 📁 파일 구조

```
contact_management/
├── index.html       # 메인 HTML 구조
├── styles.css       # 모든 스타일시트
├── app.js          # JavaScript 애플리케이션 로직
├── SETUP.md        # Supabase 설정 가이드
└── README.md       # 이 파일
```

## 🚀 시작하기

### 1. Supabase 설정

`SETUP.md` 파일을 따라 Supabase를 설정합니다:
- Supabase 프로젝트 생성
- 데이터베이스 테이블 생성
- Google OAuth 설정
- API 키 구성

### 2. 애플리케이션 설정

`app.js` 파일의 다음 부분을 수정합니다:

```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

### 3. 실행

```bash
# Python 3 사용
python -m http.server 8000

# 또는 http-server 사용
npx http-server
```

브라우저에서 `http://localhost:8000` 접속

## 💡 사용 방법

### 로그인
1. "Google 로그인" 버튼 클릭
2. Google 계정으로 인증

### 연락처 추가
1. "새 연락처 추가" 버튼 클릭
2. 정보 입력 (이름은 필수)
3. "저장" 클릭

### 연락처 검색
- 검색창에 이름, 전화번호, 이메일 입력
- 실시간으로 필터링됨

### 연락처 수정
1. 연락처 선택
2. "수정" 버튼 클릭
3. 정보 변경 후 "저장"

### 연락처 삭제
1. 연락처 선택
2. "삭제" 버튼 클릭
3. 확인

## 🎨 디자인 특징

### 색상 팔레트
- **Primary**: `#4F46E5` (인디고)
- **Background**: `#F8FAFC` (밝은 회색)
- **Surface**: `#FFFFFF` (흰색)
- **Danger**: `#EF4444` (빨강)

### 반응형 브레이크포인트
- Desktop: 1024px+
- Tablet: 768px - 1023px
- Mobile: < 768px

### 애니메이션
- Fade-in: 0.3s ease
- Slide-up: 0.3s ease
- Hover effects: 0.3s ease

## 📱 모바일 최적화

- 터치 친화적인 버튼 크기 (최소 44x44px)
- 반응형 레이아웃
- 모바일 키보드 적응
- 빠른 로딩 시간

## 🔐 보안

- Supabase Row Level Security (RLS)로 사용자별 데이터 분리
- Google OAuth 2.0 인증
- HTTPS 권장
- API 키는 환경 변수로 관리 (프로덕션)

## 📊 데이터 구조

### contacts 테이블
```sql
id: UUID (Primary Key)
user_id: UUID (Foreign Key to auth.users)
name: VARCHAR(255) - 필수
phone: VARCHAR(20)
email: VARCHAR(255)
memo: TEXT
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

## 🐛 알려진 제한사항

- 오프라인 모드 미지원 (온라인 필수)
- 연락처 이미지 미지원
- 그룹/카테고리 미지원
- 개인정보 백업 미지원

## 🎯 향후 개선 사항

- [ ] 연락처 프로필 이미지
- [ ] 그룹/태그 기능
- [ ] 중복 연락처 병합
- [ ] 데이터 백업/복원
- [ ] 어두운 테마
- [ ] 여러 언어 지원
- [ ] 연락처 공유 기능

## 📝 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능

## 🤝 기여

버그 리포트, 기능 제안은 언제든 환영합니다!

## 📞 지원

문제가 발생하면:
1. 브라우저 개발자 도구(F12) 콘솔에서 오류 확인
2. Supabase 대시보드에서 로그 확인
3. `SETUP.md`의 문제 해결 섹션 참고

## 🙏 감사합니다

- [Supabase](https://supabase.com) - 백엔드 서비스
- [Google Cloud](https://cloud.google.com) - OAuth 제공자
- 사용해주셔서 감사합니다!

---

**마지막 업데이트**: 2024년

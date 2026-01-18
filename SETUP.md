# 연락처 관리 애플리케이션 - Supabase 설정 가이드

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 방문하여 계정을 생성합니다.
2. 새 프로젝트를 생성합니다:
   - Organization: 원하는 이름으로 생성
   - Project name: `contact-management`
   - Database password: 안전한 비밀번호 설정
   - Region: 가까운 지역 선택 (예: Singapore)
   - Pricing plan: Free 선택

3. 프로젝트 생성 완료 후 대기합니다 (1-2분 소요).

## 2. API 키 확인

1. Supabase 대시보드에서 Settings → API를 클릭합니다.
2. 다음 정보를 복사합니다:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` 형식의 키

## 3. 데이터베이스 테이블 생성

Supabase 대시보드의 SQL Editor에서 다음 쿼리를 실행합니다:

```sql
-- contacts 테이블 생성
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  memo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성 (검색 성능 향상)
CREATE INDEX contacts_user_id_idx ON contacts(user_id);
CREATE INDEX contacts_name_idx ON contacts(name);

-- Row Level Security (RLS) 활성화
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 연락처만 조회/수정/삭제 가능
CREATE POLICY "Users can view their own contacts"
  ON contacts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contacts"
  ON contacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts"
  ON contacts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts"
  ON contacts FOR DELETE
  USING (auth.uid() = user_id);
```

## 4. Google OAuth 설정

### 4.1 Google Cloud Console 설정

1. [Google Cloud Console](https://console.cloud.google.com)에 접속합니다.
2. 새 프로젝트를 생성합니다:
   - Project name: `contact-management`
3. API 및 서비스 → OAuth 동의 화면을 클릭합니다.
4. User Type: "외부"를 선택하고 만들기를 클릭합니다.
5. 필수 정보를 입력합니다:
   - App name: `Contact Management`
   - User support email: 본인 이메일
   - Developer contact: 본인 이메일
6. 저장하고 계속을 클릭합니다.
7. 범위 추가는 건너뜁니다.
8. 테스트 사용자 추가 (본인 이메일 추가).

### 4.2 OAuth 2.0 클라이언트 생성

1. API 및 서비스 → 사용자 인증 정보를 클릭합니다.
2. 사용자 인증 정보 만들기 → OAuth 2.0 클라이언트 ID를 클릭합니다.
3. 애플리케이션 유형: "웹 애플리케이션"을 선택합니다.
4. 승인된 리다이렉트 URI에 추가합니다:
   - `https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback`
   - 예: `https://abcdefgh.supabase.co/auth/v1/callback`
5. 생성을 클릭합니다.
6. **클라이언트 ID** 복사합니다.

### 4.3 Supabase에서 Google OAuth 연동

1. Supabase 대시보드 → Authentication → Providers를 클릭합니다.
2. Google을 활성화합니다:
   - Enabled: 활성화
   - Client ID: Google에서 복사한 클라이언트 ID 붙여넣기
3. Save를 클릭합니다.

## 5. 애플리케이션 설정

`app.js` 파일을 열고 다음을 수정합니다:

```javascript
const SUPABASE_URL = 'https://YOUR_SUPABASE_URL.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

예시:
```javascript
const SUPABASE_URL = 'https://abcdefgh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

## 6. 애플리케이션 실행

1. `index.html` 파일을 웹 브라우저에서 엽니다.
2. 또는 간단한 HTTP 서버를 사용합니다:

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (http-server 필요)
npm install -g http-server
http-server
```

3. 브라우저에서 `http://localhost:8000`으로 접속합니다.

## 7. 기능 확인

- ✅ Google 로그인
- ✅ 연락처 추가/수정/삭제
- ✅ 실시간 검색
- ✅ 모바일 반응형

## 문제 해결

### Google 로그인이 작동하지 않음
- Google Cloud Console에서 클라이언트 ID가 올바른지 확인
- Supabase에서 Google 제공자가 활성화되어 있는지 확인
- 브라우저 개발자 도구(F12)의 콘솔에서 오류 메시지 확인

### 데이터가 저장되지 않음
- Supabase 대시보드에서 RLS 정책이 올바르게 설정되어 있는지 확인
- 테이블이 생성되었는지 확인: Authentication → Database → Tables

### CORS 오류
- Supabase 대시보드 → Settings → API → CORS를 확인합니다.
- localhost를 CORS whitelist에 추가하려면:
  ```
  http://localhost:*
  ```

## 보안 주의사항

⚠️ **중요**: `app.js`의 Supabase 키는 공개되지 않도록 주의하세요.
- GitHub에 업로드하지 않도록 `.gitignore`에 추가하세요.
- 프로덕션 배포 시 환경 변수를 사용하세요.

## 추가 리소스

- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase JavaScript 클라이언트](https://supabase.com/docs/reference/javascript)
- [Google OAuth 문서](https://developers.google.com/identity/protocols/oauth2)

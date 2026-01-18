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
4. **승인된 리다이렉트 URI에 다음을 추가합니다** (⚠️ 매우 중요):
   - `https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback`
   - 예: `https://xdxbboqvtpbalbxmvpfz.supabase.co/auth/v1/callback`
   - ⚠️ **주의**: 정확한 Supabase 프로젝트 URL을 사용해야 합니다. 오타가 있으면 `redirect_uri_mismatch` 오류가 발생합니다.
   - ⚠️ **Vercel 배포 시**: Supabase 콜백 URI만 추가하면 됩니다. Vercel URL은 Supabase에서 처리합니다.
5. 생성을 클릭합니다.
6. **클라이언트 ID**와 **클라이언트 Secret**을 복사합니다 (Secret은 나중에 필요할 수 있습니다).

### 4.3 Supabase에서 Google OAuth 연동

1. Supabase 대시보드 → Authentication → Providers를 클릭합니다.
2. Google을 활성화합니다:
   - Enabled: 활성화
   - Client ID: Google에서 복사한 클라이언트 ID 붙여넣기
   - Client Secret: Google에서 복사한 클라이언트 Secret 붙여넣기 (선택사항이지만 권장)
3. **Site URL 설정 확인** (매우 중요):
   - Authentication → URL Configuration으로 이동
   - **Site URL**: 프로덕션 배포 URL 설정
     - Vercel 배포: `https://claude-test-2vgg.vercel.app`
     - 또는 다른 프로덕션 URL
   - **Redirect URLs**에 다음을 모두 추가:
     - 프로덕션: `https://claude-test-2vgg.vercel.app/**`
     - 로컬 개발: `http://localhost:8000/**` (또는 사용하는 포트)
     - 다른 포트 사용 시: `http://localhost:3000/**` 등
     - 와일드카드(`/**`)를 사용하여 모든 경로 허용
     - ⚠️ **중요**: 사용하는 모든 로컬 포트를 추가해야 합니다!
4. Save를 클릭합니다.

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

### 로컬 개발

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

### Vercel 배포

애플리케이션은 다음 URL에서 배포되어 있습니다:
- **프로덕션 URL**: `https://claude-test-2vgg.vercel.app`

Vercel에 배포하려면:
1. Vercel 계정 생성 및 로그인
2. GitHub 저장소 연결
3. 프로젝트 설정 후 배포

또는 Vercel CLI 사용:
```bash
npm i -g vercel
vercel
```

## 7. 기능 확인

- ✅ Google 로그인
- ✅ 연락처 추가/수정/삭제
- ✅ 실시간 검색
- ✅ 모바일 반응형

## 문제 해결

### Google 로그인이 작동하지 않음

#### `redirect_uri_mismatch` 오류 해결 방법:

1. **Google Cloud Console 확인**:
   - API 및 서비스 → 사용자 인증 정보 → OAuth 2.0 클라이언트 ID 클릭
   - 승인된 리다이렉트 URI에 다음이 정확히 등록되어 있는지 확인:
     ```
     https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback
     ```
     예: `https://xdxbboqvtpbalbxmvpfz.supabase.co/auth/v1/callback`
   - ⚠️ **주의사항**:
     - `https://`로 시작해야 함
     - `/auth/v1/callback`으로 끝나야 함
     - 프로젝트 URL이 정확해야 함 (오타 없이)
     - 마지막에 슬래시(`/`)가 없어야 함
     - **Vercel URL은 Google Cloud Console에 추가하지 않습니다!** (Supabase가 처리)

2. **Supabase 설정 확인**:
   - Authentication → URL Configuration
   - **Site URL**: 프로덕션 URL 설정
     - Vercel 배포: `https://claude-test-2vgg.vercel.app`
   - **Redirect URLs**에 다음이 모두 포함되어 있는지 확인:
     - `https://claude-test-2vgg.vercel.app/**` (프로덕션)
     - `http://localhost:8000/**` (로컬 개발)
     - `http://localhost:3000/**` (다른 포트 사용 시)
     - 사용하는 모든 로컬 포트를 추가해야 합니다

3. **OAuth 콜백 후 잘못된 URL로 리다이렉트되는 경우**:
   - Supabase → Authentication → URL Configuration
   - Redirect URLs에 현재 사용 중인 URL이 포함되어 있는지 확인
   - 예: `http://localhost:3000`으로 리다이렉트된다면 `http://localhost:3000/**` 추가
   - 코드에서 OAuth 콜백을 자동으로 처리하도록 업데이트됨 (URL 파라미터 정리)

4. **일반적인 확인사항**:
   - Google Cloud Console에서 클라이언트 ID가 올바른지 확인
   - Supabase에서 Google 제공자가 활성화되어 있는지 확인
   - 브라우저 개발자 도구(F12)의 콘솔에서 오류 메시지 확인
   - 브라우저 캐시를 지우고 다시 시도

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

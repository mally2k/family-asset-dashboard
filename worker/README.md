# 관리자 업데이트 Worker 설정 가이드

대시보드의 🔄 버튼 → 비밀번호 입력 → 구글 시트 최신 데이터 자동 반영을 위한 1회성 설정입니다.

## 전제 조건

구글 시트가 **"링크가 있는 모든 사용자"** 로 공유되어 있어야 합니다.
구글 시트 → 우상단 **공유** → 일반 액세스 → **링크가 있는 모든 사용자 (뷰어)**

## 1. GitHub PAT 생성

1. GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained tokens** → **Generate new token**
2. 설정:
   - Token name: `family-asset-dashboard` (아무거나)
   - Repository access: **Only select repositories** → `mally2k/family-asset-dashboard`
   - Permissions → Repository permissions → **Contents: Read and write**
3. 생성 후 토큰(`github_pat_...`)을 복사해 둡니다

## 2. Cloudflare Worker 생성

1. [Cloudflare](https://dash.cloudflare.com) 가입/로그인 (무료)
2. **Workers & Pages** → **Create** → **Worker** → 이름 입력(예: `asset-update`) → **Deploy**
3. **Edit code** → 이 디렉토리의 `worker.js` 내용을 전부 붙여넣기 → **Deploy**

## 3. 시크릿 등록

Worker 페이지 → **Settings** → **Variables and Secrets** → **Add** (Type: Secret):

| Name | Value |
|---|---|
| `ADMIN_PASSWORD` | 원하는 관리자 비밀번호 |
| `GITHUB_PAT` | 1단계에서 생성한 GitHub 토큰 |

## 4. 대시보드에 Worker URL 연결

Worker URL(예: `https://asset-update.xxxx.workers.dev`)을 복사한 뒤,
`index.html`의 `ADMIN_WORKER_URL` 상수에 입력하고 push 합니다.

## 동작 확인

1. 대시보드 🔄 버튼 → 틀린 비밀번호 → "비밀번호가 올바르지 않습니다" 표시
2. 올바른 비밀번호 → 토스트 "업데이트를 시작했습니다" → sync 아이콘 회전
3. GitHub Actions 탭에서 `Update Dashboard Data` 워크플로우 실행 확인
4. 1~2분 후 대시보드가 자동으로 최신 데이터로 갱신됨

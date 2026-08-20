/**
 * family-asset-dashboard 관리자 업데이트 Worker
 *
 * 대시보드의 "데이터 업데이트" 버튼 → 이 Worker → GitHub repository_dispatch
 *
 * 설정해야 할 시크릿 (Worker Settings → Variables and Secrets):
 *   - ADMIN_PASSWORD : 관리자 비밀번호
 *   - GITHUB_PAT     : GitHub fine-grained PAT (이 레포만, Contents: Read and write)
 */

const ALLOWED_ORIGIN = 'https://mally2k.github.io';
const REPO = 'mally2k/family-asset-dashboard';

function jsonResponse(body, status, corsHeaders) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method Not Allowed' }, 405, cors);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: '잘못된 요청입니다' }, 400, cors);
    }

    if (!body.password || body.password !== env.ADMIN_PASSWORD) {
      return jsonResponse({ error: '비밀번호가 올바르지 않습니다' }, 401, cors);
    }

    const res = await fetch(`https://api.github.com/repos/${REPO}/dispatches`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.GITHUB_PAT}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'family-asset-dashboard-worker',
      },
      body: JSON.stringify({ event_type: 'sheet-update' }),
    });

    if (res.status === 204) {
      return jsonResponse({ ok: true, message: '업데이트를 시작했습니다' }, 200, cors);
    }
    return jsonResponse({ error: 'GitHub 요청 실패', status: res.status }, 502, cors);
  },
};

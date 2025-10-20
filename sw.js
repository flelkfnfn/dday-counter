// 파일 이름: sw.js

// Supabase 클라이언트 라이브러리를 가져옵니다.
importScripts('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');

// --- 중요: 본인의 Supabase URL과 Anon Key로 꼭 변경해주세요! ---
const SUPABASE_URL = 'https://hhgykrylnfvvrcrkrrud.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoZ3lrcnlsbmZ2dnJjcmtycnVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2ODI3MjUsImV4cCI6MjA3NjI1ODcyNX0.24sdL2NyHA0K-pewG52rjJFDTNmLFIn4_xTQ8VQg5b8';
// -------------------------------------------------------------

const supabase = self.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// D-Day 계산 함수
function calculateDday(targetDate) {
    const today = new Date();
    const target = new Date(targetDate);
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'D-DAY';
    return `D-${diffDays}`;
}

// 'periodicsync' 이벤트가 발생했을 때 실행될 로직
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'd-day-check') {
        event.waitUntil(checkDdaysAndNotify());
    }
});

// D-DAY를 확인하고 알림을 보내는 핵심 함수
async function checkDdaysAndNotify() {
    console.log('[Service Worker] D-DAY 일정을 확인합니다...');

    try {
        // Supabase에서 모든 이벤트 데이터를 가져옵니다.
        const { data: events, error } = await supabase.from('events').select('*');
        if (error) throw error;

        if (!events || events.length === 0) {
            console.log('[Service Worker] 이벤트가 없습니다.');
            return;
        }

        // 오늘이 D-DAY인 이벤트를 찾습니다.
        const todayEvents = events.filter(event => calculateDday(event.date) === 'D-DAY');

        if (todayEvents.length > 0) {
            const eventSummary = todayEvents.map(e => `${e.name} (${e.type})`).join(', ');
            const notificationTitle = `오늘 ${todayEvents.length}개의 D-DAY 일정이 있습니다.`;
            
            // 사용자에게 알림을 표시합니다.
            await self.registration.showNotification(notificationTitle, {
                body: eventSummary,
                icon: 'favicon.png' // 이 파일이 프로젝트에 있다면 아이콘으로 표시됩니다.
            });
        } else {
            console.log('[Service Worker] 오늘 D-DAY인 일정이 없습니다.');
        }
    } catch (err) {
        console.error('[Service Worker] 일정 확인 중 오류 발생:', err);
    }
}

// 서비스 워커가 즉시 활성화되도록 설정 (개발 편의용)
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

# Lucky Six (6/45 Lotto Number Generator)

무료, 가벼운 PWA 로또 번호 생성기입니다. 완전 랜덤 + 핫/콜드(역대 빈도 가중) 옵션을 지원합니다.
GitHub Pages에 바로 올려서 배포할 수 있고, Capacitor로 감싸서 앱스토어/플레이스토어 배포도 확장 가능합니다.

## 기능 (v0.1 MVP)
- 6/45 번호 완전 랜덤 생성 (`crypto.getRandomValues`)
- 핫/콜드 옵션: `data/historical.json`의 빈도 기반 가중치
- 여러 세트 동시 생성, 로컬 저장/삭제
- 번호 빈도 요약(TOP5 / BOTTOM5)
- 오프라인 동작(PWA): 기본 파일 캐시

## 아직 포함하지 않은 것 (차기 버전 로드맵)
- 당첨 결과 푸시 알림(서버 필요: Cloud Functions 등)
- QR 스캔(브라우저에서 가능하지만 로또 QR 규격 파싱 로직 필요)
- 회차별 자동 당첨 확인(공식/서드파티 API 연동 필요)
- 주변 명당 지도(지도 SDK + 데이터 필요)
- 분석 통계 대시보드(시각화/그래프)

## 배포 (GitHub Pages)
1. 새 공개 저장소 생성: `lucky-six`
2. 이 폴더의 모든 파일을 저장소 루트에 업로드
3. **Settings → Pages → Branch**를 `main /(root)`로 설정 → Save
4. 몇 분 후 배포된 URL로 접속

## 데이터 교체 (핫/콜드)
- `data/historical.json` 파일을 전체 회차 데이터로 교체하면, 다음 새로고침부터 즉시 반영됩니다.
- 포맷:
```json
{
  "draws": [
    [4,7,12,33,38,40],
    [1,9,12,23,33,42]
  ]
}
```
- (선택) 빌드/수집 자동화는 차후에 스크립트로 추가

## 앱스토어 배포(개요)
- 웹(PWA)로 먼저 안정화 → Capacitor로 iOS/Android 프로젝트 생성
- AdMob/Firebase Analytics 연동 후 스토어 심사 제출

## 라이선스
MIT

// Firebase 설정 예시 파일
// 이 파일을 복사하여 firebaseConfig.js로 저장하고, 아래 값들을 실제 Firebase 설정으로 교체하세요.
//
// Firebase 프로젝트 생성 방법:
// 1. https://console.firebase.google.com/ 접속
// 2. "프로젝트 추가" 클릭
// 3. 프로젝트 이름 입력 후 생성
// 4. "웹 앱 추가" (</>아이콘) 클릭
// 5. 앱 닉네임 입력 후 "앱 등록"
// 6. 표시되는 firebaseConfig 값을 아래에 복사
// 7. Firestore Database 활성화: 빌드 > Firestore Database > 데이터베이스 만들기

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Firestore 인스턴스 내보내기
export const db = getFirestore(app);

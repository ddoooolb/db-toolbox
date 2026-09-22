const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: 'AIzaSyDyoypLvZF__FIeaFLaAcCizc9IzFaEUjI',
  authDomain: 'db-toolbox-58d1d.firebaseapp.com',
  databaseURL: 'https://db-toolbox-58d1d-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'db-toolbox-58d1d',
  storageBucket: 'db-toolbox-58d1d.firebasestorage.app',
  messagingSenderId: '957810102903',
  appId: '1:957810102903:web:e55c954ce22e37aed5ac72'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  try {
    console.log('📝 테스트 쓰기 시작...\n');
    
    const classDoc = doc(db, 'classes', 'class1', 'data', 'attendance');
    const testKey = '2026-09-22-morning-배드민턴(남,여)-배드민턴-3-9-24';
    
    await setDoc(classDoc, {
      [testKey]: 45
    }, { merge: true });
    
    console.log('✅ 쓰기 성공!');
    console.log(`   저장된 키: ${testKey}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 쓰기 실패:', error.message);
    console.error('에러 코드:', error.code);
    process.exit(1);
  }
}

test();

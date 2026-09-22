const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

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

async function check() {
  try {
    const classDoc = doc(db, 'classes', 'class1', 'data', 'attendance');
    const snap = await getDoc(classDoc);
    const data = snap.data() || {};
    
    console.log('\n📊 Firestore 현재 상태:\n');
    
    const today = '2026-09-22';
    const morning = Object.keys(data).filter(k => k.startsWith(today + '-morning-'));
    const lunch = Object.keys(data).filter(k => k.startsWith(today + '-lunch-'));
    const afternoon = Object.keys(data).filter(k => k.startsWith(today + '-afternoon-'));
    const directInput = Object.keys(data).filter(k => k.startsWith(today + '-direct-input-'));
    
    console.log(`아침: ${morning.length}개`);
    if (morning.length > 0) {
      console.log('  예시:', morning[0]);
    }
    
    console.log(`\n점심: ${lunch.length}개`);
    if (lunch.length > 0) {
      console.log('  예시:', lunch[0]);
    }
    
    console.log(`\n방과후: ${afternoon.length}개`);
    if (afternoon.length > 0) {
      console.log('  예시:', afternoon[0]);
    }
    
    console.log(`\n직접입력: ${directInput.length}개`);
    if (directInput.length > 0) {
      console.log('  예시:', directInput[0]);
    }
    
    console.log('\n📌 오늘 배드민턴 데이터 (모든 시간대):');
    Object.keys(data)
      .filter(k => k.startsWith(today) && k.includes('배드민턴'))
      .forEach(k => console.log(`  ${k}: ${data[k]}`));
    
    process.exit(0);
  } catch (error) {
    console.error('오류:', error.message);
    process.exit(1);
  }
}

check();

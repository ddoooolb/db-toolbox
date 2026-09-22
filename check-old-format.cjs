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
    
    const today = '2026-09-22';
    
    // 구형식: 2026-09-22-배드민턴-학생id
    const oldFormat = Object.keys(data).filter(k => 
      k.startsWith(today) && !k.includes('-morning-') && !k.includes('-lunch-') && 
      !k.includes('-afternoon-') && !k.includes('-direct-input-')
    );
    
    console.log(`\n❌ 구형식 데이터 (시간대 없음): ${oldFormat.length}개`);
    if (oldFormat.length > 0) {
      oldFormat.slice(0, 10).forEach(k => {
        console.log(`  ${k}: ${data[k]}`);
      });
      if (oldFormat.length > 10) console.log(`  ... 외 ${oldFormat.length - 10}개`);
    }
    
    // 새로운 형식
    const allKeys = Object.keys(data);
    const newFormat = allKeys.filter(k => 
      k.startsWith(today) && 
      (k.includes('-morning-') || k.includes('-lunch-') || k.includes('-afternoon-') || k.includes('-direct-input-'))
    );
    
    console.log(`\n✅ 새로운 형식 (시간대 포함): ${newFormat.length}개`);
    if (newFormat.length > 0) {
      newFormat.slice(0, 10).forEach(k => {
        console.log(`  ${k}: ${data[k]}`);
      });
    }
    
    console.log(`\n📊 총 데이터: ${allKeys.length}개`);
    
    process.exit(0);
  } catch (error) {
    console.error('오류:', error.message);
    process.exit(1);
  }
}

check();

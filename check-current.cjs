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
    const allData = snap.data() || {};
    
    const today = '2026-09-22';
    const morning = Object.keys(allData).filter(k => k.startsWith(today + '-morning-'));
    
    console.log(`\n📊 오늘 아침 데이터: ${morning.length}개\n`);
    morning.slice(0, 30).forEach(k => {
      console.log(`  ${k}: ${allData[k]}`);
    });
    if (morning.length > 30) {
      console.log(`  ... 외 ${morning.length - 30}개`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('오류:', error.message);
    process.exit(1);
  }
}

check();

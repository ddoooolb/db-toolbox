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
    const badmintonKeys = Object.keys(data).filter(k => 
      k.startsWith(today) && k.includes('배드민턴')
    );
    
    console.log(`📅 오늘(${today}) 배드민턴 데이터:\n`);
    badmintonKeys.forEach(k => console.log(`  ${k}: ${data[k]}`));
    
    process.exit(0);
  } catch (error) {
    console.error('오류:', error.message);
    process.exit(1);
  }
}

check();

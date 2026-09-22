const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, setDoc, deleteField } = require('firebase/firestore');

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

async function deleteData() {
  try {
    const classDoc = doc(db, 'classes', 'class1', 'data', 'attendance');
    const snap = await getDoc(classDoc);
    const data = snap.data() || {};
    
    const today = '2026-09-22';
    const yesterday = '2026-09-21';
    
    const toDelete = {};
    let count = 0;
    
    Object.keys(data).forEach(k => {
      // 어제/오늘 배드민턴 데이터 모두 삭제
      if ((k.startsWith(today) || k.startsWith(yesterday)) && k.includes('배드민턴')) {
        toDelete[k] = deleteField();
        count++;
        console.log(`❌ 삭제: ${k}`);
      }
    });
    
    console.log(`\n🗑️ 총 ${count}개 삭제\n`);
    
    if (count === 0) {
      console.log('삭제할 데이터 없음');
      process.exit(0);
    }
    
    await setDoc(classDoc, toDelete, { merge: true });
    console.log('✅ 삭제 완료!');
    process.exit(0);
  } catch (error) {
    console.error('❌ 오류:', error.message);
    process.exit(1);
  }
}

deleteData();

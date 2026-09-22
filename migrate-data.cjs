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

async function migrate() {
  try {
    console.log('🔄 데이터 마이그레이션 시작...\n');
    
    const classDoc = doc(db, 'classes', 'class1', 'data', 'attendance');
    const snap = await getDoc(classDoc);
    const allData = snap.data() || {};
    
    const today = '2026-09-22';
    const yesterday = '2026-09-21';
    
    // 어제/오늘 데이터만 필터링
    const oldKeys = Object.keys(allData).filter(k => 
      (k.startsWith(today) || k.startsWith(yesterday))
    );
    
    console.log(`📊 어제/오늘 데이터: ${oldKeys.length}개\n`);
    
    if (oldKeys.length === 0) {
      console.log('✅ 마이그레이션할 데이터 없음');
      process.exit(0);
    }
    
    // 삭제할 데이터
    const deleteData = {};
    oldKeys.forEach(k => {
      deleteData[k] = deleteField();
    });
    
    // 삭제 실행
    await setDoc(classDoc, deleteData, { merge: true });
    
    console.log(`✅ ${oldKeys.length}개 데이터 초기화 완료`);
    console.log('\n💡 이제부터 새로운 형식으로 저장됩니다:');
    console.log('   형식: 날짜-시간대-종목-학생ID');
    console.log('   예시: 2026-09-22-morning-배드민턴(남,여)-배드민턴-3-9-24');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 오류:', error.message);
    process.exit(1);
  }
}

migrate();

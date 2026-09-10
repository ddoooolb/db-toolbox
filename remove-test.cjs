const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');

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

async function removeTest() {
  console.log('🗑️ 테스트 데이터 제거 중...\n');

  const snapshot = await getDocs(collection(db, 'students'));
  let deleteCount = 0;

  for (const docSnap of snapshot.docs) {
    const s = docSnap.data();
    if (s.name.includes('테스트')) {
      await deleteDoc(doc(db, 'students', docSnap.id));
      console.log(`  ✅ ${s.name} (${s.sports}) - ID: ${docSnap.id}`);
      deleteCount++;
    }
  }

  console.log(`\n✅ 완료! ${deleteCount}개의 테스트 데이터가 삭제되었습니다.`);
  process.exit(0);
}

removeTest();

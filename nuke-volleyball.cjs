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

async function nuke() {
  console.log('🗑️ Firestore 배구 데이터 전부 삭제 중...\n');
  
  const snapshot = await getDocs(collection(db, 'students'));
  let count = 0;

  for (const docSnap of snapshot.docs) {
    const s = docSnap.data();
    if (s.sports && s.sports.includes('배구')) {
      await deleteDoc(doc(db, 'students', docSnap.id));
      count++;
    }
  }

  console.log(`✅ ${count}개 삭제 완료!\n`);
  process.exit(0);
}

nuke();

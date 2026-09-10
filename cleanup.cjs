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

const toRemove = ['안채희', '이루현', '최다진', '김아소', '윤수연', '장다은', '최슬', '정다원', '손새봄', '김윤', '황정웅', '김서준', '박찬준', '이찬서'];

async function cleanup() {
  console.log('🗑️ Firestore에서 중복된 배구 학생 제거 중...\n');

  const snapshot = await getDocs(collection(db, 'students'));
  let deleteCount = 0;

  for (const docSnap of snapshot.docs) {
    const s = docSnap.data();
    if (toRemove.includes(s.name) && s.sports.includes('배구')) {
      await deleteDoc(doc(db, 'students', docSnap.id));
      console.log(`  ✅ ${s.name} (${s.sports}) - ID: ${docSnap.id}`);
      deleteCount++;
    }
  }

  console.log(`\n✅ 완료! ${deleteCount}명이 제거되었습니다.`);
  console.log('테스트8, 테스트11은 보존되었습니다.');
  process.exit(0);
}

cleanup();

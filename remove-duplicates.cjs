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

async function removeDuplicates() {
  try {
    console.log('🗑️ Firestore에서 중복 학생 데이터 제거 중...\n');

    const snapshot = await getDocs(collection(db, 'students'));

    const studentMap = {};
    const toDelete = [];

    snapshot.forEach(doc => {
      const student = doc.data();
      const key = `${student.grade}-${student.class}-${student.number}-${student.sports}`;

      if (studentMap[key]) {
        console.log(`  🗑️ 중복 제거: ${student.grade}학년 ${student.class}반 ${student.number}번 ${student.name} (${student.sports})`);
        toDelete.push(doc.id);
      } else {
        studentMap[key] = doc.id;
      }
    });

    for (const docId of toDelete) {
      await deleteDoc(doc(collection(db, 'students'), docId));
    }

    console.log(`\n✅ 완료! ${toDelete.length}개의 중복 학생이 제거되었습니다.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ 오류:', error.message);
    process.exit(1);
  }
}

removeDuplicates();

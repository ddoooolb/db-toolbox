const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

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

async function checkAll() {
  const snapshot = await getDocs(collection(db, 'students'));
  const volleyball = [];

  snapshot.forEach(doc => {
    const s = doc.data();
    if (s.sports.includes('배구')) {
      volleyball.push({ docId: doc.id, ...s });
    }
  });

  console.log('\n📊 Firestore 배구 학생 현황 (' + volleyball.length + '명):\n');
  volleyball.forEach(s => {
    console.log(`${s.grade}학년 ${s.class}반 ${s.number}번 ${s.name.padEnd(10)} (${s.sports})`);
  });

  process.exit(0);
}

checkAll();

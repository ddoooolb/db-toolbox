const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

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

async function exportComplete() {
  console.log('📦 완전한 백업 데이터 내보내는 중...\n');

  const collections_to_export = ['students', 'groups', 'dance-open', 'dance-submitted'];
  const backup = {};
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  for (const collName of collections_to_export) {
    try {
      const snapshot = await getDocs(collection(db, collName));
      backup[collName] = [];
      
      snapshot.forEach(doc => {
        backup[collName].push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log(`  ✅ ${collName}: ${backup[collName].length}개`);
    } catch (e) {
      console.log(`  ⚠️  ${collName}: 없음 또는 오류`);
    }
  }

  const fileName = `BACKUP_${timestamp}.json`;
  const filePath = path.join(process.cwd(), fileName);
  fs.writeFileSync(filePath, JSON.stringify(backup, null, 2));

  console.log(`\n✅ 완벽한 백업 완료!\n📁 파일: ${filePath}\n`);
  console.log('📊 백업 내용:');
  Object.entries(backup).forEach(([key, val]) => {
    console.log(`  - ${key}: ${val.length}개 항목`);
  });
  console.log('\n💾 이 파일을 안전한 곳에 저장하세요!');

  process.exit(0);
}

exportComplete();

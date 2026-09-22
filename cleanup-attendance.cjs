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

async function cleanup() {
  try {
    console.log('🔍 출석 데이터 정리 중...\n');

    const classId = 'class1';
    const classDoc = doc(db, 'classes', classId, 'data', 'attendance');
    const snap = await getDoc(classDoc);
    const data = snap.data() || {};

    console.log(`📊 현재 저장된 레코드: ${Object.keys(data).length}개\n`);

    // 어제와 오늘 날짜
    const today = '2026-09-22';
    const yesterday = '2026-09-21';

    const toDelete = {};
    const toKeep = [];
    const duplicates = {};

    // 모든 키를 확인
    Object.keys(data).forEach(key => {
      const parts = key.split('-');

      // 2026-09-22-morning-배드민턴-student1 형식 (새로운 형식)
      // 2026-09-22-배드민턴-student1 형식 (구형식)

      const date = parts[0] + '-' + parts[1] + '-' + parts[2];

      // 오늘 점심만 삭제
      if (key.startsWith(today + '-lunch-')) {
        toDelete[key] = deleteField();
        console.log(`❌ 삭제: ${key} (오늘 점심)`);
        return;
      }

      // 구형식 데이터 찾기 (시간대 없음)
      // 형식: YYYY-MM-DD-종목-학생ID (4개 부분)
      if (parts.length === 4 && (date === today || date === yesterday)) {
        // 이건 구형식이다. 중복일 가능성이 높다.
        const newFormatExists = Object.keys(data).some(k =>
          k.startsWith(date) &&
          (k.includes('-morning-') || k.includes('-lunch-') || k.includes('-afternoon-') || k.includes('-direct-input-'))
        );

        if (newFormatExists) {
          duplicates[key] = true;
          toDelete[key] = deleteField();
          console.log(`⚠️  중복 제거 (구형식): ${key}`);
          return;
        }
      }

      toKeep.push(key);
    });

    console.log(`\n📋 유지할 레코드: ${toKeep.length}개`);
    console.log(`🗑️  삭제할 레코드: ${Object.keys(toDelete).length}개`);

    if (Object.keys(toDelete).length === 0) {
      console.log('\n✅ 삭제할 데이터 없음');
      process.exit(0);
    }

    // Firestore에 업데이트
    await setDoc(classDoc, toDelete, { merge: true });
    console.log('\n✅ 정리 완료!');
    process.exit(0);
  } catch (error) {
    console.error('❌ 오류:', error.message);
    process.exit(1);
  }
}

cleanup();

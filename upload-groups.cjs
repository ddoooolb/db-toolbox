const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const { initialGroupsData } = require('./src/data/groupsData.js');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function uploadGroupsData() {
  try {
    console.log('📤 Firestore에 groupsData 업로드 중...\n');

    const batch = db.batch();
    let count = 0;

    for (const [className, groups] of Object.entries(initialGroupsData)) {
      const docRef = db.collection('groups').doc(className);
      batch.set(docRef, groups, { merge: true });
      console.log(`  ✅ ${className}`);
      count++;
    }

    await batch.commit();

    console.log(`\n✅ 완료! ${count}개 반의 데이터가 Firestore에 저장되었습니다.`);
    await admin.app().delete();
    process.exit(0);
  } catch (error) {
    console.error('❌ 업로드 오류:', error.message);
    process.exit(1);
  }
}

uploadGroupsData();

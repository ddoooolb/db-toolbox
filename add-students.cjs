const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');

// Firebase 설정
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

// 추가할 학생들
const students = [
  // 여배
  { grade: '1', class: '6', number: '13', name: '안채희', sports: '배구(여)' },
  { grade: '1', class: '6', number: '17', name: '이루현', sports: '배구(여)' },
  { grade: '1', class: '8', number: '25', name: '최다진', sports: '배구(여)' },
  { grade: '1', class: '8', number: '4', name: '김아소', sports: '배구(여)' },
  { grade: '1', class: '8', number: '15', name: '윤수연', sports: '배구(여)' },
  { grade: '1', class: '10', number: '25', name: '장다은', sports: '배구(여)' },
  { grade: '2', class: '4', number: '29', name: '최슬', sports: '배구(여)' },
  { grade: '2', class: '8', number: '25', name: '정다원', sports: '배구(여)' },
  { grade: '2', class: '8', number: '13', name: '손새봄', sports: '배구(여)' },
  { grade: '2', class: '8', number: '5', name: '김윤', sports: '배구(여)' },
  // 남배
  { grade: '2', class: '13', number: '32', name: '황정웅', sports: '배구(남)' },
  { grade: '2', class: '3', number: '8', name: '김서준', sports: '배구(남)' },
  { grade: '2', class: '1', number: '13', name: '박찬준', sports: '배구(남)' },
  { grade: '1', class: '3', number: '26', name: '이찬서', sports: '배구(남)' }
];

async function addStudents() {
  try {
    console.log('📤 Firestore에 학생 데이터 추가 중...\n');

    const studentsCollection = collection(db, 'students');
    let count = 0;

    for (const student of students) {
      const studentId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const docRef = doc(studentsCollection, studentId);

      await setDoc(docRef, {
        ...student,
        id: studentId
      });

      console.log(`  ✅ ${student.grade}학년 ${student.class}반 ${student.number}번 ${student.name} (${student.sports})`);
      count++;
    }

    console.log(`\n✅ 완료! ${count}명의 학생이 Firestore에 저장되었습니다.`);
    console.log('배포된 Vercel 앱과도 자동으로 동기화됩니다.');
    process.exit(0);
  } catch (error) {
    console.error('❌ 추가 오류:', error.message);
    process.exit(1);
  }
}

addStudents();

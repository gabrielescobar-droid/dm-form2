import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { readFileSync } from 'fs';

const config = JSON.parse(readFileSync('firebase-applet-config.json', 'utf8'));

const app = initializeApp({
  projectId: config.projectId,
  appId: config.appId,
  apiKey: config.apiKey,
  authDomain: config.authDomain,
});

const db = getFirestore(app);
const q = query(collection(db, 'form_submissions'), orderBy('createdAt', 'desc'));

getDocs(q).then(snapshot => {
  console.log('Docs count:', snapshot.size);
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

import { db, handleFirestoreError, OperationType } from '../utils/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

export async function fetchCrops() {
  try {
    const cropsCol = collection(db, 'crops');
    const snapshot = await getDocs(cropsCol);
    return snapshot.docs.map(doc => doc.data());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'crops');
  }
}

export async function fetchSchemes() {
  try {
    const schemesCol = collection(db, 'schemes');
    const snapshot = await getDocs(schemesCol);
    return snapshot.docs.map(doc => doc.data());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'schemes');
  }
}

export async function fetchContent() {
  try {
    const contentCol = collection(db, 'content');
    const snapshot = await getDocs(contentCol);
    return snapshot.docs.map(doc => doc.data());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'content');
  }
}

export async function fetchMarketPrices() {
  try {
    const marketCol = collection(db, 'marketPrices');
    const snapshot = await getDocs(marketCol);
    return snapshot.docs.map(doc => doc.data());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'marketPrices');
  }
}

export async function fetchCropSchedules(lang: string) {
  try {
    const docRef = doc(db, 'cropSchedules', lang);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().schedules || [];
    }
    return [];
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `cropSchedules/${lang}`);
  }
}

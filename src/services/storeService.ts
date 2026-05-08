import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  doc,
  getDoc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Product, Category } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const storeService = {
  async getProducts(categoryId?: string) {
    const productsRef = collection(db, 'products');
    let q = query(productsRef, orderBy('createdAt', 'desc'));
    
    if (categoryId && categoryId !== 'all') {
      q = query(productsRef, where('category', '==', categoryId), orderBy('createdAt', 'desc'));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  },

  async getProduct(id: string) {
    const docRef = doc(db, 'products', id);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as Product;
    }
    return null;
  },

  async getCategories() {
    const snapshot = await getDocs(collection(db, 'categories'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
  },

  async getFlashSaleProducts() {
    const q = query(
      collection(db, 'products'), 
      where('isFlashSale', '==', true),
      limit(4)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  },

  async createOrder(orderData: any) {
    const path = 'orders';
    try {
      return await addDoc(collection(db, path), {
        ...orderData,
        userId: auth.currentUser?.uid || null,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    }
  }
};

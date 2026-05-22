import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  serverTimestamp,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Product, Category, AppUser, ManualInvoice } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const adminService = {
  async isAdmin() {
    if (!auth.currentUser) return false;
    if (auth.currentUser.email === 'reocleanproperties@gmail.com') return true;
    
    try {
      const adminDoc = await getDoc(doc(db, 'admins', auth.currentUser.uid));
      return adminDoc.exists();
    } catch (e) {
      return false;
    }
  },

  // Products
  async getProducts() {
    const path = 'products';
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
    }
  },

  async addProduct(product: Omit<Product, 'id'>) {
    const path = 'products';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...product,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    }
  },

  async updateProduct(id: string, product: Partial<Product>) {
    const path = `products/${id}`;
    try {
      await updateDoc(doc(db, 'products', id), {
        ...product,
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, path);
    }
  },

  async deleteProduct(id: string) {
    const path = `products/${id}`;
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  },

  // Categories
  async getCategories() {
    const path = 'categories';
    try {
      const snapshot = await getDocs(collection(db, path));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
    }
  },

  async addCategory(category: Omit<Category, 'id'>) {
    const path = 'categories';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...category,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    }
  },

  async updateCategory(id: string, category: Partial<Category>) {
    const path = `categories/${id}`;
    try {
      await updateDoc(doc(db, 'categories', id), {
        ...category,
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, path);
    }
  },

  async deleteCategory(id: string) {
    const path = `categories/${id}`;
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  },

  // Orders
  async getOrders() {
    const path = 'orders';
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
    }
  },

  async updateOrderStatus(id: string, status: string) {
    const path = `orders/${id}`;
    try {
      await updateDoc(doc(db, 'orders', id), {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, path);
    }
  },

  // Users Management
  async getUsers() {
    const path = 'users';
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppUser));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
    }
  },

  async addUser(userData: Omit<AppUser, 'id'>) {
    const path = 'users';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...userData,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    }
  },

  async updateUser(id: string, userData: Partial<AppUser>) {
    const path = `users/${id}`;
    try {
      await updateDoc(doc(db, 'users', id), {
        ...userData,
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, path);
    }
  },

  async deleteUser(id: string) {
    const path = `users/${id}`;
    try {
      await deleteDoc(doc(db, 'users', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  },

  // Manual Invoices
  async getManualInvoices() {
    const path = 'manualInvoices';
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ManualInvoice));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
    }
  },

  async addManualInvoice(invoice: Omit<ManualInvoice, 'id'>) {
    const path = 'manualInvoices';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...invoice,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    }
  },

  async updateManualInvoice(id: string, invoice: Partial<ManualInvoice>) {
    const path = `manualInvoices/${id}`;
    try {
      await updateDoc(doc(db, 'manualInvoices', id), {
        ...invoice,
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, path);
    }
  },

  async deleteManualInvoice(id: string) {
    const path = `manualInvoices/${id}`;
    try {
      await deleteDoc(doc(db, 'manualInvoices', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  },

  // Sliders
  async getSliders() {
    const path = 'sliders';
    try {
      const q = query(collection(db, path), orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
    }
  },

  async addSlider(slider: { imageUrl: string; title: string; description: string; link: string; order: number }) {
    const path = 'sliders';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...slider,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    }
  },

  async updateSlider(id: string, slider: Partial<{ imageUrl: string; title: string; description: string; link: string; order: number }>) {
    const path = `sliders/${id}`;
    try {
      await updateDoc(doc(db, 'sliders', id), {
        ...slider,
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, path);
    }
  },

  async deleteSlider(id: string) {
    const path = `sliders/${id}`;
    try {
      await deleteDoc(doc(db, 'sliders', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  },

  // Producers
  async getProducers() {
    const path = 'producers';
    try {
      const q = query(collection(db, path), orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
    }
  },

  async addProducer(producer: { name: string; role: string; img: string; story: string; order: number }) {
    const path = 'producers';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...producer,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    }
  },

  async updateProducer(id: string, producer: Partial<{ name: string; role: string; img: string; story: string; order: number }>) {
    const path = `producers/${id}`;
    try {
      await updateDoc(doc(db, 'producers', id), {
        ...producer,
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, path);
    }
  },

  async deleteProducer(id: string) {
    const path = `producers/${id}`;
    try {
      await deleteDoc(doc(db, 'producers', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  },

  // Press / News Coverages
  async getPress() {
    const path = 'press';
    try {
      const q = query(collection(db, path), orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
    }
  },

  async addPress(press: { source: string; title: string; excerpt: string; img: string; link: string; date: string; order: number }) {
    const path = 'press';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...press,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    }
  },

  async updatePress(id: string, press: Partial<{ source: string; title: string; excerpt: string; img: string; link: string; date: string; order: number }>) {
    const path = `press/${id}`;
    try {
      await updateDoc(doc(db, 'press', id), {
        ...press,
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, path);
    }
  },

  async deletePress(id: string) {
    const path = `press/${id}`;
    try {
      await deleteDoc(doc(db, 'press', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  },

  async getSettings() {
    const path = 'settings/general';
    try {
      const docRef = doc(db, 'settings', 'general');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as { logoUrl: string };
        if (data && data.logoUrl) {
          localStorage.setItem('siteLogo', data.logoUrl);
        }
        return data;
      }
      return null;
    } catch (e) {
      return null;
    }
  },

  async updateSettings(settings: { logoUrl: string }) {
    const path = 'settings/general';
    try {
      const docRef = doc(db, 'settings', 'general');
      await setDoc(docRef, {
        ...settings,
        updatedAt: serverTimestamp()
      });
      if (settings.logoUrl) {
        localStorage.setItem('siteLogo', settings.logoUrl);
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  }
};

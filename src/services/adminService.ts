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
  getDoc
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
  }
};

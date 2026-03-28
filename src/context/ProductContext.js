import { createContext, useContext, useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const auth = useAuth();
  const user = auth?.user;
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sincronizar productos desde Firestore
  useEffect(() => {
    if (!user) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(collection(db, 'products'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching products:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  // Sincronizar categorías desde Firestore
  useEffect(() => {
    if (!user) {
      setCategories([]);
      return;
    }

    const q = query(collection(db, 'categories'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const categoriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCategories(categoriesData);
    }, (error) => {
      console.error('Error fetching categories:', error);
    });

    return unsubscribe;
  }, [user]);

  // Sincronizar adicionales desde Firestore
  useEffect(() => {
    if (!user) {
      setAddons([]);
      return;
    }

    const q = query(collection(db, 'addons'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const addonsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAddons(addonsData);
    }, (error) => {
      console.error('Error fetching addons:', error);
    });

    return unsubscribe;
  }, [user]);

  // Funciones CRUD Productos
  const addProduct = async (product) => {
    if (!user) throw new Error('User not authenticated');
    try {
      const docRef = await addDoc(collection(db, 'products'), {
        ...product,
        userId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return { id: docRef.id, ...product };
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const updateProduct = async (id, data) => {
    if (!user) throw new Error('User not authenticated');
    try {
      const productRef = doc(db, 'products', id);
      await updateDoc(productRef, {
        ...data,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id) => {
    if (!user) throw new Error('User not authenticated');
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  const getProductById = (id) => products.find(p => p.id === id);

  // Funciones CRUD Categorías
  const addCategory = async (category) => {
    if (!user) throw new Error('User not authenticated');
    try {
      const docRef = await addDoc(collection(db, 'categories'), {
        ...category,
        userId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return { id: docRef.id, ...category };
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  };

  const updateCategory = async (id, data) => {
    if (!user) throw new Error('User not authenticated');
    try {
      const categoryRef = doc(db, 'categories', id);
      await updateDoc(categoryRef, {
        ...data,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  };

  const deleteCategory = async (id) => {
    if (!user) throw new Error('User not authenticated');
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };

  // Funciones CRUD Adicionales
  const addAddon = async (addon) => {
    if (!user) throw new Error('User not authenticated');
    try {
      const docRef = await addDoc(collection(db, 'addons'), {
        ...addon,
        userId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return { id: docRef.id, ...addon };
    } catch (error) {
      console.error('Error adding addon:', error);
      throw error;
    }
  };

  const updateAddon = async (id, data) => {
    if (!user) throw new Error('User not authenticated');
    try {
      const addonRef = doc(db, 'addons', id);
      await updateDoc(addonRef, {
        ...data,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating addon:', error);
      throw error;
    }
  };

  const deleteAddon = async (id) => {
    if (!user) throw new Error('User not authenticated');
    try {
      await deleteDoc(doc(db, 'addons', id));
    } catch (error) {
      console.error('Error deleting addon:', error);
      throw error;
    }
  };

  // Obtener productos activos
  const getActiveProducts = () => products.filter(p => p.status === 'active');

  // Obtener productos por categoría
  const getProductsByCategory = (category) => {
    return products.filter(p => p.category === category && p.status === 'active');
  };

  // Obtener categorías activas
  const getActiveCategories = () => categories.filter(c => c.status === 'active');

  const value = {
    products,
    categories,
    addons,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    addCategory,
    updateCategory,
    deleteCategory,
    addAddon,
    updateAddon,
    deleteAddon,
    getActiveProducts,
    getProductsByCategory,
    getActiveCategories,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts debe usarse dentro de ProductProvider');
  }
  return context;
};

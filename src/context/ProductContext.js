import { createContext, useContext, useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import { mockCategories, mockProducts, mockAddons } from '../data/mockFirebaseData';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const auth = useAuth();
  const user = auth?.user;
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataloaded, setDataLoaded] = useState(false);

  // Cargar datos de Firestore en tiempo real
  useEffect(() => {
    if (!user) {
      setProducts([]);
      setCategories([]);
      setAddons([]);
      setDataLoaded(false);
      return;
    }

    setLoading(true);

    // Listener para productos
    const productsQuery = query(
      collection(db, `users/${user.uid}/products`),
      where('userId', '==', user.uid)
    );

    const unsubscribeProducts = onSnapshot(
      productsQuery,
      (snapshot) => {
        const productsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        // Si no hay productos en Firestore, usar datos mock
        if (productsData.length === 0) {
          const productsWithId = mockProducts.map((p, i) => ({
            id: `prod_${i}`,
            userId: user.uid,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...p
          }));
          setProducts(productsWithId);
        } else {
          setProducts(productsData);
        }
      },
      (error) => {
        console.warn('⚠️ Error cargando productos:', error.message);
        // Fallback a datos mock
        const productsWithId = mockProducts.map((p, i) => ({
          id: `prod_${i}`,
          userId: user.uid,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...p
        }));
        setProducts(productsWithId);
      }
    );

    // Listener para categorías
    const categoriesQuery = query(
      collection(db, `users/${user.uid}/categories`),
      where('userId', '==', user.uid)
    );

    const unsubscribeCategories = onSnapshot(
      categoriesQuery,
      (snapshot) => {
        const categoriesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        if (categoriesData.length === 0) {
          const categoriesWithId = mockCategories.map((c, i) => ({
            id: `cat_${i}`,
            userId: user.uid,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...c
          }));
          setCategories(categoriesWithId);
        } else {
          setCategories(categoriesData);
        }
      },
      (error) => {
        console.warn('⚠️ Error cargando categorías:', error.message);
        const categoriesWithId = mockCategories.map((c, i) => ({
          id: `cat_${i}`,
          userId: user.uid,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...c
        }));
        setCategories(categoriesWithId);
      }
    );

    // Listener para addons
    const addonsQuery = query(
      collection(db, `users/${user.uid}/addons`),
      where('userId', '==', user.uid)
    );

    const unsubscribeAddons = onSnapshot(
      addonsQuery,
      (snapshot) => {
        const addonsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        if (addonsData.length === 0) {
          const addonsWithId = mockAddons.map((a, i) => ({
            id: `addon_${i}`,
            userId: user.uid,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...a
          }));
          setAddons(addonsWithId);
        } else {
          setAddons(addonsData);
        }
      },
      (error) => {
        console.warn('⚠️ Error cargando addons:', error.message);
        const addonsWithId = mockAddons.map((a, i) => ({
          id: `addon_${i}`,
          userId: user.uid,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...a
        }));
        setAddons(addonsWithId);
      }
    );

    setDataLoaded(true);
    setLoading(false);

    return () => {
      unsubscribeProducts();
      unsubscribeCategories();
      unsubscribeAddons();
    };
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

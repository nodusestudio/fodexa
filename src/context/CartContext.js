import React, { createContext, useContext, useReducer, useMemo, useEffect, useRef } from 'react';
import { collection, addDoc, doc, updateDoc, deleteDoc, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const initialState = {
  items: [],
  customer: null,
  savedCarts: [],
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(item => item.id === action.payload.id);
      let items;
      if (existing) {
        items = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        items = [...state.items, { ...action.payload }];
      }
      return { ...state, items };
    }
    case 'REMOVE_ITEM': {
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.id),
      };
    }
    case 'UPDATE_QUANTITY': {
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    }
    case 'CLEAR_CART': {
      return { ...state, items: [] };
    }
    case 'SET_CUSTOMER': {
      return { ...state, customer: action.payload };
    }
    case 'UPDATE_ADDONS': {
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, addons: action.payload.addons }
            : item
        ),
      };
    }
    case 'UPDATE_ITEM_NOTES': {
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, notes: action.payload.notes }
            : item
        ),
      };
    }
    case 'SET_SAVED_CARTS': {
      return {
        ...state,
        savedCarts: action.payload,
      };
    }
    case 'LOAD_SAVED_CART': {
      return {
        ...state,
        items: action.payload.items,
        customer: action.payload.customer,
      };
    }
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const auth = useAuth();
  const user = auth?.user;
  const uid = user?.uid;
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const savedCartsRef = useRef([]);
  const isProcessingSavedCartsRef = useRef(false);
  const lastProcessedSavedCartsRef = useRef('');

  savedCartsRef.current = state.savedCarts;

  // Sincronizar carritos guardados desde Firestore
  useEffect(() => {
    if (!uid) {
      if (savedCartsRef.current.length) {
        dispatch({ type: 'SET_SAVED_CARTS', payload: [] });
      }
      lastProcessedSavedCartsRef.current = '';
      return;
    }

    const q = query(collection(db, 'savedCarts'), where('userId', '==', uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (isProcessingSavedCartsRef.current) return;
      isProcessingSavedCartsRef.current = true;

      try {
        const carts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        const incomingStr = JSON.stringify(carts);
        if (
          lastProcessedSavedCartsRef.current === incomingStr ||
          JSON.stringify(savedCartsRef.current) === incomingStr
        ) {
          return;
        }

        lastProcessedSavedCartsRef.current = incomingStr;
        dispatch({ type: 'SET_SAVED_CARTS', payload: carts });
      } finally {
        isProcessingSavedCartsRef.current = false;
      }
    }, (error) => {
      isProcessingSavedCartsRef.current = false;
      console.error('Error fetching saved carts:', error);
    });

    return unsubscribe;
  }, [uid]);

  const addItem = (item) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeItem = (id) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  };

  const updateQuantity = (id, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const setCustomer = (customer) => {
    dispatch({ type: 'SET_CUSTOMER', payload: customer });
  };

  const updateAddons = (id, addons) => {
    dispatch({ type: 'UPDATE_ADDONS', payload: { id, addons } });
  };

  const updateItemNotes = (id, notes) => {
    dispatch({ type: 'UPDATE_ITEM_NOTES', payload: { id, notes } });
  };

  // Guardar carrito en Firestore
  const saveCart = async (name) => {
    if (!user) throw new Error('User not authenticated');
    try {
      const cartData = {
        userId: user.uid,
        name,
        items: state.items,
        customer: state.customer,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const docRef = await addDoc(collection(db, 'savedCarts'), cartData);
      return { id: docRef.id, ...cartData };
    } catch (error) {
      console.error('Error saving cart:', error);
      throw error;
    }
  };

  // Actualizar carrito guardado
  const updateSavedCart = async (cartId, updates) => {
    if (!user) throw new Error('User not authenticated');
    try {
      const cartRef = doc(db, 'savedCarts', cartId);
      await updateDoc(cartRef, {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating saved cart:', error);
      throw error;
    }
  };

  // Eliminar carrito guardado
  const deleteSavedCart = async (cartId) => {
    if (!user) throw new Error('User not authenticated');
    try {
      await deleteDoc(doc(db, 'savedCarts', cartId));
    } catch (error) {
      console.error('Error deleting saved cart:', error);
      throw error;
    }
  };

  // Cargar un carrito guardado
  const loadSavedCart = (cart) => {
    dispatch({ type: 'LOAD_SAVED_CART', payload: cart });
  };

  const total = useMemo(
    () => state.items.reduce((sum, item) => {
      const addonsTotal = Array.isArray(item.addons)
        ? item.addons.reduce((aSum, addon) => aSum + (parseFloat(addon.price) || 0), 0) * (item.quantity || 1)
        : 0;
      return sum + (parseFloat(item.price) || 0) * (item.quantity || 1) + addonsTotal;
    }, 0),
    [state.items]
  );

  const value = useMemo(() => ({
    items: state.items,
    customer: state.customer,
    savedCarts: state.savedCarts,
    addItem,
    removeItem,
    updateQuantity,
    updateAddons,
    updateItemNotes,
    clearCart,
    setCustomer,
    saveCart,
    updateSavedCart,
    deleteSavedCart,
    loadSavedCart,
    total,
  }), [state.items, state.customer, state.savedCarts, total]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

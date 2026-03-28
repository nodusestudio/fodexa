import React, { createContext, useContext, useReducer, useMemo } from 'react';

const CartContext = createContext();

const initialState = {
  items: [],
  customer: null,
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
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

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

  const total = useMemo(
    () => state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [state.items]
  );


  const updateItemNotes = (id, notes) => {
    dispatch({ type: 'UPDATE_ITEM_NOTES', payload: { id, notes } });
  };

  const value = useMemo(() => ({
    items: state.items,
    customer: state.customer,
    addItem,
    removeItem,
    updateQuantity,
    updateAddons,
    updateItemNotes,
    clearCart,
    setCustomer,
    total,
  }), [state.items, state.customer, total]);

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

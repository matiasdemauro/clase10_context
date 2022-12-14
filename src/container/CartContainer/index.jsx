import React from 'react'
import { useContext } from 'react'
import { Shop } from './../../context/ShopProvider';
import { DataGrid } from '@mui/x-data-grid';
import { Button, CircularProgress} from '@mui/material';
import ordenGenerada from '../../services/generarOrden';
import { collection, addDoc } from "firebase/firestore";
//import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from './../../firebase/config';
import { useState } from 'react';
import guardarOrden from './../../services/guardarOrden';
import { Link } from 'react-router-dom';

const Cart = () => {
  //primero consumo el Context
  //luego muestro lo que hay en Context
  //Muestro el carrito Cart con boton eliminar y vaciar Cart.
  const { cart, removeItem, clearCart, totalPrice } = useContext(Shop)
  const [loading, setLoading] = useState(false);
  const renderImage = (image) => {
    return (
      <img
        src={image.value}
        alt='cart-product'
        style={{ height: '120px' }}
      ></img>
    );
  };
  const renderRemoveButton = (item) => {
    const product = item.value;
    return (
      <Button
        onClick={() => removeItem(product)}
        variant='contained'
        color='error'
      >
        Remove
      </Button>
    );
  };
  const handleBuy = async () => {
    setLoading(true);
    const importeTotal = totalPrice(cart);
    const orden = ordenGenerada('Matias', 'matias@gmail.com', '3254124', cart, importeTotal);
    console.log(orden);
    // Genero un nuevo documento en mi base de datos llamada orders utilizando el codigo proporcionado en firebase
    const docRef = await addDoc(collection(db, "orders"), orden);
    //Actualizamos el stock del producto
    guardarOrden(cart, orden);
    //     
    setLoading(false);
    alert(' Gracias por su compra, Orden generada con ID: ' + docRef.id);

  }
  const columns = [
    { field: 'image', headerName: 'Producto', width: 250, renderCell: renderImage },
    { field: 'title', headerName: 'Detalle', width: 250 },
    { field: 'quantity', headerName: 'Cantidad', width: 80 },
    { field: 'price', headerName: 'Subtotal', width: 100 },
    {
      field: 'remove',
      headerName: 'Remove',
      renderCell: renderRemoveButton,
      width: 120,
    },
  ];
  const filas = [];
  cart.forEach(item => {
    filas.push({
      id: item.id,
      image: item.image,
      title: item.title,
      quantity: item.quantity,
      remove: item,
      price: `$${item.price * item.quantity}`,
    });
  });
  console.log(cart);


  if(cart.length === 0) {
    return <div>
      <h4>No hay items en el carrito</h4>
     <Link to='/'>Volver al cat??logo</Link>
    </div>
  }
  else{
  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={filas}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10]}
        rowHeight={150}
      />
      <p >Total:</p>
      <Button onClick={clearCart} color='error' variant='outlined'>Clear cart</Button>
      {loading ? (<div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </div>)
        :

        <Button onClick={handleBuy} >Confirmar Compra</Button>
      }
    </div>
  );}
};
export default Cart
'use client'
import React, { useState, useEffect } from 'react'
import { Foodform } from './components/Foodform'
import { collection, getDocs, onSnapshot,updateDoc,writeBatch } from '@firebase/firestore'
import db from '@/firebase.config'
import { CreateInput } from './components/CreateInput'


const Home = () => {
  const [getFoodList, setGetFoodList] = useState([])
  const [toggle, setToggle] = useState(true)  
  const [foodlist2, setFoodlist2] = useState([])

  useEffect(() => {
    let unsubscribe;
  
    if (toggle) {
      unsubscribe = onSnapshot(collection(db, 'matlista'), (snapshot) => {
        const foodlist = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGetFoodList(foodlist);
      });
    }
  
    return () => {
      if (unsubscribe) {
        unsubscribe(); // Avregistrera lyssnaren
      }
    };
  }, [toggle]);

  useEffect(() => {
    let unsubscribe;
  
    if (!toggle) {
      unsubscribe = onSnapshot(collection(db, 'svärmorslistan'), (snapshot) => {
        const foodlist = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFoodlist2(foodlist);
      });
    }
  
    return () => {
      if (unsubscribe) {
        unsubscribe(); // Avregistrera lyssnaren
      }
    };
  }, [toggle]);

  useEffect(() => {
    const foodlist = []
    if(toggle){
      const unsubscribeMatlista = onSnapshot(collection(db, 'matlista'), (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const docData = change.doc.data()
          if (change.type === 'added') {
            foodlist.push({ id: change.doc.id, title: docData.title, items: [] })
            setupItemsListener(change.doc.id)
          }
          if (change.type === 'modified') {
            const index = foodlist.findIndex(item => item.id === change.doc.id)
            if (index > -1) {
              foodlist[index] = { ...foodlist[index], ...docData }
            }
          }
          if (change.type === 'removed') {
            const index = foodlist.findIndex(item => item.id === change.doc.id)
            if (index > -1) {
              foodlist.splice(index, 1)
            }
          }
        })
        setGetFoodList([...foodlist])
      })
  
      const setupItemsListener = (docId) => {
        const itemsCollection = collection(db, 'matlista', docId, 'items')
        onSnapshot(itemsCollection, (itemsSnapshot) => {
          const items = itemsSnapshot.docs.map(itemDoc => ({ id: itemDoc.id, ...itemDoc.data() }))
          const index = foodlist.findIndex(item => item.id === docId)
          if (index > -1) {
            foodlist[index].items = items
          }
          setGetFoodList([...foodlist])
        })
      }
  
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
              console.log('Service Worker registered with scope:', registration.scope);
            }, err => {
              console.log('Service Worker registration failed:', err);
            });
        });
      }
  
      return () => unsubscribeMatlista()
    }
  }, [toggle])
  

  useEffect(() => {
    const foodlist = []
   

    if(!toggle){
      const unsubscribeMatlista = onSnapshot(collection(db, 'svärmorslistan'), (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const docData = change.doc.data()
          if (change.type === 'added') {
            foodlist.push({ id: change.doc.id, title: docData.title, items: [] })
            setupItemsListener(change.doc.id)
          }
          if (change.type === 'modified') {
            const index = foodlist.findIndex(item => item.id === change.doc.id)
            if (index > -1) {
              foodlist[index] = { ...foodlist[index], ...docData }
            }
          }
          if (change.type === 'removed') {
            const index = foodlist.findIndex(item => item.id === change.doc.id)
            if (index > -1) {
              foodlist.splice(index, 1)
            }
          }
        })
        setFoodlist2([...foodlist])
      })
  
      const setupItemsListener = (docId) => {
        const itemsCollection = collection(db, 'svärmorslistan', docId, 'items')
        onSnapshot(itemsCollection, (itemsSnapshot) => {
          const items = itemsSnapshot.docs.map(itemDoc => ({ id: itemDoc.id, ...itemDoc.data() }))
          const index = foodlist.findIndex(item => item.id === docId)
          if (index > -1) {
            foodlist[index].items = items
          }
          setFoodlist2([...foodlist])
        })
      }
  
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
              console.log('Service Worker registered with scope:', registration.scope);
            }, err => {
              console.log('Service Worker registration failed:', err);
            });
        });
      }
  
      return () => unsubscribeMatlista()
    }
  }, [toggle])

  const handleDeleteAll = async () => {
    if(toggle){
      try {
        // Pausa lyssnaren temporärt
        setGetFoodList([]);
    
        const querySnapshot = await getDocs(collection(db, 'matlista'));
        const batch = writeBatch(db);
    
        for (const doc of querySnapshot.docs) {
          const itemsCollection = collection(db, 'matlista', doc.id, 'items');
          const itemsSnapshot = await getDocs(itemsCollection);
    
          itemsSnapshot.forEach((itemDoc) => {
            batch.delete(itemDoc.ref);
          });
    
          batch.delete(doc.ref);
        }
    
        await batch.commit();
      } catch (error) {
        console.log(error.message);
      }
    }
    if(!toggle){
      try {
        // Pausa lyssnaren temporärt
        setFoodlist2([]);
    
        const querySnapshot = await getDocs(collection(db, 'svärmorslistan'));
        const batch = writeBatch(db);
    
        for (const doc of querySnapshot.docs) {
          const itemsCollection = collection(db, 'svärmorslistan', doc.id, 'items');
          const itemsSnapshot = await getDocs(itemsCollection);
    
          itemsSnapshot.forEach((itemDoc) => {
            batch.delete(itemDoc.ref);
          });
    
          batch.delete(doc.ref);
        }
    
        await batch.commit();
      } catch (error) {
        console.log(error.message);
      }
    }
    
  }

const handleDelete = (id) => {
  setGetFoodList((prev) => prev.filter((foodItem) => foodItem.id !== id));
};

const handleDelete2 = (id) => {
  setFoodlist2((prev) => prev.filter((foodItem) => foodItem.id !== id));
};

function onToggle(){
  setToggle(prev => !prev)
}


  return (
    <>
      <div className='bg-slate-400 flex gap-3 justify-end items-center p-5 overflow-auto'>
        {
          toggle ? 
          <button className='px-4 py-2 bg-emerald-400 rounded-full text-white font-semibold' onClick={onToggle}>Linneas och Vincents lista</button>
          : <button className='px-4 py-2 bg-orange-400 rounded-full text-white font-semibold' onClick={onToggle} >Marias och Per-Eriks lista</button>
        }
        <button onClick={handleDeleteAll} className='px-3 py-2 bg-red-700 text-white font-bold rounded-md'>Rensa</button>
      </div>
      <div className=' bg-slate-400 h-screen pt-10 flex flex-col items-center overflow-auto'>
        <form>
          <h1 className='text-center text-3xl text-white font-bold mb-5'>Matlista</h1>
          <CreateInput toggle={toggle}/>
        </form>
        {
         toggle && getFoodList.map((food) => {
            return <Foodform key={food.id} food={food} toggle={toggle} onDelete={handleDelete}/>
          })
        }
        {
          !toggle && foodlist2.map((food) => {
            return <Foodform key={food.id} food={food} toggle={toggle} onDelete2={handleDelete2}/>
          })
        }
      </div>
    </>
  )
}

export default Home

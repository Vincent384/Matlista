'use client'
import React, { useState, useEffect } from 'react'
import { Foodform } from './components/Foodform'
import { collection, getDocs, onSnapshot,updateDoc,writeBatch } from '@firebase/firestore'
import db from '@/firebase.config'
import { CreateInput } from './components/CreateInput'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AlignJustify, Undo } from 'lucide-react'
import Link from 'next/link'

const Home = () => {
  const [getFoodList, setGetFoodList] = useState([])
  const [UndoList, setUndoList] = useState([])

  useEffect(() => {
    const foodlist = []
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

    return () => unsubscribeMatlista()
  }, [])

  const handleDeleteAll = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'matlista'))
      const batch = writeBatch(db)
      querySnapshot.forEach(doc => {
        batch.delete(doc.ref)
      })
      await batch.commit()
      setGetFoodList([])
    } catch (error) {
      console.log(error.message)
    }
  }

const handleDelete = (id) => {
  setGetFoodList((prev) => prev.filter((foodItem) => foodItem.id !== id));
};

  return (
    <>
      <div className='bg-slate-400 flex justify-between items-center p-5 overflow-auto'>
        <button onClick={handleDeleteAll} className='px-3 py-2 bg-red-700 text-white font-bold rounded-md'>Rensa</button>
      </div>
      <div className=' bg-slate-400 h-screen pt-10 flex flex-col items-center overflow-auto'>
        <form>
          <h1 className='text-center text-3xl text-white font-bold mb-5'>Matlista</h1>
          <CreateInput/>
        </form>
        {
          getFoodList.map((food) => {
            return <Foodform key={food.id} food={food} onDelete={handleDelete}/>
          })
        }
      </div>
    </>
  )
}

export default Home

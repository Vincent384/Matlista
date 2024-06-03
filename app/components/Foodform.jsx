import React, { useState } from 'react'
import { Pen, Trash, X } from 'lucide-react'
import { doc, deleteDoc, collection, getDocs, writeBatch, getDoc, updateDoc } from '@firebase/firestore'
import db from '@/firebase.config'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export const Foodform = ({ food, onDelete }) => {

  const [editFood, setEditFood] = useState({id:null,text:''})

  const handleDelete = async () => {
    try {
      // Delete all documents in the sub-collection first
      const itemsCollection = collection(db, 'matlista', food.id, 'items')
      const itemsSnapshot = await getDocs(itemsCollection)
      const batch = writeBatch(db)
      itemsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref)
      })
      await batch.commit()

      await deleteDoc(doc(db, 'matlista', food.id))
      onDelete(food.id)
    } catch (error) {
      console.log(error.message)
    }
  }

  const handleDeleteItem = async (itemName) => {
    try {
      const itemToDelete = food.items.find(item => item.food === itemName);
      if (!itemToDelete) {
        console.error(`Item '${itemName}' not found in food items.`);
        return;
      }
  
      const itemDocRef = doc(db, 'matlista', food.id, 'items', itemToDelete.id);
      await deleteDoc(itemDocRef);
      onDelete(itemName,itemName.food)
    } catch (error) {
      console.log(error.message);
    }
  }

  const handleUpdate = async(itemId) =>{
    try {
      const foodRef = doc(db, 'matlista', food.id, 'items', itemId) 
      console.log(foodRef)
      await updateDoc(foodRef,{food:editFood.text})
      setEditFood({id:null,text:''})
    } catch (error) {
     console.log(error.message) 
    }
  }


  return (
    <div className='w-[300px] border mt-4 bg-white/70 rounded-md'>
    <div className='relative'>
      <h2 className='text-center text-xl font-bold my-3'>{food.title}</h2>
      <X onClick={handleDelete} className='absolute top-0 right-3 cursor-pointer' />
    </div>
    {food.items.map(item => (
      <div key={item.id} className='flex justify-between px-2 py-1 border bg-slate-100 rounded-md mb-2 mx-1 overflow-auto'>
        {editFood && editFood.id === item.id ? (
          <Input
            value={editFood.text}
            onChange={e => setEditFood({ ...editFood, text: e.target.value })}
          />
        ) : (
          <p className='text-lg pr-2'>{item.food}</p>
        )}
        <div className='flex gap-1'>
          {editFood.id === item.id ? (
            <>
              <Button className='bg-green-700 ml-1' onClick={() => handleUpdate(item.id)}>Spara</Button>
              <Button className='bg-red-700' onClick={() => setEditFood({ id: null, text: '' })}>Avbryt</Button>
            </>
          ) : (
            <>
              <Pen onClick={() => setEditFood({ id: item.id, text: item.food })} className='cursor-pointer' />
              <Trash onClick={() => handleDeleteItem(item.food)} className='text-red-600 cursor-pointer' />
            </>
          )}
        </div>
      </div>
    ))}
  </div>
  )
}

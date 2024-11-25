import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { addDoc, collection, doc, getDoc, setDoc } from '@firebase/firestore'
import db from '@/firebase.config'

export const CreateInput = ({toggle}) => {
  const [selectForm, setSelectForm] = useState('')
  const [inputFoodForm, setInputFoodForm] = useState({
    foodName: ''
  })

  const handleSelectChange = (value) => {
    setSelectForm(value)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    console.log('Input Change:', name, value)
    setInputFoodForm((prevForm) => ({
      ...prevForm,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if(inputFoodForm.foodName === ''){
      return
    }
    if(toggle){
      try {
          const categoryDocRef = doc(db,'matlista',selectForm)
          const categoryDoc = await getDoc(categoryDocRef)
  
          if(!categoryDoc.exists()){
              await setDoc(categoryDocRef,{title:selectForm})
          }
  
          const itemsCollectionRef = collection(categoryDocRef,'items')
          await addDoc(itemsCollectionRef,{food:inputFoodForm.foodName})
          setInputFoodForm({foodName:''})
  
      } catch (error) {
        console.log(error.message)
      }
    }

    if(!toggle){
      try {
        const categoryDocRef = doc(db,'svärmorslistan',selectForm)
        const categoryDoc = await getDoc(categoryDocRef)

        if(!categoryDoc.exists()){
            await setDoc(categoryDocRef,{title:selectForm})
        }

        const itemsCollectionRef = collection(categoryDocRef,'items')
        await addDoc(itemsCollectionRef,{food:inputFoodForm.foodName})
        setInputFoodForm({foodName:''})

    } catch (error) {
      console.log(error.message)
    }
    }

    
  }

  return (
    <>
      <div className='flex mx-5'>
        
          <Input
            name='foodName'
            value={inputFoodForm.foodName}
            onChange={handleInputChange}
            placeholder='Skriv in mat'
          />
          <Select onValueChange={handleSelectChange}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Protein">Protein</SelectItem>
              <SelectItem value="Grönsaker">Grönsaker</SelectItem>
              <SelectItem value="Hushåll">Hushåll</SelectItem>
              <SelectItem value="Frys">Frys</SelectItem>
              <SelectItem value="Basvaror">Basvaror</SelectItem>
              <SelectItem value="Mejeri">Mejeri</SelectItem>
              <SelectItem value="Snacks">Snacks</SelectItem>
              <SelectItem value="Övrigt">Övrigt</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSubmit} type="submit">Lägg till</Button>
      </div>
    </>
  )
}

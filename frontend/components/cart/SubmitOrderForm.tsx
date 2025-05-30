import { useRouter } from "next/navigation"
import { useStore } from "@/src/store"
import { toast } from "react-toastify"

export default function SubmitOrderForm() {
  const router = useRouter()
  const contents = useStore(state => state.contents)
  const total = useStore(state => state.total)
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar que hay productos en el carrito
    if (contents.length === 0) {
      toast.error('No hay productos en el carrito')
      return
    }
    
    // Validar que el total sea mayor a 0
    if (total <= 0) {
      toast.error('El total debe ser mayor a 0')
      return
    }
    
    // Redirigir a la página de payment donde se guardará la orden
    router.push('/payment')
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="submit"
        className="mt-5 w-full bg-indigo-600 hover:bg-indigo-700 cursor-pointer text-white uppercase font-bold p-3 transition-colors"
        value="Proceder al Pago"
        disabled={contents.length === 0 || total <= 0}
      />
    </form>
  )
}
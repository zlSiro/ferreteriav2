import { CategoryWithProductsResponseSchema } from "@/src/schemas"
import ProductCard from "@/components/products/productCard"
import { redirect } from "next/navigation"

type Params = Promise<{categoryId: string}>

async function getProducts(categoryId : string) {
  const url = `${process.env.API_URL}/categories/${categoryId}?products=true`
  const req = await fetch(url, {
    next: {
      tags: ["products-by-category"]
    }
  })
  const json = await req.json()
  if (!req.ok) { //si la consulta no es correcta o no existe lo redireccionamos
    redirect("/1")
  }
  const products = CategoryWithProductsResponseSchema.parse(json)
  return products
}

export default async function StorePage({params} : {params: Params}) {

  const { categoryId } = await params
  const category = await getProducts(categoryId)

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {category.products.map(product => (
        <ProductCard 
          key={product.id}
          product={product}
        />
      ))}
    </div>
  )
}
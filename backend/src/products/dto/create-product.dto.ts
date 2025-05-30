import { IsInt, IsNotEmpty, IsNumber, IsString } from "class-validator"

export class CreateProductDto {
  @IsNotEmpty({message: "El nombre del producto es obligatorio"})
  @IsString({message: "Nombre no válido"})
  name: string

  @IsNotEmpty({message: "El nombre del producto es obligatorio"})
  image: string

  @IsNotEmpty({message: "El precio del producto es obligatorio"})
  @IsNumber({maxDecimalPlaces: 2}, {message: "Precio no válido"})
  price: number

  @IsNotEmpty({message: "La cantidad no puede ir vacia"})
  @IsNumber({maxDecimalPlaces: 0}, {message: "cantidad no válida"})
  inventory: number

  @IsNotEmpty({message: "La categoria es obligatoria"})
  @IsInt({message: "La categoria no es válida"})
  categoryId: number
}

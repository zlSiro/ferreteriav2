import { NextRequest } from "next/server";


export async function GET(request: NextRequest) {
  
  const searchParams = request.nextUrl.searchParams
  const transationDate = searchParams.get("transactionDate")
  const url = `${process.env.API_URL}/transactions?transactionDate=${transationDate}`

  const req = await fetch(url)
  const response = await req.json()
  return Response.json(response)
}
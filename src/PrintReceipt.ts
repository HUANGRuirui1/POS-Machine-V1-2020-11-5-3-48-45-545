import {loadAllItems, loadPromotions} from './Dependencies'

export function printReceipt(tags: string[]): string {
  return generateReceipt(discount(generateOrders(tags)))
}

function generateOrders(tags: string[]): Order[]{
  const items = loadAllItems()
  const ordersMap = new Map<string, Order>()
  for (const singleTag of tags) {
    const tag: string = singleTag.split('-')[0]
    let quantity
    if (singleTag.split('-').length === 1) { quantity = 1 }
    else { quantity = (Number)(singleTag.split('-')[1]) }
    if (ordersMap.has(tag)) {
      ordersMap.get(tag)!.quantity += quantity
    }
    else {
      const item = items.find(item => item.barcode === tag)!
      ordersMap.set(tag, { barcode: item.barcode, name: item.name, unit: item.unit, price: item.price, quantity: quantity, subtotal: 0 } as Order)
    }
  }
  const orders: Order[] = []
  for (const order of ordersMap.values()){
    orders.push(order)
  }
  return orders
}

function discount(orders: Order[]){
  const promotions = loadPromotions()
  const promotionItems: string[] = promotions[0].barcodes
  orders.forEach(order => {
    order.subtotal = order.price * order.quantity
    const promotion = promotionItems.find(item => item === order.barcode)
    if (promotion !== null){
      order.subtotal = order.price * (order.quantity - Math.floor(order.quantity / 3))
    }
  })
  return orders
}

function generateReceipt(discountedOrders: Order[]){
  let total = 0
  let totalBeforeDiscount = 0
  let receipt = '***<store earning no money>Receipt ***\n'
  discountedOrders.forEach(order => {
    total += order.subtotal
    totalBeforeDiscount += order.price * order.quantity
    receipt += `Name：${order.name}，Quantity：${order.quantity} ${order.unit}s，Unit：${order.price.toFixed(2)}(yuan)，Subtotal：${order.subtotal.toFixed(2)}(yuan)\n`
  })
  receipt += `----------------------\nTotal：${total.toFixed(2)}(yuan)\nDiscounted prices：${(totalBeforeDiscount - total).toFixed(2)}(yuan)\n**********************`
  return receipt
}

interface Order{
  barcode: string,
  name: string,
  unit: string,
  price: number,
  quantity: number,
  subtotal: number
}

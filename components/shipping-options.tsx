import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface ShippingOption {
  id: string
  name: string
  description: string
  price: number
  estimatedDays: string
  available: boolean
  popular?: boolean
}

export default function ShippingOptions() {
  const shippingOptions: ShippingOption[] = [
    {
      id: "pathao",
      name: "Pathao Courier",
      description: "Fast delivery within Dhaka",
      price: 60,
      estimatedDays: "1-2 days",
      available: true,
      popular: true,
    },
    {
      id: "redx",
      name: "RedX Delivery",
      description: "Reliable nationwide delivery",
      price: 80,
      estimatedDays: "2-3 days",
      available: true,
      popular: true,
    },
    {
      id: "steadfast",
      name: "Steadfast Courier",
      description: "Express delivery service",
      price: 70,
      estimatedDays: "1-3 days",
      available: true,
    },
    {
      id: "sundarban",
      name: "Sundarban Courier",
      description: "Nationwide coverage",
      price: 90,
      estimatedDays: "3-5 days",
      available: true,
    },
    {
      id: "sa-paribahan",
      name: "SA Paribahan",
      description: "Budget-friendly option",
      price: 50,
      estimatedDays: "3-7 days",
      available: true,
    },
    {
      id: "free-shipping",
      name: "Free Shipping",
      description: "Orders above TK2000",
      price: 0,
      estimatedDays: "5-7 days",
      available: true,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipping Options in Bangladesh</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup defaultValue="pathao" className="space-y-4">
          {shippingOptions.map((option) => (
            <div key={option.id} className="flex items-center space-x-3">
              <RadioGroupItem value={option.id} id={option.id} disabled={!option.available} />
              <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{option.name}</span>
                      {option.popular && (
                        <Badge variant="secondary" className="text-xs">
                          Popular
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                    <p className="text-sm text-muted-foreground">Estimated: {option.estimatedDays}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold">{option.price === 0 ? "FREE" : `TK${option.price}`}</span>
                  </div>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  )
}

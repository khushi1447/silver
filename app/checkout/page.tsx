import Header from "@/components/Header"
import Footer from "@/components/Footer"
import CheckoutForm from "@/components/CheckoutForm"

export const metadata = {
  title: "Checkout | Silverline925",
  description: "Complete your jewelry purchase with secure checkout.",
  robots: {
    index: false,
    follow: true,
  },
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <CheckoutForm />
      <Footer />
    </div>
  )
}

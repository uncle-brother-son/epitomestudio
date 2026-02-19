import Link from 'next/link'
import ContactForm from '@/components/ContactForm'

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      <div className="container py-16 max-w-2xl">
        <div className="mb-8">
          <Link 
            href="/" 
            prefetch={false}
            className="text-blue-600 hover:underline"
          >
            ← Back to Home
          </Link>
        </div>
        
        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-gray-600 mb-8">
          Have a question or want to work together? Send us a message!
        </p>
        
        <ContactForm />
      </div>
    </main>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { PolarCheckout } from '@polar-sh/checkout'

// Stripe promise for checkout
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export interface Subscription {
  id: string
  productId: string
  price: number
  status: 'active' | 'cancelled' | 'past_due'
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
}

export interface CreditInfo {
  current: number
  total: number
  resetDate: Date
  canGenerate: {
    veo: boolean
    klingStandard: boolean
    klingPro: boolean
  }
}

// Custom hook for Polar subscription management
export function usePolar() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [credits, setCredits] = useState<CreditInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch user subscription and credits
  const fetchUserData = async () => {
    try {
      setLoading(true)
      
      const [subRes, creditsRes] = await Promise.all([
        fetch('/api/user/subscription'),
        fetch('/api/user/credits')
      ])
      
      if (subRes.ok && creditsRes.ok) {
        const [subData, creditsData] = await Promise.all([
          subRes.json(),
          creditsRes.json()
        ])
        
        setSubscription(subData.subscription)
        setCredits(creditsData)
      } else {
        throw new Error('Failed to fetch user data')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // Check if user can afford a generation
  const canAffordGeneration = (type: 'veo' | 'klingStandard' | 'klingPro'): boolean => {
    if (!credits) return false
    
    const costs = {
      veo: parseInt(process.env.NEXT_PUBLIC_VEO_CREDIT_COST!),
      klingStandard: parseInt(process.env.NEXT_PUBLIC_KLING_STANDARD_CREDIT_COST!),
      klingPro: parseInt(process.env.NEXT_PUBLIC_KLING_PRO_CREDIT_COST!)
    }
    
    return credits.current >= costs[type]
  }

  // Deduct credits for generation
  const deductCredits = async (creditsToDeduct: number): Promise<boolean> => {
    try {
      const response = await fetch('/api/user/credits/deduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credits: creditsToDeduct })
      })
      
      if (response.ok) {
        const data = await response.json()
        setCredits(prev => prev ? { ...prev, current: data.remainingCredits } : null)
        return true
      }
      return false
    } catch (err) {
      console.error('Credit deduction failed:', err)
      return false
    }
  }

  // Initialize on mount
  useEffect(() => {
    fetchUserData()
  }, [])

  return {
    subscription,
    credits,
    loading,
    error,
    canAffordGeneration,
    deductCredits,
    refetch: fetchUserData
  }
}

// Pricing component
export function PricingCards({ onSubscribe }: { onSubscribe?: () => void }) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleCheckout = async (priceId: string, productId: string) => {
    setLoading(productId)
    
    try {
      // Initialize Polar checkout
      const checkout = await PolarCheckout.create({
        organizationId: process.env.NEXT_PUBLIC_POLAR_ORGANIZATION_ID!,
        priceId,
        successUrl: `${window.location.origin}/dashboard?subscribed=true`,
        cancelUrl: `${window.location.origin}/pricing?cancelled=true`
      })
      
      // Redirect to checkout
      await checkout.redirect()
    } catch (err) {
      console.error('Checkout failed:', err)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  const tiers = [
    {
      id: process.env.NEXT_PUBLIC_POLAR_STARTER_PRODUCT_ID!,
      priceId: process.env.NEXT_PUBLIC_POLAR_STARTER_PRICE_ID!,
      name: 'Starter',
      price: 25,
      credits: 1000,
      features: [
        '1,000 credits/month',
        'Veo video generation',
        'Kling Standard & Pro',
        'Email support'
      ],
      cta: 'Get Started'
    },
    {
      id: process.env.NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID!,
      priceId: process.env.NEXT_PUBLIC_POLAR_PRO_PRICE_ID!,
      name: 'Pro',
      price: 59,
      credits: 3000,
      popular: true,
      features: [
        '3,000 credits/month',
        'Everything in Starter',
        'Priority support',
        'Advanced analytics'
      ],
      cta: 'Go Pro'
    },
    {
      id: process.env.NEXT_PUBLIC_POLAR_AGENCY_PRODUCT_ID!,
      priceId: process.env.NEXT_PUBLIC_POLAR_AGENCY_PRICE_ID!,
      name: 'Agency',
      price: 129,
      credits: 8000,
      features: [
        '8,000 credits/month',
        'Everything in Pro',
        'White-label options',
        'API access',
        'Dedicated support'
      ],
      cta: 'Start Agency'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {tiers.map((tier) => (
        <div
          key={tier.id}
          className={`relative rounded-2xl border ${tier.popular ? 'border-blue-500 shadow-xl' : 'border-gray-200'} bg-white p-8`}
        >
          {tier.popular && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                Most Popular
              </span>
            </div>
          )}
          
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900">{tier.name}</h3>
            <div className="mt-4">
              <span className="text-4xl font-bold text-gray-900">${tier.price}</span>
              <span className="text-gray-500">/month</span>
            </div>
            <p className="mt-2 text-lg font-semibold text-blue-600">
              {tier.credits.toLocaleString()} credits
            </p>
          </div>
          
          <ul className="mt-8 space-y-4">
            {tier.features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="ml-3 text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
          
          <div className="mt-8">
            <button
              onClick={() => handleCheckout(tier.priceId, tier.id)}
              disabled={loading === tier.id}
              className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                tier.popular
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              } disabled:opacity-50`}
            >
              {loading === tier.id ? 'Loading...' : tier.cta}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
import React from 'react';
import { useLocation } from 'wouter';
import { ArrowRight, TrendingUp, PieChart, Target, Shield } from 'lucide-react';

export default function HomePage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">GrowWise</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setLocation('/auth')}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </button>
              <button
                onClick={() => setLocation('/auth')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Master Your Money,
            <span className="text-green-600"> Fuel Your Growth</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Smart financial management for small businesses. Track profits, allocate resources wisely, and achieve your growth goals with confidence.
          </p>
          <button
            onClick={() => setLocation('/auth')}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-semibold inline-flex items-center"
          >
            Start Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need to grow your business
            </h2>
            <p className="text-xl text-gray-600">
              Powerful tools designed specifically for small business owners
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <PieChart className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Profit Allocation</h3>
              <p className="text-gray-600">
                Automatically split your profits between owner pay, reinvestment, savings, and tax reserves.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <Target className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Growth Goal Planning</h3>
              <p className="text-gray-600">
                Set and track business growth goals with intelligent savings recommendations.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <Shield className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Financial Security</h3>
              <p className="text-gray-600">
                Build cash reserves and maintain healthy profit margins for long-term stability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to grow your business smarter?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join thousands of small business owners who trust GrowWise
          </p>
          <button
            onClick={() => setLocation('/auth')}
            className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold"
          >
            Get Started Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-green-400" />
            <span className="ml-2 text-xl font-bold">GrowWise</span>
          </div>
          <p className="text-center text-gray-400 mt-4">
            © 2024 GrowWise. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
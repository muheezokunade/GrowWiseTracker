import { MainLayout } from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CheckCircle } from "lucide-react";

export default function HomePage() {
  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">
        <div className="py-12 lg:py-16">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-4">
              Master Your Money, <span className="text-[#27AE60]">Fuel Your Growth</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              The smart financial app built specifically for small business owners to manage money, allocate profits, and plan for growth.
            </p>
            <div className="mt-8">
              <Link href="/auth">
                <Button size="lg" className="bg-[#27AE60] hover:bg-[#219653] text-lg">
                  Sign up free
                </Button>
              </Link>
              <p className="mt-2 text-sm text-gray-400">No credit card required</p>
            </div>
          </div>
          
          {/* App Screenshot */}
          <div className="relative my-12 max-w-2xl mx-auto">
            <div className="relative z-10 rounded-xl shadow-2xl overflow-hidden border-8 border-white">
              <div className="h-[350px] bg-gray-100 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <svg className="h-16 w-16 text-[#27AE60] mx-auto mb-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                  </svg>
                  <p className="text-lg font-medium mb-2">GrowWise Dashboard</p>
                  <p className="text-sm max-w-xs mx-auto">Track your income, expenses, and profit all in one simple view.</p>
                </div>
              </div>
            </div>
            <div className="absolute top-1/4 -right-4 h-24 w-24 bg-[#6FCF97] rounded-full blur-xl opacity-60"></div>
            <div className="absolute bottom-1/3 -left-8 h-32 w-32 bg-[#27AE60] rounded-full blur-xl opacity-40"></div>
          </div>
          
          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-16">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="h-12 w-12 bg-[#27AE60]/20 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#27AE60]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-heading font-semibold text-xl mb-2">Easy Finance Management</h3>
              <p className="text-gray-600">Track income, expenses and profit in one simple dashboard without accounting jargon.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="h-12 w-12 bg-[#27AE60]/20 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#27AE60]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="font-heading font-semibold text-xl mb-2">Smart Profit Allocation</h3>
              <p className="text-gray-600">Automatically split your profits for owner pay, business reinvestment, and savings.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="h-12 w-12 bg-[#27AE60]/20 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#27AE60]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="font-heading font-semibold text-xl mb-2">Growth Planning</h3>
              <p className="text-gray-600">Set financial goals and track progress with clear visuals and actionable steps.</p>
            </div>
          </div>
          
          {/* Benefits Section */}
          <div className="my-16">
            <h2 className="text-3xl font-heading font-bold text-center mb-12">Why Small Business Owners Love GrowWise</h2>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <CheckCircle className="h-6 w-6 text-[#27AE60]" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-heading font-semibold">Stop guessing, start growing</h3>
                  <p className="text-gray-600 mt-1">Always know exactly where your money is going and how much you can safely reinvest.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <CheckCircle className="h-6 w-6 text-[#27AE60]" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-heading font-semibold">No accounting degree required</h3>
                  <p className="text-gray-600 mt-1">Simplified financial tracking that any business owner can understand and use immediately.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <CheckCircle className="h-6 w-6 text-[#27AE60]" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-heading font-semibold">Always available, even offline</h3>
                  <p className="text-gray-600 mt-1">Access your financial data anytime, anywhere - even without an internet connection.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* CTA Section */}
          <div className="bg-[#27AE60] text-white rounded-xl p-8 text-center my-12">
            <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4">Ready to grow your business smarter?</h2>
            <p className="text-white/80 mb-6 max-w-2xl mx-auto">Join thousands of small business owners who are taking control of their finances and fueling their growth.</p>
            <Link href="/auth">
              <Button size="lg" variant="outline" className="bg-white text-[#27AE60] border-none hover:bg-gray-100">
                Get started now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

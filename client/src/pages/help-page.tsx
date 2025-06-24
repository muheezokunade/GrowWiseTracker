import React from 'react';
import { HelpCircle, MessageCircle, Book, Mail } from 'lucide-react';

export default function HelpPage() {
  const faqs = [
    {
      question: "How do I connect my bank account?",
      answer: "Currently, bank connection is not available. You can manually add transactions through the Transactions page."
    },
    {
      question: "How is profit calculated?",
      answer: "Profit is calculated as Total Revenue minus Total Expenses for the selected time period."
    },
    {
      question: "Can I change my profit split percentages?",
      answer: "Yes! Go to the Profit Split page and adjust the sliders to customize your allocation percentages."
    },
    {
      question: "How do I set up growth goals?",
      answer: "Visit the Growth Goals page and click 'Add Goal' to create new business objectives with target amounts and dates."
    },
    {
      question: "Can I export my financial reports?",
      answer: "Yes, you can generate and download PDF reports from the Reports page."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
          <p className="text-gray-600">Find answers to common questions and get support</p>
        </div>

        {/* Quick Help Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
            <Book className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">User Guide</h3>
            <p className="text-sm text-gray-600 mb-4">
              Learn how to use all GrowWise features effectively
            </p>
            <button className="text-green-600 hover:text-green-700 font-medium">
              View Guide
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
            <MessageCircle className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
            <p className="text-sm text-gray-600 mb-4">
              Get instant help from our support team
            </p>
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              Start Chat
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
            <Mail className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
            <p className="text-sm text-gray-600 mb-4">
              Send us a detailed message about your issue
            </p>
            <button className="text-purple-600 hover:text-purple-700 font-medium">
              Send Email
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <HelpCircle className="h-5 w-5 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Frequently Asked Questions</h3>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {faqs.map((faq, index) => (
              <div key={index} className="p-6">
                <h4 className="font-medium text-gray-900 mb-2">{faq.question}</h4>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Still need help?</h3>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Brief description of your issue"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Describe your issue in detail..."
              ></textarea>
            </div>
            
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
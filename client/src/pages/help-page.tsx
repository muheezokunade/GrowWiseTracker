import { useState } from "react";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Mail, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function HelpPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Message sent",
        description: "We'll get back to you as soon as possible.",
      });
      setName("");
      setEmail("");
      setMessage("");
    }, 1500);
  };

  // Filter FAQs based on search term
  const filterFAQs = (faqs: typeof faqItems) => {
    if (!searchTerm) return faqs;
    
    return faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // FAQ items
  const faqItems = [
    {
      question: "How do I connect my bank account?",
      answer:
        "You can connect your bank account during onboarding or later in Settings. GrowWise uses secure API connections (similar to Plaid) to safely connect to your bank and import transactions. We never store your banking credentials.",
    },
    {
      question: "How is my profit calculated?",
      answer:
        "Profit is calculated as your total income minus your total expenses for the selected time period. GrowWise automatically categorizes your transactions and provides real-time profit calculations.",
    },
    {
      question: "Can I export my financial reports?",
      answer:
        "Yes! You can generate and export Profit & Loss statements, Cash Flow reports, and Growth Analysis reports in PDF format. Visit the Reports section to create and download these reports.",
    },
    {
      question: "What is the Profit Split feature?",
      answer:
        "The Profit Split feature helps you allocate your monthly profit across four categories: Owner Pay, Reinvestment, Savings, and Tax Reserve. This follows the Profit First methodology to ensure your business grows sustainably while you take home consistent owner compensation.",
    },
    {
      question: "How do Growth Goals work?",
      answer:
        "Growth Goals allow you to set specific financial targets for your business, such as saving for equipment purchases or expanding your marketing budget. You can track progress toward these goals over time and GrowWise will provide recommendations on how to achieve them faster.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Absolutely. GrowWise uses bank-level encryption to protect your financial data. We never share your information with third parties without your explicit permission.",
    },
    {
      question: "Can I use GrowWise without connecting my bank?",
      answer:
        "Yes! While bank connections make transaction tracking easier, you can manually add all transactions if you prefer. This gives you full control over your financial data.",
    },
    {
      question: "Can I access GrowWise offline?",
      answer:
        "Yes, GrowWise is a Progressive Web App (PWA) which means it works offline. You can install it on your home screen on mobile devices and access key features even without an internet connection.",
    },
  ];

  const filteredFAQs = filterFAQs(faqItems);

  return (
    <MainLayout title="Help & Support">
      <div className="max-w-4xl mx-auto">
        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search for help..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* FAQ Section */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Find answers to common questions about GrowWise.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredFAQs.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {filteredFAQs.map((faq, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent>{faq.answer}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-gray-500">
                      No FAQs match your search. Try a different term or contact us directly.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Video Tutorials */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Video Tutorials</CardTitle>
                <CardDescription>
                  Watch step-by-step guides on how to use GrowWise.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-100 rounded-md p-5 flex flex-col items-center justify-center text-center h-36">
                    <span className="text-[#27AE60] mb-2">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10 8L16 12L10 16V8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    <h3 className="font-medium mb-1">Getting Started</h3>
                    <p className="text-xs text-gray-500">Learn the basics of GrowWise</p>
                  </div>
                  <div className="bg-gray-100 rounded-md p-5 flex flex-col items-center justify-center text-center h-36">
                    <span className="text-[#27AE60] mb-2">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10 8L16 12L10 16V8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    <h3 className="font-medium mb-1">Using Profit Split</h3>
                    <p className="text-xs text-gray-500">Maximize your profit allocation</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Need More Help?</CardTitle>
                <CardDescription>
                  Send us a message and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#27AE60] hover:bg-[#219653]"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

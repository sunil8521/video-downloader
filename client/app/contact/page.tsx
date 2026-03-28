"use client"
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Mail, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner"
export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent!", { description: "We'll get back to you within 24 hours." });
    setName(""); setEmail(""); setMessage("");
  };

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-[72px]">
        <div className="container mx-auto px-6 py-16 max-w-xl">
          <h1 className="text-4xl font-extrabold text-center mb-4">Contact Us</h1>
          <p className="text-center text-muted-foreground mb-10">
            Have a question? We'd love to hear from you.
          </p>

          <div className="flex items-center justify-center gap-2 text-muted-foreground mb-10">
            <Mail className="h-5 w-5" />
            <span className="text-sm">support@snapload.com</span>
          </div>

          <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-8 shadow-sm border border-border/50 space-y-5">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Name</label>
              <input
                type="text" required value={name} onChange={(e) => setName(e.target.value)}
                className="w-full h-11 bg-surface border border-border rounded-xl px-4 text-sm outline-none focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 bg-surface border border-border rounded-xl px-4 text-sm outline-none focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Message</label>
              <textarea
                required rows={5} value={message} onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl p-4 text-sm outline-none focus:border-accent transition-colors resize-none"
              />
            </div>
            <Button type="submit" variant="default" size="lg" className="w-full">
              <Send className="h-4 w-4" /> Send Message
            </Button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}

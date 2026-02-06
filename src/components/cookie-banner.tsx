"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";
import Link from "next/link";

const COOKIE_CONSENT_KEY = "bermy-banana-cookie-consent";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Check if user has already consented
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    setIsVisible(false);
  };

  // Don't render anything during SSR or if already consented
  if (!isMounted || !isVisible) {
    return null;
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-4 duration-300"
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="container mx-auto max-w-4xl">
        <div className="bg-card border rounded-lg shadow-lg p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            {/* Icon and Text */}
            <div className="flex-1 flex items-start gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-yellow-400/20 shrink-0">
                <Cookie className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground">
                  We use cookies
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We use cookies and similar technologies to enhance your experience, 
                  analyze site usage, and assist in our marketing efforts. By clicking 
                  "Accept", you consent to our use of cookies. Read our{" "}
                  <Link
                    href="/privacy"
                    className="text-yellow-500 hover:text-yellow-600 underline underline-offset-2 transition-colors"
                    onClick={() => setIsVisible(false)}
                  >
                    Privacy Policy
                  </Link>{" "}
                  for more information.
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDecline}
                className="flex-1 md:flex-none"
              >
                Decline
              </Button>
              <Button
                size="sm"
                onClick={handleAccept}
                className="flex-1 md:flex-none bg-yellow-500 hover:bg-yellow-600 text-black"
              >
                Accept
              </Button>
              <button
                onClick={() => setIsVisible(false)}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors md:hidden"
                aria-label="Close cookie banner"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Cookie Preferences Link */}
          <div className="mt-4 pt-4 border-t text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-2">
            <span>
              You can change your cookie preferences at any time in your browser settings.
            </span>
            <Link
              href="/privacy#cookies"
              className="text-yellow-500 hover:text-yellow-600 underline underline-offset-2 transition-colors whitespace-nowrap"
              onClick={() => setIsVisible(false)}
            >
              Learn more about cookies
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CookieBanner;

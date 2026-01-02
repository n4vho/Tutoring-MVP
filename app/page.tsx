import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-8 flex justify-center">
              <Image
                src="/math-academy-logo.jpeg"
                alt="Math Academy Logo"
                width={120}
                height={120}
                className="h-24 w-auto"
                priority
              />
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Specialized Math Coaching for Cadet College Admission
            </h1>
            <p className="mb-4 text-xl text-muted-foreground sm:text-2xl">
              Directed by Jahangir Kabir Sir
            </p>
            <p className="mb-8 text-lg text-muted-foreground">
              Expert preparation for Bangladesh Cadet College admission tests with our Special Care Program, ensuring personalized attention for every student.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/enroll">
                <Button size="lg" className="w-full sm:w-auto">
                  Enroll Now
                </Button>
              </Link>
              <Link href="/enroll/status">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Check Status
                </Button>
              </Link>
              <a href="#contact">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Contact
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Our Programs</h2>
            <p className="text-lg text-muted-foreground">
              Specialized coaching designed for Cadet College admission success
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 text-3xl">🎯</div>
                <h3 className="mb-2 text-xl font-semibold">Cadet College Admission Prep</h3>
                <p className="text-muted-foreground">
                  Specialized Math coaching focused on Bangladesh Cadet College admission test requirements and format.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 text-3xl">💎</div>
                <h3 className="mb-2 text-xl font-semibold">Special Care Program</h3>
                <p className="text-muted-foreground">
                  Personalized attention and tailored guidance to ensure every student receives the support they need to succeed.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 text-3xl">📊</div>
                <h3 className="mb-2 text-xl font-semibold">Regular Assessments</h3>
                <p className="text-muted-foreground">
                  Practice tests and assessments aligned with Cadet College exam patterns to track progress and identify areas for improvement.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 text-3xl">👨‍🏫</div>
                <h3 className="mb-2 text-xl font-semibold">Expert Guidance</h3>
                <p className="text-muted-foreground">
                  Learn under the direction of Jahangir Kabir Sir, with years of experience preparing students for Cadet College admissions.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 text-3xl">👥</div>
                <h3 className="mb-2 text-xl font-semibold">Small Batch Classes</h3>
                <p className="text-muted-foreground">
                  Focused learning groups ensuring individual attention and better understanding of complex mathematical concepts.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 text-3xl">📱</div>
                <h3 className="mb-2 text-xl font-semibold">Online Portal</h3>
                <p className="text-muted-foreground">
                  Access your results, track progress, and view assessment history anytime through our student portal.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-muted py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">How It Works</h2>
            <p className="text-lg text-muted-foreground">
              Simple steps to prepare for Cadet College admission
            </p>
          </div>
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                  1
                </div>
                <h3 className="mb-2 text-lg font-semibold">Enroll</h3>
                <p className="text-sm text-muted-foreground">
                  Submit your enrollment request with basic information
                </p>
              </div>
              <div className="text-center">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                  2
                </div>
                <h3 className="mb-2 text-lg font-semibold">Approval</h3>
                <p className="text-sm text-muted-foreground">
                  We review your application and contact you for confirmation
                </p>
              </div>
              <div className="text-center">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                  3
                </div>
                <h3 className="mb-2 text-lg font-semibold">Join Batch</h3>
                <p className="text-sm text-muted-foreground">
                  Get assigned to a batch with our Special Care Program for personalized attention
                </p>
              </div>
              <div className="text-center">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                  4
                </div>
                <h3 className="mb-2 text-lg font-semibold">Practice & Assess</h3>
                <p className="text-sm text-muted-foreground">
                  Take regular assessments aligned with Cadet College exam patterns and track your progress
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Get In Touch</h2>
            <p className="text-lg text-muted-foreground">
              Have questions? We're here to help
            </p>
          </div>
          <div className="mx-auto max-w-2xl">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="mb-4 text-3xl">📞</div>
                  <h3 className="mb-2 font-semibold">Phone</h3>
                  <p className="text-sm text-muted-foreground">
                    <a href="tel:+8801914070418" className="hover:text-foreground font-medium">
                      +8801914070418
                    </a>
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="mb-4 text-3xl">✉️</div>
                  <h3 className="mb-2 font-semibold">Email</h3>
                  <p className="text-sm text-muted-foreground">
                    <a href="mailto:kabir0718@gmail.com" className="hover:text-foreground">
                      kabir0718@gmail.com
                    </a>
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="mb-4 text-3xl">📍</div>
                  <h3 className="mb-2 font-semibold">Location</h3>
                  <p className="text-sm text-muted-foreground">
                    10 Zilla School Road, Mymensingh
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="mt-8 text-center space-y-3">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/enroll">
                  <Button size="lg">Start Your Enrollment</Button>
                </Link>
                <Link href="/enroll/status">
                  <Button size="lg" variant="outline">Check Enrollment Status</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-3">
              <Image
                src="/math-academy-logo.jpeg"
                alt="Math Academy Logo"
                width={32}
                height={32}
                className="h-8 w-auto opacity-70"
              />
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Math Academy. All rights reserved.
              </p>
            </div>
            <div className="flex gap-4 flex-wrap items-center justify-center">
              <Link href="/enroll" className="text-sm text-muted-foreground hover:text-foreground">
                Enroll
              </Link>
              <Link href="/enroll/status" className="text-sm text-muted-foreground hover:text-foreground">
                Check Status
              </Link>
              <a href="#services" className="text-sm text-muted-foreground hover:text-foreground">
                Services
              </a>
              <a href="#contact" className="text-sm text-muted-foreground hover:text-foreground">
                Contact
              </a>
              <Link href="/admin/login" className="text-xs text-muted-foreground/70 hover:text-muted-foreground">
                Staff Login
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

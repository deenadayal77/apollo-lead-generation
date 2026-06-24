import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LookupClient from '@/components/LookupClient';

function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Paste URL',
      description:
        'Enter any LinkedIn company URL — no CSV, no batch setup, just the company you want.',
      icon: (
        <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
        </svg>
      ),
    },
    {
      number: '02',
      title: 'Apollo Finds People',
      description:
        'Our pipeline queries Apollo.io for the top 5 senior contacts — C-Suite, VP, Director — and reveals their emails.',
      icon: (
        <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
      ),
    },
    {
      number: '03',
      title: 'Get Results',
      description:
        'Names, titles, emails, phone numbers, and LinkedIn profiles — right in the browser. Download as PDF in one click.',
      icon: (
        <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
      ),
    },
  ];

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h2 className="text-2xl font-semibold text-slate-200 mb-3">How It Works</h2>
        <p className="text-slate-400 text-sm">One URL in — five verified decision-makers out</p>
      </div>

      <div className="relative">
        <div
          className="hidden md:block absolute top-10 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"
          aria-hidden="true"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative flex flex-col items-center text-center">
              {index < steps.length - 1 && (
                <div className="md:hidden flex justify-center my-2" aria-hidden="true">
                  <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              )}
              <div className="relative mb-4">
                <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-mono text-slate-500">{step.number}</span>
                    {step.icon}
                  </div>
                </div>
              </div>
              <h3 className="text-base font-semibold text-slate-200 mb-2">{step.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xs">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 grid grid-cols-3 gap-4 p-6 bg-slate-900 border border-slate-800 rounded-xl">
        {[
          { value: '< 30 sec', label: 'Per company lookup' },
          { value: 'Top 5',    label: 'Senior contacts' },
          { value: '95%+',     label: 'Email accuracy' },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-xl font-bold text-blue-400">{stat.value}</div>
            <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-950 border border-blue-800 text-blue-300 text-xs font-medium px-3 py-1 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Powered by Apollo.io
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-100 mb-4 leading-tight">
            Find Decision-Makers Instantly
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
            Paste a LinkedIn company URL and get the top 5 senior contacts — with verified emails,
            titles, and phone numbers — in under 30 seconds.
          </p>
        </section>

        <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <LookupClient />
        </section>

        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}

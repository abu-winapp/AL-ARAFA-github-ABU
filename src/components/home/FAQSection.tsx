'use client';

import { FAQ } from '@/types';

interface FAQSectionProps {
  faqs?: FAQ[];
  error?: string | null;
}

export default function FAQSection({ faqs = [], error = null }: FAQSectionProps) {
  return (
    <section style={{ padding: '80px 0', backgroundColor: '#ffffff' }}>
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
        }}
      >
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: 'rgba(159,0,8,0.1)',
              borderRadius: '9999px',
              padding: '8px 20px',
              marginBottom: '16px',
            }}
          >
            <span
              style={{
                color: '#9f0008',
                fontSize: '14px',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              FAQ
            </span>
          </div>
          <h2
            style={{
              fontSize: '36px',
              fontWeight: 700,
              color: '#1f2937',
              marginBottom: '12px',
            }}
          >
            Frequently Asked Questions
          </h2>
          <p style={{ fontSize: '16px', color: '#6b7280', maxWidth: '600px', margin: '0 auto' }}>
            Find answers to common questions about our food, delivery, and services
          </p>
        </div>

        {/* FAQ Content */}
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Error State */}
          {error && (
            <div
              style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: '16px',
                padding: '24px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#991B1B', marginBottom: '8px' }}>
                Unable to Load FAQs
              </h3>
              <p style={{ fontSize: '14px', color: '#B91C1C', marginBottom: '8px' }}>
                {error}
              </p>
              <p style={{ fontSize: '12px', color: '#9CA3AF' }}>
                This page will automatically refresh with the latest content
              </p>
            </div>
          )}

          {/* Empty State */}
          {!error && faqs.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 24px',
                backgroundColor: '#F5F7FA',
                borderRadius: '16px',
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>❓</div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', marginBottom: '8px' }}>
                No FAQs Available
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>
                Check back soon for answers to common questions
              </p>
            </div>
          )}

          {/* FAQ Items */}
          {!error && faqs.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {faqs.map((faq, index) => (
                <details
                  key={faq.id}
                  className="faq-item"
                  style={{
                    backgroundColor: '#F5F7FA',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '1px solid transparent',
                  }}
                >
                  <summary
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '24px',
                      cursor: 'pointer',
                      listStyle: 'none',
                      userSelect: 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flex: 1 }}>
                      {/* Number Badge */}
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          backgroundColor: '#9f0008',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: '2px',
                        }}
                      >
                        <span style={{ color: 'white', fontSize: '14px', fontWeight: 700 }}>
                          {index + 1}
                        </span>
                      </div>
                      {/* Question */}
                      <h3
                        style={{
                          fontSize: '18px',
                          fontWeight: 700,
                          color: '#1f2937',
                          lineHeight: '1.5',
                        }}
                      >
                        {faq.question}
                      </h3>
                    </div>
                    {/* Chevron Icon */}
                    <svg
                      className="chevron-icon"
                      style={{
                        width: '20px',
                        height: '20px',
                        color: '#9f0008',
                        flexShrink: 0,
                        marginLeft: '16px',
                        transition: 'transform 0.3s',
                      }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  {/* Answer */}
                  <div
                    style={{
                      padding: '0 24px 24px 72px',
                      fontSize: '15px',
                      color: '#4b5563',
                      lineHeight: '1.7',
                    }}
                  >
                    <p style={{ margin: 0 }}>{faq.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FAQ Styles */}
      <style jsx>{`
        .faq-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
          border-color: rgba(159, 0, 8, 0.1);
        }

        details[open] .chevron-icon {
          transform: rotate(180deg);
        }

        summary::-webkit-details-marker {
          display: none;
        }
      `}</style>
    </section>
  );
}

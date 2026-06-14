'use client';
import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CERTIFICATIONS } from '@/lib/constants';

export default function CertificationsSection() {
  const t = useTranslations('achievements');
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);
      gsap.from('.cert-item', {
        opacity: 0,
        x: -20,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: { trigger: containerRef.current, start: 'top 75%' },
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="certifications-section">
      <h2 className="certifications-title">{t('certs_title')}</h2>

      <div className="certifications-list">
        {CERTIFICATIONS.map((cert) => (
          <div key={cert.name} className="cert-item">
            <CheckCircle size={24} className="cert-icon" />
            <div className="cert-info">
              <h3 className="cert-name">{cert.name}</h3>
              <p className="cert-issuer">
                {cert.issuer} · {cert.year}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

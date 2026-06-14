'use client';
import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Github, Linkedin, Mail, MessageCircle } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function ContactSection() {
  const t = useTranslations('achievements');
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);
      gsap.from('.contact-content', {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: containerRef.current, start: 'top 75%' },
      });
      gsap.from('.contact-button', {
        opacity: 0,
        scale: 0.9,
        duration: 0.5,
        stagger: 0.1,
        ease: 'back.out(1.5)',
        scrollTrigger: { trigger: containerRef.current, start: 'top 75%' },
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="contact-section">
      <div className="contact-content">
        <h2 className="contact-title">{t('contact_title')}</h2>
        <p className="contact-subtitle">{t('contact_subtitle')}</p>
      </div>

      <div className="contact-buttons">
        <a href="mailto:shashanksrik@gmail.com" className="contact-button contact-email">
          <Mail size={20} />
          <span>{t('contact_email')}</span>
        </a>
        <a
          href="https://wa.me/817085977438"
          target="_blank"
          rel="noopener noreferrer"
          className="contact-button contact-whatsapp"
        >
          <MessageCircle size={20} />
          <span>{t('contact_whatsapp')}</span>
        </a>
        <a
          href="https://www.linkedin.com/in/shashank-s-bharadwaj-015492271/"
          target="_blank"
          rel="noopener noreferrer"
          className="contact-button contact-linkedin"
        >
          <Linkedin size={20} />
          <span>{t('contact_linkedin')}</span>
        </a>
        <a
          href="https://github.com/shashanksbharadwaj161"
          target="_blank"
          rel="noopener noreferrer"
          className="contact-button contact-github"
        >
          <Github size={20} />
          <span>{t('contact_github')}</span>
        </a>
      </div>
    </section>
  );
}

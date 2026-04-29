import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X, Shield, FileText } from 'lucide-react';
import PrivacyPolicyModal from './PrivacyPolicyModal';
import TermsOfUseModal from './TermsOfUseModal';
import './CookieConsentBanner.css';

const CookieConsentBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    // Verifica se já aceitou
    const hasConsented = localStorage.getItem('pebaspro_lgpd_consent');
    if (!hasConsented) {
      // Pequeno delay para a animação inicial ficar mais fluida caso abra na home
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('pebaspro_lgpd_consent', 'true');
    setIsVisible(false);
  };

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div 
            className="cookie-banner-container"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="cookie-banner-content">
              <div className="cookie-text-section">
                <div className="cookie-icon-wrapper">
                  <Shield size={24} className="cookie-icon" />
                </div>
                <div>
                  <h4 className="cookie-title">Nós respeitamos sua privacidade</h4>
                  <p className="cookie-description">
                    Utilizamos cookies para melhorar sua experiência na plataforma, analisar o tráfego e personalizar conteúdos. 
                    Ao continuar navegando, você concorda com a nossa{' '}
                    <button className="text-btn cookie-link" onClick={() => setShowPrivacy(true)}>
                      Política de Privacidade
                    </button>{' '}
                    e com nossos{' '}
                    <button className="text-btn cookie-link" onClick={() => setShowTerms(true)}>
                      Termos de Uso
                    </button>.
                  </p>
                </div>
              </div>
              <div className="cookie-actions">
                <button className="btn-cookie-accept" onClick={handleAccept}>
                  Entendi e Aceito
                </button>
              </div>
              
              <button className="cookie-close-btn" onClick={() => setIsVisible(false)} aria-label="Fechar Aviso (Temporário)">
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <PrivacyPolicyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
      <TermsOfUseModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </>
  );
};

export default CookieConsentBanner;

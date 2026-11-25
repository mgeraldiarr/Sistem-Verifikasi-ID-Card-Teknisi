// src/app/technician/my-card/components/TechnicianHamburgerDrawer.tsx
'use client';

import React, { useEffect } from 'react';
import { BarChart3, Camera, CreditCard, LogOut, X } from 'lucide-react';
import styles from '../my-card.module.css';

export type TechnicianMenuTab = 'card' | 'grooming' | 'performance';

interface MenuItem {
  id: TechnicianMenuTab;
  label: string;
  icon: React.ReactNode;
}

export const TECHNICIAN_MENU_ITEMS: MenuItem[] = [
  { id: 'card', label: 'Kartu ID Digital', icon: <CreditCard size={17} /> },
  { id: 'grooming', label: 'Monitoring Grooming', icon: <Camera size={17} /> },
  { id: 'performance', label: 'Performa & KPI', icon: <BarChart3 size={17} /> },
];

interface TechnicianHamburgerDrawerProps {
  isOpen: boolean;
  activeTab: TechnicianMenuTab;
  onClose: () => void;
  onSelectTab: (tab: TechnicianMenuTab) => void;
  onRequestLogout: () => void;
}

export const TechnicianHamburgerDrawer: React.FC<TechnicianHamburgerDrawerProps> = ({
  isOpen,
  activeTab,
  onClose,
  onSelectTab,
  onRequestLogout,
}) => {
  // Tutup drawer dengan tombol Escape & kunci scroll halaman belakang saat terbuka
  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleItemClick = (tab: TechnicianMenuTab) => {
    onSelectTab(tab);
    onClose();
  };

  const handleLogoutClick = () => {
    onClose();
    onRequestLogout();
  };

  return (
    <>
      {isOpen && (
        <div
          className={styles.drawerScrim}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`${styles.drawerPanel} ${isOpen ? styles.drawerPanelOpen : ''}`}
        aria-label="Menu navigasi teknisi"
        aria-hidden={!isOpen}
      >
        {/* Header Brand Identik dengan Sidebar Portal Admin */}
        <div className={styles.drawerHeader}>
          <img
            src="/modena-logo-white.png"
            alt="MODENA"
            className={styles.brandLogo}
          />
          <span className={styles.drawerBrandSub}>Portal Teknisi</span>
          <button
            type="button"
            onClick={onClose}
            className={styles.drawerCloseBtn}
            aria-label="Tutup menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Daftar Menu Utama */}
        <nav className={styles.drawerNav} aria-label="Menu Teknisi">
          <div className={styles.drawerSectionLabel}>Navigasi</div>
          {TECHNICIAN_MENU_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item.id)}
                className={`${styles.drawerLink} ${isActive ? styles.drawerLinkActive : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Aksi Keluar di Bagian Bawah Drawer */}
        <div className={styles.drawerFooter}>
          <button
            type="button"
            onClick={handleLogoutClick}
            className={styles.drawerLogoutBtn}
          >
            <LogOut size={17} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
};

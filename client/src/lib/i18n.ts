// Internationalization utilities for Spanish language support
export type Language = 'en' | 'es';

// Detect user's preferred language from browser settings
export function detectLanguage(): Language {
  const browserLang = navigator.language || navigator.languages?.[0] || 'en';
  return browserLang.startsWith('es') ? 'es' : 'en';
}

// PWA Installation Prompt translations
export const pwaInstallTranslations = {
  en: {
    title: "Install Rank It Pro",
    iosDescription: "Install this app for the best mobile experience. Perfect for technicians in the field!",
    androidDescription: "Install this app for offline access and a native mobile experience.",
    iosSteps: {
      share: "Tap the share button in Safari",
      addToHome: "Select \"Add to Home Screen\"",
      install: "Tap \"Add\" to install"
    },
    buttons: {
      install: "Install App",
      gotIt: "Got it!",
      maybeLater: "Maybe Later"
    }
  },
  es: {
    title: "Instalar Rank It Pro",
    iosDescription: "Instala esta aplicación para la mejor experiencia móvil. ¡Perfecta para técnicos en el campo!",
    androidDescription: "Instala esta aplicación para acceso sin conexión y una experiencia móvil nativa.",
    iosSteps: {
      share: "Toca el botón de compartir en Safari",
      addToHome: "Selecciona \"Añadir a pantalla de inicio\"",
      install: "Toca \"Añadir\" para instalar"
    },
    buttons: {
      install: "Instalar App",
      gotIt: "¡Entendido!",
      maybeLater: "Tal vez después"
    }
  }
};

// Technician Dashboard translations
export const technicianDashboardTranslations = {
  en: {
    title: "Technician Dashboard",
    subtitle: "Manage your jobs and check-ins",
    navigation: {
      dashboard: "Dashboard",
      checkIns: "Check-ins",
      jobTypes: "Job Types",
      profile: "Profile"
    },
    quickActions: {
      title: "Quick Actions",
      newCheckIn: "New Check-in",
      viewJobs: "View Jobs",
      updateProfile: "Update Profile"
    },
    stats: {
      totalCheckIns: "Total Check-ins",
      thisWeek: "This Week",
      pendingJobs: "Pending Jobs",
      completed: "Completed"
    },
    recentActivity: {
      title: "Recent Activity",
      noActivity: "No recent activity",
      checkInAt: "Check-in at",
      completedJob: "Completed job:",
      ago: "ago"
    },
    checkInForm: {
      title: "New Check-in",
      jobType: "Job Type",
      customerName: "Customer Name",
      customerPhone: "Customer Phone",
      customerEmail: "Customer Email",
      location: "Location",
      notes: "Notes",
      photos: "Photos",
      selectJobType: "Select a job type",
      enterCustomerName: "Enter customer name",
      enterPhone: "Enter phone number",
      enterEmail: "Enter email address",
      enterLocation: "Enter location",
      addNotes: "Add notes about the job",
      takePhoto: "Take Photo",
      submit: "Submit Check-in",
      submitting: "Submitting...",
      success: "Check-in submitted successfully!",
      error: "Failed to submit check-in"
    },
    buttons: {
      save: "Save",
      cancel: "Cancel",
      edit: "Edit",
      delete: "Delete",
      view: "View",
      close: "Close"
    }
  },
  es: {
    title: "Panel de Técnico",
    subtitle: "Gestiona tus trabajos y registros",
    navigation: {
      dashboard: "Panel",
      checkIns: "Registros",
      jobTypes: "Tipos de Trabajo",
      profile: "Perfil"
    },
    quickActions: {
      title: "Acciones Rápidas",
      newCheckIn: "Nuevo Registro",
      viewJobs: "Ver Trabajos",
      updateProfile: "Actualizar Perfil"
    },
    stats: {
      totalCheckIns: "Total Registros",
      thisWeek: "Esta Semana",
      pendingJobs: "Trabajos Pendientes",
      completed: "Completados"
    },
    recentActivity: {
      title: "Actividad Reciente",
      noActivity: "Sin actividad reciente",
      checkInAt: "Registro en",
      completedJob: "Trabajo completado:",
      ago: "hace"
    },
    checkInForm: {
      title: "Nuevo Registro",
      jobType: "Tipo de Trabajo",
      customerName: "Nombre del Cliente",
      customerPhone: "Teléfono del Cliente",
      customerEmail: "Email del Cliente",
      location: "Ubicación",
      notes: "Notas",
      photos: "Fotos",
      selectJobType: "Selecciona un tipo de trabajo",
      enterCustomerName: "Ingresa nombre del cliente",
      enterPhone: "Ingresa número de teléfono",
      enterEmail: "Ingresa dirección de email",
      enterLocation: "Ingresa ubicación",
      addNotes: "Añade notas sobre el trabajo",
      takePhoto: "Tomar Foto",
      submit: "Enviar Registro",
      submitting: "Enviando...",
      success: "¡Registro enviado exitosamente!",
      error: "Error al enviar registro"
    },
    buttons: {
      save: "Guardar",
      cancel: "Cancelar",
      edit: "Editar",
      delete: "Eliminar",
      view: "Ver",
      close: "Cerrar"
    }
  }
};

// Get translations for current language
export function getPWATranslations(lang?: Language) {
  const currentLang = lang || detectLanguage();
  return pwaInstallTranslations[currentLang];
}

export function getTechnicianTranslations(lang?: Language) {
  const currentLang = lang || detectLanguage();
  return technicianDashboardTranslations[currentLang];
}

// Format relative time in the appropriate language
export function formatRelativeTime(date: Date, lang?: Language): string {
  const currentLang = lang || detectLanguage();
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (currentLang === 'es') {
    if (diffInMinutes < 1) return 'ahora mismo';
    if (diffInMinutes < 60) return `hace ${diffInMinutes} minuto${diffInMinutes !== 1 ? 's' : ''}`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `hace ${diffInHours} hora${diffInHours !== 1 ? 's' : ''}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `hace ${diffInDays} día${diffInDays !== 1 ? 's' : ''}`;
  } else {
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  }
}
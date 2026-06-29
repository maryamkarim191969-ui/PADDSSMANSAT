export type ThemeMode = "light" | "dark" | "system";

export type SystemSettings = {
  school: {
    name: string;
    npsn: string;
    address: string;
    phone: string;
    email: string;
    website: string;
  };
  app: {
    name: string;
    version: string;
    description: string;
  };
  appearance: ThemeMode;
  language: string;
  time: {
    timezone: string;
    dateFormat: string;
    timeFormat: string;
  };
  qr: {
    size: string;
    format: string;
    publicLink: boolean;
  };
  security: {
    sessionTimeout: string;
    loginSecurity: string;
    passwordPolicy: string;
  };
};

export const defaultSettings: SystemSettings = {
  school: {
    name: "",
    npsn: "",
    address: "",
    phone: "",
    email: "",
    website: "",
  },
  app: {
    name: "PADDS SMANSAT",
    version: "2.0.0",
    description: "Pusat Arsip dan Dokumen Digital Sekolah SMAN 1 Suwawa Timur.",
  },
  appearance: "light",
  language: "id",
  time: {
    timezone: "WITA (UTC+8)",
    dateFormat: "DD MMM YYYY",
    timeFormat: "24 jam",
  },
  qr: {
    size: "256px",
    format: "PNG",
    publicLink: true,
  },
  security: {
    sessionTimeout: "30 menit",
    loginSecurity: "Standar",
    passwordPolicy: "Minimal 8 karakter, huruf & angka",
  },
};

export const systemInfo = {
  version: "2.0.0",
  build: "—",
  lastUpdate: "—",
};

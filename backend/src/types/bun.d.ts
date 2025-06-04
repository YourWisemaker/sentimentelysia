// Type definitions for Bun runtime

declare namespace NodeJS {
  interface ProcessEnv {
    OPENROUTER_API_KEY?: string;
    PORT?: string;
    HOST?: string;
    ALLOWED_ORIGINS?: string;
  }
}

declare var process: {
  env: NodeJS.ProcessEnv;
};

declare var Buffer: any;
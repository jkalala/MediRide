declare module 'africastalking' {
  interface AfricasTalkingOptions {
    apiKey: string;
    username: string;
  }

  interface AfricasTalkingInstance {
    SMS: {
      send: (options: {
        to: string;
        message: string;
        from?: string;
      }) => Promise<any>;
    };
    USSD: {
      send: (options: {
        to: string;
        message: string;
      }) => Promise<any>;
    };
  }

  function AfricasTalking(options: AfricasTalkingOptions): AfricasTalkingInstance;
  export = AfricasTalking;
} 
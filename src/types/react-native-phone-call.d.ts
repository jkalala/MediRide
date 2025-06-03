declare module 'react-native-phone-call' {
  interface PhoneCallArgs {
    number: string;
    prompt?: boolean;
  }

  export function makePhoneCall(args: PhoneCallArgs): Promise<void>;
} 
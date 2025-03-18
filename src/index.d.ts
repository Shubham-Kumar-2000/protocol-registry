export = ProtocolRegistry;

declare namespace ProtocolRegistry {
  export type RegisterOptions = {
    /**
     * **default false.**
     * If this is not true, then you will get an error that protocol is already being used.
     * So, first check if the protocol exist or not then take action accordingly (Refrain from using it).
     */
    override?: boolean;
    /**
     * **default false.**
     * If this is set true, then first a terminal is opened and then your command is executed inside it.
     * otherwise your command is executed in background and no logs appear but if your program launches any UI / webpage / file, it will be visible.
     */
    terminal?: boolean;
    /**
     * **default url-${protocol}.**
     * This will be app name of your registered protocol
     */
    appName?: string;
  };

  export type DeRegisterOptions = {
    force?: boolean;
  };

  export function register(protocol: string, command: string, params?: RegisterOptions): Promise<void>;

  export function checkIfExists(protocol: string): Promise<boolean>;
  export function getDefaultApp(protocol: string): Promise<string|null>;
  export function deRegister(protocol: string, options?: DeRegisterOptions): Promise<void>;
}

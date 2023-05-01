export = ProtocolRegistry;

declare namespace ProtocolRegistry {
  export type RegisterOptions = {
    /**
     * Only alphabets allowed.
     * Your command will be executed when any url starting with this protocol is opened i.e.
     * "myapp://test","testproto://abcd?mode=dev", etc.
     * And please make sure that the protocol is unique to your application.
     */
    protocol: string;
    /**
     * This command will be executed when the proctocol is called.
     * $_URL_ mentioned anywhere in your command will be replaced by the url by which it is initiated.
     */
    command: string;
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
     * **default false.**
     * If this is set true, then your command is saved in a script and that script is executed.
     * This option is recommended if you are using multi-line commands or your command uses any kind of quotes.
     */
    script?: boolean;
    /**
     * **default ${protocol}.**
     * This is the name of the script file that will be created if script option is set true.
     * It is recommended to use the default value.
     */
    scriptName?: string;
  };
  export function register(params: RegisterOptions): Promise<void>;
  export function register(
    params: RegisterOptions,
    cb: (err?: Error) => void
  ): void;

  export function checkifExists(protocol: string): Promise<boolean>;
}
